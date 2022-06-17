import React, { useContext, useEffect, useState } from 'react';
import { Route, Switch, useNavigate } from 'react-router-dom';

import {
    APIClient,
    AppPage,
    Drawer,
    DrawerHeader,
    DrawerItems,
    DrawerItem,
    useToasts,
    WebAppsUXContext,
    ComponentError,
    ComponentErrorTrigger,
} from 'webapps-react';

import { Apps, Plugins } from './Online';
import ApplicationSettings from './ApplicationSettings';
import EmailSettings from './EmailSettings';
import AuthenticationSettings from './AuthenticationSettings';
import AccessPermissions from './AccessPermissions';
import ConfigEditor from './ConfigEditor';
import UsersGroups from './UsersGroups';
import AppsPlugins from './AppsPlugins';
import Azure from './Azure';
import BlockSettings from './BlockSettings';
import SystemInfo from './SystemInfo';

let _mounted = false;

const Settings = props => {
    const [errors, setErrors] = useState({});
    const [updateInfo, setUpdateInfo] = useState({}); //
    const [settings, setSettings] = useState({});
    const [groups, setGroups] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [states, setStates] = useState({});

    const { useNavigation } = useContext(WebAppsUXContext);
    const { loadNavigation } = useNavigation;

    const { addToast } = useToasts();
    const navigate = useNavigate();

    const APIController = new AbortController();
    let timer = null;

    useEffect(() => {
        _mounted = true;
        loadUpdateInfo(); //

        loadGroups();
        loadPermissions();
        loadSettings();

        return () => {
            APIController.abort();
            if (timer) {
                clearTimeout(timer);
            }
            _mounted = false;
        }
    }, []);

    const loadUpdateInfo = async () => {
        await APIClient('/api/update-info', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    if (json.data.apps && json.data.plugins) {
                        json.data.AppPluginUpdates = Object.keys(json.data.apps).length + Object.keys(json.data.plugins).length
                    } else if (json.data.apps && !json.data.plugins) {
                        json.data.AppPluginUpdates = Object.keys(json.data.apps).length
                    } else if (!json.data.apps && json.data.plugins) {
                        json.data.AppPluginUpdates = Object.keys(json.data.plugins).length
                    }
                    setUpdateInfo(json.data);
                    if (json.data.apps) {
                        addToast(
                            `App ${(Object.keys(json.data.apps).length === 1) ? 'Update' : 'Updates'} Available!`,
                            undefined,
                            {
                                appearance: 'info',
                                autoDismissTimeout: 5000,
                                action: () => navigate('/settings/appsplugins'),
                                actionLabel: "Go to Apps & Plugins",
                                secondaryAction: 'dismiss',
                                secondaryActionLabel: 'Close'
                            }
                        );
                    }
                    if (json.data.plugins) {
                        addToast(
                            `Plugin ${(Object.keys(json.data.plugins).length === 1) ? 'Update' : 'Updates'} Available!`,
                            undefined,
                            {
                                appearance: 'info',
                                autoDismissTimeout: 5000,
                                action: () => navigate('/settings/appsplugins'),
                                actionLabel: "Go to Apps & Plugins",
                                secondaryAction: 'dismiss',
                                secondaryActionLabel: 'Close'
                            }
                        );
                    }
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    addToast(
                        "Unable to check for App or Plugin updates",
                        error.data.message,
                        {
                            appearance: 'error',
                        }
                    );
                }
            })
    }

    const loadGroups = async () => {
        await APIClient('/api/groups', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setGroups(json.data.groups);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    errors.groups = error.data.message;
                    setErrors({ ...errors });
                }
            });
    }

    const loadPermissions = async () => {
        await APIClient('/api/permissions', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setPermissions(json.data.permissions);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    errors.permissions = error.data.message;
                    setErrors({ ...errors });
                }
            });
    }

    const loadSettings = async () => {
        await APIClient('/api/setting', { key: '*' }, { signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setSettings(json.data.settings);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    errors.settings = error.data.message;
                    setErrors({ ...errors });
                }
            });
    }

    const createKey = async key => {
        await APIClient(`/api/setting/${key}`, { value: '', '_method': 'PUT' }, { method: 'PUT', signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setSettings(json.data.settings);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    addToast(
                        "Unable to create setting",
                        "An unknown error occurred.",
                        { appearance: 'error' }
                    );
                }
            })
    }

    const deleteKey = async key => {
        await APIClient(`/api/setting/${key}`, { _method: 'DELETE' }, { method: 'DELETE', signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setSettings(json.data.settings);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    addToast(
                        "Unable to delete setting",
                        "An unknown error occurred.",
                        { appearance: 'error' }
                    );
                }
            })
    }

    const setValue = async (key, value, ce) => {
        states[key] = 'saving';
        setStates({ ...states });

        let config_editor = (ce !== undefined);
        let ce_key = key;
        if (config_editor) {
            key = key.replace('ce-', '');
        }

        settings[key] = value;
        if (_mounted) {
            setSettings({ ...settings });
        }

        await APIClient(`/api/setting/${key}`, { value: value, _method: 'PUT' }, { method: 'PUT', signal: APIController.signal })
            .then(json => {
                key = (config_editor) ? ce_key : key;

                states[key] = 'saved';
                setStates({ ...states });

                timer = setTimeout(function () {
                    states[key] = '';
                    setStates({ ...states });
                    timer = null;
                }, 2500);

                if (key.includes("core.cms.")) {
                    loadNavigation();
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    addToast(
                        "Unable to save setting",
                        "An unknown error occurred.",
                        { appearance: 'error' }
                    );

                    key = (config_editor) ? ce_key : key;

                    states[key] = 'error';
                    setStates({ ...states });

                    timer = setTimeout(function () {
                        states[key] = '';
                        setStates({ ...states });
                        timer = null;
                    }, 2500);
                }
            })
    }

    const typeValue = (key, value) => {
        settings[key] = value;
        if (_mounted) {
            setSettings({ ...settings });
        }
    }

    const updateGroup = (group_index, new_group) => {
        groups[group_index] = new_group;
        if (_mounted) {
            setGroups([...groups]);
        }
    }

    return (
        <AppPage id="Settings">
            <Drawer>
                <DrawerHeader>Settings</DrawerHeader>
                <DrawerItems>
                    <DrawerItem to="/settings/application">Application</DrawerItem>
                    <DrawerItem
                        to="/settings/appsplugins"
                        badge={
                            (updateInfo.AppPluginUpdates)
                                ? { text: updateInfo.AppPluginUpdates }
                                : null
                        }>
                        Apps & Plugins
                    </DrawerItem>
                    <DrawerItem to="/settings/authentication">Authentication</DrawerItem>
                    <DrawerItem to="/settings/blocks">Blocks</DrawerItem>
                    <DrawerItem to="/settings/email">Email</DrawerItem>
                    <DrawerItem to="/settings/azure">Microsoft Azure Integration</DrawerItem>
                    <DrawerItem to="/settings/permissions">Permissions</DrawerItem>
                    <DrawerItem to="/settings/usersgroups">Users & Groups</DrawerItem>
                    <DrawerItem to="/settings/advanced" color="red" badge={{ text: 'Advanced' }}>Config Editor</DrawerItem>
                </DrawerItems>
            </Drawer>
            <Switch>
                <Route exact path="/settings/application">
                    <ComponentError retry={() => { errors.settings = null; setErrors({ ...errors }); loadSettings(); }}>
                        {
                            (errors.settings)
                                ? <ComponentErrorTrigger error={errors.settings} />
                                : <ApplicationSettings
                                    settings={settings}
                                    typeValue={typeValue}
                                    setValue={setValue}
                                    states={states}
                                />
                        }
                    </ComponentError>
                </Route>
                <Route exact path="/settings/appsplugins">
                    <AppsPlugins />
                </Route>
                <Route exact path="/settings/online/apps">
                    <Apps />
                </Route>
                <Route exact path="/settings/online/plugins">
                    <Plugins />
                </Route>
                <Route exact path="/settings/authentication">
                    <ComponentError
                        retry={() => {
                            errors.settings = null;
                            errors.groups = null;
                            setErrors({ ...errors });
                            loadSettings();
                            loadGroups();
                        }}
                    >
                        {
                            (errors.settings)
                                ? <ComponentErrorTrigger error={errors.settings} />
                                : (errors.groups)
                                    ? <ComponentErrorTrigger error={errors.groups} />
                                    : <AuthenticationSettings
                                        settings={settings}
                                        setValue={setValue}
                                        roles={groups}
                                        states={states}
                                    />
                        }
                    </ComponentError>
                </Route>
                <Route exact path="/settings/blocks">
                    <ComponentError retry={() => { errors.settings = null; setErrors({ ...errors }); loadSettings(); }}>
                        {
                            (errors.settings)
                                ? <ComponentErrorTrigger error={errors.settings} />
                                : <BlockSettings
                                    settings={settings}
                                    typeValue={typeValue}
                                    setValue={setValue}
                                    states={states}
                                />
                        }
                    </ComponentError>
                </Route>
                <Route exact path="/settings/email">
                    <ComponentError retry={() => { errors.settings = null; setErrors({ ...errors }); loadSettings(); }}>
                        {
                            (errors.settings)
                                ? <ComponentErrorTrigger error={errors.settings} />
                                : <EmailSettings
                                    settings={settings}
                                    typeValue={typeValue}
                                    setValue={setValue}
                                    states={states}
                                />
                        }
                    </ComponentError>
                </Route>
                <Route exact path="/settings/azure">
                    <ComponentError
                        retry={() => {
                            errors.settings = null;
                            errors.groups = null;
                            setErrors({ ...errors });
                            loadSettings();
                            loadGroups();
                        }}
                    >
                        {
                            (errors.settings)
                                ? <ComponentErrorTrigger error={errors.settings} />
                                : (errors.groups)
                                    ? <ComponentErrorTrigger error={errors.groups} />
                                    : <Azure
                                        settings={settings}
                                        states={states}
                                        typeValue={typeValue}
                                        setValue={setValue}
                                        groups={groups}
                                    />
                        }
                    </ComponentError>
                </Route>
                <Route exact path="/settings/permissions">
                    <ComponentError retry={() => { errors.groups = null; setErrors({ ...errors }); loadGroups(); }}>
                        {
                            (errors.groups)
                                ? <ComponentErrorTrigger error={errors.groups} />
                                : <AccessPermissions
                                    groups={groups}
                                    permissions={permissions}
                                    updateGroup={updateGroup}
                                />
                        }
                    </ComponentError>
                </Route>
                <Route exact path="/settings/usersgroups">
                    <ComponentError retry={() => { errors.groups = null; setErrors({ ...errors }); loadGroups(); }}>
                        {
                            (errors.groups)
                                ? <ComponentErrorTrigger error={errors.groups} />
                                : <UsersGroups
                                    groups={groups}
                                    setGroups={setGroups}
                                />
                        }
                    </ComponentError>
                </Route>
                <Route exact path="/settings/advanced">
                    <ComponentError retry={() => { errors.settings = null; setErrors({ ...errors }); loadSettings(); }}>
                        {
                            (errors.settings)
                                ? <ComponentErrorTrigger error={errors.settings} />
                                : <ConfigEditor
                                    settings={settings}
                                    typeValue={typeValue}
                                    setValue={setValue}
                                    createKey={createKey}
                                    deleteKey={deleteKey}
                                    states={states}
                                />
                        }
                    </ComponentError>
                </Route>
                <Route exact path="/settings">
                    <SystemInfo />
                </Route>
            </Switch>
        </AppPage>
    )
}

export default Settings;
