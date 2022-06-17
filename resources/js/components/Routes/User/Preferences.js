import React, { useContext, useEffect, useState } from 'react';
import { APIClient, ColorGridSelect, Loader, PageWrapper, WebAppsUXContext, withAuth } from 'webapps-react';

let APIController = new AbortController();

const Preferences = ({ user, preferences, setPreference }) => {
    const [darkOptions, setDarkOptions] = useState([]);
    const [sidebarColorOptions, setSidebarColorOptions] = useState([]);
    const [settings, setSettings] = useState(null);

    const { useNavigation } = useContext(WebAppsUXContext);
    const { navigation, setNavigation } = useNavigation;

    useEffect(() => {
        loadModes();

        return () => {
            APIController.abort();
        }
    }, []);

    useEffect(() => {
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
                selected: (preferences?.dark_mode === '' || !preferences.dark_mode),
            }
        ]);
        setSidebarColorOptions([
            {
                value: 'light',
                bgClasses: 'bg-gray-200',
                name: 'Light Sidebar',
                selected: (preferences?.['sidebar.color_mode'] === 'light' || !preferences['sidebar.color_mode']),
            },
            {
                value: 'dark',
                bgClasses: 'bg-gray-900',
                name: 'Dark Sidebar',
                selected: (preferences?.['sidebar.color_mode'] === 'dark'),
            }
        ]);
    }, [preferences]);

    const loadModes = async () => {
        await APIClient('/api/setting', { key: JSON.stringify(['core.ui.dark_mode', 'core.sidebar.color_mode']) }, { signal: APIController.signal })
            .then(json => {
                setSettings(json.data);
            });
    }

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

    const setSidebarColorMode = value => {
        navigation.color_mode = value;
        setNavigation({ ...navigation });
        setPreference('sidebar.color_mode', value);
    }

    if (!settings) {
        return <Loader />
    }

    return (
        <PageWrapper title={user.name}>
            {
                (settings['core.ui.dark_mode'] === 'user' || !settings['core.ui.dark_mode'])
                    ? (
                        <ColorGridSelect
                            id="core.ui.dark_mode"
                            label="Dark Mode Option"
                            colors={darkOptions}
                            onSelect={setDarkMode}
                        />
                    ) : null
            }
            {
                (settings['core.sidebar.color_mode'] === 'user' || !settings['core.sidebar.color_mode'])
                    ? (
                        <ColorGridSelect
                            id="core.sidebar.color_mode"
                            label="Sidebar Color Mode Option"
                            colors={sidebarColorOptions}
                            onSelect={setSidebarColorMode}
                        />
                    ) : null
            }
        </PageWrapper>
    )
}

export default withAuth(Preferences);