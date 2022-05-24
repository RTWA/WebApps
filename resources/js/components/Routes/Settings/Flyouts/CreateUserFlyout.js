import React, { useContext, useEffect, useState } from 'react';
import { FlyoutsContext } from '../UsersGroups';
import { APIClient, Button, FlyoutContent, FlyoutHeader, FlyoutFooter, Input, Select, useToasts } from 'webapps-react';

const CreateUserFlyout = props => {
    const {
        groups,
        pushUser
    } = props;

    const { addToast } = useToasts();

    const {
        createUserFlyout, closeAllFlyouts,
    } = useContext(FlyoutsContext);

    const APIController = new AbortController();

    useEffect(() => {
        return () => {
            APIController.abort();
        }
    }, []);

    const init = {
        name: [],
        username: [],
        email: [],
        password: [],
        password_confirmation: [],
    }

    const [user, setUser] = useState(init);
    const [group, setGroup] = useState(0);

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
        }, { signal: APIController.signal })
            .then(json => {
                pushUser(json.data.user);
                addToast(json.data.message, '', { appearance: 'success' });
                resetState();
                closeAllFlyouts();
            })
            .catch(error => {
                if (error.status.code === 422) {
                    let errors = error.data.errors;

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

    if (!createUserFlyout) {
        return null;
    }

    return (
        <>
            <FlyoutHeader>Add New User</FlyoutHeader>
            <FlyoutContent>
                <Input
                    id="name_cuf"
                    name="name"
                    label="User's Name"
                    type="text"
                    value={user.name.value || ''}
                    error={user.name.error || ''}
                    state={user.name.state || ''}
                    onChange={typeValue} />
                <Input
                    id="username_cuf"
                    name="username"
                    label="Username"
                    type="text"
                    value={user.username.value || ''}
                    error={user.username.error || ''}
                    state={user.username.state || ''}
                    onChange={typeValue} />
                <Input
                    id="email_cuf"
                    name="email"
                    label="E-Mail Address"
                    type="text"
                    value={user.email.value || ''}
                    error={user.email.error || ''}
                    state={user.email.state || ''}
                    onChange={typeValue} />
                <Input
                    id="password_cuf"
                    name="password"
                    label="Enter Password"
                    type="password"
                    value={user.password.value || ''}
                    error={user.password.error || ''}
                    state={user.password.state || ''}
                    onChange={typeValue} />

                <Input
                    id="password_confirmation_cuf"
                    name="password_confirmation"
                    label="Confirm Password"
                    type="password"
                    value={user.password_confirmation.value || ''}
                    error={user.password_confirmation.error || ''}
                    state={user.password_confirmation.state || ''}
                    onChange={typeValue} />
                <Select
                    id="secGroup_cuf"
                    name="group"
                    label="Select Security Group"
                    onChange={typeValue}
                    value={group}
                    wrapperClassName="mt-8">
                    <option value="0">Select Group...</option>
                    {
                        Object(groups).map(function (role, i) {
                            return (
                                <option value={role.id} key={i}>{role.name}</option>
                            )
                        })
                    }
                </Select>
            </FlyoutContent>
            <FlyoutFooter>
                <Button onClick={createUser} square>Create User</Button>
                <Button onClick={closeAllFlyouts} className="ml-auto" color="gray" type="outline" square>Cancel</Button>
            </FlyoutFooter>
        </>
    )
}

export default CreateUserFlyout;
