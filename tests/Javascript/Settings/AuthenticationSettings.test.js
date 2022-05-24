import React from 'react';
import { act, fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import '../../../resources/js/__mocks__/mockMedia';
import * as mockData from '../../../resources/js/__mocks__/mockData';
import AuthenticationSettings from '../../../resources/js/components/Routes/Settings/AuthenticationSettings';

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

mockData.settings['azure.graph.client_id'] = '000';
mockData.settings['azure.graph.client_secret'] = 'abc';

describe('AuthenticationSettings Component', () => {
    test('Can Render', () => {
        render(<WebAppsUX><AuthenticationSettings settings={mockData.settings} typeValue={typeValue} setValue={setValue} roles={mockData.groups} states={{}} /></WebAppsUX>);

        expect(screen.getByText(/allow registration/i)).toBeDefined();
    });

    test('Can Disable Registrations', async () => {
        expect(mockData.settings['auth.internal.registrations']).toEqual('true');
        expect(screen.getByText(/allow registration of webapps users/i)).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('checkbox', { name: /allow registration of webapps users/i }));
        });
        await waitFor(() => expect(mockData.settings['auth.internal.registrations']).toEqual('false'));
    });

    // FIXME: Not Working
    // test('Cannot See Default User Group on Registration Option If Registrations Are Disabled', async () => {
    //     expect(mockData.settings['auth.internal.registrations']).toEqual('false');
    //     expect(screen.getByText(/allow registration of webapps users/i)).toBeDefined();
    //     await waitForElementToBeRemoved(() => screen.queryByText(/default user group on registration/i));
    //     expect(screen.queryByText(/default user group on registration/i)).toBeNull()
    // });

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

    test('Cant See And Toggle Azure Authentication Options', async () => {
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
});