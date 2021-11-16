import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, Switch, withWebApps } from 'webapps-react';
import moment from 'moment';

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
    const [groupMappings, setGroupMappings] = useState({});
    const [azGroups, setAzGroups] = useState([]);
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
            getAzGroups();
        }
    }, [accessToken]);

    const getTenantId = async () => {
        if (settings['azure.graph.tenant'] !== '' && settings['azure.graph.tenant'] !== undefined) {
            graphApp.tenantId = settings['azure.graph.tenant'];
            setGraphApp({ ...graphApp });
        } else {
            let formData = new FormData();
            formData.append("key", "azure.graph.tenant");
            await axios.post('/api/setting', formData)
                .then(json => {
                    /* istanbul ignore else */
                    if (_mounted) {
                        graphApp.tenantId = json.data['azure.graph.tenant'];
                        setGraphApp({ ...graphApp });
                    }
                });
        }
    };

    const RequestAccessToken = () => {
        axios.get('/api/graph/token')
            .then(json => {
                setAccessToken(json.data.token.access_token);
            });
    }

    const getGroupMaps = () => {
        axios.get('/api/group/mappings')
            .then(json => {
                setGroupMappings(json.data.mappings);
            })
            .catch(/* istanbul ignore next */ error => {
                // TODO: Handle Errors
                console.log(error);
            })
    }

    const setGroupMapping = e => {
        let group = e.target.id;
        let azGroup = e.target.value;

        let formData = new FormData();
        formData.append('group_id', group);
        formData.append('azure_group_id', azGroup);

        axios.post('/api/group/mapping', formData)
            .then(json => {
                /* istanbul ignore else */
                if (json.data.success) {
                    groupMappings[group] = azGroup;
                    setGroupMappings({ ...groupMappings });
                }
            })
            .catch(/* istanbul ignore next */ error => {
                // TODO: Handle Errors
                console.log(error);
            });
    }

    const getAzGroups = () => {
        let headers = new Headers();
        let bearer = `Bearer ${accessToken}`;
        headers.append('Authorization', bearer);
        let options = {
            method: "GET",
            headers: headers,
        };
        let graphEndpoint = 'https://graph.microsoft.com/v1.0/groups?$select=id,displayName';

        fetch(graphEndpoint, options)
            .then(response => response.json())
            .then(data => setAzGroups(data.value));
    }

    const syncAzureNow = () => {
        setSyncBtnText('Syncing');
        axios.get('/api/azure/sync');
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
                <Button to="/settings" style="link" className="flex flex-auto -mt-8 text-sm uppercase">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to settings
                </Button>
                <div className="w-full px-4 py-6" id="azure">
                    <div className="flex flex-row">
                        <h6 className="text-gray-600 dark:text-gray-400 ml-6 inline-block cursor-pointer text-2xl font-bold">Microsoft Azure Integration</h6>
                    </div>
                    <div className="flex flex-col min-w-0 break-words w-full my-6 shadow-lg rounded-lg bg-blue-gray-100 dark:bg-blue-gray-600 border-0 overflow-hidden">
                        <div className="bg-white dark:bg-gray-700 text-blue-gray-700 dark:text-blue-gray-100 mb-0 px-6 py-6">
                            <div className="px-4 lg:px-10 py-2 -mt-2">
                                <p>Please follow the guidance found in the WebApps Documentation to create your App Registration in Azure, then provide the
                                    required information below.
                                </p>
                                <div className="grid grid-cols-6 gap-6 py-4 mt-4">
                                    <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                                        <label className="font-medium text-sm md:text-base" htmlFor="client_id">Application (Client) ID</label>
                                        <Input name="client_id"
                                            id="client_id"
                                            type="text"
                                            value={client.id}
                                            onChange={setClientID} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-6 gap-6 py-4">
                                    <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                                        <label className="font-medium text-sm md:text-base" htmlFor="client_secret">Client Secret</label>
                                        <Input name="client_secret"
                                            id="client_secret"
                                            type="text"
                                            defaultValue={client.secret}
                                            onChange={setClientSecret} />
                                    </div>
                                </div>
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
            <Button to="/settings" style="link" className="flex flex-auto -mt-8 text-sm uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to settings
            </Button>
            <div className="w-full px-4 py-6" id="azure">
                <div className="flex flex-row">
                    <h6 className="text-gray-600 dark:text-gray-400 ml-6 inline-block cursor-pointer text-2xl font-bold">Microsoft Azure Integration</h6>
                </div>
                <div className="flex flex-col min-w-0 break-words w-full my-6 shadow-lg rounded-lg bg-blue-gray-100 dark:bg-blue-gray-600 border-0 overflow-hidden">
                    <div className="flex flex-col">
                        <div className="w-full bg-white dark:bg-gray-700 text-blue-gray-700 dark:text-blue-gray-100 mb-0 px-6 py-6">
                            <p className="font-semibold">Azure App Registration Information</p>
                        </div>
                        <div className="grid grid-cols-6 gap-6 py-4 px-4 lg:px-10">
                            <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                                <label className="font-medium text-sm md:text-base" htmlFor="azure.graph.client_id">Application (Client) ID</label>
                                <Input name="azure.graph.client_id"
                                    id="azure.graph.client_id"
                                    type="text"
                                    value={settings['azure.graph.client_id'] || ''}
                                    onChange={onType}
                                    onBlur={onChange}
                                    state={states['azure.graph.client_id']} />
                            </div>
                        </div>
                        <div className="grid grid-cols-6 gap-6 py-4 px-4 lg:px-10">
                            <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                                <label className="font-medium text-sm md:text-base" htmlFor="azure.graph.client_secret">Client Secret</label>
                                <Input name="azure.graph.client_secret"
                                    id="azure.graph.client_secret"
                                    type="text"
                                    placeholder="(Not displayed)"
                                    defaultValue=""
                                    onChange={onType}
                                    onBlur={onChange}
                                    state={states['azure.graph.client_secret']} />
                            </div>
                        </div>
                    </div>
                    {
                        (settings['azure.graph.client_id'] !== "" && settings['azure.graph.client_secret'] !== "")
                            ? (
                                <>
                                    <div className="flex flex-col">
                                        <div className="w-full bg-white dark:bg-gray-700 text-blue-gray-700 dark:text-blue-gray-100 mb-0 px-6 py-6">
                                            <p className="font-semibold">Azure Authentication</p>
                                        </div>
                                        <div className="px-4 lg:px-10 py-2 pt-5">
                                            <p>A User must be in a member of an Azure Mapped Group to authenticate with WebApps.</p>
                                        </div>
                                        <div className="grid grid-cols-6 gap-6 py-4 px-4 lg:px-10">
                                            <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                                                <label className="font-medium text-sm md:text-base" htmlFor="azure.graph.login_enabled">Enable Azure Authentication</label>
                                                <div className="md:col-span-3">
                                                    <Switch name="azure.graph.login_enabled"
                                                        checked={(settings['azure.graph.login_enabled'] === 'true')}
                                                        onChange={onChange}
                                                        state={states['azure.graph.login_enabled']} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-6 gap-6 py-4 px-4 lg:px-10">
                                            <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                                                <label className="font-medium text-sm md:text-base" htmlFor="azure.graph.default_login">Use Azure Authentication by Default</label>
                                                <div className="md:col-span-3">
                                                    <Switch name="azure.graph.default_login"
                                                        checked={(settings['azure.graph.default_login'] === 'true')}
                                                        onChange={onChange}
                                                        state={states['azure.graph.default_login']} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <div className="w-full bg-white dark:bg-gray-700 text-blue-gray-700 dark:text-blue-gray-100 mb-0 px-6 py-6">
                                            <p className="font-semibold">Map Azure Groups to WebApps Groups</p>
                                        </div>
                                        <div className="px-4 lg:px-10 py-2 pt-5">
                                            <p>Members of each Azure Group will be assigned to the mapped WebApps Group.
                                                User accounts will only be automatically created for members of these Groups.</p>
                                        </div>
                                        {
                                            Object(groups).map(function (group, i) {
                                                return (
                                                    <div className="grid grid-cols-6 gap-6 py-4 px-4 lg:px-10" key={i}>
                                                        <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                                                            <label className="font-medium text-sm md:text-base" htmlFor={`${group.id}`}>{group.name}</label>
                                                            <select name={group.id}
                                                                id={group.id}
                                                                value={groupMappings[group.id]}
                                                                onChange={setGroupMapping}
                                                                className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`}
                                                            >
                                                                <option value="">Not Mapped</option>
                                                                {
                                                                    Object(azGroups).map(function (azGroup, i) {
                                                                        let used = [];
                                                                        Object.keys(groupMappings).map(function (gid) {
                                                                            /* istanbul ignore else */
                                                                            if (gid != group.id) {
                                                                                used.push(groupMappings[gid]);
                                                                            }
                                                                        });

                                                                        /* istanbul ignore else */
                                                                        if (!used.includes(azGroup.id)) {
                                                                            return <option key={i} value={azGroup.id}>{azGroup.displayName}</option>
                                                                        } else {
                                                                            return <option key={i} value={azGroup.id} disabled>{azGroup.displayName}</option>
                                                                        }
                                                                    })
                                                                }
                                                            </select>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>

                                    <div className="flex flex-col">
                                        <div className="w-full bg-white dark:bg-gray-700 text-blue-gray-700 dark:text-blue-gray-100 mb-0 px-6 py-6">
                                            <p className="font-semibold">Azure Synchronisation Status</p>
                                        </div>
                                        <div className="grid grid-cols-6 gap-6 py-4 px-4 lg:px-10">
                                            <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                                                <label className="font-medium text-sm md:text-base" htmlFor="azure.graph.last_sync">Last Synced</label>
                                                <div className="relative">
                                                    <Input name="azure.graph.last_sync"
                                                        id="azure.graph.last_sync"
                                                        type="text"
                                                        value={moment(settings['azure.graph.last_sync']).calendar()}
                                                        readOnly disabled />

                                                    <div className="absolute inset-y-0 right-0 flex items-center">
                                                        <Button style="ghost" size="small"
                                                            className="uppercase mr-1"
                                                            onClick={syncAzureNow}>
                                                            {syncBtnText}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
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
