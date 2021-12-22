import React from 'react';
import { Input, Switch, withWebApps } from 'webapps-react';

const ApplicationSettings = ({ UI, setUI, ...props }) => {
    const {
        settings,
        setValue,
        typeValue,
        states,
    } = props;

    const colors = [
        {
            class: 'indigo',
            name: 'Indigo',
        },
        {
            class: 'fuchsia',
            name: 'Fuchsia',
        },
        {
            class: 'light-blue',
            name: 'Blue',
        },
        {
            class: 'red',
            name: 'Red',
        },
        {
            class: 'orange',
            name: 'Orange',
        },
        {
            class: 'yellow',
            name: 'Yellow',
        },
        {
            class: 'lime',
            name: 'Green',
        },
        {
            class: 'gray',
            name: 'Gray',
        }
    ];

    const setColor = color => {
        setValue('core.ui.theme', color)
        UI.theme = color;
        setUI({ ...UI });
    }

    const setDarkMode = value => {
        setValue('core.ui.dark_mode', value)
        UI.dark_mode = value;
        setUI({ ...UI });

        if (value === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        if (value === 'user') {
            /* istanbul ignore else */
            if (localStorage['WA_DarkMode'] === 'dark'
                || (!('WA_DarkMode' in localStorage)
                    && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }
        }
    }

    const onChange = e => {
        let key = e.target.id;
        let value = e.target.value;

        if (key === "core.error.reporting")
            value = (settings['core.error.reporting'] === "true") ? "false" : "true";
        if (key === "core.cms.display_link")
            value = (settings['core.cms.display_link'] === "true") ? "false" : "true";

        setValue(key, value);
    }

    const onType = e => {
        typeValue(e.target.id, e.target.value);
    }

    return (
        <>
            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="core.error.reporting">Enable Error Reporting</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none mt-1 xl:mt-0 w-full">
                    <Switch name="core.error.reporting"
                        checked={(settings['core.error.reporting'] === 'true')}
                        onChange={onChange}
                        state={states['core.error.reporting']} />
                    <p className="text-xs text-gray-400 dark:text-gray-200">
                        Enabling this option will report all application errors to WebApps via Sentry. (
                        <a href="https://docs.getwebapps.uk/configuration/application-settings" target="_blank"
                            className="text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-400 font-semibold">See Documentation</a>)
                    </p>
                </div>
            </div>
            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="core.ui.theme">Theme Colour</label>
                <div className={`grid grid-cols-1 md:col-span-3 sm:grid-cols-${colors.length / 2} xl:grid-cols-${colors.length} gap-y-2 gap-x-4 mt-1 xl:mt-0 w-full`}>
                    {
                        Object(colors).map(function (color) {
                            return (settings['core.ui.theme'] === color.class)
                                ? (
                                    <div key={color.class} onClick={() => setColor(color.class)} className={`border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer ring-4 ring-${color.class}-600 dark:ring-${color.class}-500 ring-opacity-50`}>
                                        <div className={`h-10 bg-${color.class}-600 dark:bg-${color.class}-500 not-sr-only`}></div>
                                        <div className="text-center font-semibold">{color.name}</div>
                                    </div>
                                )
                                : (
                                    <div key={color.class} onClick={() => setColor(color.class)} className="border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                        <div className={`h-10 bg-${color.class}-600 dark:bg-${color.class}-500 not-sr-only`}></div>
                                        <div className="text-center">{color.name}</div>
                                    </div>
                                )
                        })
                    }
                </div>
            </div>
            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="core.ui.dark_mode">Dark Mode Option</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 pt-2 mt-1 xl:mt-0 w-full">
                    <div onClick={() => setDarkMode('light')} className={`border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer ${(UI.dark_mode === 'light') ? `ring-4 ring-${UI.theme}-600 dark:ring-${UI.theme}-500 ring-opacity-50` : ''}`}>
                        <div className="selector h-10 bg-gray-200 not-sr-only"></div>
                        <div className="text-center">Light Mode Only</div>
                    </div>
                    <div onClick={() => setDarkMode('dark')} className={`border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer ${(UI.dark_mode === 'dark') ? `ring-4 ring-${UI.theme}-600 dark:ring-${UI.theme}-500 ring-opacity-50` : ''}`}>
                        <div className="selector h-10 bg-gray-900 not-sr-only"></div>
                        <div className="text-center">Dark Mode Only</div>
                    </div>
                    <div onClick={() => setDarkMode('user')} className={`border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer ${(UI.dark_mode === 'user') ? `ring-4 ring-${UI.theme}-600 dark:ring-${UI.theme}-500 ring-opacity-50` : ''}`}>
                        <div className="flex flex-row w-full h-10">
                            <div className="selector h-10 w-full bg-gray-200 not-sr-only"></div>
                            <div className="selector h-10 w-full bg-gray-900 not-sr-only"></div>
                        </div>
                        <div className="text-center">User Selectable</div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-200 sm:col-span-3">
                        If you choose to allow the user to select, their system preferences will be respected.
                    </span>
                </div>
            </div>
            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="core.cms.display_link">Display "Return to CMS" Link</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none mt-1 xl:mt-0 w-full">
                    <Switch name="core.cms.display_link"
                        checked={(settings['core.cms.display_link'] === 'true')}
                        onChange={onChange}
                        state={states['core.cms.display_link']} />
                </div>
            </div>
            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="core.cms.url">CMS URL</label>
                <Input name="core.cms.url"
                    id="core.cms.url"
                    type="text"
                    value={settings['core.cms.url'] || ''}
                    onChange={onType}
                    onBlur={onChange}
                    state={states['core.cms.url']}
                    className="w-full" />
            </div>
            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="core.cms.text">"Return to CMS" Link Text</label>
                <Input name="core.cms.text"
                    type="text"
                    id="core.cms.text"
                    value={settings['core.cms.text'] || ''}
                    onChange={onType}
                    onBlur={onChange}
                    state={states['core.cms.text']}
                    className="w-full" />
            </div>
        </>
    )
}

export default withWebApps(ApplicationSettings);
