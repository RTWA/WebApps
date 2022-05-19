import React, { useContext, useEffect, useState } from 'react';
import Values from 'values.js';
import { ColorGridSelect, Input, Loader, NavigationError, PageWrapper, Switch, useToasts, WebAppsUXContext } from 'webapps-react';

const ApplicationSettings = props => {
    const {
        settings,
        setValue,
        typeValue,
        states,
    } = props;

    const { useNavigation, setDarkMode, setTheme } = useContext(WebAppsUXContext);
    const { navigation, setNavigation } = useNavigation;

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
    const [colors, setColors] = useState([]);
    const [darkOptions, setDarkOptions] = useState([]);
    const [sidebarColorOptions, setSidebarColorOptions] = useState([]);

    const color = new Values(base);
    const shades = [10, 23, 40, 50];
    const tints = [93, 85, 72, 53, 25];
    const index = [9, 9, 9, 9, 9, 0, 0, 0, 0, 0];

    const { addToast } = useToasts();

    useEffect(() => {
        /* istanbul ignore else */
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

    useEffect(() => {
        setColors([
            {
                value: 'indigo',
                bgClasses: 'bg-indigo-600 dark:bg-indigo-500',
                name: 'Indigo',
                selected: (settings['core.ui.theme'] === 'indigo'),
            },
            {
                value: 'fuchsia',
                bgClasses: 'bg-fuchsia-600 dark:bg-fuchsia-500',
                name: 'Fuchsia',
                selected: (settings['core.ui.theme'] === 'fuchsia'),
            },
            {
                value: 'light-blue',
                bgClasses: 'bg-light-blue-600 dark:bg-light-blue-500',
                name: 'Blue',
                selected: (settings['core.ui.theme'] === 'light-blue'),
            },
            {
                value: 'red',
                bgClasses: 'bg-red-600 dark:bg-red-500',
                name: 'Red',
                selected: (settings['core.ui.theme'] === 'red'),
            },
            {
                value: 'orange',
                bgClasses: 'bg-orange-600 dark:bg-orange-500',
                name: 'Orange',
                selected: (settings['core.ui.theme'] === 'orange'),
            },
            {
                value: 'lime',
                bgClasses: 'bg-lime-600 dark:bg-lime-500',
                name: 'Green',
                selected: (settings['core.ui.theme'] === 'lime'),
            },
            {
                value: 'gray',
                bgClasses: 'bg-gray-600 dark:bg-gray-500',
                name: 'Gray',
                selected: (settings['core.ui.theme'] === 'gray'),
            },
            {
                value: 'brand',
                bgClasses: 'bg-brand-600 dark:bg-brand-500',
                name: 'Custom',
                selected: (settings['core.ui.theme'] === 'brand'),
            },
        ]);
    }, [settings['core.ui.theme']]);

    useEffect(() => {
        setDarkOptions([
            {
                value: 'light',
                bgClasses: 'bg-gray-200',
                name: 'Light Mode Only',
                selected: (settings['core.ui.dark_mode'] === 'light'),
            },
            {
                value: 'dark',
                bgClasses: 'bg-gray-900',
                name: 'Dark Mode Only',
                selected: (settings['core.ui.dark_mode'] === 'dark'),
            },
            {
                value: 'user',
                bgClasses: 'bg-gradient-to-r from-gray-200 to-gray-900',
                name: 'User Selectable',
                selected: (settings['core.ui.dark_mode'] === 'user'),
            }
        ]);
    }, [settings['core.ui.dark_mode']]);

    useEffect(() => {
        setSidebarColorOptions([
            {
                value: 'light',
                bgClasses: 'bg-gray-200',
                name: 'Light Sidebar',
                selected: (settings['core.sidebar.color_mode'] === 'light'),
            },
            {
                value: 'dark',
                bgClasses: 'bg-gray-900',
                name: 'Dark Sidebar',
                selected: (settings['core.sidebar.color_mode'] === 'dark'),
            },
            {
                value: 'user',
                bgClasses: 'bg-gradient-to-r from-gray-200 to-gray-900',
                name: 'User Selectable',
                selected: (settings['core.sidebar.color_mode'] === 'user' || !settings['core.sidebar.color_mode']),
            }
        ]);
    }, [settings['core.sidebar.color_mode']]);

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

    const changeColor = color => {
        setValue('core.ui.theme', color)
        setTheme(color);
    }

    const changeDarkMode = value => {
        setValue('core.ui.dark_mode', value)
        setDarkMode(value)

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

    const changeSidebarColorMode = value => {
        setValue('core.sidebar.color_mode', value)
        navigation.color_mode = value;
        setNavigation({ ...navigation });
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

    if (settings['core.ui.theme'] === undefined) {
        return <Loader />
    }

    return (
        <PageWrapper title="Application Settings">
            <Switch
                label="Enable Error Reporting"
                id="core.error.reporting"
                name="core.error.reporting"
                checked={(settings['core.error.reporting'] === 'true')}
                onChange={onChange}
                state={states['core.error.reporting']}
                className="mb-6"
                helpText={<>Enabling this option will report all application errors to WebApps via Sentry. (
                    <a href="https://docs.getwebapps.uk/configuration/application-settings" target="_blank"
                        className="text-gray-500 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-400 font-semibold">See Documentation</a>)</>}
            />

            <ColorGridSelect id="core.ui.theme" label="Theme Colour" colors={colors} onSelect={changeColor} />
            {
                (settings['core.ui.theme'] === 'brand')
                    ? (
                        <div className="relative mb-6">
                            <Input
                                id="base"
                                name="base"
                                label="Custom Colour"
                                type="text"
                                value={typeBase}
                                onChange={onTypeBase}
                                onBlur={onChangeBase}
                                state={states['core.ui.branding']}
                                wrapperClassName="" />
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
                    )
                    : null
            }
            <ColorGridSelect
                id="core.ui.dark_mode"
                label="Dark Mode Option"
                colors={darkOptions}
                onSelect={changeDarkMode}
                helpText="If you choose to allow the user to select, their system preferences will be respected."
            />
            <ColorGridSelect
                            id="core.sidebar.color_mode"
                            label="Sidebar Color Mode Option"
                            colors={sidebarColorOptions}
                            onSelect={changeSidebarColorMode}
                            helpText="Light Sidebar will not be in use when Dark Mode is enabled."
                        />
            <Switch
                label='Display "Return to CMS" Link'
                id="core.cms.display_link"
                name="core.cms.display_link"
                checked={(settings['core.cms.display_link'] === 'true')}
                onChange={onChange}
                state={states['core.cms.display_link']}
                className="w-full py-6" />
            <Input
                id="core.cms.url"
                name="core.cms.url"
                label="CMS URL"
                type="text"
                value={settings['core.cms.url'] || ''}
                onChange={onType}
                onBlur={onChange}
                state={states['core.cms.url']} />
            <Input
                id="core.cms.text"
                name="core.cms.text"
                label='"Return to CMS" Link Text'
                type="text"
                value={settings['core.cms.text'] || ''}
                onChange={onType}
                onBlur={onChange}
                state={states['core.cms.text']} />
        </PageWrapper>
    )
}

export default ApplicationSettings;
