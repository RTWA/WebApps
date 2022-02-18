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
mockData.settings['azure.graph.client_id'] = '1234';
mockData.settings['azure.graph.client_secret'] = '4321';

describe('Azure Component - Configured', () => {
    test('Renders Azure', async () => {
        render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={setValue} typeValue={typeValue} /></BrowserRouter></WebApps>);

        expect(screen.getByText(/azure app registration information/i)).toBeDefined();
        expect(screen.getByText(/map azure groups to webapps groups/i)).toBeDefined();
        expect(screen.getByText(/azure synchronisation status/i)).toBeDefined();
        expect(screen.getByRole('combobox', { name: /administrators/i })).toBeDefined();

        await waitFor(async () => expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3));
    });

    test('Can Enable Azure Authentication', async () => {
        expect(screen.getByRole('checkbox', {  name: /enable azure authentication/i})).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /enable azure authentication/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.login_enabled']).toEqual('true'));
    });

    test('Can Enable Azure Auto Login', async () => {
        expect(screen.getByRole('checkbox', {  name: /use azure authentication by default/i})).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', {  name: /use azure authentication by default/i}));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.default_login']).toEqual('true'));
    });

    test('Can Disable Azure Authentication', async () => {
        expect(screen.getByRole('checkbox', {  name: /enable azure authentication/i})).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /enable azure authentication/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.login_enabled']).toEqual('false'));
    });

    test('Can Disable Azure Auto Login', async () => {
        expect(screen.getByRole('checkbox', {  name: /use azure authentication by default/i})).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', {  name: /use azure authentication by default/i}));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.default_login']).toEqual('false'));
    });

    // FIXME: This is not correctly testing a result
    // test('Can Add A Group Mapping', async () => {
    //     expect(screen.getByRole('combobox', { name: /administrators/i })).toBeDefined();

    //     await waitFor(async () => {
    //         expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
    //     });

    //     expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);

    //     await act(async () => {
    //         fireEvent.change(screen.getByRole('combobox', { name: /administrators/i }), { target: { value: '001' } });
    //         await screen.getByRole('combobox', { name: /administrators/i }).value === '001';
    //     });
    //     await waitFor(() => expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3));
    // });

    test('Can Request A Manual Azure Sync', async () => {
        expect(screen.getByRole('button', { name: /sync now/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /sync now/i }));
        });
        await waitFor(() => expect(screen.getByRole('button', { name: /syncing/i })).toBeDefined());
    });
});