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
            <div className="grid grid-cols-6 gap-6 py-4">
                <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                    <label className="font-medium text-sm md:text-base" htmlFor="core.error.reporting">Enable Error Reporting</label>
                    <div className="md:col-span-3">
                        <Switch name="core.error.reporting"
                            checked={(settings['core.error.reporting'] === 'true')}
                            onChange={onChange}
                            state={states['core.error.reporting']} />
                        <p className="text-xs text-gray-400">
                            Enabling this option will report all application errors to WebApps via Sentry. (
                            <a href="https://docs.getwebapps.uk/configuration/application-settings" target="_blank"
                                className="text-gray-500 hover:text-gray-600 font-semibold">See Documentation</a>)
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-6 py-4">
                <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                    <label className="font-medium text-sm md:text-base">Theme Colour</label>
                    <div className={`grid grid-cols-1 md:col-span-3 sm:grid-cols-${colors.length / 2} xl:grid-cols-${colors.length} gap-4`}>
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
            </div>
            <div className="grid grid-cols-6 gap-6 py-4">
                <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                    <label className="font-medium text-sm md:text-base" htmlFor="core.ui.dark_mode">Dark Mode Option</label>
                    <div className="md:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
                        </div>
                        <span className="text-xs text-gray-400">
                            If you choose to allow the user to select, their system preferences will be respected.
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-6 py-4">
                <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                    <label className="font-medium text-sm md:text-base" htmlFor="core.cms.display_link">Display "Return to CMS" Link</label>
                    <div className="md:col-span-3">
                        <Switch name="core.cms.display_link"
                            checked={(settings['core.cms.display_link'] === 'true')}
                            onChange={onChange}
                            state={states['core.cms.display_link']} />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-6 py-4">
                <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                    <label className="font-medium text-sm md:text-base" htmlFor="core.cms.url">CMS URL</label>
                    <Input name="core.cms.url"
                        id="core.cms.url"
                        type="text"
                        value={settings['core.cms.url'] || ''}
                        onChange={onType}
                        onBlur={onChange}
                        state={states['core.cms.url']} />
                </div>
            </div>
            <div className="grid grid-cols-6 gap-6 py-4">
                <div className="col-span-6 md:grid md:grid-cols-4 md:gap-4">
                    <label className="font-medium text-sm md:text-base" htmlFor="core.cms.text">"Return to CMS" Link Text</label>
                    <Input name="core.cms.text"
                        type="text"
                        id="core.cms.text"
                        value={settings['core.cms.text'] || ''}
                        onChange={onType}
                        onBlur={onChange}
                        state={states['core.cms.text']} />
                </div>
            </div>
        </>
    )
}

export default withWebApps(ApplicationSettings);
