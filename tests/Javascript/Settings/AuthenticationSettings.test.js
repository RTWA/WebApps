import React from 'react';
import { act, fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';

import '../../../resources/js/__mocks__/mockMedia';
import * as mockData from '../../../resources/js/__mocks__/mockData';

import { WebApps } from 'webapps-react';

import AuthenticationSettings from '../../../resources/js/components/Routes/Settings/AuthenticationSettings';

const mockFunction = (e) => {
    return null;
}

test('Renders Authentication Settings', () => {
    render(<WebApps><AuthenticationSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} roles={mockData.groups} states={{}} /></WebApps>);

    expect(screen.getByText(/allow registration/i)).toBeDefined();
});

test('Can Enable Registrations', async () => {
    mockData.settings['auth.internal.registrations'] = 'false';
    render(<WebApps><AuthenticationSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} roles={mockData.groups} states={{}} /></WebApps>);

    expect(screen.getByText(/allow registration of webapps users/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', { name: /allow registration of webapps users/i }));
    });
    await waitFor(() =>
        screen.getByRole('checkbox', { name: /allow registration of webapps users/i })
    );

    expect(screen.getByRole('checkbox', { name: /allow registration of webapps users/i })).toBeDefined();
});

test('Can Disable Registrations', async () => {
    mockData.settings['auth.internal.registrations'] = 'true';
    render(<WebApps><AuthenticationSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} roles={mockData.groups} states={{}} /></WebApps>);

    expect(screen.getByText(/allow registration of webapps users/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', { name: /allow registration of webapps users/i }));
    });
    await waitFor(() =>
        screen.getByRole('checkbox', { name: /allow registration of webapps users/i })
    );

    expect(screen.getByRole('checkbox', { name: /allow registration of webapps users/i })).toBeDefined();
});

test('Cannot See Default User Group on Registration Option If Registrations Are Disabled', async () => {
    mockData.settings['auth.internal.registrations'] = 'true';
    render(<WebApps><AuthenticationSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} roles={mockData.groups} states={{}} /></WebApps>);

    expect(screen.getByText(/allow registration of webapps users/i)).toBeDefined();
    expect(screen.getByText(/default user group on registration/i)).toBeDefined();
    
    mockData.settings['auth.internal.registrations'] = 'false';
        
    await waitForElementToBeRemoved(() =>
        screen.queryByText(/default user group on registration/i)
    );

    expect(screen.getByRole('checkbox', { name: /allow registration of webapps users/i })).toBeDefined();
    expect(screen.queryByText(/default user group on registration/i)).toBeNull();
});

test('Cant See And Toggle Azure Authentication Options', async () => {
    mockData.settings['azure.graph.client_id'] = '000';
    mockData.settings['azure.graph.client_secret'] = 'abc';
    render(<WebApps><AuthenticationSettings settings={mockData.settings} typeValue={mockFunction} setValue={mockFunction} roles={mockData.groups} states={{}} /></WebApps>);

    expect(screen.getByText(/enable azure authentication/i)).toBeDefined();
    expect(screen.getByText(/use azure authentication by default/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', {  name: /enable azure authentication/i}));
        mockData.settings['azure.graph.login_enabled'] = 'true';
    });
    await waitFor(() =>
        screen.getByRole('checkbox', {  name: /enable azure authentication/i})
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', {  name: /use azure authentication by default/i}));
        mockData.settings['azure.graph.default_login'] = 'true';
    });
    await waitFor(() =>
        screen.getByRole('checkbox', {  name: /use azure authentication by default/i})
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', {  name: /enable azure authentication/i}));
        mockData.settings['azure.graph.login_enabled'] = 'false';
    });
    await waitFor(() =>
        screen.getByRole('checkbox', {  name: /enable azure authentication/i})
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', {  name: /use azure authentication by default/i}));
        mockData.settings['azure.graph.default_login'] = 'false';
    });
    await waitFor(() =>
        screen.getByRole('checkbox', {  name: /use azure authentication by default/i})
    );

    expect(screen.getByRole('checkbox', {  name: /enable azure authentication/i})).toBeDefined();
    expect(screen.getByRole('checkbox', {  name: /use azure authentication by default/i})).toBeDefined();
});