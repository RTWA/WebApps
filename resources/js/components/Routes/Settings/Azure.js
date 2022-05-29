import React, { useEffect, useState } from 'react';
import { APIClient, AzureGroupSearch, Button, Input, Switch, PageWrapper, withWebApps, Loader, ComponentError, ComponentErrorTrigger } from 'webapps-react';
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

    const [errors, setErrors] = useState({});
    const [client, setClient] = useState({ id: '', secret: '' });

    const [graphApp, setGraphApp] = useState({});
    const [accessToken, setAccessToken] = useState(null);
    const [groupData, setGroupData] = useState([]);
    const [syncBtnText, setSyncBtnText] = useState('Sync Now');

    const APIController = new AbortController();
    let timer = null;

    useEffect(() => {
        _mounted = true;
        getTenantId();

        return () => {
            APIController.abort();
            if (timer) {
                clearTimeout(timer);
            }
            _mounted = false;
        }
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
            await APIClient('/api/setting', { key: 'azure.graph.tenant' }, { signal: APIController.signal })
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
        await APIClient('/api/graph/token', undefined, { signal: APIController.signal })
            .then(json => {
                setAccessToken(json.data.token.access_token);
            });
    }

    const getGroupMaps = async () => {
        await APIClient('/api/group/mappings', undefined, { signal: APIController.signal })
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
                    errors.groupData = error.data?.message;
                    setErrors({ ...errors });
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
        }, { signal: APIController.signal })
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
                    groupData[group].state = 'error';
                    groupData[group].error = error.data.message;
                    setGroupData([...groupData]);

                    let timer = setTimeout(/* istanbul ignore next */ function () {
                        // Don't do anything if testing
                        if (process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test') {
                            groupData[group].state = '';
                            setGroupData([...groupData]);
                            timer = null;
                        }
                    }, 2500);
                }
            });
    }

    const syncAzureNow = async () => {
        setSyncBtnText('Syncing');
        await APIClient('/api/azure/sync', undefined, { signal: APIController.signal });
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

    if (settings['azure.graph.tenant'] === undefined) {
        return <Loader />
    }

    if (graphApp.tenantId === null || graphApp.tenantId === "" || graphApp.tenantId === undefined) {
        return (
            <PageWrapper title="Microsoft Azure Integration">
                <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                    Please follow the guidance found in the
                    <Button href="https://docs.getwebapps.uk/configuration/microsoft-azure-integration/setup" target="_blank" size="small" type="link">WebApps Documentation</Button>
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
            </PageWrapper>
        )
    }

    return (
        <PageWrapper title="Microsoft Azure Integration">
            <h6 className="mb-4 text-gray-600 dark:text-gray-400 text-xl">Azure App Registration Information</h6>
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
            {
                (settings['azure.graph.client_id'] !== "" && settings['azure.graph.client_secret'] !== "")
                    ? (
                        <>
                            <h6 className="text-gray-600 dark:text-gray-400 text-xl">Azure Authentication</h6>
                            <p className="mb-6 text-gray-600 dark:text-gray-400 text-sm">
                                A User must be in a member of an Azure Mapped Group to authenticate with WebApps.
                            </p>
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
                            <h6 className="text-gray-600 dark:text-gray-400 text-xl">Map Azure Groups to WebApps Groups</h6>
                            <p className={`${(typeof groupData === 'string') ? '' : 'mb-6'} text-gray-600 dark:text-gray-400 text-sm`}>
                                Members of each Azure Group will be assigned to the mapped WebApps Group.
                                User accounts will only be automatically created for members of these Groups.
                            </p>
                            <ComponentError retry={() => {
                                errors.groupData = null;
                                setErrors({ ...errors });
                                getGroupMaps()
                            }} title="Failed to load data!">
                                {
                                    (typeof errors.groupData === 'string')
                                        ? <ComponentErrorTrigger error={errors.groupData} />
                                        : Object(groups).map(function (group, i) {
                                            return (
                                                <div className="mb-6" key={i}>
                                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={`${group.id}`}>{group.name}</label>
                                                    <AzureGroupSearch id={group.id} name={group.id} groupData={groupData} setData={setGroupData} saveChange={setGroupMapping} accessToken={accessToken} />
                                                </div>
                                            )
                                        })
                                }
                            </ComponentError>
                            <h6 className="mb-4 text-gray-600 dark:text-gray-400 text-xl">Azure Synchronisation Status</h6>
                            <Input
                                id="azure.graph.last_sync"
                                name="azure.graph.last_sync"
                                label="Last Synced"
                                type="text"
                                value={moment(settings['azure.graph.last_sync']).calendar()}
                                readOnly disabled
                                action={
                                    <Button type="ghost" color="gray" size="small" square
                                        className="uppercase mr-1 w-full sm:w-auto sm:rounded-md"
                                        onClick={syncAzureNow}>
                                        {syncBtnText}
                                    </Button>
                                }
                            />
                        </>
                    )
                    : null
            }
        </PageWrapper>
    )
}

export default withWebApps(Azure);
