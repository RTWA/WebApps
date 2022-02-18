import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import { WebApps } from 'webapps-react';

import * as mockData from '../../../../resources/js/__mocks__/mockData';
import UsersGroups from '../../../../resources/js/components/Routes/Settings/UsersGroups';

describe('UserGroups Component - Groups', () => {
    test('Can View Groups List', async () => {
        render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
        await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

        expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

        await act(async () => {
            fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
        });
        await waitFor(() => expect(screen.getByRole('heading', { name: /mocked group/i })).toBeDefined());
    });

    test('Can Return To Users List After Viewing Groups List', async () => {
        await act(async () => {
            fireEvent.click(screen.getByRole('heading', { name: /users/i }));
        });
        await waitFor(() =>
            screen.getByRole('button', { name: /add new user/i })
        );
        expect(screen.getByText(/test jest user/i)).toBeDefined();
    });

    // test('Can View The Add New Group Flyout', async () => {
    //     render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    //     await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    //     expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    //     await act(async () => {
    //         fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    //     });
    //     await waitFor(() =>
    //         screen.getByRole('button', { name: /add new group/i })
    //     );

    //     await act(async () => {
    //         fireEvent.click(screen.getByRole('button', { name: /add new group/i }));
    //     });
    //     await waitFor(() =>
    //         screen.getByRole('heading', { name: /add new group/i })
    //     );

    //     expect(screen.getByText(/groups name/i)).toBeDefined();
    // });

    // test('Can Create A New Group With Valid Data', async () => {
    //     render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} setGroups={mockFunction} /></BrowserRouter></WebApps>);
    //     await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    //     expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    //     await act(async () => {
    //         fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    //     });
    //     await waitFor(() =>
    //         screen.getByRole('button', { name: /add new group/i })
    //     );

    //     await act(async () => {
    //         fireEvent.click(screen.getByRole('button', { name: /add new group/i }));
    //     });
    //     await waitFor(() =>
    //         screen.getByRole('heading', { name: /add new group/i })
    //     );

    //     expect(screen.getByText(/groups name/i)).toBeDefined();

    //     await act(async () => {
    //         fireEvent.change(screen.getByRole('textbox', { name: /groups name/i, hidden: true }), { target: { value: 'New Group' } });
    //         await screen.getByRole('textbox', { name: /groups name/i, hidden: true }).value === 'New Group';
    //     });

    //     expect(screen.getByRole('button', { name: /create group/i })).toBeDefined();

    //     await act(async () => {
    //         fireEvent.click(screen.getByRole('button', { name: /create group/i }));
    //     });
    //     await waitFor(() =>
    //         screen.getByText(/group created successfully/i)
    //     );

    //     expect(screen.getByText(/group created successfully/i)).toBeDefined();
    // });

    // test('Cannot Create A New Group With Invalid Data', async () => {
    //     render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} setGroups={mockFunction} /></BrowserRouter></WebApps>);
    //     await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    //     expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    //     await act(async () => {
    //         fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    //     });
    //     await waitFor(() =>
    //         screen.getByRole('button', { name: /add new group/i })
    //     );

    //     await act(async () => {
    //         fireEvent.click(screen.getByRole('button', { name: /add new group/i }));
    //     });
    //     await waitFor(() =>
    //         screen.getByRole('heading', { name: /add new group/i })
    //     );

    //     expect(screen.getByText(/groups name/i)).toBeDefined();

    //     await act(async () => {
    //         fireEvent.change(screen.getByRole('textbox', { name: /groups name/i, hidden: true }), { target: { value: 'Mocked Group' } });
    //         await screen.getByRole('textbox', { name: /groups name/i, hidden: true }).value === 'Mocked Group';
    //     });

    //     expect(screen.getByRole('button', { name: /create group/i })).toBeDefined();

    //     await act(async () => {
    //         fireEvent.click(screen.getByRole('button', { name: /create group/i }));
    //     });
    //     await waitFor(() =>
    //         screen.getByText(/the name has already been taken\./i)
    //     );

    //     expect(screen.getByText(/the name has already been taken\./i)).toBeDefined();
    // });
});