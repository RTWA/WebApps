import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import UsersGroups from '../../../../resources/js/components/Routes/Settings/UsersGroups';

const mockFunction = jest.fn((e) => {
    return null;
});

describe('UserGroups Component - Select Group And Make Changes', () => {
    test('Can View Groups List', async () => {
        render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} setGroups={mockFunction} /></BrowserRouter></WebApps>);
        await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

        expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
        });
        await waitFor(() => expect(screen.getByRole('heading', { name: /mocked group/i })).toBeDefined());
    });

    test('Can Select A Group', async () => {
        await act(async () => {
            fireEvent.click(screen.getByRole('heading', { name: /mocked group/i }));
        });
        await waitFor(() => screen.getByRole('heading', { name: /mocked group \- group properties/i }));
        expect(screen.getByRole('button', { name: /delete group/i })).toBeDefined();
    });

    test('Cannot Rename With Invalid Data', async () => {
        expect(screen.getByRole('textbox', { name: /group name/i, hidden: true })).toBeDefined();
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /group name/i, hidden: true }), { target: { value: 'invalid' } });
            await screen.getByRole('textbox', { name: /group name/i, hidden: true }).value === 'invalid';
            fireEvent.blur(screen.getByRole('textbox', { name: /group name/i, hidden: true }), { target: { value: 'invalid' } })
        });
        await waitFor(() => expect(screen.getByText(/this is invalid\./i)).toBeDefined());
    });

    test('Cannot Rename With Invalid Data For Old Name', async () => {
        expect(screen.getByRole('textbox', { name: /group name/i, hidden: true })).toBeDefined();
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /group name/i, hidden: true }), { target: { value: 'old_name_error' } });
            await screen.getByRole('textbox', { name: /group name/i, hidden: true }).value === 'old_name_error';
            fireEvent.blur(screen.getByRole('textbox', { name: /group name/i, hidden: true }), { target: { value: 'old_name_error' } })
        });
        await waitFor(() => expect(screen.getByText(/the old name must exist\./i)).toBeDefined());
    });

    test('Can Rename', async () => {
        expect(screen.getByRole('textbox', { name: /group name/i, hidden: true })).toBeDefined();
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: /group name/i, hidden: true }), { target: { value: 'New Name' } });
            await screen.getByRole('textbox', { name: /group name/i, hidden: true }).value === 'New Name';
            fireEvent.blur(screen.getByRole('textbox', { name: /group name/i, hidden: true }), { target: { value: 'New Name' } })
        });
        await waitFor(() => expect(screen.getByText(/group renamed successfully/i)).toBeDefined());
    });

    test('Can Delete A Group', async () => {
        expect(screen.getByRole('button', { name: /delete group/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /delete group/i }));
        });
        await waitFor(() => screen.getByRole('button', { name: /are you sure\?/i }));
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /are you sure\?/i }));
        });
        await waitForElementToBeRemoved(() => screen.getByRole('heading', { name: /new name \- group properties/i }));
        expect(screen.queryByRole('heading', { name: /new name \- group properties/i })).toBeNull();
    });
});