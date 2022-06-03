import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { APIClient, Button, ComponentError, ComponentErrorTrigger, Loader, PageWrapper, Scrollbar, useToasts, WebAppsUXContext } from 'webapps-react';
import moment from 'moment';
import classNames from 'classnames';

let APIController = new AbortController;

moment.locale(window.navigator.userLanguage || window.navigator.language);

const SystemInfo = () => {
    const { addToast } = useToasts();
    const { theme } = useContext(WebAppsUXContext);

    const [errors, setErrors] = useState({});
    const [productInfo, setProductInfo] = useState({});
    const [updateCheck, setUpdateCheck] = useState(null);
    const [showUpdateHistory, setShowUpdateHistory] = useState(false);
    const [systemTasks, setSystemTasks] = useState(null);
    const [errorLog, setErrorLog] = useState(null);
    const [errorInfo, setErrorInfo] = useState();
    const [tab, setTab] = useState(0);

    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    useEffect(async () => {
        await loadProductInfo();
        await checkForUpdate();
        await getSystemTasks();
        await getErrorLog();

        return () => {
            void (isMountedRef.current = false);
            APIController.abort();
        }
    }, []);

    const loadProductInfo = async () => {
        await APIClient('/api/product', undefined, { signal: APIController.signal })
            .then(json => {
                if (isMounted()) {
                    setProductInfo(json.data);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    errors.productInfo = error.data.message;
                    setErrors({ ...errors });
                }
            });
    }

    const checkForUpdate = async () => {
        setUpdateCheck(<p>Checking for updates...</p>);
        await APIClient('/api/update-check', undefined, { signal: APIController.signal })
            .then(json => {
                if (isMounted() && json.data.available) {
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
                } else if (isMounted()) {
                    setUpdateCheck(<a href="#" onClick={checkForUpdate} className="hover:text-gray-900 dark:hover:text-white">Check for updates</a>);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    addToast(
                        "Unable to check for updates to WebApps",
                        error.data.message,
                        {
                            appearance: 'error',
                        }
                    );
                    setUpdateCheck(<a href="#" onClick={checkForUpdate} className="hover:text-gray-900 dark:hover:text-white">Check for updates</a>);
                }
            });
    }

    const getSystemTasks = async () => {
        await APIClient('/api/system-tasks', undefined, { signal: APIController.signal })
            .then(json => {
                if (isMounted()) {
                    setSystemTasks(json.data.tasks);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    errors.tasks = error.data.message;
                    setErrors({ ...errors });
                }
            })
    }

    const getErrorLog = async () => {
        await APIClient('/api/error-log', undefined, { signal: APIController.signal })
            .then(json => {
                if (isMounted()) {
                    setErrorLog(json.data.logs);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    errors.ironic = error.data.message;
                    setErrors({ ...errors });
                }
            });
    }

    const runTask = async command => {
        await APIClient('/api/run-task', { command: command }, { signal: APIController.signal })
            .then(json => {
                if (isMounted()) {
                    setSystemTasks(json.data.tasks);
                    addToast('Task ran successfully!', '', { appearance: 'success' });
                }
            })
            .catch(async error => {
                if (!error.status?.isAbort) {
                    addToast('Failed to run task', error.data.message, { appearance: 'error' });
                    await getErrorLog();
                }
            })
    }

    const clearCache = async () => {
        await APIClient('/api/clear-cache', undefined, { signal: APIController.signal })
            .then(json => {
                if (isMounted()) {
                    addToast('Cache Cleared!', 'The system cache has been cleared successfully.', { appearance: 'success' })
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    addToast(
                        "Failed to clear system cache",
                        error.data.message,
                        {
                            appearance: 'error',
                        }
                    );
                }
            });
    }

    const toggleUpdateHistory = () => {
        setShowUpdateHistory(!showUpdateHistory);
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
        (tab === id) ? `border-${theme}-500` : ''
    )

    const paneClass = id => classNames(
        'p-5',
        'w-full',
        'overflow-x-hidden',
        (tab === id) ? 'block' : 'hidden'
    )

    return (
        <PageWrapper>
            <div className="flex flex-col md:flex-row md:gap-24 items-center justify-center">
                <div className="md:w-6/12 text-gray-400 text-right">
                    <div className="flex flex-row items-center justify-end">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 text-${theme}-600 dark:text-${theme}-500 mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                        <h1 className="text-gray-900 dark:text-white text-4xl font-bold">WebApps</h1>
                    </div>
                    {
                        (productInfo.app_version)
                            ? <p className="mb-4 text-sm">Version {productInfo.app_version}</p>
                            : null
                    }
                </div>
                <div className="md:w-6/12 text-gray-400 text-left text-xs">
                    {updateCheck}
                    <div className="mt-2 cursor-pointer" onClick={toggleUpdateHistory}>{(showUpdateHistory) ? 'Hide' : 'Show'} Update History</div>
                    <div className="cursor-pointer" onClick={clearCache}>Clear System Cache</div>
                </div>
            </div>

            <div className={`${(showUpdateHistory) ? 'max-h-[1000rem] mt-4' : 'max-h-0'} transition-all text-gray-400 overflow-hidden flex justify-center`}>
                <ComponentError
                    title="Unable to load update history!"
                    retry={() => {
                        delete errors.productInfo
                        setErrors({ ...errors });
                        loadProductInfo();
                    }}
                >
                    {
                        (errors.productInfo)
                            ? <ComponentErrorTrigger error={errors.productInfo} />
                            : <table className="mb-6 w-2/12 text-center">
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
                    }
                </ComponentError>
            </div>

            <nav className="flex flex-col sm:flex-row border-b border-gray-300 dark:border-gray-600">
                <button className={tabClass(0)} onClick={() => setTab(0)}>
                    System Tasks
                </button>
                <button className={tabClass(1)} onClick={() => setTab(1)}>
                    Error Log
                </button>
            </nav>
            <div className={paneClass(0)}>
                <Scrollbar>
                    {
                        (systemTasks)
                            ? (
                                <>
                                    <h3 className="font-bold mb-3">Media Cleanup</h3>
                                    <div className="grid grid-cols-5">
                                        <h6 className="font-semibold">Items Deleted</h6>
                                        <h6 className="font-semibold">Last Ran</h6>
                                        <h6 className="font-semibold">Next Due</h6>
                                        <h6 className="font-semibold">Schedule</h6>
                                        <h6 className="font-semibold">&nbsp;</h6>
                                    </div>
                                    <div className="py-1 text-xs grid grid-cols-5">
                                        <p className="pl-10">{systemTasks.cleanUpMedia.lastQty}</p>
                                        <p>{moment(systemTasks.cleanUpMedia.lastRun).calendar()}</p>
                                        <p>{
                                            moment(systemTasks.cleanUpMedia.lastRun)
                                                .add(systemTasks.cleanUpMedia.schedule[0], systemTasks.cleanUpMedia.schedule[1])
                                                .calendar()
                                        }</p>
                                        <p>Every {systemTasks.cleanUpMedia.schedule[0]} {systemTasks.cleanUpMedia.schedule[1]}</p>
                                        <Button
                                            type="link"
                                            padding={false}
                                            onClick={() => runTask(systemTasks.cleanUpMedia.command)}
                                        >
                                            Run Now
                                        </Button>
                                    </div>

                                    <h3 className="font-bold mt-6 mb-3">Microsoft Azure Integration</h3>
                                    <div className="grid grid-cols-5">
                                        <h6 className="font-semibold">Task Name</h6>
                                        <h6 className="font-semibold">Last Ran</h6>
                                        <h6 className="font-semibold">Next Due</h6>
                                        <h6 className="font-semibold">Schedule</h6>
                                        <h6 className="font-semibold">&nbsp;</h6>
                                    </div>
                                    <div className="py-1 text-xs grid grid-cols-5">
                                        <p>Sync Users and Groups</p>
                                        <p>{moment(systemTasks.azure.sync.lastRun).fromNow()}</p>
                                        <p>{
                                            moment(systemTasks.azure.sync.lastRun)
                                                .add(systemTasks.azure.sync.schedule[0], systemTasks.azure.sync.schedule[1])
                                                .fromNow()
                                        }</p>
                                        <p>Every {systemTasks.azure.sync.schedule[0]} {systemTasks.azure.sync.schedule[1]}</p>
                                        <Button
                                            type="link"
                                            padding={false}
                                            onClick={() => runTask(systemTasks.azure.sync.command)}
                                        >
                                            Run Now
                                        </Button>

                                        <p>Cleanup Access Tokens</p>
                                        <p>{moment(systemTasks.azure.cleanup.lastRun).fromNow()}</p>
                                        <p>{
                                            moment(systemTasks.azure.cleanup.lastRun)
                                                .add(systemTasks.azure.cleanup.schedule[0], systemTasks.azure.cleanup.schedule[1])
                                                .fromNow()
                                        }</p>
                                        <p>Every {systemTasks.azure.cleanup.schedule[0]} {systemTasks.azure.cleanup.schedule[1]}</p>
                                        <Button
                                            type="link"
                                            padding={false}
                                            onClick={() => runTask(systemTasks.azure.cleanup.command)}
                                        >
                                            Run Now
                                        </Button>
                                    </div>
                                    {
                                        (systemTasks.appsTasks.length > 0)
                                            ? (
                                                <>
                                                    <h3 className="font-bold mt-6 mb-3">Apps Tasks</h3>
                                                    <div className="grid grid-cols-6">
                                                        <h6 className="font-semibold">App</h6>
                                                        <h6 className="font-semibold">Command</h6>
                                                        <h6 className="font-semibold">Last Ran</h6>
                                                        <h6 className="font-semibold">Next Due</h6>
                                                        <h6 className="font-semibold">Schedule</h6>
                                                        <h6 className="font-semibold">&nbsp;</h6>
                                                    </div>
                                                    <div className="py-1 text-xs">
                                                        {
                                                            systemTasks.appsTasks.map((task, i) => {
                                                                let schedule = task.schedule.split(' ');
                                                                return (
                                                                    <div className="grid grid-cols-6" key={i}>
                                                                        <p>{task.app}</p>
                                                                        <p>{task.command.replace(`${task.app}:`, '')}</p>
                                                                        <p>{moment(task.last_run).fromNow()}</p>
                                                                        <p>{
                                                                            moment(task.last_run)
                                                                                .add(schedule[0][1], schedule[1])
                                                                                .fromNow()
                                                                        }</p>
                                                                        <p>Every {schedule[0][1]} {schedule[1]}</p>
                                                                        <Button
                                                                            type="link"
                                                                            padding={false}
                                                                            onClick={() => runTask(task.command)}
                                                                        >
                                                                            Run Now
                                                                        </Button>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </>
                                            ) : null
                                    }
                                    <h3 className="font-bold mt-6 mb-3">Error Log Cleanup</h3>
                                    <div className="grid grid-cols-4">
                                        <h6 className="font-semibold">Last Ran</h6>
                                        <h6 className="font-semibold">Next Due</h6>
                                        <h6 className="font-semibold">Schedule</h6>
                                        <h6 className="font-semibold">&nbsp;</h6>
                                    </div>
                                    <div className="py-1 text-xs grid grid-cols-4">
                                        <p>{moment(systemTasks.cleanUpLog.lastRun).calendar()}</p>
                                        <p>{
                                            moment(systemTasks.cleanUpLog.lastRun)
                                                .add(systemTasks.cleanUpLog.schedule[0], systemTasks.cleanUpLog.schedule[1])
                                                .calendar()
                                        }</p>
                                        <p>Every {systemTasks.cleanUpLog.schedule[0]} {systemTasks.cleanUpLog.schedule[1]}</p>
                                        <Button
                                            type="link"
                                            padding={false}
                                            onClick={() => runTask(systemTasks.cleanUpLog.command)}
                                        >
                                            Run Now
                                        </Button>
                                    </div>
                                </>
                            ) : <Loader type="circle" height="12" width="12" />
                    }
                </Scrollbar>
            </div>
            <div className={paneClass(1)}>
                <Scrollbar>
                    {
                        (errorLog)
                            ? (
                                <>
                                    <div className="grid grid-cols-5">
                                        <h6 className="text-left font-semibold">When?</h6>
                                        <h6 className="text-left font-semibold col-span-2">What?</h6>
                                        <h6 className="text-left font-semibold col-span-2">Where?</h6>
                                    </div>
                                    {
                                        (errorLog)
                                            ? errorLog.map((error, i) => {
                                                return (
                                                    <div
                                                        className="py-1 text-xs grid grid-cols-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        key={i}
                                                        onClick={() => { (errorInfo === i) ? setErrorInfo() : setErrorInfo(i) }}
                                                    >
                                                        <p>{moment(error.created_at).calendar()}</p>
                                                        <p className="col-span-2">{error.message}</p>
                                                        <p className="col-span-2">{error.file}:{error.line}</p>
                                                        {
                                                            (errorInfo === i)
                                                                ? <div className="col-span-5"><pre>{error.trace}</pre></div>
                                                                : null
                                                        }
                                                    </div>
                                                )
                                            })
                                            : null
                                    }
                                </>
                            ) : <Loader type="circle" height="12" width="12" />
                    }
                </Scrollbar>
            </div>
        </PageWrapper>
    );
}

export default SystemInfo;