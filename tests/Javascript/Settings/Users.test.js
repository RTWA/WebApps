import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitForElementToBeRemoved, waitFor } from '@testing-library/react';

import * as mockData from '../../../resources/js/__mocks__/mockData';

import { WebApps } from 'webapps-react';

import UsersGroups from '../../../resources/js/components/Routes/Settings/UsersGroups';

test('Can View User List', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/test jest user/i)).toBeDefined();
});

test('Can Select A User', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/test jest user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/test jest user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /test jest user \- properties/i })
    );

    expect(screen.getByRole('link', { name: /view this user's block/i, hidden: true })).toBeDefined();
});

test('Can Reset A User Password', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/test jest user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/test jest user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /test jest user \- properties/i })
    );

    expect(screen.getByRole('button', {  name: /change this user's password/i,  hidden: true})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', {  name: /change this user's password/i,  hidden: true}));
    });
    await waitFor(() =>
        screen.getByLabelText(/new password/i)
    );

    await act(async () => {
        fireEvent.change(screen.getByLabelText(/new password:/i), { target: { value: 'newPassword' } });
        await screen.getByLabelText(/new password:/i).value === 'newPassword';
        fireEvent.change(screen.getByLabelText(/confirm password:/i), { target: { value: 'newPassword' } });
        await screen.getByLabelText(/confirm password:/i).value === 'newPassword';
    });

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
    });
    await waitFor(() =>
        screen.getByText(/password has been changed!/i)
    );

    expect(screen.getByText(/password has been changed!/i)).toBeDefined();
});

test('Cannot Reset A User Password If A New Password Isn\'t Provided', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/test jest user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/test jest user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /test jest user \- properties/i })
    );

    expect(screen.getByRole('button', {  name: /change this user's password/i,  hidden: true})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', {  name: /change this user's password/i,  hidden: true}));
    });
    await waitFor(() =>
        screen.getByLabelText(/new password/i)
    );

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
    });
    await waitFor(() =>
        screen.getByText(/please enter a new password\./i)
    );

    expect(screen.getByText(/please enter a new password\./i)).toBeDefined();
});

test('Cannot Reset A User Password If They Don\'t Match', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/test jest user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/test jest user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /test jest user \- properties/i })
    );

    expect(screen.getByRole('button', {  name: /change this user's password/i,  hidden: true})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', {  name: /change this user's password/i,  hidden: true}));
    });
    await waitFor(() =>
        screen.getByLabelText(/new password/i)
    );

    await act(async () => {
        fireEvent.change(screen.getByLabelText(/new password:/i), { target: { value: 'newPassword' } });
        await screen.getByLabelText(/new password:/i).value === 'newPassword';
        fireEvent.change(screen.getByLabelText(/confirm password:/i), { target: { value: 'newPassword1' } });
        await screen.getByLabelText(/confirm password:/i).value === 'newPassword1';
    });

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
    });
    await waitFor(() =>
        screen.getByText(/passwords do not match!/i)
    );

    expect(screen.getByText(/passwords do not match!/i)).toBeDefined();
});

test('Cannot Reset A User Password If It Is Invalid', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/test jest user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/test jest user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /test jest user \- properties/i })
    );

    expect(screen.getByRole('button', {  name: /change this user's password/i,  hidden: true})).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', {  name: /change this user's password/i,  hidden: true}));
    });
    await waitFor(() =>
        screen.getByLabelText(/new password/i)
    );

    await act(async () => {
        fireEvent.change(screen.getByLabelText(/new password:/i), { target: { value: 'ThisIsInvalid' } });
        await screen.getByLabelText(/new password:/i).value === 'ThisIsInvalid';
        fireEvent.change(screen.getByLabelText(/confirm password:/i), { target: { value: 'ThisIsInvalid' } });
        await screen.getByLabelText(/confirm password:/i).value === 'ThisIsInvalid';
    });

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
    });
    await waitFor(() =>
        screen.getByText(/this is not valid\./i)
    );

    expect(screen.getByText(/this is not valid\./i)).toBeDefined();
});

test('Cannot Reset A User Password With An Unknown Error', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/test jest user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/test jest user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /test jest user \- properties/i })
    );

    expect(screen.getByRole('button', { name: /change this user's password/i, hidden: true })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /change this user's password/i, hidden: true }));
    });
    await waitFor(() =>
        screen.getByLabelText(/new password/i)
    );

    await act(async () => {
        fireEvent.change(screen.getByLabelText(/new password:/i), { target: { value: 'unknown' } });
        await screen.getByLabelText(/new password:/i).value === 'unknown';
        fireEvent.change(screen.getByLabelText(/confirm password:/i), { target: { value: 'unknown' } });
        await screen.getByLabelText(/confirm password:/i).value === 'unknown';
    });

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /change password/i, hidden: true }));
    });
    await waitFor(() =>
        screen.getByLabelText(/new password:/i).value === ''
    );

    expect(screen.getByRole('button', { name: /change password/i, hidden: true })).toBeDefined();
});

test('Can Select A User And Change Their Group', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/test jest user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/test jest user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /test jest user \- properties/i })
    );

    await act(async () => {
        fireEvent.change(screen.getByRole('combobox', { name: /change security group/i, hidden: true }), { target: { value: mockData.groups[0].id } });
        await screen.getByRole('combobox', { name: /change security group/i, hidden: true }).value === mockData.groups[0].id;
    });

    await waitFor(() =>
        screen.getByText(/security group updated/i)
    );
});

test('Can Select A User But Can\'t Change Their Group If They Are AAD Provisioned', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/jest alternative user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/jest alternative user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /jest alternative user \- properties/i })
    );

    await act(async () => {
        fireEvent.change(screen.getByRole('combobox', { name: /change security group/i, hidden: true }), { target: { value: mockData.groups[0].id } });
        await screen.getByRole('combobox', { name: /change security group/i, hidden: true }).value === mockData.groups[0].id;
    });

    expect(screen.getByText(/you cannot change this user's group as they have been provisioned by microsoft azure active directory./i)).toBeDefined();
});

test('Can Select A User And Disable Them', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/test jest user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/test jest user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /test jest user \- properties/i })
    );

    expect(screen.getByRole('button', { name: /disable user account/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /disable user account/i }));
    });
    await waitFor(() =>
        screen.getByText(/this account is currently disabled/i)
    );

    expect(screen.getByRole('button', { name: /enable user account/i })).toBeDefined();
});

test('Can Select A User But Cannot Disable Them If They Are AAD Provisioned', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: /groups/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    expect(screen.getByText(/jest alternative user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/jest alternative user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /jest alternative user \- properties/i })
    );

    expect(screen.getByRole('button', { name: /disable user account/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /disable user account/i }));
    });
    await waitFor(() =>
        screen.getByText(/you cannot disable this user as they have been provisioned by microsoft azure active directory./i)
    );

    expect(screen.getByText(/you cannot disable this user as they have been provisioned by microsoft azure active directory./i)).toBeDefined();
});

test('Can View Disabled User List', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('button', { name: /show disabled users \(2\)/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /show disabled users \(2\)/i }));
    });
    await waitFor(() =>
        screen.getByText(/jest second user/i)
    );
});

test('Can Select A Disabled User And Enable Them', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('button', { name: /show disabled users \(2\)/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /show disabled users \(2\)/i }));
    });
    await waitFor(() =>
        screen.getByText(/jest second user/i)
    );

    expect(screen.getByText(/jest second user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/jest second user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /jest second user \- properties/i })
    );

    expect(screen.getByRole('button', { name: /enable user account/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /enable user account/i }));
    });
    await waitFor(() =>
        screen.getByRole('button', { name: /disable user account/i })
    );

    expect(screen.getByRole('button', { name: /disable user account/i })).toBeDefined();
});

test('Can Select A Disabled User And Delete Them', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('button', { name: /show disabled users \(2\)/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /show disabled users \(2\)/i }));
    });
    await waitFor(() =>
        screen.getByText(/jest second user/i)
    );

    expect(screen.getByText(/jest second user/i)).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByText(/jest second user/i));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /jest second user \- properties/i })
    );

    expect(screen.getByRole('button', { name: /delete user account/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /delete user account/i }));
    });

    await waitFor(() => {
        screen.getByRole('button', { name: /are you sure\?/i })
    });
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /are you sure\?/i }));
    });
    await waitForElementToBeRemoved(() =>
        screen.getByRole('heading', { name: /jest second user \- properties/i })
    );

    expect(screen.queryByText(/jest second user/i)).toBeNull();
});

test('Can View Add New User Flyout', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add new user/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /add new user/i })
    );

    expect(screen.getByText(/user's name/i)).toBeDefined();
});

test('Can Create A New User With Valid Data', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add new user/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /add new user/i })
    );

    expect(screen.getByRole('textbox', { name: /username/i, hidden: true })).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /user's name/i, hidden: true }), { target: { value: 'New User' } });
        await screen.getByRole('textbox', { name: /user's name/i, hidden: true }).value === 'New User';
        fireEvent.change(screen.getByRole('textbox', { name: /username/i, hidden: true }), { target: { value: 'new_user' } });
        await screen.getByRole('textbox', { name: /username/i, hidden: true }).value === 'new_user';
        fireEvent.change(screen.getByRole('textbox', { name: /e\-mail address/i, hidden: true }), { target: { value: 'new_user@test.com' } });
        await screen.getByRole('textbox', { name: /e\-mail address/i, hidden: true }).value === 'new_user@test.com';
        fireEvent.change(screen.getByLabelText(/enter password/i), { target: { value: 'Password123' } });
        await screen.getByLabelText(/enter password/i).value === 'Password123';
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Password123' } });
        await screen.getByLabelText(/confirm password/i).value === 'Password123';
        fireEvent.change(screen.getByRole('combobox', { name: /select security group/i, hidden: true }), { target: { value: mockData.groups[0].id } });
        await screen.getByRole('combobox', { name: /select security group/i, hidden: true }).value === mockData.groups[0].id;
    });

    expect(screen.getByRole('button', { name: /create user/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    });
    await waitFor(() =>
        screen.getByText(/user created successfully/i)
    );

    expect(screen.getByText(/user created successfully/i)).toBeDefined();
});

test('Cannot Create A New User With Invalid Data', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add new user/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /add new user/i })
    );

    expect(screen.getByRole('textbox', { name: /username/i, hidden: true })).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /username/i, hidden: true }), { target: { value: mockData.User.username } });
        await screen.getByRole('textbox', { name: /username/i, hidden: true }).value === mockData.User.username;
    });

    expect(screen.getByRole('button', { name: /create user/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    });
    await waitFor(() =>
        screen.getByText(/the username has already been taken\./i)
    );

    expect(screen.getByText(/the username has already been taken\./i)).toBeDefined();
});

test('Cannot Create A New User Due To An Unknown Error', async () => {
    render(<WebApps><BrowserRouter><UsersGroups groups={mockData.groups} /></BrowserRouter></WebApps>);
    await waitForElementToBeRemoved(() => screen.getByTestId('user-loader'));
    await waitFor(() => screen.getByRole('button', { name: /show disabled users \(2\)/i }));

    expect(screen.getByRole('heading', { name: /users/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /add new user/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add new user/i }));
    });
    await waitFor(() =>
        screen.getByRole('heading', { name: /add new user/i })
    );

    expect(screen.getByRole('textbox', { name: /user's name/i, hidden: true })).toBeDefined();

    await act(async () => {
        fireEvent.change(screen.getByRole('textbox', { name: /user's name/i, hidden: true }), { target: { value: 'unknown' } });
        await screen.getByRole('textbox', { name: /user's name/i, hidden: true }).value === 'unknown';
    });

    expect(screen.getByRole('button', { name: /create user/i })).toBeDefined();

    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /create user/i }));
    });
    await waitFor(() =>
        screen.getByText(/an unknown error occurred\./i)
    );

    expect(screen.getByText(/an unknown error occurred\./i)).toBeDefined();
});