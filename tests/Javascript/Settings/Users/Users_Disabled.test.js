import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import UsersGroups from '../../../../resources/js/components/Routes/Settings/UsersGroups';

describe('UsersGroups Component - Disabled Users List', () => {
    test('Renders User list', async () => {
        render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
        await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
        await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

        expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
        expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();
        expect(screen.getByText(/test jest user/i)).toBeDefined();
    });

    test('Can View Disabled User List', async () => {
        expect(screen.getByRole('button', { name: /show disabled users \(2\)/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /show disabled users \(2\)/i }));
        });
        await waitFor(() => expect(screen.getByText(/jest second user/i)).toBeDefined());
    });

    test('Can Select A Disabled User', async () => {
        expect(screen.getByText(/jest second user/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByText(/jest second user/i));
        });
        await waitFor(() => expect(screen.getByRole('heading', { name: /jest second user \- properties/i })).toBeDefined());
    });

    test('Can Enable A Disabled User', async () => {
        expect(screen.getByRole('button', { name: /enable user account/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /enable user account/i }));
        });
        await waitFor(() => expect(screen.getByRole('button', { name: /disable user account/i })).toBeDefined());

        /* Reset */
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /disable user account/i }));
        });
        await waitFor(() => screen.getByText(/this account is currently disabled/i));
        expect(screen.getByRole('button', { name: /enable user account/i })).toBeDefined();
    });

    test('Can Delete A Disabled User', async () => {
        expect(screen.getByRole('heading', { name: /jest second user \- properties/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /delete user account/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /delete user account/i }));
        });
        await waitFor(() => expect(screen.getByRole('button', { name: /are you sure\?/i })).toBeDefined());
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /are you sure\?/i }));
        });
        await waitForElementToBeRemoved(() => screen.getByRole('heading', { name: /jest second user \- properties/i }));
        await waitFor(() => expect(screen.queryByText(/jest second user/i)).toBeNull());
    });
});