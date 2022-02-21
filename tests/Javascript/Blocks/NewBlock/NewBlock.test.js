import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import NewBlock from '../../../../resources/js/components/Routes/Blocks/NewBlock';

describe('NewBlock Component', () => {
    test('Can Render', async () => {
        render(<WebApps><BrowserRouter><NewBlock /></BrowserRouter></WebApps>);
        await waitFor(() => expect(screen.getByRole('heading', { name: /select the plugin you wish to use\.\.\./i })).toBeDefined());

        expect(screen.getByText(/sample/i)).toBeDefined();
        expect(screen.getByText(/jest/i)).toBeDefined();
    });

    test('Can Select A Plugin To Use', async () => {
        expect(screen.getByText(/sample/i)).toBeDefined();
        expect(screen.getByText(/jest/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByText(/sample/i));
        });
        await waitFor(() => screen.getByRole('button', { name: /block properties/i }));
        await waitFor(() => expect(screen.getByText(/enter the sample message/i)).toBeDefined());
    });
});