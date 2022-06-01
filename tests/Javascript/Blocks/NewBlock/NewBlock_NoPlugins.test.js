import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { WebApps, WebAppsUX } from 'webapps-react';

import { server } from '../../../../resources/js/__mocks__/server';
import NewBlock from '../../../../resources/js/components/Routes/Blocks/NewBlock';

describe('NewBlock Component - No Plugins', () => {
    test('No Plugins Available', async () => {
        server.use(
            rest.get('/api/plugins', (req, res, ctx) => {
                return res(
                    ctx.status(200),
                    ctx.json({
                        plugins: []
                    })
                )
            }),
            rest.get('/api/plugins/active', (req, res, ctx) => {
                return res(
                    ctx.status(200),
                    ctx.json({
                        plugins: []
                    })
                )
            }),
        )

        render(<WebAppsUX><WebApps><BrowserRouter><NewBlock /></BrowserRouter></WebApps></WebAppsUX>);
        await waitFor(() => expect(screen.getByRole('heading', { name: /no active plugins!/i })).toBeDefined());

        expect(screen.getByRole('heading', { name: /no active plugins!/i })).toBeDefined();
        expect(screen.getByText(/please contact your system administrator\./i)).toBeDefined();
    });
});