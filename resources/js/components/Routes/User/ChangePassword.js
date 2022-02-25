import React, { useEffect, useState } from 'react';
import { APIClient, Button, Input, useToasts, withAuth } from 'webapps-react';

const ChangePassword = ({ user }) => {
    const [states, setStates] = useState({ currentPassword: {}, newPassword: {}, confirmedPassword: {} });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');

    const { addToast } = useToasts();

    const APIController = new AbortController();

    useEffect(() => {
        return () => {
            APIController.abort();
        }
    }, []);

    const update = e => {
        if (e.target.id === "currentPassword") {
            setCurrentPassword(e.target.value);
            states.currentPassword = {};
            setStates({ ...states });
        } else if (e.target.id === "newPassword") {
            setNewPassword(e.target.value);
            states.newPassword = {};
            setStates({ ...states });
        } else if (e.target.id === "confirmedPassword") {
            setConfirmedPassword(e.target.value);
            states.confirmedPassword = {};
            setStates({ ...states });
        }
    }

    const changePassword = async () => {
        let hasError = false;
        if (currentPassword === '') {
            states.currentPassword = {
                state: 'error',
                error: 'Please provide your current password.'
            };
            setStates({ ...states });
            hasError = true;
        }
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
            await APIClient('/api/user/password', { 
                id: user.id,
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmedPassword
            }, { signal: APIController.signal })
                .then(json => {
                    if (json.data.success) {
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmedPassword('');
                        addToast('Password Changed!', '', { appearance: 'success' });
                    }
                })
                .catch(error => {
                    if (error.status.code === 422) {
                        let errors = error.data.errors;
                        if (errors.current_password) {
                            states.currentPassword = {
                                state: 'error',
                                error: errors.current_password[0]
                            };
                            setStates({ ...states });
                        }
                        if (errors.password) {
                            states.newPassword = {
                                state: 'error',
                                error: errors.password[0]
                            };
                            setStates({ ...states });
                        }
                        if (errors.password_confirmation) {
                            states.confirmedPassword = {
                                state: 'error',
                                error: errors.password_confirmation[0]
                            };
                            setStates({ ...states });
                        }
                    } else {
                        if (!error.status.isAbort) {
                            // TODO: Handle errors
                            console.error(error);
                        }
                    }
                });
        }
    }

    return (
        <div className="mt-10 sm:mt-0 py-0 sm:py-8">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1 flex justify-between">
                    <div className="px-4 sm:px-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Update Password</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Ensure your account is using a long, random password to stay secure.
                        </p>
                    </div>
                </div>

                <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="px-4 py-5 bg-white dark:bg-gray-800 sm:p-6 shadow sm:rounded-tl-md sm:rounded-tr-md">
                        <div className="grid grid-cols-6 gap-6">
                            <Input
                                type="password"
                                wrapperClassName="col-span-6 sm:col-span-4"
                                label="Current Password"
                                name="currentPassword"
                                id="currentPassword"
                                value={currentPassword}
                                onChange={update}
                                state={states.currentPassword.state}
                                error={states.currentPassword.error} />
                            <Input
                                type="password"
                                wrapperClassName="col-span-6 sm:col-span-4"
                                label="New Password"
                                name="newPassword"
                                id="newPassword"
                                value={newPassword}
                                onChange={update}
                                state={states.newPassword.state}
                                error={states.newPassword.error} />
                            <Input
                                type="password"
                                wrapperClassName="col-span-6 sm:col-span-4"
                                label="Confirm Password"
                                name="confirmedPassword"
                                id="confirmedPassword"
                                value={confirmedPassword}
                                onChange={update}
                                state={states.confirmedPassword.state}
                                error={states.confirmedPassword.error} />
                        </div>
                    </div>

                    <div className="flex items-center justify-end px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6 shadow sm:rounded-bl-md sm:rounded-br-md">
                        <Button className="text-xs uppercase tracking-widest" onClick={changePassword}>Save</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withAuth(ChangePassword);