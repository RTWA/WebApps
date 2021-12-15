import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import * as mockData from '../../../resources/js/__mocks__/mockData';

import { WebApps } from 'webapps-react';

import AccessPermissions from '../../../resources/js/components/Routes/Settings/AccessPermissions';

const mockFunction = (e) => {
    return null;
}

test('Renders Access Permissions', () => {
    render(<WebApps><AccessPermissions updateRole={mockFunction} groups={mockData.groups} permissions={mockData.permissions} /></WebApps>);

    expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /mocked permission/i })).toBeDefined();
});

test('Can Switch Between Tabs', async () => {
    render(<WebApps><AccessPermissions updateRole={mockFunction} groups={mockData.groups} permissions={mockData.permissions} /></WebApps>);

    expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /second group/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /second group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /second permission/i })
    );

    expect(screen.getByRole('heading', { name: /second permission/i })).toBeDefined();
});

test('Can Remove A Permission', async () => {
    render(<WebApps><AccessPermissions updateGroup={mockFunction} groups={mockData.groups} permissions={mockData.permissions} /></WebApps>);

    expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
    expect(screen.getByTestId('mocked.permission_Mocked Group')).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByTestId('mocked.permission_Mocked Group'));
    });
    await waitFor(() =>
        screen.getByTestId('mocked.permission_Mocked Group')
    );

    expect(screen.getByTestId('mocked.permission_Mocked Group')).toBeDefined();
});

test('Can Add A Permission', async () => {
    render(<WebApps><AccessPermissions updateGroup={mockFunction} groups={mockData.groups} permissions={mockData.permissions} /></WebApps>);

    expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /second group/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /second group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /second permission/i })
    );

    expect(screen.getByRole('heading', { name: /second permission/i })).toBeDefined();
    expect(screen.getByTestId('admin.access_Mocked Group')).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByTestId('admin.access_Mocked Group'));
    });
    await waitFor(() =>
        screen.getByTestId('admin.access_Mocked Group')
    );

    expect(screen.getByTestId('admin.access_Mocked Group')).toBeDefined();
});

test('Cannot Add A Permission Due To An Error', async () => {
    render(<WebApps><AccessPermissions updateGroup={mockFunction} groups={mockData.groups} permissions={mockData.permissions} /></WebApps>);

    expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /second group/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /second group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /second permission/i })
    );

    expect(screen.getByRole('heading', { name: /second permission/i })).toBeDefined();
    expect(screen.getByTestId('second.permission_Mocked Group')).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByTestId('second.permission_Mocked Group'));
    });
    await waitFor(() =>
        screen.getByText(/permission failed to update\. please reload the page try again\./i)
    );

    expect(screen.getByText(/permission failed to update\. please reload the page try again\./i)).toBeDefined();
});

test('Cannot Toggle Admin Permission for Administrators', async () => {
    render(<WebApps><AccessPermissions updateGroup={mockFunction} groups={mockData.groups} permissions={mockData.permissions} /></WebApps>);

    expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /second group/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /second group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /second permission/i })
    );

    expect(screen.getByRole('heading', { name: /second permission/i })).toBeDefined();
    expect(screen.getByTestId('admin.access_Administrators')).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByTestId('admin.access_Administrators'));
    });
    await waitFor(() =>
        screen.getByText(/administrators cannot be denied access to administrative options/i)
    );

    expect(screen.getByText(/administrators cannot be denied access to administrative options/i)).toBeDefined();
});