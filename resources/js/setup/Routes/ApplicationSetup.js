import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIClient, Loader } from 'webapps-react';

import { withTheme } from '../Context';
import Card from '../Components/Card';

const ApplicationSetup = ({ color, dark, changeColor, changeDark, ...props }) => {
    const {
        title,
        subtitle
    } = props.routedata

    const navigate = useNavigate();

    const [settings, setSettings] = useState(null);
    const [errors, setErrors] = useState(null);

    const APIController = new AbortController();

    useEffect(() => {
        props.setSuccess([true, true, false, false, false]);
        if (!settings) {
            getSettings();
        }

        return () => {
            APIController.abort();
        }
    }, []);

    const getSettings = async () => {
        APIClient('/api/install/application', undefined, { signal: APIController.signal })
            .then(json => {
                setSettings(json.data);
            })
            .catch(error => {
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            });
    }

    const setURL = e => {
        setSettings({
            ...settings,
            APP_URL: e.target.value
        });
        setErrors(null);
    }

    const setColor = newColor => {
        if (color !== newColor) {
            changeColor(newColor);
            setSettings({
                ...settings,
                theme: newColor
            });
        }
    }

    const setDark = mode => {
        if (dark !== mode) {
            changeDark(mode);
            setSettings({
                ...settings,
                dark_mode: mode
            });

            if ((mode === 'user' && (localStorage['WA_DarkMode'] === 'dark' || (!('WA_DarkMode' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches))) ||
                mode === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    }

    const toggleReporting = () => {
        setSettings({
            ...settings,
            error_reporting: !settings.error_reporting
        });
    }

    const saveSettings = async () => {
        await APIClient('/api/install/application', settings, { signal: APIController.signal })
            .then(json => {
                navigate('/install/administrator');
            })
            .catch(error => {
                if (error.response.status === 422) {
                    setErrors(error.response.data.errors)
                } else {
                    if (!error.status.isAbort) {
                        // TODO: Handle errors
                        console.error(error);
                    }
                }
            });
    }

    const CardAction = () => {
        if (errors) {
            return (
                <div className="ml-auto flex flex-row px-2 py-2 rounded-md border border-red-500 text-red-500 font-medium">
                    <span className="pt-2">Fix errors to continue</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                    </svg>
                </div>
            )
        } else {
            return (
                <div onClick={saveSettings} className={`ml-auto flex flex-row px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white cursor-pointer`}>
                    <span className="pt-2">Create Administrator</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )
        }
    }

    if (!settings) {
        return <Loader />;
    }

    return (
        <Card title={title} subtitle={subtitle} action={CardAction}>
            <div className="flex flex-col divde divide-y dark:divide-gray-400 w-full px-4 pt-5 sm:px-12">
                <div className="flex flex-row py-4">
                    <div className="px-4 pt-3 sm:px-6 w-1/3">
                        <label htmlFor="APP_URL" className="font-medium">WebApps URL</label>
                    </div>
                    <div className="w-2/3">
                        <input type="text" name="APP_URL" id="APP_URL" className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.APP_URL) ? 'border-red-500 text-red-500' : ''}`} value={settings.APP_URL} onChange={setURL} />
                        {(errors?.APP_URL) ? <div className="text-red-500">{errors.APP_URL[0]}</div> : null}
                    </div>
                </div>
                <div className="flex flex-row py-4">
                    <div className="px-4 pt-3 sm:px-6 w-1/3">
                        <label htmlFor="theme" className="font-medium">Theme Colour</label>
                    </div>
                    <div className="w-2/3">
                        <div className="grid grid-cols-7 gap-4">
                            <div onClick={() => setColor('indigo')} className="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="selector h-10 bg-indigo-600 dark:bg-indigo-500 not-sr-only"></div>
                                <div className="text-center">Indigo</div>
                            </div>
                            <div onClick={() => setColor('fuchsia')} className="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="selector h-10 bg-fuchsia-600 dark:bg-fuchsia-500 not-sr-only"></div>
                                <div className="text-center">Fuchsia</div>
                            </div>
                            <div onClick={() => setColor('light-blue')} className="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="selector h-10 bg-light-blue-600 dark:bg-light-blue-500 not-sr-only"></div>
                                <div className="text-center">Blue</div>
                            </div>
                            <div onClick={() => setColor('red')} className="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="selector h-10 bg-red-600 dark:bg-red-500 not-sr-only"></div>
                                <div className="text-center">Red</div>
                            </div>
                            <div onClick={() => setColor('orange')} className="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="selector h-10 bg-orange-600 dark:bg-orange-500 not-sr-only"></div>
                                <div className="text-center">Orange</div>
                            </div>
                            <div onClick={() => setColor('lime')} className="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="selector h-10 bg-lime-600 dark:bg-lime-500 not-sr-only"></div>
                                <div className="text-center">Green</div>
                            </div>
                            <div onClick={() => setColor('gray')} className="theme border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="selector h-10 bg-gray-600 dark:bg-gray-500 not-sr-only"></div>
                                <div className="text-center">Gray</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row py-4">
                    <div className="px-4 pt-3 sm:px-6 w-1/3">
                        <label htmlFor="dark_mode" className="font-medium">Dark Mode Option</label>
                    </div>
                    <div className="w-2/3">
                        <div className="grid grid-cols-5 gap-4">
                            <div onClick={() => setDark('light')} className="dark_mode border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="selector h-10 bg-gray-200 not-sr-only"></div>
                                <div className="text-center">Light Mode Only</div>
                            </div>
                            <div onClick={() => setDark('dark')} className="dark_mode border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="selector h-10 bg-gray-900 not-sr-only"></div>
                                <div className="text-center">Dark Mode Only</div>
                            </div>
                            <div onClick={() => setDark('user')} className="dark_mode border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                <div className="flex flex-row w-full h-10">
                                    <div className="selector h-10 w-full bg-gray-200 not-sr-only"></div>
                                    <div className="selector h-10 w-full bg-gray-900 not-sr-only"></div>
                                </div>
                                <div className="text-center">User Selectable</div>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                            If you choose to allow the user to select, their system preferences will be respected.
                        </p>
                    </div>
                </div>

                <div className="flex flex-row py-4">
                    <div className="px-4 pt-3 sm:px-6 w-1/3">
                        <label htmlFor="error_reporting" className="font-medium">Enable Error Reporting</label>
                    </div>
                    <div className="w-2/3">
                        <div className="grid grid-cols-5 gap-4">
                            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                <input type="checkbox" id="error_reporting" name="error_reporting" onChange={toggleReporting} checked={settings.error_reporting} className="checked:bg-gray-500 outline-none focus:ring-0 focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                <label htmlFor="error_reporting" className="block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">
                            Enabling this option will report all application errors to WebApps via Sentry. (<a href="https://docs.getwebapps.uk/configuration/application-settings" target="_blank" className="text-gray-500 hover:text-gray-600 font-semibold">See Documentation</a>)
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default withTheme(ApplicationSetup);