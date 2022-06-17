import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { Auth, WebAppsUX } from 'webapps-react';

import { users } from '../../../../resources/js/__mocks__/mockData';
import EditBlock from '../../../../resources/js/components/Routes/Blocks/EditBlock';

describe('EditBlock Component', () => {
    test('Can Render', async () => {
        render(<Auth><WebAppsUX><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></WebAppsUX></Auth>);
        await waitFor(() => expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined());
        expect(screen.getByText(/enter the sample message/i)).toBeDefined();
    });

    test('Can Open The Share Flyout', async () => {
        expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /share block/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /share block/i }))
        });
        await waitFor(() => expect(screen.getByText(/the following people also have access to edit this block\./i)).toBeDefined(), { timeout: 2000 });
    });

    test('Cannot Add A Share Due To An Error', async () => {
        expect(screen.getByRole('textbox', { name: /add person by name/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /add person by name/i }), { target: { value: 'WebApps' } });
            await screen.getByRole('textbox', { name: /add person by name/i }).value === 'WebApps';
        });
        await waitFor(() => expect(screen.getByText(/\(admin@test\)/i)).toBeDefined(), { timeout: 5000 });

        await act(async () => {
            fireEvent.click(screen.getByText(/admin@test/i));
        });
        await waitFor(() => expect(screen.getByText(/failed to share block/i)).toBeDefined());
    });

    test('Can Add A Share', async () => {
        expect(screen.getByRole('textbox', { name: /add person by name/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /add person by name/i }), { target: { value: 'Jest' } });
            await screen.getByRole('textbox', { name: /add person by name/i }).value === 'Jest';
        });
        await waitFor(() => expect(screen.getByText(/jest alternative user/i)).toBeDefined());

        await act(async () => {
            fireEvent.click(screen.getByText(/jest alternative user/i));
        });
        await waitFor(() => expect(screen.getByRole('heading', { name: /jest alternative user/i })).toBeDefined());
    });

    test('Can Add An Existing Share', async () => {
        expect(screen.getByRole('textbox', { name: /add person by name/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /add person by name/i }), { target: { value: 'Jest' } });
            await screen.getByRole('textbox', { name: /add person by name/i }).value === 'Jest';
        });
        await waitFor(() => expect(screen.getByText(/jest@test/i)).toBeDefined());

        await act(async () => {
            fireEvent.click(screen.getByText(/jest@test/i));
        });
        await waitFor(() => expect(screen.getByRole('heading', { name: /jest alternative user/i })).toBeDefined());
    });

    test('Cannot Remove A Share Due To An Error', async () => {
        expect(screen.getByRole('textbox', { name: /add person by name/i })).toBeDefined();
        expect(screen.getByTestId(`removeShare-${users[4].id}`)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByTestId(`removeShare-${users[4].id}`));
        });
        await waitFor(() => screen.getByText(/failed to remove share/i));
        expect(screen.getByText(/failed to remove share/i)).toBeDefined();
    });

    test('Can Remove A Share', async () => {
        expect(screen.getByRole('textbox', { name: /add person by name/i })).toBeDefined();
        expect(screen.getByTestId(`removeShare-${users[1].id}`)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByTestId(`removeShare-${users[1].id}`));
        });
        await waitForElementToBeRemoved(() => screen.getByRole('heading', { name: /jest alternative user/i }));
    });
});