import React from 'react';
import { Switch, withWebApps } from 'webapps-react';
import Select from '../../TEMP/Select';

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
            <Switch
                id="auth.internal.registrations"
                name="auth.internal.registrations"
                label="Allow Registration of WebApps Users"
                checked={(settings['auth.internal.registrations'] === 'true')}
                onChange={onChange}
                className="w-full my-6"
                state={states['auth.internal.registrations']} />
            {
                (settings['auth.internal.registrations'] === 'true')
                    ? (
                        <Select
                            id="auth.internal.default_group"
                            name="auth.internal.default_group"
                            onChange={onChange}
                            label="Default User Group on Registration"
                            helpText="Which group should newly created users be put in by default?"
                        >
                            {
                                Object(roles).map(function (role, i) {
                                    return (
                                        <option value={role.name} key={i}>{role.name}</option>
                                    )
                                })
                            }
                        </Select>
                    )
                    : null
            }
            {
                (settings['azure.graph.client_id'] !== "" && settings['azure.graph.client_secret'] !== "")
                    ? (
                        <>
                            <Switch
                                id="azure.graph.login_enabled"
                                name="azure.graph.login_enabled"
                                label="Enable Azure Authentication"
                                checked={(settings['azure.graph.login_enabled'] === 'true')}
                                onChange={onChange}
                                className="w-full mb-6"
                                state={states['azure.graph.login_enabled']} />

                            <Switch
                                id="azure.graph.default_login"
                                name="azure.graph.default_login"
                                label="Use Azure Authentication by Default"
                                checked={(settings['azure.graph.default_login'] === 'true')}
                                onChange={onChange}
                                className="w-full mb-6"
                                state={states['azure.graph.default_login']} />
                        </>
                    )
                    : null
            }
        </>
    )
};

export default withWebApps(AuthenticationSettings);
