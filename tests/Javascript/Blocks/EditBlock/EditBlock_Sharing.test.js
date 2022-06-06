import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Auth, WebAppsUX } from 'webapps-react';

import { rest } from 'msw';
import { server } from '../../../../resources/js/__mocks__/server';

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
        await waitFor(() => expect(screen.getByText(/the following people also have access to edit this block\./i)).toBeDefined());
    });
});