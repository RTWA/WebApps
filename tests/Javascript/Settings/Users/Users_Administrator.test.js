import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import UsersGroups from '../../../../resources/js/components/Routes/Settings/UsersGroups';

describe('UsersGroups Component - Administrator Users', () => {
    test('Renders User list', async () => {
        render(<WebAppsUX><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebAppsUX>);
        await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

        expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
        expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();
        expect(screen.getByText(/webapps administrator/i)).toBeDefined();
    });

    test('Can Select A User', async () => {
        await act(async () => {
            fireEvent.click(screen.getByText(/webapps administrator/i));
        });
        await waitFor(() => screen.getByRole('heading', { name: /webapps administrator/i }));
    });

    test('Cannot Change A Users Group If They Are \'administrator\'', async () => {
        await act(async () => {
            fireEvent.change(screen.getByRole('combobox', { name: /change security group/i, hidden: true }), { target: { value: mockData.groups[0].id } });
            await screen.getByRole('combobox', { name: /change security group/i, hidden: true }).value === mockData.groups[0].id;
        });
        await waitFor(() => expect(screen.getByText(/you cannot change the built-in administrators group!/i)).toBeDefined());
    });
});