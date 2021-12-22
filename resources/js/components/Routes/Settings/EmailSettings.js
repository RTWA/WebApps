import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, useToasts, withAuth, withWebApps } from 'webapps-react';

let testSndBtnText = 'Send test Email';

const EmailSettings = ({ user, UI, ...props }) => {
    const {
        settings,
        setValue,
        typeValue,
        states,
    } = props;

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

    const updateTestTo = e => {
        setTestTo(e.target.value);
    }

    const sendTest = async e => {
        e.preventDefault();

        testSndBtnText = 'Sending...';

        let formData = new FormData();
        formData.append('to', testTo);
        await axios.post('/api/email/test', formData)
            .then(json => {
                addToast(
                    "Test Email Sent",
                    '',
                    { appearance: 'success' }
                );
                testSndBtnText = 'Send test Email';
            })
            .catch(error => {
                addToast(
                    "Unable to send test Email",
                    '',
                    { appearance: 'error' }
                );
                testSndBtnText = 'Send test Email';
            })
    }

    return (
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
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.smtp.from_address">SMTP From E-Mail Address</label>
                <Input name="mail.smtp.from_address"
                    type="text"
                    id="mail.smtp.from_address"
                    value={settings['mail.smtp.from_address'] || ''}
                    onChange={onType}
                    onBlur={onChange}
                    state={states['mail.smtp.from_address']} />
            </div>

            <div className="flex flex-col xl:flex-row py-4">
                <label className="w-full xl:w-4/12 xl:py-2 font-medium xl:font-normal text-sm xl:text-base" htmlFor="mail.smtp.from_name">SMTP From E-Mail Name</label>
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
