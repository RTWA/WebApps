import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { WebApps } from 'webapps-react';

import { server } from '../../../../resources/js/__mocks__/server';
import EditBlock from '../../../../resources/js/components/Routes/Blocks/EditBlock';

describe('EditBlock Component - Orphaned Block', () => {
    test('Can Render Edit Block For An Orphaned Block', async () => {
        server.use(
            rest.get('/api/blocks/:id', (req, res, ctx) => {
                return res(
                    ctx.status(200),
                    ctx.json({
                        styles: "",
                        block: "Not available"
                    })

                )
            }),
        )
        render(<WebApps><BrowserRouter><EditBlock id="TestBlock" /></BrowserRouter></WebApps>);
        await waitFor(() => expect(screen.getByText(/this block is in an orphaned state\.please contact your system administrator\./i)).toBeDefined());

        expect(screen.getByText(/this block is in an orphaned state\.please contact your system administrator\./i)).toBeDefined();
    });
});