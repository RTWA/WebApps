import React, { useEffect, useState } from 'react';
import { Link, Route, Switch } from 'react-router-dom';

import { APIClient, Loader, useToasts, withWebApps } from 'webapps-react';
import { Apps, Plugins } from './Online';
import ApplicationSettings from './ApplicationSettings';
import EmailSettings from './EmailSettings';
import AuthenticationSettings from './AuthenticationSettings';
import AccessPermissions from './AccessPermissions';
import ConfigEditor from './ConfigEditor';
import UsersGroups from './UsersGroups';
import AppsPlugins from './AppsPlugins';
import Azure from './Azure';

let _mounted = false;

const Settings = ({ UI, loadNavigation }) => {
    const [open, setOpen] = useState('');
    const [productInfo, setProductInfo] = useState([]);
    const [settings, setSettings] = useState({});
    const [groups, setGroups] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [states, setStates] = useState({});
    const [updateCheck, setUpdateCheck] = useState(null);

    const { addToast } = useToasts();

    const APIController = new AbortController();
    let timer = null;

    useEffect(async () => {
        _mounted = true;
        await loadProductInfo();
        await loadGroups();
        await loadPermissions();
        await loadSettings();
        await checkForUpdate();

        return () => {
            APIController.abort();
            if (timer) {
                clearTimeout(timer);
            }
            _mounted = false;
        }
    }, []);

    const loadProductInfo = async () => {
        await APIClient('/api/product', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setProductInfo(json.data);
                }
            });
    }

    const loadGroups = async () => {
        await APIClient('/api/groups', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setGroups(json.data.groups);
                }
            });
    }

    const loadPermissions = async () => {
        await APIClient('/api/permissions', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setPermissions(json.data.permissions);
                }
            });
    }

    const loadSettings = async () => {
        await APIClient('/api/setting', { key: '*' }, {signal: APIController.signal})
            .then(json => {
                if (_mounted) {
                    setSettings(json.data.settings);
                }
            });
    }

    const checkForUpdate = async () => {
        setUpdateCheck(<p>Checking for updates...</p>);
        await APIClient('/api/update-check', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted && json.data.available) {
                    const content = (
                        <>
                            <p>Version {json.data.version} of WebApps is available.</p>
                            <a href={json.data.url} target="_blank">Click here to view details</a>
                        </>
                    )
                    addToast('Update Available!', content, { appearance: 'info', autoDismissTimeout: 10000 });
                    setUpdateCheck(<><p>An update is available ({json.data.version}).</p>
                        <a href={json.data.url} target="_blank" className="hover:text-gray-900 dark:hover:text-white">Click here to view details</a></>);
                } else if (_mounted) {
                    setUpdateCheck(<a href="#" onClick={checkForUpdate} className="hover:text-gray-900 dark:hover:text-white">Check for updates</a>);
                }
            });
    }

    const toggleOpen = pane => {
        setOpen((open === pane) ? '' : pane);
    }

    const createKey = async key => {
        await APIClient(`/api/setting/${key}`, { value: '', '_method': 'PUT' }, { method: 'PUT', signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setSettings(json.data.settings);
                }
            })
            .catch(error => {
                addToast(
                    "An unknown error occurred.",
                    '',
                    { appearance: 'error' }
                );
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
                addToast(
                    "An unknown error occurred.",
                    '',
                    { appearance: 'error' }
                );
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
                addToast(
                    "An unknown error occurred.",
                    '',
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

    if (settings.length === 0 || groups.length === 0 || permissions.length === 0) {
        return <Loader />
    }

    return (
        <div id="Settings" className="mt-10">
            <Route render={({ location }) => (
                <Switch location={location} key={location.pathname}>
                    <Route exact path="/settings">
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-600 border-0 overflow-hidden">
                            <div className={`bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:text-${UI.theme}-600 dark:hover:text-${UI.theme}-400 mb-0 px-6 py-6 cursor-pointer`}
                                onClick={() => toggleOpen('ApplicationSettings')}>
                                <h6 className="text-xl font-bold">Application</h6>
                            </div>
                            <div className={`flex-auto px-4 lg:px-10 overflow-hidden ${(open === 'ApplicationSettings') ? '' : 'h-0'}`}>
                                <ApplicationSettings
                                    settings={settings}
                                    typeValue={typeValue}
                                    setValue={setValue}
                                    states={states} />
                            </div>
                        </div>
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-600 border-0 overflow-hidden">
                            <div className={`bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:text-${UI.theme}-600 dark:hover:text-${UI.theme}-400 mb-0 px-6 py-6 cursor-pointer`}
                                onClick={() => toggleOpen('EmailSettings')}>
                                <h6 className="text-xl font-bold">Email</h6>
                            </div>
                            <div className={`flex-auto px-4 lg:px-10 overflow-hidden ${(open === 'EmailSettings') ? '' : 'h-0'}`}>
                                <EmailSettings settings={settings} typeValue={typeValue} setValue={setValue} states={states} />
                            </div>
                        </div>
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-600 border-0 overflow-hidden">
                            <div className={`bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:text-${UI.theme}-600 dark:hover:text-${UI.theme}-400 mb-0 px-6 py-6 cursor-pointer`}
                                onClick={() => toggleOpen('AuthenticationSettings')}>
                                <h6 className="text-xl font-bold">Authentication</h6>
                            </div>
                            <div className={`flex-auto px-4 lg:px-10 overflow-hidden ${(open === 'AuthenticationSettings') ? '' : 'h-0'}`}>
                                <AuthenticationSettings settings={settings} setValue={setValue} roles={groups} states={states} />
                            </div>
                        </div>
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-600 border-0 overflow-hidden">
                            <div className={`bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:text-${UI.theme}-600 dark:hover:text-${UI.theme}-400 mb-0 px-6 py-6 cursor-pointer`}
                                onClick={() => toggleOpen('AccessPermissions')}>
                                <h6 className="text-xl font-bold">Permissions</h6>
                            </div>
                            <div className={`flex-auto overflow-hidden ${(open === 'AccessPermissions') ? '' : 'h-0'}`}>
                                <AccessPermissions groups={groups} permissions={permissions} updateGroup={updateGroup} />
                            </div>
                        </div>
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border-0 overflow-hidden">
                            <Link to="/settings/usersgroups" className={`bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:text-${UI.theme}-600 dark:hover:text-${UI.theme}-400 mb-0 px-6 py-6 cursor-pointer`}>
                                <h6 className="text-xl font-bold">Users & Groups</h6>
                            </Link>
                        </div>
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border-0 overflow-hidden">
                            <Link to="/settings/appsplugins" className={`bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:text-${UI.theme}-600 dark:hover:text-${UI.theme}-400 mb-0 px-6 py-6 cursor-pointer`}>
                                <h6 className="text-xl font-bold">Apps & Plugins</h6>
                            </Link>
                        </div>
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border-0 overflow-hidden">
                            <Link to="/settings/azure" className={`bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:text-${UI.theme}-600 dark:hover:text-${UI.theme}-400 mb-0 px-6 py-6 cursor-pointer`}>
                                <h6 className="text-xl font-bold">Microsoft Azure Integration</h6>
                            </Link>
                        </div>
                        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border-0 overflow-hidden">
                            <Link to="/settings/advanced" className="bg-white dark:bg-gray-700 hover:bg-red-300 dark:hover:bg-red-900 text-red-300 hover:text-red-500 dark:hover:text-red-300  mb-0 px-6 py-6 cursor-pointer">
                                <h6 className="text-xl font-bold">Config Editor (Advanced)</h6>
                            </Link>
                        </div>
                        <div className="flex flex-col text-gray-400 text-center">
                            <div>{productInfo.app_name} &bull; Version {productInfo.app_version}</div>
                            <div className="text-xs">
                                {updateCheck}
                            </div>
                        </div>
                    </Route>

                    <Route exact path="/settings/usersgroups">
                        <UsersGroups groups={groups} setGroups={setGroups} />
                    </Route>
                    <Route exact path="/settings/appsplugins">
                        <AppsPlugins />
                    </Route>
                    <Route exact path="/settings/azure">
                        <Azure settings={settings} states={states} typeValue={typeValue} setValue={setValue} groups={groups} />
                    </Route>
                    <Route exact path="/settings/advanced">
                        <ConfigEditor settings={settings} typeValue={typeValue} setValue={setValue} createKey={createKey} deleteKey={deleteKey} states={states} />
                    </Route>
                    <Route exact path="/settings/online/apps">
                        <Apps />
                    </Route>
                    <Route exact path="/settings/online/plugins">
                        <Plugins />
                    </Route>
                </Switch>
            )} />
        </div>
    )
}

export default withWebApps(Settings);
