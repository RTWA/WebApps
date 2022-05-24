import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import UsersGroups from '../../../../resources/js/components/Routes/Settings/UsersGroups';

describe('UsersGroups Component - Create New Users', () => {
    test('Renders User list', async () => {
        render(<WebAppsUX><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebAppsUX>);
        await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

        expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
        expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();
        expect(screen.getByText(/test jest user/i)).toBeDefined();
    });

    test('Can View Add New User Flyout', async () => {
        expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /add new user/i }));
        });
        await waitFor(() => expect(screen.getByRole('textbox', { name: /user's name/i })).toBeDefined());

        expect(screen.getByText(/user's name/i)).toBeDefined();
    });

    test('Cannot Create A New User With Invalid Data', async () => {
        expect(screen.getByRole('textbox', { name: /username/i, hidden: true })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /user's name/i, hidden: true }), { target: { value: 'New User' } });
            await screen.getByRole('textbox', { name: /user's name/i, hidden: true }).value === 'New User';
            fireEvent.change(screen.getByRole('textbox', { name: /username/i, hidden: true }), { target: { value: mockData.User.username } });
            await screen.getByRole('textbox', { name: /username/i, hidden: true }).value === mockData.User.username;
        });

        expect(screen.getByRole('button', { name: /create user/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /create user/i }));
        });
        await waitFor(() => expect(screen.getByText(/the username has already been taken\./i)).toBeDefined());
    });

    test('Cannot Create A New User Due To An Unknown Error', async () => {
        expect(screen.getByRole('textbox', { name: /user's name/i, hidden: true })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /user's name/i, hidden: true }), { target: { value: 'unknown' } });
            await screen.getByRole('textbox', { name: /user's name/i, hidden: true }).value === 'unknown';
            fireEvent.change(screen.getByRole('textbox', { name: /username/i, hidden: true }), { target: { value: 'new_user' } });
            await screen.getByRole('textbox', { name: /username/i, hidden: true }).value === 'new_user';
        });

        expect(screen.getByRole('button', { name: /create user/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /create user/i }));
        });
        await waitFor(() => expect(screen.getByText(/an unknown error occurred\./i)).toBeDefined());
    });

    test('Can Create A New User With Valid Data', async () => {
        expect(screen.getByRole('textbox', { name: /username/i, hidden: true })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /user's name/i, hidden: true }), { target: { value: 'New User' } });
            await screen.getByRole('textbox', { name: /user's name/i, hidden: true }).value === 'New User';
            fireEvent.change(screen.getByRole('textbox', { name: /username/i, hidden: true }), { target: { value: 'new_user' } });
            await screen.getByRole('textbox', { name: /username/i, hidden: true }).value === 'new_user';
            fireEvent.change(screen.getByRole('textbox', { name: /e\-mail address/i, hidden: true }), { target: { value: 'new_user@test.com' } });
            await screen.getByRole('textbox', { name: /e\-mail address/i, hidden: true }).value === 'new_user@test.com';
            fireEvent.change(screen.getByLabelText(/enter password/i), { target: { value: 'Password123' } });
            await screen.getByLabelText(/enter password/i).value === 'Password123';
            fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123' } });
            await screen.getByLabelText(/confirm password/i).value === 'Password123';
            fireEvent.change(screen.getByRole('combobox', { name: /select security group/i, hidden: true }), { target: { value: mockData.groups[0].id } });
            await screen.getByRole('combobox', { name: /select security group/i, hidden: true }).value === mockData.groups[0].id;
        });

        expect(screen.getByRole('button', { name: /create user/i })).toBeDefined();
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /create user/i }));
        });
        await waitFor(() => expect(screen.getByText(/user created successfully/i)).toBeDefined());
    });
});