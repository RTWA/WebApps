import React from 'react';
import axios from 'axios';
import { BrowserRouter, Route } from 'react-router-dom';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import * as mockData from '../../resources/js/__mocks__/mockData';

import Login from '../../resources/js/components/Auth/Login';


const loginUser = async (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Perform sign in
      await axios.post(`/login`, { username, password });
      // When correct, return the user object
      return resolve(mockData.User);
    } catch (error) {
      return reject(error);
    }
  });
}


test('Render Login form', () => {
  render(<WebApps><Login /></WebApps>);

  // Expect the fields to be defined
  expect(screen.getByRole('form')).toHaveFormValues({
    username: '',
    password: ''
  });
});

test('Validation fails when empty Login form is submitted', async () => {
  render(<WebApps><Login /></WebApps>);

  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() =>
    screen.getByText(/the username field is required\./i)
  );


  expect(screen.getByText(/the username field is required\./i)).toBeInTheDocument();
  expect(screen.getByText(/the password field is required\./i)).toBeInTheDocument();
});

test('User cannot login without correct credentials', async () => {
  render(<WebApps><Login loginUser={loginUser} /></WebApps>);

  await act(async () => {
    fireEvent.change(screen.getByRole('textbox', { name: /username:/i }), { target: { value: mockData.User.username } });
    fireEvent.change(screen.getByLabelText(/password:/i), { target: { value: 'incorrectPassword' } });

    await screen.getByRole('textbox', { name: /username:/i }).value === mockData.User.username;
    await screen.getByLabelText(/password:/i).value === 'incorrectPassword';

    fireEvent.click(screen.getByRole('button', { name: /login/i }));
  });

  await waitFor(() =>
    screen.getByRole('alert')
  );

  expect(screen.getByRole('alert')).toHaveTextContent('These credentials do not match our records.');

});

test('User can login with correct credentials', async () => {
  render(
    <WebApps>
      <BrowserRouter>
        <Login loginUser={loginUser} />
        <Route path="/">Logged In</Route>
      </BrowserRouter>
    </WebApps>
  );

  await act(async () => {
    fireEvent.change(screen.getByRole('textbox', { name: /username:/i }), { target: { value: mockData.User.username } });
    fireEvent.change(screen.getByLabelText(/password:/i), { target: { value: mockData.User.password } });

    await screen.getByRole('textbox', { name: /username:/i }).value === mockData.User.username;
    await screen.getByLabelText(/password:/i).value === mockData.User.password;

    fireEvent.click(screen.getByRole('button', { name: /login/i }));
  });

  expect(screen.getByText(/logged in/i)).toHaveTextContent(/Logged In/);
});

test('User cannot login with correct credentials but a disabled account', async () => {
  render(<Login loginUser={loginUser} />);

  await act(async () => {
    fireEvent.change(screen.getByRole('textbox', { name: /username:/i }), { target: { value: mockData.users[1].username } });
    fireEvent.change(screen.getByLabelText(/password:/i), { target: { value: mockData.users[1].password } });

    await screen.getByRole('textbox', { name: /username:/i }).value === mockData.users[1].username;
    await screen.getByLabelText(/password:/i).value === mockData.users[1].password;

    fireEvent.click(screen.getByRole('button', { name: /login/i }));
  });

  await waitFor(() =>
    screen.getByRole('alert')
  );

  expect(screen.getByRole('alert')).toHaveTextContent('Your account has been disabled. Please contact your System Administrator.');

});