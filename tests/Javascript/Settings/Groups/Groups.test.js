import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import UsersGroups from '../../../../resources/js/components/Routes/Settings/UsersGroups';

describe('UserGroups Component - Groups', () => {
    test('Can View Groups List', async () => {
        render(<WebAppsUX><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebAppsUX>);
        await waitFor(() => screen.getByRole('heading', { name: /groups/i }));

        await act(async () => {
            fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
        });
        await waitFor(() => expect(screen.getByRole('heading', { name: /mocked group/i })).toBeDefined());
    });

    test('Can Return To Users List After Viewing Groups List', async () => {
        await act(async () => {
            fireEvent.click(screen.getByRole('heading', { name: /users/i }));
        });
        await waitFor(() =>
            screen.getByRole('button', { name: /add new user/i })
        );
        expect(screen.getByText(/test jest user/i)).toBeDefined();
    });
});