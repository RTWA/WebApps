import React, { useContext, useState } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import { useToasts } from 'react-toast-notifications';
import { Button, ConfirmDeleteButton, Input, withWebApps } from 'webapps-react';

import { FlyoutsContext } from '../UsersGroups';

const UserFlyout = ({ UI, ...props }) => {
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
        userModal, toggleUserModal,
    } = useContext(FlyoutsContext);

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

    const changePassword = () => {
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
            let formData = new FormData();
            formData.append('user_id', user.id);
            formData.append('password', newPassword);
            formData.append('password_confirmation', confirmedPassword);

            axios.post('/api/admin/user.password/reset', formData)
                .then(json => {
                    // istanbul ignore else
                    if (json.data.success) {
                        addToast('Password Reset!', { appearance: 'success' });
                        setPasswordResetShowing(false);
                        setNewPassword('');
                        setConfirmedPassword('');
                    }
                })
                .catch(error => {
                    if (error.response.status === 422) {
                        let errors = error.response.data.errors;
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
                        setPasswordResetShowing(false);
                        setNewPassword('');
                        setConfirmedPassword('');
                        addToast('Failed to reset password', { appearance: 'error' });
                    }
                });
        }
    }

    const flyoutClass = classNames(
        'absolute',
        'inset-0',
        'overflow-hidden',
        (userModal) ? 'z-50' : '-z-10'
    )

    const bdClass = classNames(
        'absolute',
        'inset-0',
        'bg-gray-500',
        'bg-opacity-75',
        'transition-opacity',
        'duration-500',
        'ease-in-out',
        (userModal) ? 'opacity-100' : 'opacity-0'
    )

    const panelClass = classNames(
        'relative',
        'w-screen',
        'max-w-2xl',
        'transform',
        'transition',
        'ease-in-out',
        'duration-500',
        'delay-500',
        (userModal) ? 'translate-x-0' : 'translate-x-full'
    )

    const blocksText =
        (user.number_of_blocks > 1 || user.number_of_blocks === 0)
            ? 'Blocks'
            : 'Block';

    return (
        <div className={flyoutClass}>
            <div className={bdClass} aria-hidden="true" onClick={toggleUserModal}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex" aria-labelledby="slide-over-heading">
                <div className={panelClass}>
                    <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
                        <div className={`px-4 sm:px-6 py-6 bg-${UI.theme}-600 dark:bg-${UI.theme}-500 text-white dark:text-gray-200 relative`}>
                            <div className="absolute top-0 right-0 -ml-8 pt-6 pr-2 flex sm:-ml-10 sm:pr-4">
                                <button className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                    onClick={toggleUserModal}>
                                    <span className="sr-only">Close panel</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <h2 id="slide-over-heading" className="text-lg font-medium">{user.name} - Properties</h2>
                        </div>
                        {
                            (user.azure_id !== null) ?
                                (
                                    <div className="px-4 sm:px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm">
                                        <p className="italic">This account is provisioned by Microsoft Azure Active Directory. You cannot make any changes here.</p>
                                    </div>
                                ) : null
                        }
                        <div className="mt-6 relative flex-1 px-4 sm:px-6">
                            <div className="absolute inset-0 px-4 sm:px-6">
                                <div className="h-full" aria-hidden="true">
                                    <h1 className="text-lg font-medium">{user.name}</h1>
                                    <p className="italic text-gray-500">{user.username}</p>
                                    <h4 className="mt-2 font-medium text-md">{user.email}</h4>
                                    <div className="mt-8">
                                        <label className="text-lg font-medium" htmlFor="usrSecGroup">Change Security Group</label>
                                        <select name="usrSecGroup"
                                            id="usrSecGroup"
                                            onChange={setGroup}
                                            value={user._CurrentGroupId}
                                            className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`}>
                                            <option value="0">No group assigned</option>
                                            {
                                                Object(groups).map(function (group, i) {
                                                    return (
                                                        <option value={group.id} key={i}>{group.name}</option>
                                                    )
                                                })
                                            }
                                        </select>
                                    </div>
                                    <h4 className="mt-8 text-lg font-medium">Blocks</h4>
                                    <p>This user has created <span className="font-medium">{user.number_of_blocks}</span> {blocksText}.</p>
                                    {
                                        (user.number_of_blocks > 0) ?
                                            (
                                                <div className="pt-6">
                                                    <Button to={`/blocks/user/${user.username}`} square>
                                                        View this user's {blocksText}
                                                    </Button>
                                                </div>
                                            ) : null
                                    }
                                    <h4 className="mt-8 text-lg font-medium">Password</h4>
                                    {
                                        (passwordResetShowing) ?
                                            (
                                                <>
                                                    <div className="col-span-6 sm:col-span-4">
                                                        <label className="block font-medium text-sm text-gray-700" htmlFor="newPassword">
                                                            New Password:
                                                        </label>
                                                        <Input type="password" name="newPassword" id="newPassword" value={newPassword} onChange={update} state={states.newPassword.state} error={states.newPassword.error} />
                                                    </div>

                                                    <div className="col-span-6 sm:col-span-4 mt-2">
                                                        <label className="block font-medium text-sm text-gray-700" htmlFor="confirmedPassword">
                                                            Confirm Password:
                                                        </label>
                                                        <Input type="password" name="confirmedPassword" id="confirmedPassword" value={confirmedPassword} onChange={update} state={states.confirmedPassword.state} error={states.confirmedPassword.error} />
                                                    </div>
                                                    <div className="flex items-center justify-end text-right mt-2">
                                                        <Button square color="orange" size="small" className="uppercase tracking-widest" onClick={changePassword}>Reset Password</Button>
                                                    </div>
                                                </>
                                            ) :
                                            (
                                                <div className="pt-6">
                                                    <Button onClick={showPasswordReset} square color="orange">
                                                        Reset Password
                                                    </Button>
                                                </div>
                                            )
                                    }
                                </div>
                            </div>
                        </div>
                        {
                            (!user.active) ?
                                (
                                    <div className="px-4 sm:px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                        <p className="font-medium italic">This account is currently disabled</p>
                                    </div>
                                ) : null
                        }
                        <div className={`bg-gray-100 dark:bg-gray-800 border-t-2 py-1 px-4 border-${UI.theme}-600 dark:border-${UI.theme}-900 flex`}>
                            {
                                (user.active)
                                    ?
                                    <Button onClick={disable} square color="red" style="outline">
                                        Disable User Account
                                    </Button>
                                    :
                                    <>
                                        <Button onClick={enable} square color="green" style="outline">
                                            Enable User Account
                                        </Button>
                                        <ConfirmDeleteButton
                                            text="Delete User Account"
                                            confirmText="Are you sure?"
                                            style="outline"
                                            square
                                            className="ml-auto flex"
                                            onClick={deleteUser} />
                                    </>
                            }
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default withWebApps(UserFlyout);
