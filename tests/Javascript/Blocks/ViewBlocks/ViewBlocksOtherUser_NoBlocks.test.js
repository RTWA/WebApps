import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import ViewBlocks from '../../../../resources/js/components/Routes/Blocks/ViewBlocks';

describe('ViewBlocks Component - Other Users', () => {
    test('Can View Another User\'s Blocks - No Blocks Were Found)', async () => {
        render(
            <WebAppsUX>
                <MemoryRouter initialEntries={["/blocks/user/jestNoBlocks"]}>
                    <Routes>
                        <Route path="/blocks/user/:username" element={<ViewBlocks />} />
                    </Routes>
                </MemoryRouter>
            </WebAppsUX>
        );
        await waitFor(() => expect(screen.getByRole('heading', { name: /this user has not created any blocks yet./i })).toBeDefined());
    });
});