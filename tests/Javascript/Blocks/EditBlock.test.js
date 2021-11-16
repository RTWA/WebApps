import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from 'react-toast-notifications';
import { rest } from 'msw';

import { server } from '../../../resources/js/__mocks__/server';

import { WebApps } from 'webapps-react';

import EditBlock from '../../../resources/js/components/Routes/Blocks/EditBlock';

test('Can Render Edit Block', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined());

    expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
    expect(screen.getByText(/enter the sample message/i)).toBeDefined();
});

test('Can Render Edit Block For An Orphaned Block', async () => {
    server.use(
        rest.get('/api/blocks/:id', (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json({
                    styles: "",
                    block: "Not available"
                })

            )
        }),
    )
    render(<WebApps><ToastProvider><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByText(/this block is in an orphaned state\.please contact your system administrator\./i)).toBeDefined());

    expect(screen.getByText(/this block is in an orphaned state\.please contact your system administrator\./i)).toBeDefined();
});

test('Can Open The Flyout And Change The Properties Of The Block', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined());

    expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /block properties/i })).toBeDefined();

    expect(screen.getByRole('textbox', { name: /block title/i })).toHaveValue("Test Block\'s Title");

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /block properties/i }));
    });
    await waitFor(() =>
        screen.getByText(/block title:/i)
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
});

test('Can Change Block Text Value', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined());

    expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
    expect(screen.getByRole('textbox', {  name: /enter the sample message/i})).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /enter the sample message/i}), { target: { value: 'New Value' } });
        await screen.getByRole('textbox', {  name: /enter the sample message/i}).value === 'New Value';
    });

    expect(screen.getByRole('textbox', {  name: /enter the sample message/i})).toHaveValue('New Value');
});

test('Can Open And Close A Repeater Without Any Errors', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined());

    expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
    expect(screen.getByRole('textbox', {  name: /enter the sample message/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/image slide:/i));
    });
    await waitFor(() =>
        screen.getByRole('link', {  name: /enter url/i})
    );

    await act(async () => {
        fireEvent.click(screen.getByText(/image slide:/i));
    });
    await waitFor(() =>
        screen.getByRole('link', {  name: /enter url/i})
    );

    expect(screen.getByRole('link', {  name: /enter url/i})).toBeDefined();
});

test('Can Add And Remove A Repeater', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined());

    expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
    expect(screen.getByRole('button', {  name: /add new image slide/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', {  name: /add new image slide/i}));
    });
    await waitFor(() =>
        screen.getAllByText(/image slide:/i).length === 2
    );

    expect(screen.getAllByText(/image slide:/i)).toHaveLength(2);
    expect(screen.getByTestId('remove-1')).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByTestId('remove-1'));
    });
    await waitFor(() =>
        screen.getAllByText(/image slide:/i).length === 1
    );

    expect(screen.getAllByText(/image slide:/i)).toHaveLength(1);
    expect(screen.queryByTestId('remove-1')).toBeNull();
});

test('Can Successfully Save Block Changes', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined());

    expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
    expect(screen.getByRole('textbox', {  name: /enter the sample message/i})).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /enter the sample message/i}), { target: { value: 'New Value' } });
        await screen.getByRole('textbox', {  name: /enter the sample message/i}).value === 'New Value';
    });

    expect(screen.getByRole('textbox', {  name: /enter the sample message/i})).toHaveValue('New Value');
    expect(screen.getByRole('button', {  name: /save changes & view/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', {  name: /save changes & view/i}));
    });
    await waitFor(() =>
        screen.getByRole('button', {  name: /saving\.\.\./i})
    );

    expect(screen.getByText(/saved!/i)).toBeDefined();
});

test('Cannot Successfully Save Block Changes', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></ToastProvider></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined());

    expect(screen.getByRole('heading', { name: /sample message/i })).toBeDefined();
    expect(screen.getByRole('textbox', {  name: /enter the sample message/i})).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /enter the sample message/i}), { target: { value: 'Error This' } });
        await screen.getByRole('textbox', {  name: /enter the sample message/i}).value === 'Error This';
    });

    expect(screen.getByRole('textbox', {  name: /enter the sample message/i})).toHaveValue('Error This');
    expect(screen.getByRole('button', {  name: /save changes & view/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', {  name: /save changes & view/i}));
    });
    await waitFor(() =>
        screen.getByRole('button', {  name: /saving\.\.\./i})
    );

    expect(screen.getByText(/an error occurred whilst saving the block\./i)).toBeDefined();
});