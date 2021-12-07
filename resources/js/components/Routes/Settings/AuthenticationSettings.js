import React from 'react';
import classNames from 'classnames';
import { Switch, withWebApps } from 'webapps-react';

const AuthenticationSettings = ({ UI, ...props }) => {
    const {
        roles,
        settings,
        setValue,
        states,
    } = props;

    const onChange = e => {
        let key = e.target.id;
        let value = e.target.value;

        if (key === "auth.internal.registrations")
            value = (settings['auth.internal.registrations'] === "true") ? "false" : "true";
        if (key === "azure.graph.login_enabled")
            value = (settings['azure.graph.login_enabled'] === "true") ? "false" : "true";
        if (key === "azure.graph.default_login")
            value = (settings['azure.graph.default_login'] === "true") ? "false" : "true";

        setValue(key, value);
    }

    return (
        <>
            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="auth.internal.registrations">Allow Registration of WebApps Users</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none mt-1 xl:mt-0 w-full">
                    <Switch name="auth.internal.registrations"
                        checked={(settings['auth.internal.registrations'] === 'true')}
                        onChange={onChange}
                        state={states['auth.internal.registrations']} />
                </div>
            </div>
            {
                (settings['auth.internal.registrations'] === 'true')
                    ? (
                        <div className="flex flex-col xl:flex-row py-4">
                            <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="auth.internal.default_group">Default User Group on Registration</label>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none mt-1 xl:mt-0 w-full">
                                <select name="auth.internal.default_group"
                                    id="auth.internal.default_group"
                                    value={settings['auth.internal.default_group']}
                                    onChange={onChange}
                                    className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`}>
                                    {
                                        Object(roles).map(function (role, i) {
                                            return (
                                                <option value={role.name} key={i}>{role.name}</option>
                                            )
                                        })
                                    }
                                </select>
                                <span className="text-xs text-gray-400 dark:text-gray-200">
                                    Which group should newly created users be put in by default?
                                </span>
                            </div>
                        </div>
                    )
                    : null
            }
            {
                (settings['azure.graph.client_id'] !== "" && settings['azure.graph.client_secret'] !== "")
                    ? (
                        <>
                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="azure.graph.login_enabled">Enable Azure Authentication</label>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none mt-1 xl:mt-0 w-full">
                                    <Switch name="azure.graph.login_enabled"
                                        checked={(settings['azure.graph.login_enabled'] === 'true')}
                                        onChange={onChange}
                                        state={states['azure.graph.login_enabled']} />
                                </div>
                            </div>
                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="azure.graph.default_login">Use Azure Authentication by Default</label>
                                <div className="relative inline-block w-10 mr-2 align-middle select-none mt-1 xl:mt-0 w-full">
                                    <Switch name="azure.graph.default_login"
                                        checked={(settings['azure.graph.default_login'] === 'true')}
                                        onChange={onChange}
                                        state={states['azure.graph.default_login']} />
                                </div>
                            </div>
                        </>
                    )
                    : null
            }
        </>
    )
};

export default withWebApps(AuthenticationSettings);
