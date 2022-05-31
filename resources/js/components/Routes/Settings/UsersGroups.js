import React, { createContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { APIClient, Button, PageWrapper, Flyout, useToasts, withWebAppsUX, Loader } from 'webapps-react';
import { CreateGroupFlyout, CreateUserFlyout, GroupFlyout, UserFlyout } from './Flyouts';
import { GroupList, UserList } from './Lists';

export const FlyoutsContext = createContext({});

let _mounted = false;
let old_name = '';

const UsersGroups = props => {
    const {
        useFlyouts,
        groups,
        setGroups,
    } = props;

    const { closeFlyout, openFlyout } = useFlyouts;

    const { addToast } = useToasts();

    const [users, setUsers] = useState(null);
    const [disabled, setDisabled] = useState(null);
    const [showDisabled, setShowDisabled] = useState(0);
    const [user, setUser] = useState([]);
    const [userFlyout, setUserFlyout] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState([]);
    const [groupFlyout, setGroupFlyout] = useState(false);

    const [createUserFlyout, setCreateUserFlyout] = useState(false);
    const [createGroupFlyout, setCreateGroupFlyout] = useState(false);
    const [tab, setTab] = useState(0);

    const APIController = new AbortController();
    let timers = [null, null];

    useEffect(async () => {
        _mounted = true;
        await getUsers();

        return /* istanbul ignore next */ () => {
            APIController.abort();
            if (timers[0]) {
                clearTimeout(timers[0]);
            }
            if (timers[1]) {
                clearTimeout(timers[1]);
            }
            _mounted = false;
        }
    }, []);

    const getUsers = async () => {
        await getEnabledUsers();
        await getDisabledUsers();
    }

    const getEnabledUsers = async () => {
        await APIClient('/api/users', undefined, { signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (_mounted) {
                    let _users = json.data.users;
                    _users.map(function (user, i) {
                        if (user.roles.length !== 0) {
                            _users[i]._CurrentGroup = user.roles[0].name;
                            _users[i]._CurrentGroupId = user.roles[0].id;
                        } else {
                            _users[i]._CurrentGroupId = 0;
                        }
                    });
                    setUsers(_users);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (_mounted) {
                    addToast('An error occurred loading user data!', '', { appearance: 'error' });
                }
            });
    }

    const getDisabledUsers = async () => {
        await APIClient('/api/users/disabled', undefined, { signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (_mounted) {
                    let _disabled = json.data.users;
                    _disabled.map(function (user, i) {
                        if (user.roles.length !== 0) {
                            _disabled[i]._CurrentGroup = user.roles[0].name;
                            _disabled[i]._CurrentGroupId = user.roles[0].id;
                        } else {
                            _disabled[i]._CurrentGroupId = 0;
                        }
                    });
                    setDisabled(_disabled);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (_mounted) {
                    addToast('An error occurred loading user data!', '', { appearance: 'error' });
                }
            });
    }

    const pushUser = user => {
        if (user.roles.length !== 0) {
            user._CurrentGroup = user.roles[0].name;
            user._CurrentGroupId = user.roles[0].id;
        } else {
            user._CurrentGroupId = 0;
        }
        setUsers([...users, user]);
    }

    const pushGroup = group => {
        let _groups = [];
        groups.map(function (_group) { _groups.push(_group) });
        _groups.push(group);

        _groups.sort((a, b) => (a.letter > b.letter) ? 1 : -1)
        setGroups(_groups);
    }

    const selectUser = user => {
        setUser(user);
        openUserFlyout();
    }
    const selectGroup = group => {
        setSelectedGroup(group);
        openGroupFlyout();
    }

    const closeAllFlyouts = () => {
        setCreateUserFlyout(false);
        setCreateGroupFlyout(false);
        setUserFlyout(false);
        setGroupFlyout(false);
        closeFlyout();
    }

    const openCreateUserFlyout = () => {
        closeAllFlyouts();
        openFlyout();
        setCreateUserFlyout(true);
    }

    const openCreateGroupFlyout = () => {
        closeAllFlyouts();
        openFlyout();
        setCreateGroupFlyout(true);
    }

    const openUserFlyout = () => {
        closeAllFlyouts();
        openFlyout();
        setUserFlyout(true);
    }

    const openGroupFlyout = () => {
        closeAllFlyouts();
        openFlyout();
        setGroupFlyout(true);
    }

    const toggleShowDisabled = e => {
        e.preventDefault();
        setShowDisabled(!showDisabled);
    }

    const setGroup = async e => {
        if (user.azure_id !== null) {
            addToast(
                "You cannot change this user's group as they have been provisioned by Microsoft Azure Active Directory.",
                '',
                { appearance: 'error' }
            );
            return;
        }

        if (user.username === 'administrator') {
            addToast(
                "You cannot change the built-in administrators group!",
                '',
                { appearance: 'error' }
            );
            return;
        }

        let group_id = e.target.value;
        await APIClient('/api/user/group', { group_id: group_id, username: user.username }, { signal: APIController.signal })
            .then(async json => {
                /* istanbul ignore else */
                if (_mounted) {
                    await getUsers();
                    users.map(function (u, ui) {
                        if (user.id === u.id) {
                            setUser(users[ui]);
                        }
                    });

                    document.getElementById('usrSecGroup').blur();
                    document.getElementById('usrSecGroup').classList.add('text-green-500');
                    document.getElementById('usrSecGroup').classList.add('border-green-500');

                    addToast('Security Group Updated', '', { appearance: 'success' });
                    /* istanbul ignore next */
                    timers[0] = setTimeout(function () {
                        if (_mounted && document.getElementById('usrSecGroup') !== null) {
                            document.getElementById('usrSecGroup').classList.remove('text-green-500');
                            document.getElementById('usrSecGroup').classList.remove('border-green-500');
                            timers[0] = null;
                        }
                    }, 2500);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (_mounted) {
                    addToast(
                        "An unknown error occurred.",
                        '',
                        { appearance: 'error' }
                    );

                    document.getElementById('usrSecGroup').blur();
                    document.getElementById('usrSecGroup').classList.add('text-red-500');
                    document.getElementById('usrSecGroup').classList.add('border-red-500');
                    timers[0] = setTimeout(function () {
                        if (_mounted && document.getElementById('usrSecGroup') !== null) {
                            document.getElementById('usrSecGroup').classList.remove('text-red-500');
                            document.getElementById('usrSecGroup').classList.remove('border-red-500');
                            timers[0] = null;
                        }
                    }, 2500);
                }
            });
    }

    const renameGroup = e => {
        /* istanbul ignore else */
        if (old_name === '') {
            old_name = selectedGroup.name;
        }
        selectedGroup.state = '';
        selectedGroup.error = '';
        selectedGroup.name = e.target.value;
        setSelectedGroup({ ...selectedGroup });
    }

    const saveRenameGroup = async e => {
        e.preventDefault();
        /* istanbul ignore else */
        if (old_name !== selectedGroup.name) {
            selectedGroup.state = 'saving';
            setSelectedGroup({ ...selectedGroup });

            await APIClient('/api/group', { old_name: old_name, new_name: selectedGroup.name, _method: 'PATCH' }, { method: 'PATCH', signal: APIController.signal })
                .then(json => {
                    /* istanbul ignore else */
                    if (_mounted) {
                        addToast(json.data.message, '', { appearance: 'success' });
                        groups.map(function (g, gi) {
                            /* istanbul ignore else */
                            if (selectedGroup.id === g.id)
                                groups[gi] = json.data.group
                        });
                        setGroups([...groups]);
                        old_name = '';

                        selectedGroup.state = 'saved';
                        setSelectedGroup({ ...selectedGroup });
                        timers[1] = setTimeout(/* istanbul ignore next */function () {
                            // Don't do anything if testing
                            if (process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test') {
                                selectedGroup.status = '';
                                setSelectedGroup({ ...selectedGroup });
                                timers[1] = null;
                            }
                        }, 2500);
                    }
                })
                .catch(error => {
                    /* istanbul ignore else */
                    if (_mounted) {
                        selectedGroup.state = 'error';
                        if (error.data.errors.old_name !== undefined) {
                            selectedGroup.error = error.data.errors.old_name[0]
                        } else /* istanbul ignore else */ if (error.data.errors.new_name !== undefined) {
                            selectedGroup.error = error.data.errors.new_name[0];
                        }
                        setSelectedGroup({ ...selectedGroup });
                    }
                });
        }
    }

    const disable = async e => {
        e.preventDefault();

        if (user.azure_id !== null) {
            addToast("You cannot disable this user as they have been provisioned by Microsoft Azure Active Directory.", '', { appearance: 'error' });
            return;
        }

        await APIClient(`/api/user/${user.id}`, { _method: 'DELETE' }, { method: 'DELETE', signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (_mounted) {
                    // TODO: Surely this can be improved?
                    let _users = [];
                    users.map(function (u, i) {
                        if (u.id !== user.id) {
                            _users.push(u)
                        }
                    });

                    disabled.push(json.data.user);

                    setDisabled([...disabled]);
                    setUsers(_users);
                    setUser(json.data.user);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (_mounted) {
                    addToast(error.data.message, '', { appearance: 'error' });
                }
            });
    }

    const enable = async e => {
        e.preventDefault();

        await APIClient(`/api/user/${user.id}/enable`, undefined, { signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (_mounted) {
                    // TODO: Surely this can be improved?
                    let _disabled = [];
                    disabled.map(function (u) {
                        if (u.id !== user.id) {
                            _disabled.push(u)
                        }
                    });

                    users.push(json.data.user);

                    setDisabled(_disabled);
                    setUsers([...users]);
                    setUser(json.data.user);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                console.log(error);
                if (_mounted) {
                    addToast(error.data.message, '', { appearance: 'error' });
                }
            });
    }

    const deleteUser = async () => {
        await APIClient(`/api/user/${user.id}/hard`, { _method: 'DELETE' }, { method: 'DELETE', signal: APIController.signal })
            .then(json => {
                // TODO: Surely this can be improved?
                let _disabled = [];
                disabled.map(function (u) {
                    if (u.id !== user.id) {
                        _disabled.push(u)
                    }
                });

                /* istanbul ignore else */
                if (_mounted) {
                    setDisabled(_disabled);
                    setUser([]);
                    closeAllFlyouts();
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (_mounted) {
                    addToast(error.data.message, '', { appearance: 'error' });
                }
            });
    }

    const deleteGroup = async () => {
        await APIClient('/api/group', { name: selectedGroup.name, _method: 'DELETE' }, { method: 'DELETE', signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (_mounted) {
                    // TODO: Surely this can be improved?
                    let _groups = [];
                    groups.map(function (g) {
                        if (g.id !== selectedGroup.id) {
                            _groups.push(g)
                        }
                    });

                    setGroups(_groups);
                    setSelectedGroup([]);
                    closeAllFlyouts();
                }
            })
            .catch(/* istanbul ignore next */ error => {
                console.log(error);
                if (_mounted) {
                    addToast(error.data.errors?.name[0], '', { appearance: 'error' });
                }
            });
    }

    const tabClass = id => classNames(
        'cursor-pointer',
        (tab === id) ? 'text-2xl' : 'text-lg mt-1 font-normal',
    )

    const paneClass = id => classNames(
        'pt-2',
        '-mx-6',
        'md:-px-8',
        'lg:-mx-12',
        (tab === id) ? 'block' : 'hidden'
    )

    let obj = (showDisabled) ? disabled : users;

    if (!users) {
        return <Loader />
    }

    return (
        <>
            <PageWrapper title={
                <div className="flex flex-row gap-6">
                    <h6 className={tabClass(0)} onClick={() => setTab(0)}>Users</h6>
                    <h6 className={tabClass(1)} onClick={() => setTab(1)}>Groups</h6>
                </div>
            }>
                <div className="flex flex-col flex-col-reverse xl:flex-row">
                    {
                        (tab === 0) ?
                            (
                                <div className="flex-1 text-right">
                                    <Button onClick={toggleShowDisabled} type="link">{
                                        (showDisabled) ? 'Show Enabled Users' : `Show Disabled Users ${(disabled === null) ? '' : `(${disabled.length})`}`
                                    }</Button>
                                    <Button onClick={openCreateUserFlyout} square>
                                        Add New User
                                    </Button>
                                </div>
                            ) :
                            (
                                <div className="flex-1 text-right">
                                    <Button onClick={openCreateGroupFlyout} square>
                                        Add New Group
                                    </Button>
                                </div>
                            )
                    }
                </div>

                <div className={paneClass(0)}>
                    <UserList users={obj} selectUser={selectUser} disabled={showDisabled} />
                </div>
                <div className={paneClass(1)}>
                    <GroupList groups={groups} selectGroup={selectGroup} />
                </div>
            </PageWrapper>

            <Flyout>
                <FlyoutsContext.Provider value={{
                    userFlyout,
                    groupFlyout,
                    createUserFlyout,
                    createGroupFlyout,
                    closeAllFlyouts,
                }}>
                    <UserFlyout user={user} setGroup={setGroup} disable={disable} deleteUser={deleteUser} enable={enable} groups={groups} />
                    <GroupFlyout group={selectedGroup} deleteGroup={deleteGroup} renameGroup={renameGroup} saveRenameGroup={saveRenameGroup} />
                    <CreateUserFlyout groups={groups} pushUser={pushUser} />
                    <CreateGroupFlyout pushGroup={pushGroup} />
                </FlyoutsContext.Provider>
            </Flyout>
        </>
    )
}

export default withWebAppsUX(UsersGroups);
