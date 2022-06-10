import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import UsersGroups from '../../../../resources/js/components/Routes/Settings/UsersGroups';

describe('UsersGroups Component - Users', () => {
    test('Renders User list', async () => {
        render(<WebAppsUX><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebAppsUX>);
        await waitFor(() => screen.getByRole('button', { name: /show disabled users/i }));

        expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
        expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();
        expect(screen.getByText(/test jest user/i)).toBeDefined();
    });

    test('Can Select A User', async () => {
        await act(async () => {
            fireEvent.click(screen.getByText(/test jest user/i));
        });
        await waitFor(() => screen.getByRole('heading', { name: /test jest user/i }));

        expect(screen.getByRole('link', { name: /view this user's block/i, hidden: true })).toBeDefined();
    });

    test('Can Reset A User Password', async () => {
        expect(screen.getByRole('button', { name: /change this user's password/i, hidden: true })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change this user's password/i, hidden: true }));
        });
        await waitFor(() => screen.getByLabelText(/new password/i));

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/new password:/i), { target: { value: 'newPassword' } });
            await screen.getByLabelText(/new password:/i).value === 'newPassword';
            fireEvent.change(screen.getByLabelText(/confirm password:/i), { target: { value: 'newPassword' } });
            await screen.getByLabelText(/confirm password:/i).value === 'newPassword';
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
        });
        await waitFor(() => expect(screen.getByText(/password has been changed!/i)).toBeDefined());
    });

    test('Cannot Reset A User Password If A New Password Isn\'t Provided', async () => {
        expect(screen.getByRole('button', { name: /change this user's password/i, hidden: true })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change this user's password/i, hidden: true }));
        });
        await waitFor(() => screen.getByLabelText(/new password/i));

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
        });
        await waitFor(() => expect(screen.getByText(/please enter a new password\./i)).toBeDefined());
    });

    test('Cannot Reset A User Password If They Don\'t Match', async () => {
        expect(screen.getByLabelText(/new password/i)).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/new password:/i), { target: { value: 'newPassword' } });
            await screen.getByLabelText(/new password:/i).value === 'newPassword';
            fireEvent.change(screen.getByLabelText(/confirm password:/i), { target: { value: 'newPassword1' } });
            await screen.getByLabelText(/confirm password:/i).value === 'newPassword1';
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
        });
        await waitFor(() => expect(screen.getByText(/passwords do not match!/i)).toBeDefined());
    });

    test('Cannot Reset A User Password If It Is Invalid', async () => {
        await act(async () => {
            fireEvent.change(screen.getByLabelText(/new password:/i), { target: { value: 'ThisIsInvalid' } });
            await screen.getByLabelText(/new password:/i).value === 'ThisIsInvalid';
            fireEvent.change(screen.getByLabelText(/confirm password:/i), { target: { value: 'ThisIsInvalid' } });
            await screen.getByLabelText(/confirm password:/i).value === 'ThisIsInvalid';
        });
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
        });
        await waitFor(() => expect(screen.getByText(/this is not valid\./i)).toBeDefined());
    });

    test('Cannot Reset A User Password With An Unknown Error', async () => {
        await act(async () => {
            fireEvent.change(screen.getByLabelText(/new password:/i), { target: { value: 'unknown' } });
            await screen.getByLabelText(/new password:/i).value === 'unknown';
            fireEvent.change(screen.getByLabelText(/confirm password:/i), { target: { value: 'unknown' } });
            await screen.getByLabelText(/confirm password:/i).value === 'unknown';
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
        });
        await waitFor(() => expect(screen.getByText(/failed to change password/i)).toBeDefined());
    });

    test('Can Change A Users Group', async () => {
        expect(screen.getByRole('heading', { name: /test jest user/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('combobox', { name: /change security group/i, hidden: true }), { target: { value: mockData.groups[0].id } });
            await screen.getByRole('combobox', { name: /change security group/i, hidden: true }).value === mockData.groups[0].id;
        });
        await waitFor(() => expect(screen.getByText(/security group updated/i)).toBeDefined());
    });

    test('Can Disable A User', async () => {
        expect(screen.getByRole('heading', { name: /test jest user/i })).toBeDefined();

        expect(screen.getByRole('button', { name: /disable user account/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /disable user account/i }));
        });
        await waitFor(() => screen.getByText(/this account is currently disabled/i));
        expect(screen.getByRole('button', { name: /enable user account/i })).toBeDefined();
    });
});