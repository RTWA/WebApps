import React, { useEffect, useState } from 'react';
import { APIClient, Button, Input, Switch, withWebApps } from 'webapps-react';
import moment from 'moment';

import GroupSearch from './GroupSearch/GroupSearch';

let _mounted = false;
/* istanbul ignore next */
let webapps = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;
let callback = `${webapps}/graph/callback/register`;

const Azure = ({ UI, ...props }) => {
    const {
        settings,
        states,
        typeValue,
        setValue,
        groups
    } = props;

    const [client, setClient] = useState({ id: '', secret: '' });

    const [graphApp, setGraphApp] = useState({});
    const [accessToken, setAccessToken] = useState(null);
    const [groupData, setGroupData] = useState([]);
    const [syncBtnText, setSyncBtnText] = useState('Sync Now');

    useEffect(() => {
        _mounted = true;
        getTenantId();

        return () => _mounted = false;
    }, []);

    useEffect(async () => {
        if (graphApp.tenantId) {
            RequestAccessToken();
        }
    }, [graphApp]);

    useEffect(() => {
        if (accessToken) {
            getGroupMaps();
            // getAzGroups();
        }
    }, [accessToken]);

    const getTenantId = async () => {
        if (settings['azure.graph.tenant'] !== '' && settings['azure.graph.tenant'] !== undefined) {
            graphApp.tenantId = settings['azure.graph.tenant'];
            setGraphApp({ ...graphApp });
        } else {
            await APIClient('/api/setting', { key: 'azure.graph.tenant' })
                .then(json => {
                    /* istanbul ignore else */
                    if (_mounted) {
                        graphApp.tenantId = json.data['azure.graph.tenant'];
                        setGraphApp({ ...graphApp });
                    }
                });
        }
    };

    const RequestAccessToken = async () => {
        await APIClient('/api/graph/token')
            .then(json => {
                setAccessToken(json.data.token.access_token);
            });
    }

    const getGroupMaps = async () => {
        await APIClient('/api/group/mappings')
            .then(json => {
                Object.keys(json.data.mappings).map(function (group) {
                    let map = json.data.mappings[group];

                    groupData[group] = {
                        value: map.azure_display_name,
                        selected: {
                            id: map.azure_group_id,
                            displayName: map.azure_display_name
                        }
                    };
                });
                setGroupData(groupData);
            })
            .catch(/* istanbul ignore next */ error => {
                if (!error.status?.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            })
    }

    const setGroupMapping = async group => {
        groupData[group].state = 'saving';
        setGroupData([...groupData]);

        await APIClient('/api/group/mapping', {
            group_id: group,
            azure_group_id: groupData[group].selected.id,
            azure_display_name: groupData[group].selected.displayName,
        })
            .then(json => {
                /* istanbul ignore else */
                if (json.data.success) {
                    groupData[group].state = 'saved';
                    setGroupData([...groupData]);

                    setTimeout(/* istanbul ignore next */ function () {
                        // Don't do anything if testing
                        if (process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test') {
                            groupData[group].state = '';
                            setGroupData([...groupData]);
                        }
                    }, 2500);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);

                    groupData[group].state = 'error';
                    setGroupData([...groupData]);

                    setTimeout(/* istanbul ignore next */ function () {
                        // Don't do anything if testing
                        if (process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test') {
                            groupData[group].state = '';
                            setGroupData([...groupData]);
                        }
                    }, 2500);
                }
            });
    }

    const syncAzureNow = async () => {
        setSyncBtnText('Syncing');
        await APIClient('/api/azure/sync');
    }

    const onChange = e => {
        let value = e.target.value;

        if (e.target.id === "azure.graph.login_enabled")
            value = (settings['azure.graph.login_enabled'] === "true") ? "false" : "true";
        if (e.target.id === "azure.graph.default_login")
            value = (settings['azure.graph.default_login'] === "true") ? "false" : "true";

        if (e.target.id === "azure.graph.client_secret") {
            e.target.value = '';
        }

        setValue(e.target.id, value);
    }

    const onType = e => {
        typeValue(e.target.id, e.target.value);
    }

    const setClientID = e => {
        client.id = e.target.value;
        setClient({ ...client });
        setValue('azure.graph.client_id', e.target.value);
    }

    const setClientSecret = e => {
        client.secret = e.target.value;
        setClient({ ...client });
        setValue('azure.graph.client_secret', e.target.value);
    }

    if (graphApp.tenantId === null || graphApp.tenantId === "" || graphApp.tenantId === undefined) {
        return (
            <>
                <Button to="/settings" style="link" className="flex flex-auto -mt-8 -ml-4 text-sm uppercase">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to settings
                </Button>
                <div className="w-full py-6" id="azure">
                    <div className="flex flex-row">
                        <h6 className="text-gray-600 dark:text-gray-400 inline-block cursor-pointer text-2xl font-bold">Microsoft Azure Integration</h6>
                    </div>
                    <div className="flex flex-col min-w-0 break-words w-full my-6 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-600 border-0 overflow-hidden">
                        <div className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 mb-0 py-6">
                            <div className="px-4 py-2 -mt-2">
                                <p>Please follow the guidance found in the
                                    <Button href="https://docs.getwebapps.uk/configuration/azure-integration-setup" target="_blank" size="small" style="link">WebApps Documentation</Button>
                                    to create your App Registration in Azure, then provide the required information below.
                                </p>
                                <Input
                                    id="client_id"
                                    name="client_id"
                                    label="Application (Client) ID"
                                    type="text"
                                    value={client.id}
                                    onChange={setClientID} />
                                <Input
                                    id="client_secret"
                                    name="client_secret"
                                    label="Client Secret"
                                    type="text"
                                    defaultValue={client.secret}
                                    onChange={setClientSecret} />
                                {
                                    (client.id !== "" && client.secret !== "")
                                        ? (
                                            <div className="text-center">
                                                <p>Click the button below to get started with Microsoft Azure Integration</p>
                                                <p className="mt-4">
                                                    <Button href={`https://login.microsoftonline.com/common/adminconsent?client_id=${client.id}&redirect_uri=${callback}`}
                                                        size="large">
                                                        Get Started
                                                    </Button>
                                                </p>
                                            </div>
                                        )
                                        : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Button to="/settings" style="link" className="flex flex-auto -mt-8 -ml-4 text-sm uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to settings
            </Button>
            <div className="w-full py-6" id="azure">
                <div className="flex flex-row">
                    <h6 className="text-gray-600 dark:text-gray-400 inline-block cursor-pointer text-2xl font-bold">Microsoft Azure Integration</h6>
                </div>
                <div className="flex flex-col min-w-0 break-words w-full my-6 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-600 border-0 overflow-hidden">
                    <div className="flex flex-col">
                        <div className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 mb-0 px-4 py-6">
                            <p className="font-semibold">Azure App Registration Information</p>
                        </div>
                        <div className="px-4 pt-4">
                            <Input
                                id="azure.graph.client_id"
                                name="azure.graph.client_id"
                                label="Application (Client) ID"
                                type="text"
                                value={settings['azure.graph.client_id'] || ''}
                                onChange={onType}
                                onBlur={onChange}
                                state={states['azure.graph.client_id']} />
                            <Input
                                id="azure.graph.client_secret"
                                name="azure.graph.client_secret"
                                label="Client Secret"
                                type="text"
                                placeholder="(Not displayed)"
                                defaultValue=""
                                onChange={onType}
                                onBlur={onChange}
                                state={states['azure.graph.client_secret']} />
                        </div>
                    </div>
                    {
                        (settings['azure.graph.client_id'] !== "" && settings['azure.graph.client_secret'] !== "")
                            ? (
                                <>
                                    <div className="flex flex-col">
                                        <div className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 mb-0 px-4 py-6">
                                            <p className="font-semibold">Azure Authentication</p>
                                        </div>
                                        <div className="px-4 pt-4">
                                            <div className="pt-2 pb-4">
                                                <p>A User must be in a member of an Azure Mapped Group to authenticate with WebApps.</p>
                                            </div>
                                            <Switch
                                                id="azure.graph.login_enabled"
                                                name="azure.graph.login_enabled"
                                                label="Enable Azure Authentication"
                                                checked={(settings['azure.graph.login_enabled'] === 'true')}
                                                onChange={onChange}
                                                state={states['azure.graph.login_enabled']}
                                                className="w-full mb-6" />
                                            <Switch
                                                id="azure.graph.default_login"
                                                name="azure.graph.default_login"
                                                label="Use Azure Authentication by Default"
                                                checked={(settings['azure.graph.default_login'] === 'true')}
                                                onChange={onChange}
                                                state={states['azure.graph.default_login']}
                                                className="w-full mb-6" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 mb-0 px-4 py-6">
                                            <p className="font-semibold">Map Azure Groups to WebApps Groups</p>
                                        </div>
                                        <div className="px-4 pt-4">
                                            <div className="pt-2 pb-4">
                                                <p>Members of each Azure Group will be assigned to the mapped WebApps Group.
                                                    User accounts will only be automatically created for members of these Groups.</p>
                                            </div>
                                            {
                                                Object(groups).map(function (group, i) {
                                                    return (
                                                        <div className="mb-6" key={i}>
                                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={`${group.id}`}>{group.name}</label>
                                                            <GroupSearch id={group.id} name={group.id} groupData={groupData} setData={setGroupData} saveChange={setGroupMapping} accessToken={accessToken} />
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 mb-0 px-4 py-6">
                                            <p className="font-semibold">Azure Synchronisation Status</p>
                                        </div>
                                        <div className="px-4 pt-4">
                                            <Input
                                                id="azure.graph.last_sync"
                                                name="azure.graph.last_sync"
                                                label="Last Synced"
                                                type="text"
                                                value={moment(settings['azure.graph.last_sync']).calendar()}
                                                readOnly disabled
                                                action={
                                                    <Button style="ghost" color="gray" size="small" square
                                                        className="uppercase mr-1 w-full sm:w-auto sm:rounded-md"
                                                        onClick={syncAzureNow}>
                                                        {syncBtnText}
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    </div>
                                </>
                            )
                            : null
                    }
                </div>
            </div>
        </>
    )
}

export default withWebApps(Azure);
