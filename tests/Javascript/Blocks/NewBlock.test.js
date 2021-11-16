import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from 'react-toast-notifications';
import { rest } from 'msw';

import { server } from '../../../resources/js/__mocks__/server';

import { WebApps } from 'webapps-react';

import NewBlock from '../../../resources/js/components/Routes/Blocks/NewBlock';

test('Can View Create a New Block', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><NewBlock /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /select the plugin you wish to use\.\.\./i })).toBeDefined());

    expect(screen.getByText(/sample/i)).toBeDefined();
    expect(screen.getByText(/jest/i)).toBeDefined();
});

test('No Plugins Available', async () => {
    server.use(
        rest.get('/api/plugins', (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json({
                    plugins: []
                })
            )
        }),
        rest.get('/api/plugins/active', (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json({
                    plugins: []
                })
            )
        }),
    )

    render(<WebApps><ToastProvider><BrowserRouter><NewBlock /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', {  name: /no active plugins!/i})).toBeDefined());

    expect(screen.getByRole('heading', {  name: /no active plugins!/i})).toBeDefined();
    expect(screen.getByText(/please contact your system administrator\./i)).toBeDefined();
});

test('Can Select A Plugin To Use', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><NewBlock /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /select the plugin you wish to use\.\.\./i })).toBeDefined());

    expect(screen.getByText(/sample/i)).toBeDefined();
    expect(screen.getByText(/jest/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/sample/i));
    });
    await waitFor(() =>
        screen.getByRole('button', {  name: /block properties/i})
    );

    expect(screen.getByRole('button', {  name: /block properties/i})).toBeDefined();
});