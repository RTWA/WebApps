import React, { useEffect } from 'react';
import { withAuth, withWebApps } from 'webapps-react';

const Preferences = ({ user, preferences, setPreference, UI }) => {

    useEffect(() => {
        // Workaround for current bug in Auth Context
        // * Current preferences are not available on preferences, only user.preferences in JSON
        if (preferences.dark_mode === undefined && (user.preferences && JSON.parse(user.preferences).dark_mode)) {
            preferences = JSON.parse(user.preferences);
            setPreference('dark_mode', preferences.dark_mode);
        }
    }, [preferences]);

    const setDarkMode = value => {
        if (value === '') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            localStorage.removeItem('WA_DarkMode');
        } else if (value === 'dark') {
            localStorage['WA_DarkMode'] = 'dark';
            document.documentElement.classList.add('dark');
        } else if (value === 'light') {
            localStorage['WA_DarkMode'] = 'light';
            document.documentElement.classList.remove('dark');
        }

        setPreference('dark_mode', value);
    }

    return (
        <div className="mt-10 sm:mt-0 py-0 sm:py-8">
            <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1 flex justify-between">
                    <div className="px-4 sm:px-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Change your WebApps preferences here
                        </p>
                    </div>
                </div>

                <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="px-4 py-5 bg-white dark:bg-gray-800 sm:p-6 shadow sm:rounded-md">
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-4 md:col-span-6 lg:col-span-4">
                                <label className="block font-medium text-sm text-gray-700 dark:text-gray-300" htmlFor="dark_mode">
                                    Dark Mode Option
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <div onClick={() => setDarkMode('light')} className={`border-2 border-white dark:border-gray-700 w-full bg-white dark:bg-gray-700 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer ${(preferences.dark_mode === 'light') ? `ring-4 ring-${UI.theme}-600 dark:ring-${UI.theme}-500 ring-opacity-50` : ''}`}>
                                        <div className="selector h-10 bg-gray-200 not-sr-only"></div>
                                        <div className="text-center">Light Mode Only</div>
                                    </div>
                                    <div onClick={() => setDarkMode('dark')} className={`border-2 border-white dark:border-gray-700 w-full bg-white dark:bg-gray-700 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer ${(preferences.dark_mode === 'dark') ? `ring-4 ring-${UI.theme}-600 dark:ring-${UI.theme}-500 ring-opacity-50` : ''}`}>
                                        <div className="selector h-10 bg-gray-900 not-sr-only"></div>
                                        <div className="text-center">Dark Mode Only</div>
                                    </div>
                                    <div onClick={() => setDarkMode('')} className={`border-2 border-white dark:border-gray-700 w-full bg-white dark:bg-gray-700 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer ${(preferences.dark_mode === '') ? `ring-4 ring-${UI.theme}-600 dark:ring-${UI.theme}-500 ring-opacity-50` : ''}`}>
                                        <div className="flex flex-row w-full h-10">
                                            <div className="selector h-10 w-full bg-gray-200 not-sr-only"></div>
                                            <div className="selector h-10 w-full bg-gray-900 not-sr-only"></div>
                                        </div>
                                        <div className="text-center">Use System Settings</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withAuth(withWebApps(Preferences));