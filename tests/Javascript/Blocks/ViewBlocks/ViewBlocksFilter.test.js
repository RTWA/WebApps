import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import ViewBlocks from '../../../../resources/js/components/Routes/Blocks/ViewBlocks';

describe('ViewBlocks Component - Filter', () => {
    test('Can Filter By Plugin', async () => {
        render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
        await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

        expect(screen.getByText(/test block/i)).toBeDefined();
        expect(screen.getByRole('combobox', { name: /filter by plugin/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('combobox', { name: /filter by plugin/i }), { target: { value: '1' } });
            await screen.getByRole('combobox', { name: /filter by plugin/i }).value === '1';
            fireEvent.blur(screen.getByRole('combobox', { name: /filter by plugin/i }));
        });
        await waitFor(async () => screen.getByText(/test block/i));

        // Select the same filter again (data should not reload)
        await act(async () => {
            fireEvent.change(screen.getByRole('combobox', { name: /filter by plugin/i }), { target: { value: '1' } });
            await screen.getByRole('combobox', { name: /filter by plugin/i }).value === '1';
            fireEvent.blur(screen.getByRole('combobox', { name: /filter by plugin/i }));
        });
        await waitFor(async () => screen.getByText(/test block/i));

        // Change for else if
        await act(async () => {
            fireEvent.change(screen.getByRole('combobox', { name: /filter by plugin/i }), { target: { value: '2' } });
            await screen.getByRole('combobox', { name: /filter by plugin/i }).value === '2';
            fireEvent.blur(screen.getByRole('combobox', { name: /filter by plugin/i }));
        });
        await waitFor(async () => screen.getByText(/test block/i))

        // Reset for final else
        await act(async () => {
            fireEvent.change(screen.getByRole('combobox', { name: /filter by plugin/i }), { target: { value: '' } });
            await screen.getByRole('combobox', { name: /filter by plugin/i }).value === '';
            fireEvent.blur(screen.getByRole('combobox', { name: /filter by plugin/i }));
        });
        await waitFor(async () => expect(screen.getByText(/test block/i)).toBeDefined());
        expect(screen.getByText(/test block/i)).toBeDefined()
    });

    test('Can Filter By Search', async () => {
        expect(screen.getByText(/test block/i)).toBeDefined();
        expect(screen.getByRole('textbox', { name: /filter by search/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /filter by search/i }), { target: { value: 'test' } });
            await screen.getByRole('textbox', { name: /filter by search/i }).value === 'test';
            fireEvent.keyUp(screen.getByRole('textbox', { name: /filter by search/i }));
        });
        await waitFor(() => expect(screen.getByText(/test block/i)).toBeDefined());
        expect(screen.getByText(/test block/i)).toBeDefined()
    });

    test('Can Filter By Search With No Matching Blocks Found', async () => {
        expect(screen.getByText(/test block/i)).toBeDefined();
        expect(screen.getByRole('textbox', { name: /filter by search/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /filter by search/i }), { target: { value: 'none' } });
            await screen.getByRole('textbox', { name: /filter by search/i }).value === 'none';
            fireEvent.keyUp(screen.getByRole('textbox', { name: /filter by search/i }));
        });
        await waitFor(() => expect(screen.queryByText("Test Block")).toBeNull());
        await waitFor(() => expect(screen.getByText(/no matching blocks found/i)).toBeDefined());
        expect(screen.getByText(/no matching blocks found/i)).toBeDefined();
    });
});