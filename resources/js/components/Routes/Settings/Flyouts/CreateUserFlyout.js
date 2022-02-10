import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import { FlyoutsContext } from '../UsersGroups';
import { APIClient, Button, Input, useToasts, withWebApps } from 'webapps-react';

const CreateUserFlyout = ({ UI, ...props }) => {
    const {
        groups,
        pushUser
    } = props;

    const { addToast } = useToasts();

    const {
        createUserFlyout, toggleCreateUserFlyout,
    } = useContext(FlyoutsContext);

    const init = {
        name: [],
        username: [],
        email: [],
        password: [],
        password_confirmation: [],
    }

    const [user, setUser] = useState(init);
    const [group, setGroup] = useState(0);

    const flyoutClass = classNames(
        'absolute',
        'inset-0',
        'overflow-hidden',
        (createUserFlyout) ? 'z-50' : '-z-10'
    )

    const bdClass = classNames(
        'absolute',
        'inset-0',
        'bg-gray-500',
        'bg-opacity-75',
        'transition-opacity',
        'duration-500',
        'ease-in-out',
        (createUserFlyout) ? 'opacity-100' : 'opacity-0'
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
        (createUserFlyout) ? 'translate-x-0' : 'translate-x-full'
    )

    const typeValue = e => {
        let _field = e.target.name;
        let _value = e.target.value;

        if (_field === "group") {
            setGroup(_value);
        } else {
            user[_field].state = '';
            user[_field].error = '';
            user[_field].value = _value;
            setUser({ ...user });
        }
    }

    const createUser = async () => {
        setState('name', 'saving', '');
        setState('username', 'saving', '');
        setState('email', 'saving', '');
        setState('password', 'saving', '');
        setState('password_confirmation', 'saving', '');

        await APIClient('/api/user', {
            name: (user.name.value === undefined) ? '' : user.name.value,
            username: (user.username.value === undefined) ? '' : user.username.value,
            email: (user.email.value === undefined) ? '' : user.email.value,
            password: (user.password.value === undefined) ? '' : user.password.value,
            password_confirmation: (user.password_confirmation.value === undefined) ? '' : user.password_confirmation.value,
            group: group
        })
            .then(json => {
                pushUser(json.data.user);
                addToast(json.data.message, '', { appearance: 'success' });
                toggleCreateUserFlyout();
                resetState();
            })
            .catch(error => {
                if (error.response.status === 422) {
                    let errors = error.response.data.errors;

                    Object.keys(errors).forEach(function (field) {
                        setState(field, 'error', errors[field][0]);
                    });
                } else {
                    addToast(
                        "An unknown error occurred.",
                        '',
                        { appearance: 'error' }
                    );
                }
            });
    }

    const setState = (field, state, error) => {
        user[field]['state'] = state;
        user[field]['error'] = error;
        setUser({ ...user });
    }

    const resetState = () => {
        setState('name', '', '');
        setState('username', '', '');
        setState('email', '', '');
        setState('password', '', '');
        setState('password_confirmation', '', '');
    }

    return (
        <div className={flyoutClass}>
            <div className={bdClass} aria-hidden="true"></div>
            <section className="absolute inset-y-0 right-0 sm:pl-10 max-w-full flex" aria-labelledby="slide-over-heading">
                <div className={panelClass}>
                    <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl relative">
                        <div className={`px-4 sm:px-6 py-6 bg-${UI.theme}-600 dark:bg-${UI.theme}-500 text-white dark:text-gray-200`}>
                            <h2 id="slide-over-heading" className="text-lg font-medium">Add New User</h2>
                        </div>
                        <div className="my-6 relative flex-1 px-4 sm:px-6">
                            <div className="absolute inset-0 px-4 sm:px-6 overflow-y-auto">
                                <div className="h-full" aria-hidden="true">
                                    <div className="mt-4 flex flex-col">
                                        <label className="w-full font-medium text-sm" htmlFor="name_cuf">User's Name</label>
                                        <Input name="name"
                                            type="text"
                                            id="name_cuf"
                                            value={user.name.value || ''}
                                            error={user.name.error || ''}
                                            state={user.name.state || ''}
                                            onChange={typeValue}
                                            className="w-full" />
                                    </div>

                                    <div className="mt-4 flex flex-col">
                                        <label className="w-full font-medium text-sm" htmlFor="username_cuf">Username</label>
                                        <Input name="username"
                                            type="text"
                                            id="username_cuf"
                                            value={user.username.value || ''}
                                            error={user.username.error || ''}
                                            state={user.username.state || ''}
                                            onChange={typeValue}
                                            className="w-full" />
                                    </div>

                                    <div className="mt-4 flex flex-col">
                                        <label className="w-full font-medium text-sm" htmlFor="email_cuf">E-Mail Address</label>
                                        <Input name="email"
                                            type="text"
                                            id="email_cuf"
                                            value={user.email.value || ''}
                                            error={user.email.error || ''}
                                            state={user.email.state || ''}
                                            onChange={typeValue}
                                            className="w-full" />
                                    </div>

                                    <div className="mt-4 flex flex-col">
                                        <label className="w-full font-medium text-sm" htmlFor="password_cuf">Enter Password</label>
                                        <Input name="password"
                                            type="password"
                                            id="password_cuf"
                                            value={user.password.value || ''}
                                            error={user.password.error || ''}
                                            state={user.password.state || ''}
                                            onChange={typeValue}
                                            className="w-full" />
                                    </div>

                                    <div className="mt-4 flex flex-col">
                                        <label className="w-full font-medium text-sm" htmlFor="password_confirmation_cuf">Confirm Password</label>
                                        <Input name="password_confirmation"
                                            type="password"
                                            id="password_confirmation_cuf"
                                            value={user.password_confirmation.value || ''}
                                            error={user.password_confirmation.error || ''}
                                            state={user.password_confirmation.state || ''}
                                            onChange={typeValue}
                                            className="w-full" />
                                    </div>

                                    <div className="mt-8 flex flex-col">
                                        <label className="w-full font-medium text-sm" htmlFor="secGroup_cuf">Select Security Group</label>
                                        <div className="w-full">
                                            <select name="group"
                                                id="secGroup_cuf"
                                                onChange={typeValue}
                                                value={group}
                                                className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`}>
                                                <option value="0">Select Group...</option>
                                                {
                                                    Object(groups).map(function (role, i) {
                                                        return (
                                                            <option value={role.id} key={i}>{role.name}</option>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`relative bg-gray-100 dark:bg-gray-800 border-t-2 py-2 px-4 border-${UI.theme}-600 dark:border-${UI.theme}-500 flex flex-row`}>
                            <Button onClick={createUser} square>Create User</Button>
                            <Button onClick={toggleCreateUserFlyout} className="ml-auto" color="gray" style="outline" square>Cancel</Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default withWebApps(CreateUserFlyout);
