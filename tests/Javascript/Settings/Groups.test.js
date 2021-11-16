import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import { ToastProvider } from 'react-toast-notifications';

import * as mockData from '../../../resources/js/__mocks__/mockData';

import { WebApps } from 'webapps-react';

import UsersGroups from '../../../resources/js/components/Routes/Settings/UsersGroups';

const mockFunction = (e) => {
    return null;
}

test('Can View Groups List', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /add new group/i })
    );

    expect(screen.getByRole('heading', { name: /mocked group/i })).toBeDefined();
});

test('Can View Groups List Loader', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={[]} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByTestId('group-loader')
    );

    expect(screen.getByTestId('group-loader')).toBeDefined();
});

test('Can Return To Users List After Viewing Groups List', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /add new group/i })
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /users/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /add new user/i })
    );

    expect(screen.getByText(/test jest user/i)).toBeDefined();
});

test('Can Select A Group', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /mocked group/i })
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /mocked group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', {  name: /mocked group \- group properties/i})
    );

    expect(screen.getByRole('button', {  name: /delete group/i})).toBeDefined();
});

test('Can View The Add New Group Flyout', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /add new group/i })
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add new group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /add new group/i })
    );

    expect(screen.getByText(/groups name/i)).toBeDefined();
});

test('Can Create A New Group With Valid Data', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} setGroups={mockFunction} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /add new group/i })
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add new group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /add new group/i })
    );

    expect(screen.getByText(/groups name/i)).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /groups name/i,  hidden: true}), { target: { value: 'New Group' } });
        await screen.getByRole('textbox', {  name: /groups name/i,  hidden: true}).value === 'New Group';
    });

    expect(screen.getByRole('button', {  name: /create group/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', {  name: /create group/i}));
    });
    await waitFor(() =>
        screen.getByText(/group created successfully/i)
    );

    expect(screen.getByText(/group created successfully/i)).toBeDefined();
});

test('Cannot Create A New Group With Invalid Data', async () => {
    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} setGroups={mockFunction} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /add new group/i })
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add new group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /add new group/i })
    );

    expect(screen.getByText(/groups name/i)).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /groups name/i,  hidden: true}), { target: { value: 'Mocked Group' } });
        await screen.getByRole('textbox', {  name: /groups name/i,  hidden: true}).value === 'Mocked Group';
    });

    expect(screen.getByRole('button', {  name: /create group/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', {  name: /create group/i}));
    });
    await waitFor(() =>
        screen.getByText(/the name has already been taken\./i)
    );

    expect(screen.getByText(/the name has already been taken\./i)).toBeDefined();
});

test('Can Rename A Group', async () => {
    if (mockData.groups[0].name !== 'Mocked Group') { mockData.groups[0].name = 'Mocked Group'; }

    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} setGroups={mockFunction} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /mocked group/i })
    );

    expect(screen.getByRole('heading', { name: /mocked group/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /mocked group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', {  name: /mocked group \- group properties/i})
    );

    expect(screen.getByRole('textbox', {  name: /group name/i,  hidden: true})).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /group name/i,  hidden: true}), { target: { value: 'New Name' } });
        await screen.getByRole('textbox', {  name: /group name/i,  hidden: true}).value === 'New Name';
    });

    await act(async () => {
        fireEvent.blur(screen.getByRole('textbox', { name: /group name/i, hidden: true }))
    });

    await waitFor(() => {
        screen.getByRole('heading', {  name: /new name \- group properties/i})
    });

    expect(screen.getByRole('heading', {  name: /new name \- group properties/i})).toBeDefined();
});

test('Cannot Rename A Group With Invalid Data', async () => {
    if (mockData.groups[0].name !== 'Mocked Group') { mockData.groups[0].name = 'Mocked Group'; }
    
    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} setGroups={mockFunction} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /add new group/i })
    );

    expect(screen.getByRole('heading', { name: /mocked group/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /mocked group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', {  name: /mocked group \- group properties/i})
    );

    expect(screen.getByRole('textbox', {  name: /group name/i,  hidden: true})).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /group name/i,  hidden: true}), { target: { value: 'invalid' } });
        await screen.getByRole('textbox', {  name: /group name/i,  hidden: true}).value === 'invalid';
    });

    await act(async () => {
        fireEvent.blur(screen.getByRole('textbox', { name: /group name/i, hidden: true }))
    });

    await waitFor(() => {
        screen.getByText(/this is invalid\./i)
    });

    expect(screen.getByText(/this is invalid\./i)).toBeDefined();
});

test('Cannot Rename A Group With Invalid Data For Old Name', async () => {
    if (mockData.groups[0].name !== 'Mocked Group') { mockData.groups[0].name = 'Mocked Group'; }
    
    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} setGroups={mockFunction} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /add new group/i })
    );

    expect(screen.getByRole('heading', { name: /mocked group/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /mocked group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', {  name: /mocked group \- group properties/i})
    );

    expect(screen.getByRole('textbox', {  name: /group name/i,  hidden: true})).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', {  name: /group name/i,  hidden: true}), { target: { value: 'old_name_error' } });
        await screen.getByRole('textbox', {  name: /group name/i,  hidden: true}).value === 'old_name_error';
    });

    await act(async () => {
        fireEvent.blur(screen.getByRole('textbox', { name: /group name/i, hidden: true }))
    });

    await waitFor(() => {
        screen.getByText(/the old name must exist\./i)
    });

    expect(screen.getByText(/the old name must exist\./i)).toBeDefined();
});

test('Can Delete A Group', async () => {
    if (mockData.groups[0].name !== 'Mocked Group') { mockData.groups[0].name = 'Mocked Group'; }

    render(<WebApps><ToastProvider><BrowserRouter><UsersGroups groups={mockData.groups} setGroups={mockFunction} /></BrowserRouter></ToastProvider></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));

    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /groups/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /mocked group/i })
    );

    expect(screen.getByRole('heading', { name: /mocked group/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('heading', { name: /mocked group/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', {  name: /mocked group \- group properties/i})
    );

    expect(screen.getByRole('button', {  name: /delete group/i})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /delete group/i }));
    });
    await waitFor(() => {
        screen.getByRole('button', { name: /are you sure\?/i })
    });
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /are you sure\?/i }));
    });
    await waitForElementToBeRemoved(() =>
        screen.getByRole('heading', { name: /mocked group \- group properties/i })
    );

    expect(screen.queryByRole('heading', { name: /mocked group \- group properties/i })).toBeNull();
});