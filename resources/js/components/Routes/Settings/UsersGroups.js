import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import ContentLoader from "react-content-loader"
import { useToasts } from 'react-toast-notifications';
import { Button, withWebApps } from 'webapps-react';
import { CreateGroupFlyout, CreateUserFlyout, GroupFlyout, UserFlyout } from './Flyouts';
import { GroupList, UserList } from './Lists';

export const FlyoutsContext = createContext({});

let _mounted = false;
let old_name = '';

const UsersGroups = ({ UI, ...props }) => {
    const {
        groups,
        setGroups,
    } = props;

    const { addToast } = useToasts();

    const [users, setUsers] = useState(null);
    const [disabled, setDisabled] = useState(null);
    const [showDisabled, setShowDisabled] = useState(0);
    const [user, setUser] = useState([]);
    const [userModal, setUserModal] = useState(false);

    const [selectedGroup, setSelectedGroup] = useState([]);
    const [groupModal, setGroupModal] = useState(false);

    const [createUserFlyout, setCreateUserFlyout] = useState(false);
    const [createGroupFlyout, setCreateGroupFlyout] = useState(false);
    const [tab, setTab] = useState(0);

    useEffect(async () => {
        _mounted = true;
        await getUsers();

        return /* istanbul ignore next */ () => { _mounted = false; }
    }, []);

    const getUsers = async () => {
        await getEnabledUsers();
        await getDisabledUsers();
    }

    const getEnabledUsers = async () => {
        await axios.get('/api/users')
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
                    addToast('An error occurred loading user data!', { appearance: 'error' });
                }
            });
    }

    const getDisabledUsers = async () => {
        await axios.get('/api/users/disabled')
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
                    addToast('An error occurred loading user data!', { appearance: 'error' });
                }
            });
    }

    const pushUser = user => {
        let _users = [];
        users.map(function (_user) { _users.push(_user) });
        _users.push(user);
        setUsers(_users);
    }

    const pushGroup = group => {
        let _groups = [];
        groups.map(function (_group) { _groups.push(_group) });
        _groups.push(group);
        setGroups(_groups);
    }

    const selectUser = user => {
        setUser(user);
        toggleUserModal();
    }
    const selectGroup = group => {
        setSelectedGroup(group);
        toggleGroupModal();
    }

    const toggleCreateUserFlyout = () => {
        setCreateUserFlyout(!createUserFlyout);
    }

    const toggleCreateGroupFlyout = () => {
        setCreateGroupFlyout(!createGroupFlyout);
    }

    const toggleUserModal = () => {
        setUserModal(!userModal);
    }

    const toggleGroupModal = () => {
        setGroupModal(!groupModal);
    }

    const toggleShowDisabled = e => {
        e.preventDefault();
        setShowDisabled(!showDisabled);
    }

    const setGroup = async e => {
        if (user.azure_id !== null) {
            addToast(
                "You cannot change this user's group as they have been provisioned by Microsoft Azure Active Directory.",
                { appearance: 'error' }
            );
            return;
        }

        let group_id = e.target.value;
        let formData = new FormData();
        formData.append('group_id', group_id);
        formData.append('username', user.username);
        await axios.post('/api/user/group', formData)
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

                    addToast('Security Group Updated', { appearance: 'success' });
                    /* istanbul ignore next */
                    setTimeout(function () {
                        if (_mounted && document.getElementById('usrSecGroup') !== null) {
                            document.getElementById('usrSecGroup').classList.remove('text-green-500');
                            document.getElementById('usrSecGroup').classList.remove('border-green-500');
                        }
                    }, 2500);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (_mounted) {
                    addToast(
                        "An unknown error occurred.",
                        { appearance: 'error' }
                    );

                    document.getElementById('usrSecGroup').blur();
                    document.getElementById('usrSecGroup').classList.add('text-red-500');
                    document.getElementById('usrSecGroup').classList.add('border-red-500');
                    setTimeout(function () {
                        if (_mounted && document.getElementById('usrSecGroup') !== null) {
                            document.getElementById('usrSecGroup').classList.remove('text-red-500');
                            document.getElementById('usrSecGroup').classList.remove('border-red-500');
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

            let formData = new FormData();
            formData.append('_method', 'PATCH');
            formData.append('old_name', old_name);
            formData.append('new_name', selectedGroup.name);
            await axios.post('/api/group', formData)
                .then(json => {
                    /* istanbul ignore else */
                    if (_mounted) {
                        addToast(json.data.message, { appearance: 'success' });
                        groups.map(function (g, gi) {
                            /* istanbul ignore else */
                            if (selectedGroup.id === g.id)
                                groups[gi] = json.data.group
                        });
                        setGroups([...groups]);
                        old_name = '';

                        selectedGroup.state = 'saved';
                        setSelectedGroup({ ...selectedGroup });
                        setTimeout(/* istanbul ignore next */function () {
                            if (_mounted) {
                                selectedGroup.status = '';
                                setSelectedGroup({ ...selectedGroup });
                            }
                        }, 2500);
                    }
                })
                .catch(error => {
                    /* istanbul ignore else */
                    if (_mounted) {
                        selectedGroup.state = 'error';
                        if (error.response.data.errors.old_name !== undefined) {
                            selectedGroup.error = error.response.data.errors.old_name[0]
                        } else /* istanbul ignore else */ if (error.response.data.errors.new_name !== undefined) {
                            selectedGroup.error = error.response.data.errors.new_name[0];
                        }
                        setSelectedGroup({ ...selectedGroup });
                    }
                });
        }
    }

    const disable = async e => {
        e.preventDefault();

        if (user.azure_id !== null) {
            addToast("You cannot disable this user as they have been provisioned by Microsoft Azure Active Directory.", { appearance: 'error' });
            return;
        }

        let formData = new FormData();
        formData.append('_method', 'DELETE');

        await axios.post(`/api/user/${user.id}`, formData)
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
                    console.log(error.response);
                    addToast(error.response.data.message, { appearance: 'error' });
                }
            });
    }

    const enable = async e => {
        e.preventDefault();

        await axios.get(`/api/user/${user.id}/enable`)
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
                if (_mounted) {
                    addToast(error.response.data.message, { appearance: 'error' });
                }
            });
    }

    const deleteUser = async () => {
        let formData = new FormData();
        formData.append('_method', 'DELETE');

        await axios.post(`/api/user/${user.id}/hard`, formData)
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

                    setDisabled(_disabled);
                    setUser([]);
                    toggleUserModal();
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (_mounted) {
                    addToast(error.response.data.message, { appearance: 'error' });
                }
            });
    }

    const deleteGroup = async () => {
        let formData = new FormData();
        formData.append('_method', 'DELETE');
        formData.append('name', selectedGroup.name);

        await axios.post('/api/group', formData)
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
                    toggleGroupModal();
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (_mounted) {
                    addToast(error.response.data.errors.name[0], { appearance: 'error' });
                }
            });
    }

    const tabClass = id => classNames(
        'text-gray-600',
        'dark:text-gray-400',
        'ml-6',
        'inline-block',
        'cursor-pointer',
        (tab === id) ? 'text-2xl font-bold' : 'text-lg mt-1',
    )

    const paneClass = id => classNames(
        'py-2',
        (tab === id) ? 'block' : 'hidden'
    )

    let obj = (showDisabled) ? disabled : users;

    return (
        <>
            <Button to="/settings" style="link" className="flex flex-auto -mt-8 -ml-4 text-sm uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to settings
            </Button>
            <div className="w-full py-4" id="usersgroups">
                <div className="flex flex-col flex-col-reverse xl:flex-row">
                    <div className="flex flex-row">
                        <h6 className={tabClass(0)} onClick={() => setTab(0)}>Users</h6>
                        <h6 className={tabClass(1)} onClick={() => setTab(1)}>Groups</h6>
                    </div>

                    {
                        (tab === 0) ?
                            (
                                <div className="flex-1 text-right">
                                    <Button onClick={toggleShowDisabled} style="link">{
                                        (showDisabled) ? 'Show Enabled Users' : `Show Disabled Users ${(disabled === null) ? '' : `(${disabled.length})`}`
                                    }</Button>
                                    <Button onClick={toggleCreateUserFlyout} square>
                                        Add New User
                                    </Button>
                                </div>
                            ) :
                            (
                                <div className="flex-1 text-right">
                                    <Button onClick={toggleCreateGroupFlyout} square>
                                        Add New Group
                                    </Button>
                                </div>
                            )
                    }
                </div>

                <div className={paneClass(0)}>
                    {
                        (users === null && disabled === null) ?
                            (
                                <div className="w-full">
                                    <div className="bg-white dark:bg-gray-800 rounded mb-1 cursor-wait text-center py-2 pl-4" data-testid="user-loader">
                                        {
                                            (showDisabled) ?
                                                /* istanbul ignore next */
                                                'You have no disabled users.'
                                                : (
                                                    <ContentLoader
                                                        speed={2}
                                                        width="100%"
                                                        height={48}
                                                        foregroundColor="#FFF"
                                                    >
                                                        <rect x="70" y="8" rx="3" ry="3" width="110" height="8" />
                                                        <rect x="280" y="18" rx="3" ry="3" width="400" height="8" />
                                                        <rect x="70" y="30" rx="3" ry="3" width="80" height="6" />
                                                        <circle cx="24" cy="24" r="24" />
                                                    </ContentLoader>
                                                )
                                        }
                                    </div>
                                </div>
                            ) : <UserList users={obj} selectUser={selectUser} disabled={showDisabled} />
                    }
                </div>
                <div className={paneClass(1)}>
                    <GroupList groups={groups} selectGroup={selectGroup} />
                </div>
            </div>

            <FlyoutsContext.Provider value={{
                userModal,
                groupModal,
                createUserFlyout,
                createGroupFlyout,
                toggleUserModal,
                toggleGroupModal,
                toggleCreateUserFlyout,
                toggleCreateGroupFlyout
            }}>
                <UserFlyout user={user} setGroup={setGroup} disable={disable} deleteUser={deleteUser} enable={enable} groups={groups} />
                <GroupFlyout group={selectedGroup} deleteGroup={deleteGroup} renameGroup={renameGroup} saveRenameGroup={saveRenameGroup} />
                <CreateUserFlyout groups={groups} pushUser={pushUser} />
                <CreateGroupFlyout pushGroup={pushGroup} />
            </FlyoutsContext.Provider>
        </>
    )
}

export default withWebApps(UsersGroups);
