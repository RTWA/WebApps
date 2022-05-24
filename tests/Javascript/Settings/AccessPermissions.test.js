import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WebAppsUX } from 'webapps-react';

import * as mockData from '../../../resources/js/__mocks__/mockData';
import AccessPermissions from '../../../resources/js/components/Routes/Settings/AccessPermissions';

const updateGroup = (group_index, new_group) => {
    mockData.groups[group_index] = new_group;
}

describe('AccessPermissions Component', () => {
    test('Renders', () => {
        render(<WebAppsUX><AccessPermissions updateGroup={updateGroup} groups={mockData.groups} permissions={mockData.permissions} /></WebAppsUX>);

        expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
        expect(screen.getByRole('heading', { name: /mocked permission/i })).toBeDefined();
    });

    test('Can Switch Between Tabs', async () => {
        expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /second group/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /second group/i }));
        });
        await waitFor(() => expect(screen.getByRole('heading', { name: /second permission/i })).toBeDefined());

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /mocked permissions group/i }));
        });
        await waitFor(() => expect(screen.getByRole('heading', { name: /mocked permission/i })).toBeDefined());
    });

    test('Can Remove A Permission', async () => {
        expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
        expect(screen.getByTestId('mocked.permission_Mocked Group')).toBeDefined();
        expect(mockData.groups[0].permissions.length).toEqual(1);

        await act(async () => {
            fireEvent.click(screen.getByTestId('mocked.permission_Mocked Group'));
        });
        await waitFor(() => expect(mockData.groups[0].permissions.length).toEqual(0));
    });

    test('Can Add A Permission', async () => {
        expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
        expect(screen.getByTestId('mocked.permission_Mocked Group')).toBeDefined();
        expect(mockData.groups[0].permissions.length).toEqual(0);

        await act(async () => {
            fireEvent.click(screen.getByTestId('mocked.permission_Mocked Group'));
        });
        await waitFor(() => expect(mockData.groups[0].permissions.length).toEqual(1));
    });

    test('Cannot Add A Permission Due To An Error', async () => {expect(screen.getByRole('button', { name: /mocked permissions group/i })).toBeDefined();
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
            screen.getByText(/permission failed to update\./i)
        );

        expect(screen.getByText(/permission failed to update\./i)).toBeDefined();
    });

    test('Cannot Toggle Admin Permission for Administrators', async () => {
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
});