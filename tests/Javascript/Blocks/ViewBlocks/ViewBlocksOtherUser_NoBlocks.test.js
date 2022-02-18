import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import ViewBlocks from '../../../../resources/js/components/Routes/Blocks/ViewBlocks';

describe('ViewBlocks Component - Other Users', () => {
    test('Can View Another User\'s Blocks - No Blocks Were Found)', async () => {
        render(<WebApps><BrowserRouter><ViewBlocks match={{ params: { username: 'jestNoBlocks' } }} /></BrowserRouter></WebApps>);
        await waitFor(() => expect(screen.getByRole('heading', { name: /this user has not created any blocks yet./i })).toBeDefined());
    });
});