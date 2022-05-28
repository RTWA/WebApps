import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Auth, WebAppsUX, WebApps } from 'webapps-react';

import NewBlock from '../../../../resources/js/components/Routes/Blocks/NewBlock';

describe('NewBlock Component', () => {
    test('Can Render', async () => {
        render(<Auth><WebAppsUX><WebApps><BrowserRouter><NewBlock /></BrowserRouter></WebApps></WebAppsUX></Auth>);
        await waitFor(() => expect(screen.getByText(/select the plugin you wish to use\.\.\./i)).toBeDefined());

        expect(screen.getByText(/sample/i)).toBeDefined();
        expect(screen.getByText(/jest/i)).toBeDefined();
    });

    test('Can Select A Plugin To Use', async () => {
        expect(screen.getByText(/sample/i)).toBeDefined();
        expect(screen.getByText(/jest/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByText(/sample/i));
        });
        await waitFor(() => screen.getByRole('button', { name: /block properties/i }));
        await waitFor(() => expect(screen.getByText(/enter the sample message/i)).toBeDefined());
    });

    test('Can Open The Flyout And Can Set The Title', async () => {
        expect(screen.getByRole('button', { name: /block properties/i })).toBeDefined();

        expect(screen.getByRole('textbox', { name: /block title/i })).toHaveValue("Test Block\'s Title");

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /block properties/i }));
        });
        await waitFor(() =>
            screen.getByRole('textbox', { name: /block title:/i })
        );
        expect(screen.getByRole('textbox', { name: /block title:/i, hidden: true })).toHaveValue("Test Block\'s Title");

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /block title:/i, hidden: true }), { target: { value: 'New Title' } });
            await screen.getByRole('textbox', { name: /block title:/i, hidden: true }).value === 'New Title';
        });
        expect(screen.getByRole('textbox', { name: /block title:/i, hidden: true })).toHaveValue("New Title");

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /close panel/i }));
        });
        await waitFor(() =>
            screen.getByRole('textbox', { name: /block title/i }).value === 'New Title'
        );
        expect(screen.getByRole('textbox', { name: /block title/i })).toHaveValue("New Title");

        /* Reset */
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /block title/i, hidden: true }), { target: { value: 'Test Block\'s Title' } });
            await screen.getByRole('textbox', { name: /block title/i, hidden: true }).value === 'Test Block\'s Title';
        });
        expect(screen.getByRole('textbox', { name: /block title/i, hidden: true })).toHaveValue("Test Block's Title");
    });
});