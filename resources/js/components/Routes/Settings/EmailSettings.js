import React, { useState } from 'react';
import { APIClient, Button, Input, Switch, useToasts, withAuth, withWebApps } from 'webapps-react';

let testSndBtnText = 'Send test Email';

const EmailSettings = ({ user, UI, ...props }) => {
    const {
        settings,
        setValue,
        typeValue,
        states,
    } = props;

    const [driverStates, setDriverStates] = useState({ smtp: '', msgraph: '' });

    const { addToast } = useToasts();

    const [testTo, setTestTo] = useState(/* istanbul ignore next */(user) ? user.email : '');

    const onChange = e => {
        let key = e.target.id;
        let value = e.target.value;

        setValue(key, value);
    }

    const onType = e => {
        typeValue(e.target.id, e.target.value);
    }

    const changeDriver = e => {
        /* istanbul ignore else */
        if (e.target.id === 'mail.driver.smtp') {
            setValue('mail.driver', 'smtp');

            driverStates['smtp'] = 'saved';
            setDriverStates({ ...driverStates });

            setTimeout(function () {
                driverStates['smtp'] = '';
                setDriverStates({ ...driverStates });
            }, 2500);
        } else if (e.target.id === 'mail.driver.msgraph') {
            setValue('mail.driver', 'msgraph');

            driverStates['msgraph'] = 'saved';
            setDriverStates({ ...driverStates });

            setTimeout(function () {
                driverStates['msgraph'] = '';
                setDriverStates({ ...driverStates });
            }, 2500);
        }
    }

    const updateTestTo = e => {
        setTestTo(e.target.value);
    }

    const sendTest = async e => {
        e.preventDefault();

        testSndBtnText = 'Sending...';

        await APIClient('/api/email/test', { to: testTo})
            .then(json => {
                addToast(
                    "Test Email Sent",
                    '',
                    { appearance: 'success' }
                );
                testSndBtnText = 'Send test Email';
            })
            .catch(error => {
                /* istanbul ignore next */
                if (error.response.data.exception) {
                    addToast(
                        "Unable to send test Email",
                        error.response.data.exception,
                        { appearance: 'error' }
                    );
                } else {
                    addToast(
                        "Unable to send test Email",
                        '',
                        { appearance: 'error' }
                    );
                }
                testSndBtnText = 'Send test Email';
            })
    }

    return (
        <>
            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.driver">Email send method</label>
                <div className="w-full flex flex-col sm:flex-row gap-x-4 gap-y-1 mt-2 xl:mt-0">
                    <div className="w-full flex flex-row gap-x-2">
                        <div className="relative inline-block align-middle select-none xl:mt-2">
                            <Switch name="mail.driver.smtp"
                                checked={(settings['mail.driver'] === 'smtp')}
                                onChange={changeDriver}
                                state={driverStates['smtp']} />
                        </div>
                        <label className="w-full xl:w-80 py-1 xl:py-2 font-medium text-sm xl:text-base" htmlFor="mail.driver.smtp">Send with SMTP</label>
                    </div>
                    {
                        (settings['azure.graph.tenant'] !== null && settings['azure.graph.tenant'] !== '' && settings['azure.graph.tenant'] !== undefined)
                            ? (
                                <div className="w-full flex flex-row gap-x-2">
                                    <div className="relative inline-block align-middle select-none xl:mt-2">
                                        <Switch name="mail.driver.msgraph"
                                            checked={(settings['mail.driver'] === 'msgraph')}
                                            onChange={changeDriver}
                                            state={driverStates['msgraph']} />
                                    </div>
                                    <label className="w-full xl:w-80 py-1 xl:py-2 font-medium text-sm xl:text-base" htmlFor="mail.driver.msgraph">Send with Microsoft Azure</label>
                                </div>
                            ) : null
                    }
                </div>
            </div>
            {
                (settings['mail.driver'] === 'smtp')
                    ? (
                        <>
                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.smtp.host">SMTP Server Host</label>
                                <Input name="mail.smtp.host"
                                    type="text"
                                    id="mail.smtp.host"
                                    value={settings['mail.smtp.host'] || ''}
                                    onChange={onType}
                                    onBlur={onChange}
                                    state={states['mail.smtp.host']} />
                            </div>

                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.smtp.port">SMTP Server Port</label>
                                <Input name="mail.smtp.port"
                                    type="text"
                                    id="mail.smtp.port"
                                    value={settings['mail.smtp.port'] || ''}
                                    onChange={onType}
                                    onBlur={onChange}
                                    state={states['mail.smtp.port']} />
                            </div>

                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.smtp.encryption">SMTP Server Encryption</label>
                                <select name="mail.smtp.encryption"
                                    id="mail.smtp.encryption"
                                    value={settings['mail.smtp.encryption']}
                                    className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`}
                                    onChange={onChange}>
                                    <option value="">None</option>
                                    <option value="tls">TLS</option>
                                    <option value="ssl">SSL</option>
                                </select>
                            </div>

                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.smtp.from_address">SMTP From Email Address</label>
                                <Input name="mail.smtp.from_address"
                                    type="text"
                                    id="mail.smtp.from_address"
                                    value={settings['mail.smtp.from_address'] || ''}
                                    onChange={onType}
                                    onBlur={onChange}
                                    state={states['mail.smtp.from_address']} />
                            </div>

                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.smtp.from_name">SMTP From Email Name</label>
                                <Input name="mail.smtp.from_name"
                                    type="text"
                                    id="mail.smtp.from_name"
                                    value={settings['mail.smtp.from_name'] || ''}
                                    onChange={onType}
                                    onBlur={onChange}
                                    state={states['mail.smtp.from_name']} />
                            </div>

                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.smtp.username">SMTP Username</label>
                                <Input name="mail.smtp.username"
                                    type="text"
                                    id="mail.smtp.username"
                                    value={settings['mail.smtp.username'] || ''}
                                    onChange={onType}
                                    onBlur={onChange}
                                    state={states['mail.smtp.username']} />
                            </div>
                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.smtp.password">SMTP Password</label>
                                <Input name="mail.smtp.password"
                                    type="password"
                                    id="mail.smtp.password"
                                    value={settings['mail.smtp.password'] || ''}
                                    onChange={onType}
                                    onBlur={onChange}
                                    states={states['mail.smtp.password']} />
                            </div>
                        </>
                    ) : null
            }
            {
                (settings['mail.driver'] === 'msgraph')
                    ? (
                        <>
                            <div className="flex flex-col xl:flex-row py-4">
                                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.msgraph.from_address">From Email Address</label>
                                <div className="w-full flex flex-col">
                                    <Input name="mail.msgraph.from_address"
                                        type="text"
                                        id="mail.msgraph.from_address"
                                        value={settings['mail.msgraph.from_address'] || ''}
                                        onChange={onType}
                                        onBlur={onChange}
                                        state={states['mail.msgraph.from_address']} />
                                    <span className="text-xs text-gray-400 dark:text-gray-200 col-span-3">
                                        Please enter a valid organisational email address
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : null
            }

            <div className="h-px bg-gray-300 dark:bg-gray-700 my-4" />
            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="testTo">Send test to</label>
                <div className="relative w-full">
                    <Input name="testTo"
                        type="text"
                        id="testTo"
                        value={testTo || ''}
                        onChange={updateTestTo} />

                    <div className="w-full sm:w-auto sm:absolute inset-y-0 right-0 sm:flex items-center">
                        <Button style="ghost" color="gray" size="small" square
                            className="uppercase mr-1 w-full sm:w-auto sm:rounded-md"
                            onClick={sendTest}>
                            {testSndBtnText}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default withAuth(withWebApps(EmailSettings));
