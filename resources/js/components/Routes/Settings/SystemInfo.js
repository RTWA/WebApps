import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { APIClient, ComponentError, ComponentErrorTrigger, PageWrapper, useToasts, WebAppsUXContext } from 'webapps-react';
import moment from 'moment';

let APIController = new AbortController;

const SystemInfo = () => {
    const { addToast } = useToasts();
    const { theme } = useContext(WebAppsUXContext);

    const [errors, setErrors] = useState({});
    const [productInfo, setProductInfo] = useState({});
    const [updateCheck, setUpdateCheck] = useState(null);
    const [showUpdateHistory, setShowUpdateHistory] = useState(false);

    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    useEffect(async () => {
        await loadProductInfo();
        await checkForUpdate();

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
        </PageWrapper>
    );
}

export default SystemInfo;