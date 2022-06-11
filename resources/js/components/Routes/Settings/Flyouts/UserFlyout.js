import React, { useContext, useEffect, useState } from 'react';
import { APIClient, Button, ConfirmDeleteButton, FlyoutContent, FlyoutHeader, FlyoutFooter, Input, Select, useToasts } from 'webapps-react';

import { FlyoutsContext } from '../UsersGroups';

const UserFlyout = props => {
    const {
        user,
        setGroup,
        disable,
        deleteUser,
        enable,
        groups
    } = props;

    const [states, setStates] = useState({ newPassword: {}, confirmedPassword: {} });
    const [passwordResetShowing, setPasswordResetShowing] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');

    const { addToast } = useToasts();

    const {
        userFlyout, closeAllFlyouts,
    } = useContext(FlyoutsContext);

    const APIController = new AbortController();

    useEffect(() => {
        return () => {
            APIController.abort();
        }
    }, []);

    useEffect(() => {
        setPasswordResetShowing(false);
    }, [user]);

    const showPasswordReset = () => {
        setPasswordResetShowing(true);
    }

    const update = e => {
        if (e.target.id === "newPassword") {
            setNewPassword(e.target.value);
            states.newPassword = {};
            setStates({ ...states });
        } else /* istanbul ignore else */ if (e.target.id === "confirmedPassword") {
            setConfirmedPassword(e.target.value);
            states.confirmedPassword = {};
            setStates({ ...states });
        }
    }

    const changePassword = async () => {
        let hasError = false;
        if (newPassword === '') {
            states.newPassword = {
                state: 'error',
                error: 'Please enter a new password.'
            };
            setStates({ ...states });
            hasError = true;
        }
        if (confirmedPassword !== newPassword) {
            states.confirmedPassword = {
                state: 'error',
                error: 'Passwords do not match!'
            };
            setStates({ ...states });
            hasError = true;
        }

        if (!hasError) {
            await APIClient('/api/admin/user.password/reset', {
                user_id: user.id,
                password: newPassword,
                password_confirmation: confirmedPassword
            }, { signal: APIController.signal })
                .then(json => {
                    // istanbul ignore else
                    if (json.data.success) {
                        addToast('Password has been changed!', '', { appearance: 'success' });
                        setPasswordResetShowing(false);
                        setNewPassword('');
                        setConfirmedPassword('');
                    }
                })
                .catch(error => {
                    if (error.status.code === 422) {
                        let errors = error.data.errors;
                        // istanbul ignore else
                        if (errors.password) {
                            states.newPassword = {
                                state: 'error',
                                error: errors.password[0]
                            };
                            setStates({ ...states });
                        }
                        // istanbul ignore else
                        if (errors.password_confirmation) {
                            states.confirmedPassword = {
                                state: 'error',
                                error: errors.password_confirmation[0]
                            };
                            setStates({ ...states });
                        }
                    } else {
                        setNewPassword('');
                        setConfirmedPassword('');
                        addToast('Failed to change password', '', { appearance: 'error' });
                    }
                });
        }
    }

    const blocksText =
        (user.number_of_blocks > 1 || user.number_of_blocks === 0)
            ? 'Blocks'
            : 'Block';

    if (!userFlyout) {
        return null;
    }

    return (
        <>
            <FlyoutHeader closeAction={closeAllFlyouts}>
                {user.name}
            </FlyoutHeader>
            {
                (user.azure_id !== null) ?
                    (
                        <div className="px-4 sm:px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                            <p className="italic">This account is provisioned by Microsoft Azure Active Directory. You cannot make any changes here.</p>
                        </div>
                    ) : null
            }
            <FlyoutContent>
                <h1 className="text-lg font-medium">{user.name}</h1>
                <p className="italic text-gray-500">{user.username}</p>
                <h4 className="mt-2 font-medium text-md">{user.email}</h4>
                <Select
                    id="usrSecGroup"
                    name="usrSecGroup"
                    label="Change Security Group"
                    wrapperClassName="w-full mt-8"
                    onChange={setGroup}
                    value={user._CurrentGroupId}>
                    <option value="0">No group assigned</option>
                    {
                        Object(groups).map(function (group, i) {
                            return (
                                <option value={group.id} key={i}>{group.name}</option>
                            )
                        })
                    }
                </Select>
                <h4 className="mt-8 w-full font-medium text-sm">Blocks</h4>
                <div className="sm:flex sm:flex-row sm:gap-x-6">
                    <p>
                        This user has created <span className="font-medium">{user.number_of_blocks}</span> {blocksText}.
                    </p>
                    {
                        (user.number_of_blocks > 0) ?
                            <Button to={`/blocks/user/${user.username}`} type="ghost" size="small" square>
                                View this user's {blocksText}
                            </Button> : null
                    }
                </div>
                <h4 className="mt-8 w-full font-medium text-sm">Password</h4>
                {
                    (passwordResetShowing) ?
                        (
                            <>
                                <div className="mt-4 flex flex-col">
                                    <label className="w-full font-medium text-sm" htmlFor="newPassword">New Password:</label>
                                    <Input type="password"
                                        name="newPassword"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={update}
                                        state={states.newPassword.state}
                                        error={states.newPassword.error}
                                    />
                                </div>
                                <div className="mt-2 flex flex-col">
                                    <label className="w-full font-medium text-sm" htmlFor="confirmedPassword">Confirm Password:</label>
                                    <Input type="password"
                                        name="confirmedPassword"
                                        id="confirmedPassword"
                                        value={confirmedPassword}
                                        onChange={update}
                                        state={states.confirmedPassword.state}
                                        error={states.confirmedPassword.error}
                                    />
                                </div>
                                <div className="flex items-center justify-end text-right mt-2">
                                    <Button square color="orange" size="small" className="uppercase tracking-widest" onClick={changePassword}>Change Password</Button>
                                </div>
                            </>
                        ) :
                        <Button onClick={showPasswordReset} size="small" type="ghost" square color="orange">
                            Change this user's password
                        </Button>
                }
            </FlyoutContent>
            {
                (!user.active) ?
                    (
                        <div className="px-4 sm:px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            <p className="font-medium italic">This account is currently disabled</p>
                        </div>
                    ) : null
            }
            <FlyoutFooter>
                {
                    (user.active)
                        ?
                        <Button onClick={disable} square color="red" type="outline">
                            Disable User Account
                        </Button>
                        :
                        <>
                            <Button onClick={enable} square color="green" type="outline">
                                Enable User Account
                            </Button>
                            <ConfirmDeleteButton
                                text="Delete User Account"
                                confirmText="Are you sure?"
                                type="outline"
                                square
                                className="ml-auto flex"
                                onClick={deleteUser} />
                        </>
                }
            </FlyoutFooter>
        </>
    )
}

export default UserFlyout;
