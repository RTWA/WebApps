import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import { rest } from 'msw';
import { server } from '../../../../resources/js/__mocks__/server';

import ViewBlocks from '../../../../resources/js/components/Routes/Blocks/ViewBlocks';

describe('ViewBlocks Component - No Blocks Found', () => {
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
        render(<WebAppsUX><BrowserRouter><ViewBlocks match={{ params: { username: undefined } }} /></BrowserRouter></WebAppsUX>);
        await waitFor(() => expect(screen.getByText(/you have not created any blocks yet./i)).toBeDefined());
    });
});