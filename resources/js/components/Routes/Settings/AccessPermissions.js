import React, { useEffect, useState } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import { Switch, useToasts, withWebApps } from 'webapps-react';

let _mounted = false;

const AccessPermissions = ({ loadNavigation, ...props }) => {
    const {
        groups,
        permissions,
        updateGroup,
    } = props;

    const { addToast } = useToasts();

    const [tab, setTab] = useState(0);
    const [states, setStates] = useState({});

    useEffect(() => {
        _mounted = true;

        return () => _mounted = false;
    }, []);

    const setPerm = async (group, perm, mode, check_id) => {
        let formData = new FormData();
        formData.append("mode", mode);
        formData.append("group", group.id);
        formData.append("perm", perm.id);
        await axios.post('/api/permissions', formData)
            .then(response => {
                /* istanbul ignore else */ 
                if (_mounted) {
                    loadNavigation();

                    states[check_id] = 'saved';
                    setStates({ ...states });

                    setTimeout(/* istanbul ignore next */ function () {
                        if (_mounted) {
                            states[check_id] = '';
                            setStates({ ...states });
                        }
                    }, 2500);
                }
            })
            .catch(error => {
                /* istanbul ignore else */ 
                if (_mounted) {
                    addToast(
                        "Permission failed to update.",
                        "Please reload the page try again.",
                        { appearance: 'error' }
                    );

                    states[check_id] = 'error';
                    setStates({ ...states });

                    setTimeout(/* istanbul ignore next */ function () {
                        if (_mounted) {
                            states[check_id] = '';
                            setStates({ ...states });
                        }
                    }, 2500);
                }
            });
    }

    const toggle = (group, perm, group_index, check_id) => {
        let groupPermissionIndex = false;
        Object(group.permissions).map(function (p, i) {
            if (perm.id == p.id)
                groupPermissionIndex = i;
        });

        if (groupPermissionIndex !== false) {
            let _permissions = group.permissions;
            delete _permissions[groupPermissionIndex];
            group.permissions = _permissions.filter(/* istanbul ignore next */ function () {
                return true;
            });
            setPerm(group, perm, 'remove', check_id);
        } else {
            setPerm(group, perm, 'add', check_id);
            group.permissions.push(perm);
        }
        updateGroup(group_index, group);
    }

    const onChange = e => {
        let check_id = e.target.id
        let group = groups[e.target.dataset.gi];
        let perm = permissions[e.target.dataset.gpi].permissions[e.target.dataset.pi];

        states[check_id] = 'saving';
        setStates({ ...states });

        if (group.name === "Administrators" && perm.name === "admin.access") {
            addToast(
                "Administrators cannot be denied access to Administrative Options",
                '',
                { appearance: 'error' }
            );

            states[check_id] = 'error';
            setStates({ ...states });

            setTimeout(/* istanbul ignore next */ function () {
                if (_mounted) {
                    states[check_id] = '';
                    setStates({ ...states });
                }
            }, 2500);
            return null;
        }
        toggle(group, perm, e.target.dataset.role, check_id);
    }

    const hasPermission = (group, perm) => {
        let _bool = false;
        Object(group.permissions).map(function (p, i) {
            if (p.name === perm.name)
                _bool = true;
        });
        return _bool;
    }

    const tabClass = id => classNames(
        'text-gray-600',
        'dark:text-gray-200',
        'py-4',
        'px-6',
        'hover:text-gray-800',
        'dark:hover:text-white',
        'focus:outline-none',
        (tab === id) ? 'border-b-2' : '',
        (tab === id) ? 'font-medium' : '',
        (tab === id) ? 'border-gray-500' : ''
    )

    const paneClass = id => classNames(
        'p-5',
        (tab === id) ? 'block' : 'hidden'
    )

    return (
        <>
            <nav className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-600">
                {
                    Object.keys(permissions).map(function (g, i) {
                        let permission = permissions[g];
                        return (
                            <button key={i} className={tabClass(i)} onClick={() => setTab(i)}>
                                {permission.name}
                            </button>
                        )
                    })
                }
            </nav>
            {
                Object.keys(permissions).map(function (g, i) {
                    var permission = permissions[g];
                    return (
                        <div className={paneClass(i)} key={i}>
                            <div className={`hidden lg:grid lg:grid-cols-${permission.permissions.length + 1}`}>
                                <div>&nbsp;</div>
                                {
                                    Object(permission.permissions).map(function (perm, i) {
                                        return (
                                            <h6 key={i} className="text-left font-semibold">{perm.title}</h6>
                                        )
                                    })
                                }
                            </div>
                            {
                                Object(groups).map(function (group, gi) {
                                    return (
                                        <div key={gi} className={(gi % 2) ? `-mx-5 px-5 py-2 lg:grid lg:grid-cols-${permission.permissions.length + 1} bg-gray-200 dark:bg-gray-700` : `-mx-5 px-5 py-2 lg:grid lg:grid-cols-${permission.permissions.length + 1}`}>
                                            <h6 className="font-semibold lg:font-normal text-center lg:text-left">{group.name}</h6>
                                            {
                                                Object(permission.permissions).map(function (perm, pi) {
                                                    return (/* istanbul ignore next */
                                                        <div key={pi} className="pl-5 lg:pl-0">
                                                            <div className="lg:hidden">{perm.title}</div>
                                                            <Switch checked={hasPermission(group, perm)}
                                                                id={`${perm.name}_${pi}_${gi}_${i}`}
                                                                state={states[`${perm.name}_${pi}_${gi}_${i}`]}
                                                                data-pi={pi}
                                                                data-gi={gi}
                                                                data-gpi={g}
                                                                data-testid={`${perm.name}_${group.name}`}
                                                                onChange={onChange} />
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                })
            }
        </>
    )
};

export default withWebApps(AccessPermissions);
