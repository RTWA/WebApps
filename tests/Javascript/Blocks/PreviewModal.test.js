import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import ViewBlocks from '../../../resources/js/components/Routes/Blocks/ViewBlocks';
import Modals from '../../../resources/js/components/Layouts/Default/Modals';

describe('PreviewModal Component', () => {
    test('Can Open', async () => {
        render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /><Modals /></BrowserRouter></WebApps>);
        await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());
        await waitFor(() => expect(screen.getByText(/test block/i)).toBeDefined());
        expect(screen.getByText(/1234/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByText(/test block/i));
        });
        await waitFor(() => screen.getByRole('heading', { name: /block preview/i }));

        expect(screen.getByRole('button', { name: /use this block/i })).toBeDefined();
        expect(screen.getByRole('link', { name: /edit block/i })).toBeDefined();
    });

    test('Can Close', async () => {
        expect(screen.getByRole('button', { name: /use this block/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /close panel/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /close panel/i }));
        });
        await waitFor(() =>
            expect(screen.queryByRole('button', { name: /close panel/i })).toBeNull()
        );
    });

    test('Can Select The Use This Block Tab, Change To Advanced View And Return To Preview', async () => {
        expect(screen.getByText(/1234/i)).toBeDefined();
        expect(screen.getByTestId(/context-Test-Block/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByTestId(/context-Test-Block/i));
        });
        await waitFor(() => screen.getAllByRole('link', { name: /preview/i }));
        await act(async () => {
            fireEvent.click(screen.getAllByRole('link', { name: /preview/i })[0]);
        });
        await waitFor(() => screen.getByRole('heading', {  name: /block preview/i}));
        expect(screen.getByRole('button', {  name: /use this block/i})).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', {  name: /use this block/i}));
        });
        await waitFor(() => expect(screen.getByRole('button', {  name: /simple/i})).toBeDefined());
        expect(screen.getByRole('button', {  name: /advanced/i})).toBeDefined()

        await act(async () => {
            fireEvent.click(screen.getByRole('button', {  name: /advanced/i}));
        });
        await waitFor(() => expect(screen.getByRole('textbox', {  name: /advanced text to copy/i})).toBeDefined());
        await act(async () => {
            fireEvent.click(screen.getByRole('button', {  name: /simple/i}));
        });
        await waitFor(() => expect(screen.getByRole('textbox', {  name: /simple text to copy/i})).toBeDefined());
        await act(async () => {
            fireEvent.click(screen.getByRole('button', {  name: /preview/i}));
        });
        await waitFor(() => expect(screen.getByRole('heading', {  name: /test block/i})).toBeDefined());
    });

    test('Can Select The Delete This Block Tab And Delete The Block', async () => {
        await waitFor(() => screen.getByRole('heading', {  name: /block preview/i}));
        expect(screen.getByRole('button', {  name: /delete this block/i})).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', {  name: /delete this block/i}));
        });
        await waitFor(() => expect(screen.getByRole('button', {  name: /delete block/i})).toBeDefined());
        await act(async () => {
            fireEvent.click(screen.getByRole('button', {  name: /delete block/i}));
        });
        await waitFor(() => screen.getByRole('button', { name: /are you sure\?/i }));
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /are you sure\?/i }));
        });
        await waitFor(() => screen.getByText(/deleted!/i));
        await waitFor(() => expect(screen.queryByText(/test block/i)).toBeNull());
    });
});