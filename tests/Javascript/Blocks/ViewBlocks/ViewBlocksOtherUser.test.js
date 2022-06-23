import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import ViewBlocks from '../../../../resources/js/components/Routes/Blocks/ViewBlocks';

describe('ViewBlocks Component - Other Users', () => {
    test('Can View Another User\'s Blocks', async () => {
        render(
            <WebAppsUX>
                <MemoryRouter initialEntries={["/blocks/user/jest2"]}>
                    <Routes>
                        <Route path="/blocks/user/:username" element={<ViewBlocks />} />
                    </Routes>
                </MemoryRouter>
            </WebAppsUX>
        );
        await waitFor(() => expect(screen.getByPlaceholderText('Search...')).toBeDefined());
        await waitFor(() => screen.getByText(/test block/i));
        expect(screen.getByText(/1234/i)).toBeDefined();
    });

    test('Can Load More', async () => {
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
});