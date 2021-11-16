import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from 'react-toast-notifications';

import * as mockData from '../../../resources/js/__mocks__/mockData';

import { WebApps } from 'webapps-react';

import ViewBlock from '../../../resources/js/components/Routes/Blocks/ViewBlock';

test('Can View A Block', async () => {
    render(<ToastProvider><WebApps><BrowserRouter><ViewBlock match={{ params: { id: mockData.blocks[0].id } }} /></BrowserRouter></WebApps></ToastProvider>);
    await waitFor(() => expect(screen.getByText(/plugin:/i)).toBeDefined());

    expect(screen.getByText(/1234/i)).toBeDefined();
});