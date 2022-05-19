import React, { useEffect, useState } from 'react';
import { APIClient, Button, Input, PageWrapper, useToasts, withAuth } from 'webapps-react';

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
        <PageWrapper title="Update Password">
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                Ensure your account is using a long, random password to stay secure.
            </p>
            <Input
                type="password"
                label="Current Password"
                name="currentPassword"
                id="currentPassword"
                value={currentPassword}
                onChange={update}
                state={states.currentPassword.state}
                error={states.currentPassword.error} />
            <Input
                type="password"
                label="New Password"
                name="newPassword"
                id="newPassword"
                value={newPassword}
                onChange={update}
                state={states.newPassword.state}
                error={states.newPassword.error} />
            <Input
                type="password"
                label="Confirm Password"
                name="confirmedPassword"
                id="confirmedPassword"
                value={confirmedPassword}
                onChange={update}
                state={states.confirmedPassword.state}
                error={states.confirmedPassword.error} />

            <div className="flex items-center justify-end">
                <Button className="text-xs uppercase tracking-widest" onClick={changePassword}>Save</Button>
            </div>
        </PageWrapper>
    )
}

export default withAuth(ChangePassword);