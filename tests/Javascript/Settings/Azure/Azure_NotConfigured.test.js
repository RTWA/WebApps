import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import Azure from '../../../../resources/js/components/Routes/Settings/Azure';

const mockFunction = (e) => {
    return null;
}

mockData.settings["azure.graph.tenant"] = '';

describe('Azure Component - Not Configured', () => {
    test('Renders Azure', () => {
        render(<WebAppsUX><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={mockFunction} typeValue={mockFunction} /></BrowserRouter></WebAppsUX>);

        expect(screen.getByText(/microsoft azure integration/i)).toBeDefined();
        expect(screen.getByText(/please follow the guidance found in the/i)).toBeDefined();
        expect(screen.getByText(/to create your app registration in azure, then provide the required information below\./i)).toBeDefined();
    });

    test('Get Started Button Appears Once Client ID and Client Secret Are Provided', async () => {
        expect(screen.getByRole('textbox', { name: /application \(client\) id/i })).toBeDefined();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /application \(client\) id/i }), { target: { value: '1234' } });
            await screen.getByRole('textbox', { name: /application \(client\) id/i }).value === '1234';
            fireEvent.change(screen.getByRole('textbox', { name: /client secret/i }), { target: { value: '4321' } });
            await screen.getByRole('textbox', { name: /client secret/i }).value === '4321';
        });
        await waitFor(() => expect(screen.getByRole('link', { name: /get started/i })).toBeDefined());
    });
});