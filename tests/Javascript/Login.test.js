import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { APIClient, WebAppsUX } from 'webapps-react';

import * as mockData from '../../resources/js/__mocks__/mockData';

import Login from '../../resources/js/components/Auth/Login';


const loginUser = async (username, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Perform sign in
      await APIClient(`/login`, { username, password });
      // When correct, return the user object
      return resolve(mockData.User);
    } catch (error) {
      return reject(error);
    }
  });
}

describe('Login Component', () => {
  test('Render Login form', async () => {
    render(
      <WebAppsUX>
        <BrowserRouter>
          <Login loginUser={loginUser} />
          <Route path="/">Logged In</Route>
        </BrowserRouter>
      </WebAppsUX>
    );

    await waitFor(() => expect(screen.getByLabelText(/password/i).value === '').toBe(true));
    expect(screen.getByLabelText(/username/i).value === '').toBe(true)
  });

  test('Validation fails when empty Login form is submitted', async () => {
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => screen.getByText(/the username field is required\./i), { timeout: 2000 });

    expect(screen.getByText(/the username field is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/the password field is required\./i)).toBeInTheDocument();
  });

  test('User cannot login without correct credentials', async () => {
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /username/i }), { target: { value: mockData.User.username } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'incorrectPassword' } });
    });

    await waitFor(async () => {
      await screen.getByRole('textbox', { name: /username/i }).value === mockData.User.username;
      await screen.getByLabelText(/password/i).value === 'incorrectPassword';
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() =>
      screen.getByRole('alert')
    );

    expect(screen.getByRole('alert')).toHaveTextContent('These credentials do not match our records.');
  });

  test('User cannot login with correct credentials but a disabled account', async () => {
    await waitFor(() => expect(screen.getByRole('button', { name: /login/i })).toBeDefined());
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /username/i }), { target: { value: mockData.users[1].username } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: mockData.users[1].password } });

      await screen.getByRole('textbox', { name: /username/i }).value === mockData.users[1].username;
      await screen.getByLabelText(/password/i).value === mockData.users[1].password;

      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() =>
      screen.getByRole('alert')
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Your account has been disabled. Please contact your System Administrator.');
  });

  test('User can login with correct credentials', async () => {
    await waitFor(() => expect(screen.getByRole('button', { name: /login/i })).toBeDefined());
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /username/i }), { target: { value: mockData.User.username } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: mockData.User.password } });

      await screen.getByRole('textbox', { name: /username/i }).value === mockData.User.username;
      await screen.getByLabelText(/password/i).value === mockData.User.password;

      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    expect(screen.getByText(/logged in/i)).toHaveTextContent(/Logged In/);
  });
});