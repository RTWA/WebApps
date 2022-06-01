import React, { useState } from 'react';
import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import '../../../resources/js/__mocks__/mockMedia';
import * as mockData from '../../../resources/js/__mocks__/mockData';
import AuthenticationSettings from '../../../resources/js/components/Routes/Settings/AuthenticationSettings';

mockData.settings['azure.graph.client_id'] = '000';
mockData.settings['azure.graph.client_secret'] = 'abc';

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

    return (
        <>
            <AuthenticationSettings settings={settings} typeValue={typeValue} setValue={setValue} roles={mockData.groups} states={{}} />
            <button onClick={() => setValue('azure.graph.client_id', '', false)}>Clear Client</button>
        </>
    )
}

describe('AuthenticationSettings Component', () => {
    test('Can Render', async () => {
        render(<WebAppsUX><TestElement /></WebAppsUX>);

        await waitFor(() => expect(screen.getByText(/allow registration/i)).toBeDefined());
    });

    test('Can Disable Registrations', async () => {
        expect(mockData.settings['auth.internal.registrations']).toEqual('true');
        expect(screen.getByText(/allow registration of webapps users/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /allow registration of webapps users/i }));
        });
        await waitFor(() => expect(mockData.settings['auth.internal.registrations']).toEqual('false'));
    });

    test('Cannot See Default User Group on Registration Option If Registrations Are Disabled', async () => {
        expect(mockData.settings['auth.internal.registrations']).toEqual('false');
        expect(screen.getByText(/allow registration of webapps users/i)).toBeDefined();
        await waitFor(() => expect(screen.queryByText(/default user group on registration/i)).toBeNull());
    });

    test('Can Enable Registrations', async () => {
        expect(mockData.settings['auth.internal.registrations']).toEqual('false');
        expect(screen.getByText(/allow registration of webapps users/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /allow registration of webapps users/i }));
        });
        await waitFor(() => expect(mockData.settings['auth.internal.registrations']).toEqual('true'));
    });

    test('Can See Default User Group on Registration Option If Registrations Are Enabled', async () => {
        expect(mockData.settings['auth.internal.registrations']).toEqual('true');
        expect(screen.getByText(/allow registration of webapps users/i)).toBeDefined();
        await waitFor(() => expect(screen.getByText(/default user group on registration/i)).toBeDefined());
    });

    test('Can See And Toggle Azure Authentication Options', async () => {
        expect(screen.getByText(/enable azure authentication/i)).toBeDefined();
        expect(screen.getByText(/use azure authentication by default/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /enable azure authentication/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.login_enabled']).toEqual('true'));

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /use azure authentication by default/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.default_login']).toEqual('true'));

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /enable azure authentication/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.login_enabled']).toEqual('false'));

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /use azure authentication by default/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.default_login']).toEqual('false'));
    });

    test('Azure Authentication Options Are Not Available When Azure Is Not Configured', async () => {
        expect(screen.getByText(/enable azure authentication/i)).toBeDefined();
        expect(screen.getByText(/use azure authentication by default/i)).toBeDefined();        
        expect(screen.getByRole('button', { name: /clear client/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /clear client/i }));
        });
        await waitFor(() => expect(mockData.settings['azure.graph.client_id']).toEqual(''));

        expect(screen.queryByText(/enable azure authentication/i)).toBeNull();
        expect(screen.queryByText(/use azure authentication by default/i)).toBeNull();
    });
});