import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';

import { LOGIN_USER } from '../utils/mutations';
import Auth from '../utils/auth';

const LoginForm = () => {
  const [userFormData, setUserFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [loginUser, { data, error }] = useMutation(LOGIN_USER);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setUserFormData({ 
      ...userFormData, 
      [name]: value 
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log('Form State: ', userFormData);
  
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
  
    console.log("Before loginUser mutation");

    try {
      const { data } = await loginUser({
        variables: { ...userFormData },
      });
  
      console.log('Login Mutation Response:', data);
  
      // Check if data.loginUser is defined
      if (data && data.login && typeof data.login.token === 'string') {
        const { token } = data.login; // Access the token property
        Auth.login(token);
      } else {
        console.error('Invalid response structure from loginUser mutation:', data);
        setShowAlert(true);
      }
    } catch (err) {
      console.error('Login Error:', err);
      setShowAlert(true);
    }
  
    setUserFormData({
      email: '',
      password: '',
    });
  };
  

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your email'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
