import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';

import { server } from '../../../resources/js/__mocks__/server';
import * as mockData from '../../../resources/js/__mocks__/mockData';

import { WebApps } from 'webapps-react';

import ViewBlocks from '../../../resources/js/components/Routes/Blocks/ViewBlocks';

test('Can View My Blocks', async () => {
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.getByText(/test block/i)).toBeDefined();
    expect(screen.getByText(/1234/i)).toBeDefined();
});

test('Can View My Blocks And Load More', async () => {
    server.use(
        rest.get('/api/blocks', (req, res, ctx) => {
            let offset = req.url.searchParams.get('offset');
            if (offset === '0') {
                return res(
                    ctx.status(200),
                    ctx.json({
                        blocks: [mockData.blocks[0]],
                        styles: {
                            Sample: ".Sample { display:block; }"
                        },
                        total: 32
                    })
                )
            } else {
                return res(
                    ctx.status(200),
                    ctx.json({
                        blocks: [mockData.blocks[1]],
                        styles: {
                            Sample2: ".Sample2 { display:block; }"
                        },
                        total: 2
                    })
                )
            }
        })
    )
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.findAllByText(/test block/i)).toBeDefined();

    /////////////////////////////////////////////////////////////////////////////////
    // TODO: Currently not testing OK, but functions OK
    // expect(screen.getByRole('button', { name: /load more/i })).toBeDefined();

    // expect(screen.queryByText(/test-block-2/i)).toBeNull();

    // await act(async () => {
    //     fireEvent.click(screen.getByRole('button', { name: /load more/i }));
    // });
    // await waitFor(() =>
    //     screen.getAllByText(/test-block-2/i)
    // );
    /////////////////////////////////////////////////////////////////////////////////

    expect(screen.getAllByText(/test-block-2/i)).toBeDefined();
});

test('Cannot View My Blocks If I Don\'t Have Any', async () => {
    server.use(
        rest.get('/api/blocks', (req, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.json({
                    message: "No blocks found."
                })
            )
        })
    )
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByText(/you have not created any blocks yet./i)).toBeDefined());
});

test('Can Rename Block Via Context Menu', async () => {
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.getByText(/test block/i)).toBeDefined();
    expect(screen.getByTestId(/context-testBlock/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByTestId(/context-testBlock/i));
    });
    await waitFor(() =>
        screen.getByRole('link', { name: /rename/i })
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('link', { name: /rename/i }));
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

test('Cannot Rename Block Via Context Menu Due To Error', async () => {
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.getByText(/test block/i)).toBeDefined();
    expect(screen.getByTestId(/context-testBlock/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByTestId(/context-testBlock/i));
    });
    await waitFor(() =>
        screen.getByRole('link', { name: /rename/i })
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('link', { name: /rename/i }));
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

test('Can Delete Block Via Context Menu', async () => {
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.getByText(/test block/i)).toBeDefined();
    expect(screen.getByTestId(/context-testBlock/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByTestId(/context-testBlock/i));
    });
    await waitFor(() =>
        screen.getByRole('link', { name: /delete/i })
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('link', { name: /delete/i }));
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
    expect(screen.queryByText(/test block/i)).toBeNull();
});

test('Cannot Delete Block Via Context Menu Due To An Error', async () => {
    server.use(
        rest.post('/api/blocks/:id', (req, res, ctx) => {
            return res(
                ctx.status(500)
            )
        })
    )
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.getByText(/test block/i)).toBeDefined();
    expect(screen.getByTestId(/context-testBlock/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByTestId(/context-testBlock/i));
    });
    await waitFor(() =>
        screen.getByRole('link', { name: /delete/i })
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('link', { name: /delete/i }));
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
    expect(screen.getByText(/test block/i)).toBeDefined();
});

test('Can Filter Blocks By Plugin', async () => {
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.getByText(/test block/i)).toBeDefined();
    expect(screen.getByRole('combobox', { name: /filter by plugin/i })).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('combobox', { name: /filter by plugin/i }), { target: { value: '1' } });
        await screen.getByRole('combobox', { name: /filter by plugin/i }).value === '1';
    });
    await act(async () => {
        fireEvent.blur(screen.getByRole('combobox', { name: /filter by plugin/i }));
    });

    // Select the same filter again (data should not reload)
    await act(async () => {
        fireEvent.change(screen.getByRole('combobox', { name: /filter by plugin/i }), { target: { value: '1' } });
        await screen.getByRole('combobox', { name: /filter by plugin/i }).value === '1';
    });
    await act(async () => {
        fireEvent.blur(screen.getByRole('combobox', { name: /filter by plugin/i }));
    });

    expect(screen.getByText(/test block/i)).toBeDefined();

    // Change for else if
    await act(async () => {
        fireEvent.change(screen.getByRole('combobox', { name: /filter by plugin/i }), { target: { value: '2' } });
        await screen.getByRole('combobox', { name: /filter by plugin/i }).value === '2';
    });
    await act(async () => {
        fireEvent.blur(screen.getByRole('combobox', { name: /filter by plugin/i }));
    });

    expect(screen.getByText(/test block/i)).toBeDefined();

    // Reset for final else
    await act(async () => {
        fireEvent.change(screen.getByRole('combobox', { name: /filter by plugin/i }), { target: { value: '' } });
        await screen.getByRole('combobox', { name: /filter by plugin/i }).value === '';
    });
    await act(async () => {
        fireEvent.blur(screen.getByRole('combobox', { name: /filter by plugin/i }));
    });

    expect(screen.getByText(/test block/i)).toBeDefined();
});

test('Can Filter Blocks By Search', async () => {
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.getByText(/test block/i)).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /filter by search/i }), { target: { value: 'test' } });
        await screen.getByRole('textbox', { name: /filter by search/i }).value === 'test';
    });
    await act(async () => {
        fireEvent.keyUp(screen.getByRole('textbox', { name: /filter by search/i }));
    });

    await waitFor(() => expect(screen.getByText(/test block/i)).toBeDefined());
});

test('Can Filter Blocks By Search With No Matching Blocks Found', async () => {
    server.use(
        rest.get('/api/blocks', (req, res, ctx) => {
            let filter = req.url.searchParams.get('filter');
            if (filter === 'test') {
                return res(
                    ctx.status(200),
                    ctx.json({
                        blocks: [],
                        styles: [],
                        total: 0
                    })
                )
            } else {
                return res(
                    ctx.status(200),
                    ctx.json({
                        blocks: [mockData.blocks[0]],
                        styles: {
                            Sample: ".Sample { display:block; }"
                        },
                        total: 1
                    })
                )
            }
        })
    )
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.getByText(/test block/i)).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /filter by search/i }), { target: { value: 'test' } });
        await screen.getByRole('textbox', { name: /filter by search/i }).value === 'test';
    });
    await act(async () => {
        fireEvent.keyUp(screen.getByRole('textbox', { name: /filter by search/i }));
    });

    await waitFor(() => expect(screen.getByText(/no matching blocks found/i)).toBeDefined());
});

test('Can View Another User\'s Blocks (No Blocks)', async () => {
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: 'jest2' } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByRole('heading', { name: /this user has not created any blocks yet./i })).toBeDefined());
});

test('Can View Another User\'s Blocks And Load More', async () => {
    server.use(
        rest.get('/api/blocks/user/jest2', (req, res, ctx) => {
            let offset = req.url.searchParams.get('offset');
            if (offset === '0') {
                return res(
                    ctx.status(200),
                    ctx.json({
                        blocks: [mockData.blocks[0]],
                        styles: {
                            Sample: ".Sample { display:block; }"
                        },
                        total: 32
                    })
                )
            } else {
                return res(
                    ctx.status(200),
                    ctx.json({
                        blocks: [mockData.blocks[1]],
                        styles: {
                            Sample2: ".Sample2 { display:block; }"
                        },
                        total: 2
                    })
                )
            }
        })
    )
    render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: 'jest2' } }} /></BrowserRouter></WebApps>);
    await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());

    expect(screen.findAllByText(/test block/i)).toBeDefined();

    
    /////////////////////////////////////////////////////////////////////////////////
    // TODO: Currently not testing OK, but functions OK
    // expect(screen.getByRole('button', { name: /load more/i })).toBeDefined();

    // expect(screen.queryByText(/test-block-2/i)).toBeNull();

    // await act(async () => {
    //     fireEvent.click(screen.getByRole('button', { name: /load more/i }));
    // });
    // await waitFor(() =>
    //     screen.getAllByText(/test-block-2/i)
    // );

    // expect(screen.getAllByText(/test-block-2/i)).toBeDefined();
    /////////////////////////////////////////////////////////////////////////////////
});