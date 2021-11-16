import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as mockData from '../../../resources/js/__mocks__/mockData';

import { WebApps } from 'webapps-react';

import Azure from '../../../resources/js/components/Routes/Settings/Azure';

const mockFunction = (e) => {
    return null;
}

test('Renders Azure', () => {
    render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={mockFunction} typeValue={mockFunction} /></BrowserRouter></WebApps>);

    expect(screen.getByRole('heading', { name: /microsoft azure integration/i })).toBeDefined();
    expect(screen.getByText(/please follow the guidance found in the webapps documentation to create your app registration in azure, then provide the required information below\./i)).toBeDefined();
})

test('Get Started Button Appears Once Client ID and Client Secret Are Provided', async () => {
    render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={mockFunction} typeValue={mockFunction} /></BrowserRouter></WebApps>);

    expect(screen.getByRole('textbox', { name: /application \(client\) id/i })).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /application \(client\) id/i }), { target: { value: '1234' } });
        await screen.getByRole('textbox', { name: /application \(client\) id/i }).value === '1234';
    });

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /client secret/i }), { target: { value: '4321' } });
        await screen.getByRole('textbox', { name: /client secret/i }).value === '4321';
    });
    await waitFor(() =>
        screen.getByRole('link', { name: /get started/i })
    );

    expect(screen.getByRole('link', { name: /get started/i })).toBeDefined();
})

test('Complete Second Form Loads When Tenant ID, Client ID and Client Secret Are Provided', async () => {
    mockData.settings['azure.graph.tenant'] = '123';
    mockData.settings['azure.graph.client_id'] = '1234';
    mockData.settings['azure.graph.client_secret'] = '4321';
    render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={mockFunction} typeValue={mockFunction} /></BrowserRouter></WebApps>);

    expect(screen.getByText(/azure app registration information/i)).toBeDefined();
    expect(screen.getByText(/map azure groups to webapps groups/i)).toBeDefined();
    expect(screen.getByText(/azure synchronisation status/i)).toBeDefined();

    expect(screen.getByRole('combobox', { name: /administrators/i })).toBeDefined();

    await waitFor(async () => {
        expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
    });

    expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
})

test('Only Part Of The Second Form Loads When Tenant ID Is Provided And Client ID/Secret Are Not, But Is Revealed When They Are', async () => {
    mockData.settings['azure.graph.tenant'] = '123';
    mockData.settings['azure.graph.client_id'] = '';
    mockData.settings['azure.graph.client_secret'] = '';
    render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={mockFunction} typeValue={mockFunction} /></BrowserRouter></WebApps>);

    expect(screen.getByText(/azure app registration information/i)).toBeDefined();
    expect(screen.queryByText(/map azure groups to webapps groups/i)).toBeNull();
    expect(screen.queryByText(/azure synchronisation status/i)).toBeNull();
    
    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /application \(client\) id/i}), { target: { value: '1234' } });
        await screen.getByRole('textbox', {  name: /application \(client\) id/i}).value === '1234';
        mockData.settings['azure.graph.client_id'] = '1234';
    });
    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /client secret/i}), { target: { value: '4321' } });
        await screen.getByRole('textbox', {  name: /client secret/i}).value === '4321';
        mockData.settings['azure.graph.client_secret'] = '4321';
    });
    await act(async () => {
        fireEvent.blur(screen.getByRole('textbox', {  name: /application \(client\) id/i}));
        fireEvent.blur(screen.getByRole('textbox', {  name: /client secret/i}));
    });

    await waitFor(async () => {
        expect(screen.getByText(/map azure groups to webapps groups/i)).toBeDefined();
        expect(screen.getByText(/azure synchronisation status/i)).toBeDefined();
        expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
    });

    expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
})

test('Can Enable Azure Authentication And Auto Login', async () => {
    mockData.settings['azure.graph.tenant'] = '123';
    mockData.settings['azure.graph.client_id'] = '1234';
    mockData.settings['azure.graph.client_secret'] = '4321';
    mockData.settings['azure.graph.login_enabled'] = 'true';
    mockData.settings['azure.graph.default_login'] = 'true';
    render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={mockFunction} typeValue={mockFunction} /></BrowserRouter></WebApps>);

    expect(screen.getByText(/azure app registration information/i)).toBeDefined();
    expect(screen.getByText(/map azure groups to webapps groups/i)).toBeDefined();
    expect(screen.getByText(/azure synchronisation status/i)).toBeDefined();

    expect(screen.getByRole('combobox', { name: /administrators/i })).toBeDefined();

    await waitFor(async () => {
        expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
    });

    expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
    expect(screen.getByRole('checkbox', {  name: /enable azure authentication/i})).toBeDefined();
    expect(screen.getByRole('checkbox', {  name: /use azure authentication by default/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', { name: /enable azure authentication/i }));
        fireEvent.click(screen.getByRole('checkbox', {  name: /use azure authentication by default/i}));
    });
    await waitFor(() =>
        screen.getByRole('checkbox', { name: /enable azure authentication/i }),
        screen.getByRole('checkbox', {  name: /use azure authentication by default/i})
    );
})

test('Can Disable Azure Authentication And Auto Login', async () => {
    mockData.settings['azure.graph.tenant'] = '123';
    mockData.settings['azure.graph.client_id'] = '1234';
    mockData.settings['azure.graph.client_secret'] = '4321';
    mockData.settings['azure.graph.login_enabled'] = 'false';
    mockData.settings['azure.graph.default_login'] = 'false';
    render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={mockFunction} typeValue={mockFunction} /></BrowserRouter></WebApps>);

    expect(screen.getByText(/azure app registration information/i)).toBeDefined();
    expect(screen.getByText(/map azure groups to webapps groups/i)).toBeDefined();
    expect(screen.getByText(/azure synchronisation status/i)).toBeDefined();

    expect(screen.getByRole('combobox', { name: /administrators/i })).toBeDefined();

    await waitFor(async () => {
        expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
    });

    expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
    expect(screen.getByRole('checkbox', {  name: /enable azure authentication/i})).toBeDefined();
    expect(screen.getByRole('checkbox', {  name: /use azure authentication by default/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('checkbox', { name: /enable azure authentication/i }));
        fireEvent.click(screen.getByRole('checkbox', {  name: /use azure authentication by default/i}));
    });
    await waitFor(() =>
        screen.getByRole('checkbox', { name: /enable azure authentication/i }),
        screen.getByRole('checkbox', {  name: /use azure authentication by default/i})
    );
})

test('Can Add A Group Mapping', async () => {
    mockData.settings['azure.graph.tenant'] = '123';
    mockData.settings['azure.graph.client_id'] = '1234';
    mockData.settings['azure.graph.client_secret'] = '4321';
    render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={mockFunction} typeValue={mockFunction} /></BrowserRouter></WebApps>);

    expect(screen.getByText(/azure app registration information/i)).toBeDefined();
    expect(screen.getByText(/map azure groups to webapps groups/i)).toBeDefined();
    expect(screen.getByText(/azure synchronisation status/i)).toBeDefined();

    expect(screen.getByRole('combobox', { name: /administrators/i })).toBeDefined();

    await waitFor(async () => {
        expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
    });

    expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);

    await act(async () => {
        fireEvent.change(screen.getByRole('combobox', { name: /administrators/i }), { target: { value: '001' } });
        await screen.getByRole('combobox', { name: /administrators/i }).value === '001';
    });

    expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
})

test('Can Request A Manual Azure Sync', async () => {
    mockData.settings['azure.graph.tenant'] = '123';
    mockData.settings['azure.graph.client_id'] = '1234';
    mockData.settings['azure.graph.client_secret'] = '4321';
    render(<WebApps><BrowserRouter><Azure settings={mockData.settings} states={{}} groups={mockData.groups} setValue={mockFunction} typeValue={mockFunction} /></BrowserRouter></WebApps>);

    expect(screen.getByText(/azure app registration information/i)).toBeDefined();
    expect(screen.getByText(/map azure groups to webapps groups/i)).toBeDefined();
    expect(screen.getByText(/azure synchronisation status/i)).toBeDefined();

    expect(screen.getByRole('combobox', { name: /administrators/i })).toBeDefined();

    await waitFor(async () => {
        expect(screen.getByRole('combobox', { name: /administrators/i }).children).toHaveLength(3);
    });

    expect(screen.getByRole('button', { name: /sync now/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /sync now/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /syncing/i })
    );

    expect(screen.getByRole('button', { name: /syncing/i })).toBeDefined();
})
