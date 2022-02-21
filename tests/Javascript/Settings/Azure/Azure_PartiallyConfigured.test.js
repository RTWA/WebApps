import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import Azure from '../../../../resources/js/components/Routes/Settings/Azure';

const typeValue = (key, value) => {
    mockData.settings[key] = value;
}

const setValue = (key, value, ce) => {
    let config_editor = (ce !== undefined);
    if (config_editor) {
        key = key.replace('ce-', '');
    }
    mockData.settings[key] = value;
}

mockData.settings['azure.graph.tenant'] = '123';
mockData.settings['azure.graph.client_id'] = '';
mockData.settings['azure.graph.client_secret'] = '';

describe('Azure Component - Partially Configured', () => {
    test('Only Part Of The Second Form Loads When Tenant ID Is Provided And Client ID/Secret Are Not, But Is Revealed When They Are', async () => {
        render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={setValue} typeValue={typeValue} /></BrowserRouter></WebApps>);

        expect(screen.getByText(/azure app registration information/i)).toBeDefined();
        expect(screen.queryByText(/map azure groups to webapps groups/i)).toBeNull();
        expect(screen.queryByText(/azure synchronisation status/i)).toBeNull();

        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', {  name: /application \(client\) id/i}), { target: { value: '1234' } });
            await screen.getByRole('textbox', {  name: /application \(client\) id/i}).value === '1234';
            fireEvent.blur(screen.getByRole('textbox', {  name: /application \(client\) id/i}), { target: { value: '1234' } });
        });
        await waitFor(() => expect(mockData.settings['azure.graph.client_id']).toEqual('1234'));
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', {  name: /client secret/i}), { target: { value: '4321' } });
            await screen.getByRole('textbox', {  name: /client secret/i}).value === '4321';
            fireEvent.blur(screen.getByRole('textbox', {  name: /client secret/i}), { target: { value: '4321' } });
        });
        await waitFor(() => expect(mockData.settings['azure.graph.client_secret']).toEqual('4321'));

        await waitFor(async () => {
            expect(screen.getByText(/map azure groups to webapps groups/i)).toBeDefined();
            expect(screen.getByText(/azure synchronisation status/i)).toBeDefined();
            expect(screen.getByRole('textbox', { name: /administrators/i })).toBeDefined();
        });
    });
});