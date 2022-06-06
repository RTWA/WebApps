import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { AppError, Auth, WebAppsUX } from 'webapps-react';

import { rest } from 'msw';
import { server } from '../../../../resources/js/__mocks__/server';

import EditBlock from '../../../../resources/js/components/Routes/Blocks/EditBlock';

describe('EditBlock Component', () => {
    test('Cannot Render Due To Error', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
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
        render(<Auth><WebAppsUX><BrowserRouter><AppError><EditBlock id="TestBlock" /></AppError></BrowserRouter></WebAppsUX></Auth>);
        await waitFor(() => expect(screen.getByText(/error: failed to load/i)).toBeDefined());
        jest.resetAllMocks();
    });
});