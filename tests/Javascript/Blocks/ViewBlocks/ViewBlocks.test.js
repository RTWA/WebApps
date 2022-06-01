import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import ViewBlocks from '../../../../resources/js/components/Routes/Blocks/ViewBlocks';

describe('ViewBlocks Component', () => {
    test('Can View My Blocks', async () => {
        render(<WebAppsUX><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebAppsUX>);
        await waitFor(() => screen.getByPlaceholderText('Search...'));
        await waitFor(() => screen.getByText(/test block/i));
        expect(screen.getByText(/1234/i)).toBeDefined();
    });

    test('Can Load More Blocks', async () => {
        expect(screen.getByRole('button', { name: /load more/i })).toBeDefined();
        expect(screen.queryByText(/test-block-2/i)).toBeNull();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /load more/i }));
        });
        await waitFor(() =>
            screen.getAllByText(/test-block-2/i)
        );

        expect(screen.getAllByText(/test-block-2/i)).toBeDefined();
    });

    // TODO: Needs moving to another test
    // test('Cannot View My Blocks If I Don\'t Have Any', async () => {
    //     server.use(
    //         rest.get('/api/blocks', (req, res, ctx) => {
    //             return res(
    //                 ctx.status(200),
    //                 ctx.json({
    //                     message: "No blocks found."
    //                 })
    //             )
    //         })
    //     )
    //     render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    //     await waitFor(() => expect(screen.getByText(/you have not created any blocks yet./i)).toBeDefined());
    // });

    test('Can Rename Block', async () => {
        expect(screen.getByText(/test block/i)).toBeDefined();
        expect(screen.getByTestId(/rename-testBlock/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByTestId(/rename-testBlock/i));
        });
        await waitFor(() =>
            screen.getByRole('textbox', { name: /rename block: testBlock/i })
        );
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /rename block: testBlock/i }), { target: { value: 'New Title' } });
            await screen.getByRole('textbox', { name: /rename block: testBlock/i }).value === 'New Title';
        });
        expect(screen.getByRole('textbox', { name: /rename block: testBlock/i })).toHaveValue("New Title");

        await act(async () => {
            fireEvent.blur(screen.getByRole('textbox', { name: /rename block: testBlock/i }));
        });
        await waitFor(() =>
            screen.getByText(/saved!/i)
        );
        expect(screen.getByText(/saved!/i)).toBeDefined();
    });

    test('Cannot Rename Block Due To An Error', async () => {
        expect(screen.getByText(/new title/i)).toBeDefined();
        expect(screen.getByTestId(/rename-testBlock/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByTestId(/rename-testBlock/i));
        });
        await waitFor(() =>
            screen.getByRole('textbox', { name: /rename block: testBlock/i })
        );
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /rename block: testBlock/i }), { target: { value: 'Error This' } });
            await screen.getByRole('textbox', { name: /rename block: testBlock/i }).value === 'Error This';
        });
        expect(screen.getByRole('textbox', { name: /rename block: testBlock/i })).toHaveValue("Error This");

        await act(async () => {
            fireEvent.blur(screen.getByRole('textbox', { name: /rename block: testBlock/i }));
        });
        await waitFor(() =>
            screen.getByText(/an unknown error occurred\./i)
        );
        expect(screen.getByText(/an unknown error occurred\./i)).toBeDefined();
    });

    test('Can Delete Block', async () => {
        expect(screen.getByText(/error this/i)).toBeDefined();
        expect(screen.getByTestId(/delete-testBlock/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByTestId(/delete-testBlock/i));
        });
        await waitFor(() =>
            screen.getByRole('heading', { name: /are you sure\?/i })
        );
        expect(screen.getByRole('button', { name: /yes/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /yes/i }));
        });
        await waitFor(() =>
            screen.getByText(/deleted!/i)
        );
        expect(screen.getByText(/deleted!/i)).toBeDefined();
        expect(screen.queryByText("Error This")).toBeNull();
    });

    test('Cannot Delete Block Via Context Menu Due To An Error', async () => {
        expect(screen.getAllByText(/test-block-2/i)).toBeDefined();
        expect(screen.getByTestId(/delete-test-block-2/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByTestId(/delete-test-block-2/i));
        });
        await waitFor(() =>
            screen.getByRole('heading', { name: /are you sure\?/i })
        );
        expect(screen.getByRole('button', { name: /yes/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /yes/i }));
        });
        await waitFor(() =>
            screen.getByText(/unable to delete block\./i)
        );

        expect(screen.getByText(/unable to delete block\./i)).toBeDefined();
        expect(screen.getAllByText(/test-block-2/i)).toBeDefined();
    });
});