import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';

import Auth from '../utils/auth';
import { SEARCH_GOOGLE_BOOKS } from '../utils/queries';
import { SAVE_BOOK } from '../utils/mutations';
import { getSavedBookIds, saveBookIds } from '../utils/localStorage';

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const { data: searchQueryData } = useQuery(SEARCH_GOOGLE_BOOKS, {
    skip: !searchInput,
    variables: { searchInput },
  });

  const [saveBook] = useMutation(SAVE_BOOK, {
      context: { 
      headers: {Authorization: `Bearer ${Auth.getToken()}` }
    }}
  );

  useEffect(() => {
    saveBookIds(savedBookIds);
  }, [savedBookIds]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      if (searchQueryData?.searchGoogleBooks?.items) {
        const bookData = searchQueryData.searchGoogleBooks.items.map((book) => ({
          bookId: book.id,
          authors: book.volumeInfo.authors || ['No author to display'],
          title: book.volumeInfo.title,
          description: book.volumeInfo.description,
          image: book.volumeInfo.imageLinks?.thumbnail || '',
        }));

        console.log('Book data from search:', bookData); // Add this line
        setSearchedBooks(bookData);
        setSearchInput('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookData) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
  
    if (!token) {
      // Handle the case where the user is not authenticated
      console.log("User is not authenticated");
      return;
    }
  
    try {
      console.log("Saving book to User's savedBooks array: ", bookData); // Add this line
      const response = await saveBook({
        variables: {
          bookId: bookData.bookId,
          authors: bookData.authors,
          description: bookData.description,
          image: bookData.image,
          title: bookData.title
        },
      });
  
      console.log('Mutation response:', response); // Add this line
      if (response.data && response.data.saveBook) {
        setSavedBookIds([...savedBookIds, bookData]);
      } else {
        console.error('Failed to save the book:', bookData);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                      disabled={savedBookIds?.some((savedBookId) => savedBookId === book.bookId)}
                      className='btn-block btn-info'
                      onClick={() => handleSaveBook(book)}>
                        {savedBookIds?.some((savedBookId) => savedBookId === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
