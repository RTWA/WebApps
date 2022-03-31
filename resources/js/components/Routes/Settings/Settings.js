import React, { useEffect, useState } from 'react';
import { Link, Route, Switch, useHistory } from 'react-router-dom';

import { APIClient, Badge, Loader, useToasts, withWebApps } from 'webapps-react';
import { Apps, Plugins } from './Online';
import ApplicationSettings from './ApplicationSettings';
import EmailSettings from './EmailSettings';
import AuthenticationSettings from './AuthenticationSettings';
import AccessPermissions from './AccessPermissions';
import ConfigEditor from './ConfigEditor';
import UsersGroups from './UsersGroups';
import AppsPlugins from './AppsPlugins';
import Azure from './Azure';
import moment from 'moment';
import BlockSettings from './BlockSettings';

let _mounted = false;

const Settings = ({ UI, loadNavigation }) => {
    const [open, setOpen] = useState('');
    const [productInfo, setProductInfo] = useState([]);
    const [updateInfo, setUpdateInfo] = useState({});
    const [settings, setSettings] = useState({});
    const [groups, setGroups] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [states, setStates] = useState({});
    const [updateCheck, setUpdateCheck] = useState(null);
    const [showUpdateHistory, setShowUpdateHistory] = useState(false);

    const { addToast } = useToasts();
    const history = useHistory();

    const APIController = new AbortController();
    let timer = null;

    useEffect(async () => {
        _mounted = true;
        await loadProductInfo();
        await loadUpdateInfo();
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
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    // TODO: Handle Errors
                    console.log(error)
                }
            });
    }

    const loadUpdateInfo = async () => {
        await APIClient('/api/update-info', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    setUpdateInfo(json.data);
                    if (json.data.apps) {
                        addToast(
                            `App ${(Object.keys(json.data.apps).length === 1) ? 'Update' : 'Updates'} Available!`,
                            undefined,
                            {
                                appearance: 'info',
                                autoDismissTimeout: 5000,
                                action: () => history.push('/settings/appsplugins'),
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
                                action: () => history.push('/settings/appsplugins'),
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
                    // TODO: Handle Errors
                    console.log(error);
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
                    // TODO: Handle Errors
                    console.log(error)
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
                    // TODO: Handle Errors
                    console.log(error)
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
                    // TODO: Handle Errors
                    console.log(error)
                }
            });
    }

    const checkForUpdate = async () => {
        setUpdateCheck(<p>Checking for updates...</p>);
        await APIClient('/api/update-check', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted && json.data.available) {
                    addToast(
                        'Update Available!',
                        `Version ${json.data.version} of WebApps is available.`,
                        {
                            appearance: 'info',
                            autoDismissTimeout: 10000,
                            action: () => window.open(json.data.url, '_blank').focus(),
                            actionLabel: "View Details",
                            secondaryAction: 'dismiss',
                            secondaryActionLabel: 'Close'
                        }
                    );
                    setUpdateCheck(<><p>An update is available ({json.data.version}).</p>
                        <a href={json.data.url} target="_blank" className="hover:text-gray-900 dark:hover:text-white">Click here to view details</a></>);
                } else if (_mounted) {
                    setUpdateCheck(<a href="#" onClick={checkForUpdate} className="hover:text-gray-900 dark:hover:text-white">Check for updates</a>);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    // TODO: Handle Errors
                    console.log(error)
                }
            });
    }

    const clearCache = async () => {
        await APIClient('/api/clear-cache', undefined, { signal: APIController.signal })
            .then(json => {
                if (_mounted) {
                    addToast('Cache Cleared!', 'The system cache has been cleared successfully.', { appearance: 'success' })
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    // TODO: Handle Errors
                    console.log(error)
                }
            });
    }

    const toggleUpdateHistory = () => {
        setShowUpdateHistory(!showUpdateHistory);
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
                if (!error.status?.isAbort) {
                    addToast(
                        "An unknown error occurred.",
                        '',
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
                        "An unknown error occurred.",
                        '',
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

    if (settings.length === 0 || groups.length === 0 || permissions.length === 0) {
        return <Loader />
    }

    return (
        <div id="Settings" className="mt-10">
            <Route render={({ location }) => (
                <Switch location={location} key={location.pathname}>
                    <Route exact path="/settings">
                        <div className="flex flex-col md:flex-row mb-12 md:gap-24 items-center justify-center">
                            <div className="md:w-6/12 text-gray-400 text-right">
                                <div className="flex flex-row items-center justify-end">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 text-${UI.theme}-600 dark:text-${UI.theme}-500 mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                    </svg>
                                    <h1 className="text-gray-900 dark:text-white text-4xl font-bold">{productInfo.app_name}</h1>
                                </div>
                                <p className="mb-4 text-sm">Version {productInfo.app_version}</p>
                            </div>
                            <div className="md:w-6/12 text-gray-400 text-left text-xs">
                                {updateCheck}
                                <div className="mt-2 cursor-pointer" onClick={toggleUpdateHistory}>{(showUpdateHistory) ? 'Hide' : 'Show'} Update History</div>
                                <div className="cursor-pointer" onClick={clearCache}>Clear System Cache</div>
                            </div>
                        </div>

                        <div className={`${(showUpdateHistory) ? 'max-h-[1000rem]' : 'max-h-0'} transition-all text-gray-400 overflow-hidden flex justify-center`}>
                            <table className="mb-6 w-2/12 text-center">
                                <thead>
                                    <tr className="border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                                        <th>Version</th>
                                        <th>Installed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border border-gray-100 dark:border-gray-700">
                                        <td>{productInfo.app_version}</td>
                                        <td className="group">
                                            <time dateTime={productInfo.installed}>{moment(productInfo.installed?.replace('am', '')?.replace('pm', '')).fromNow()}</time>
                                            <span className="hidden text-center absolute z-10 group-hover:inline-block py-1 px-1.5 text-xs font-medium text-gray-600 bg-gray-400 rounded-lg dark:bg-gray-700 ml-2">{productInfo.installed}</span>
                                        </td>
                                    </tr>
                                    {
                                        productInfo.history?.map(function (info, i) {
                                            return (
                                                <tr className="border border-gray-100 dark:border-gray-700" key={i}>
                                                    <td>{info.version}</td>
                                                    <td className="group">
                                                        {
                                                            (typeof info.installed === 'string')
                                                                ? (
                                                                    <>
                                                                        <time dateTime={info.installed}>{moment(info.installed.replace('am', '').replace('pm', '')).fromNow()}</time>
                                                                        <span className="hidden text-center absolute z-10 group-hover:inline-block py-1 px-1.5 text-xs font-medium text-gray-600 bg-gray-400 rounded-lg dark:bg-gray-700 ml-2">{info.installed}</span>
                                                                    </>
                                                                ) : null
                                                        }
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                    <tr>
                                        <td colSpan={3} className="cursor-pointer text-xs text-center pt-2"><div onClick={toggleUpdateHistory}>{(showUpdateHistory) ? 'Hide Update History' : ''}</div></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

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
                                onClick={() => toggleOpen('BlockSettings')}>
                                <h6 className="text-xl font-bold">Blocks</h6>
                            </div>
                            <div className={`flex-auto px-4 lg:px-10 overflow-hidden transition-all ${(open === 'BlockSettings') ? 'max-h-[1000rem]' : 'max-h-0'}`}>
                                <BlockSettings
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
                            <Link to="/settings/appsplugins" className={`bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:text-${UI.theme}-600 dark:hover:text-${UI.theme}-400 mb-0 px-6 py-6 cursor-pointer flex flex-row items-center gap-6`}>
                                <h6 className="text-xl font-bold flex flex-row items-center gap-x-1.5">
                                    <span>Apps</span>
                                    {
                                        (updateInfo.apps)
                                            ? <Badge color={`${UI.theme}-400`} pill className="h-5 w-5 text-white dark:text-gray-900">{Object.keys(updateInfo.apps).length}</Badge> : null
                                    }
                                    <span>& Plugins</span>
                                    {
                                        (updateInfo.plugins)
                                            ? <Badge color={`${UI.theme}-400`} pill className="h-5 w-5 text-white dark:text-gray-900">{Object.keys(updateInfo.plugins).length}</Badge> : null
                                    }
                                </h6>
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
