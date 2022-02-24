import React, { useEffect, useState } from 'react';
import { ColorGridSelect, withAuth, withWebApps } from 'webapps-react';

const Preferences = ({ user, preferences, setPreference, UI }) => {
    const [darkOptions, setDarkOptions] = useState([]);

    useEffect(() => {
        // Workaround for current bug in Auth Context
        // * Current preferences are not available on preferences, only user.preferences in JSON
        if (preferences?.dark_mode === undefined && (user.preferences && JSON.parse(user.preferences).dark_mode)) {
            preferences = JSON.parse(user.preferences);
            setPreference('dark_mode', preferences.dark_mode);
        }

        setDarkOptions([
            {
                value: 'light',
                bgClasses: 'bg-gray-200',
                name: 'Light Mode Only',
                selected: (preferences?.dark_mode === 'light'),
            },
            {
                value: 'dark',
                bgClasses: 'bg-gray-900',
                name: 'Dark Mode Only',
                selected: (preferences?.dark_mode === 'dark'),
            },
            {
                value: '',
                bgClasses: 'bg-gradient-to-r from-gray-200 to-gray-900',
                name: 'Use System Settings',
                selected: (preferences?.dark_mode === ''),
            }
        ]);
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
                        <ColorGridSelect
                            id="core.ui.dark_mode"
                            label="Dark Mode Option"
                            colors={darkOptions}
                            onSelect={setDarkMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withAuth(withWebApps(Preferences));