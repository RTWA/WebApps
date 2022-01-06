import React, { useEffect, useState } from 'react';
import Values from 'values.js';
import { Input, Switch, useToasts, withWebApps } from 'webapps-react';

const ApplicationSettings = ({ UI, setUI, ...props }) => {
    const {
        settings,
        setValue,
        typeValue,
        states,
    } = props;

    /* Brand Shades
        -900 = shade(50);
        -800 = shade(40);??
        -700 = shade(23);??
        -600 = shade(10);??
        -500 = brand
        -400 = tint(25);
        -300 = tint(53);
        -200 = tint(72);
        -100 = tint(85);
        -50 = tint(93);
    */
    const [brand, setBrand] = useState([]);
    const [base, setBase] = useState('#000000');
    const [typeBase, setTypeBase] = useState('');

    const color = new Values(base);
    const shades = [10, 23, 40, 50];
    const tints = [93, 85, 72, 53, 25];
    const index = [9, 9, 9, 9, 9, 0, 0, 0, 0, 0];

    const { addToast } = useToasts();

    useEffect(() => {
        if (settings['core.ui.branding'] !== undefined) {
            setBase(JSON.parse(settings['core.ui.branding'])[5]);
            setTypeBase(JSON.parse(settings['core.ui.branding'])[5]);
        }
    }, [settings]);

    useEffect(() => {
        if (base !== '#000000') {
            let colors = [];
            tints.map(function (tint, i) {
                colors.push({
                    color: color.tint(tint).hexString().toUpperCase(),
                    name: (i === 0) ? '50' : `${i}00`
                });
            });
            colors.push({
                color: base,
                name: '500',
            });
            shades.map(function (shade, i) {
                colors.push({
                    color: color.shade(shade).hexString().toUpperCase(),
                    name: (i === 0) ? '600' : `${6 + i}00`,
                });
            });
            setBrand(colors);
        }
    }, [base]);

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
            class: 'lime',
            name: 'Green',
        },
        {
            class: 'gray',
            name: 'Gray',
        },
        {
            class: 'brand',
            name: 'Custom',
        },
    ];

    const onTypeBase = e => {
        if (e.currentTarget.value.charAt(0) !== '#') {
            setTypeBase('#' + e.currentTarget.value.toUpperCase());
        } else {
            setTypeBase(e.currentTarget.value.toUpperCase());
        }

        if (e.currentTarget.value.length === 7) {
            setBase(e.currentTarget.value);
        }
    }

    const onChangeBase = e => {
        let brands = [];
        brand.map(function (brand) {
            brands.push(brand.color);
        });
        setValue('core.ui.branding', JSON.stringify(brands));
        addToast('Branding Updated!', 'You should refresh the page to see the new colours.', { appearance: 'success', autoDismissTimeout: 8000 });
    }

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
            {
                (settings['core.ui.theme'] === 'brand')
                    ? (
                        <>
                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="base">Custom Colour</label>
                                <div className="w-full">
                                    <Input name="base"
                                        id="base"
                                        type="text"
                                        value={typeBase}
                                        onChange={onTypeBase}
                                        onBlur={onChangeBase}
                                        state={states['core.ui.branding']} />
                                    <div className={`grid grid-cols-1 md:col-span-3 sm:grid-cols-${brand.length / 2} xl:grid-cols-${brand.length} w-full`}>
                                        {
                                            Object(brand).map(function (color, i) {
                                                return (
                                                    <div key={color.color} className={`w-full bg-white dark:bg-gray-800 overflow-hidden`}>
                                                        <div className={`h-10 flex items-center text-center justify-center font-bold text-lg proportional-nums not-sr-only`} style={{ backgroundColor: color.color, color: brand[index[i]].color }}>{color.color}</div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                    : null
            }
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
