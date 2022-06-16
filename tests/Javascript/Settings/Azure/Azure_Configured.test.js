import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import Azure from '../../../../resources/js/components/Routes/Settings/Azure';

mockData.settings['azure.graph.tenant'] = '123';
mockData.settings['azure.graph.client_id'] = '1234';
mockData.settings['azure.graph.client_secret'] = '4321';

const TestElement = () => {
    const [settings, setSettings] = useState(mockData.settings);

    const typeValue = (key, value) => {
        mockData.settings[key] = value;
        settings[key] = value;
        setSettings({ ...settings });
    }

    const setValue = (key, value, ce) => {
        mockData.settings[key] = value;
        settings[key] = value;
        setSettings({ ...settings });
    }

    return <Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={setValue} typeValue={typeValue} />
}

describe('Azure Component - Configured', () => {
    test('Renders Azure', async () => {
        render(<WebAppsUX><BrowserRouter><TestElement /></BrowserRouter></WebAppsUX>);

        await waitFor(() => expect(screen.getByText(/azure app registration information/i)).toBeDefined());
        expect(screen.getByText(/map azure groups to webapps groups/i)).toBeDefined();
        expect(screen.getByText(/azure synchronisation status/i)).toBeDefined();

        await waitFor(async () => expect(screen.getByRole('textbox', { name: /administrators/i })).toBeDefined());
    });

    test('Can Enable Azure Authentication', async () => {
        expect(screen.getByRole('checkbox', { name: /enable azure authentication/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /enable azure authentication/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.login_enabled']).toEqual('true'));
    });

    test('Can Enable Azure Auto Login', async () => {
        expect(screen.getByRole('checkbox', { name: /use azure authentication by default/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /use azure authentication by default/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.default_login']).toEqual('true'));
    });

    test('Can Disable Azure Authentication', async () => {
        expect(screen.getByRole('checkbox', { name: /enable azure authentication/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /enable azure authentication/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.login_enabled']).toEqual('false'));
    });

    test('Can Disable Azure Auto Login', async () => {
        expect(screen.getByRole('checkbox', { name: /use azure authentication by default/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /use azure authentication by default/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.default_login']).toEqual('false'));
    });

    test('Cannot Add A Group Mapping Due to An Error', async () => {
        expect(screen.getByRole('textbox', { name: /administrators/i })).toBeDefined();
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /administrators/i }), { target: { value: '000' } });
            await screen.getByRole('textbox', { name: /administrators/i }).value === '000';
        });
        await waitFor(() => expect(screen.getByText(/example/i)).toBeDefined());

        await act(async () => {
            fireEvent.click(screen.getByText(/example/i));
        });
        await waitFor(() => expect(screen.getByText(/failed to save/i)).toBeDefined());
    });

    test('Can Add A Group Mapping', async () => {
        expect(screen.getByRole('textbox', { name: /administrators/i })).toBeDefined();
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /administrators/i }), { target: { value: '001' } });
            await screen.getByRole('textbox', { name: /administrators/i }).value === '001';
        });
        await waitFor(() => expect(screen.getByText(/group 1/i)).toBeDefined());

        await act(async () => {
            fireEvent.click(screen.getByText(/group 1/i));
        });
        await waitFor(() => expect(screen.getByRole('textbox', { name: /administrators/i }).value === 'Group 1'));
    });

    test('Can Request A Manual Azure Sync', async () => {
        expect(screen.getByRole('button', { name: /sync now/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /sync now/i }));
        });
        await waitFor(() => expect(screen.getByRole('button', { name: /syncing/i })).toBeDefined());
    });
});