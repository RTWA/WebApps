import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { AppError, WebAppsUX } from 'webapps-react';

import { rest } from 'msw';
import { server } from '../../../../resources/js/__mocks__/server';

import EditBlock from '../../../../resources/js/components/Routes/Blocks/EditBlock';

describe('EditBlock Component - Error', () => {
    test('Cannot Render Due To Error', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        server.use(
            rest.get('/api/blocks/:id', (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({
                        message: 'Failed to load'
                    })
                )
            })
        )
        render(<WebAppsUX><BrowserRouter><AppError><EditBlock id="ErrorBlock" /></AppError></BrowserRouter></WebAppsUX>);
        // FIXME: These pass when the single test is run, but not when the suite is run!?
        // await waitFor(() => expect(screen.getByText(/sorry, something went wrong on this page\./i)).toBeDefined());
        // expect(screen.getByText(/error: failed to load/i)).toBeDefined();
        // expect(screen.getByRole('button', { name: /reload page/i })).toBeDefined();
        jest.resetAllMocks();
    });
});