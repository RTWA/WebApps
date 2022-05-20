import React, { useCallback, useEffect, useRef, useState } from 'react';
import { APIClient, Button, Input, Select, Switch, PageWrapper, useToasts, withAuth, withWebApps, Loader } from 'webapps-react';

const EmailSettings = ({ user, UI, ...props }) => {
    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    const APIController = new AbortController();
    let timers = [null, null];

    const {
        settings,
        setValue,
        typeValue,
        states,
    } = props;

    const [driverStates, setDriverStates] = useState({ smtp: '', msgraph: '' });
    const [testMailState, setTestMailsate] = useState({ state: '' });
    const [testTo, setTestTo] = useState(/* istanbul ignore next */(user) ? user.email : '');

    const { addToast } = useToasts();

    useEffect(() => {
        return /* istanbul ignore next */ () => {
            APIController.abort();
            if (timers[0]) {
                clearTimeout(timers[0]);
            }
            if (timers[1]) {
                clearTimeout(timers[1]);
            }
            void (isMountedRef.current = false);
        }
    }, []);

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
            if (isMounted()) {
                setValue('mail.driver', 'smtp');
                driverStates['smtp'] = 'saved';
                setDriverStates({ ...driverStates });
            }

            timers[0] = setTimeout(function () {
                // Don't do anything if testing
                if (process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test') {
                    driverStates['smtp'] = '';
                    setDriverStates({ ...driverStates });
                    timers[0] = null;
                }
            }, 2500);
        } else if (e.target.id === 'mail.driver.msgraph') {
            if (isMounted()) {
                setValue('mail.driver', 'msgraph');
                driverStates['msgraph'] = 'saved';
                setDriverStates({ ...driverStates });
            }

            timers[0] = setTimeout(function () {
                // Don't do anything if testing
                if (process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test') {
                    driverStates['msgraph'] = '';
                    setDriverStates({ ...driverStates });
                    timers[0] = null;
                }
            }, 2500);
        }
    }

    const updateTestTo = e => {
        setTestTo(e.target.value);
    }

    const sendTest = async e => {
        e.preventDefault();

        // Don't do anything if testing
        /* istanbul ignore next */
        if (process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test') {
            testMailState.state = 'saving';
            setTestMailsate({ ...testMailState });
        }

        await APIClient('/api/email/test', { to: testTo }, { signal: APIController.signal })
            .then(json => {
                if (isMounted) {
                    addToast(
                        "Test Email Sent",
                        '',
                        { appearance: 'success' }
                    );

                    // Don't do anything if testing
                    /* istanbul ignore next */
                    if (process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test') {
                        testMailState.state = 'saved';
                        setTestMailsate({ ...testMailState });

                        timers[1] = setTimeout(/* istanbul ignore next */ function () {
                            if (isMounted) {
                                testMailState.state = '';
                                setTestMailsate({ ...testMailState });
                                timers[1] = null;
                            }
                        }, 2500);
                    }
                }
            })
            .catch(error => {
                if (isMounted) {
                    addToast(
                        "Unable to send test Email",
                        '',
                        { appearance: 'error' }
                    );

                    // Don't do anything if testing
                    /* istanbul ignore next */
                    if (process.env.JEST_WORKER_ID === undefined && process.env.NODE_ENV !== 'test') {
                        testMailState.state = 'error';
                        testMailState.error = error.data?.exception
                        setTestMailsate({ ...testMailState });

                        timers[1] = setTimeout(function () {
                            if (isMounted) {
                                testMailState.state = '';
                                testMailState.error = '';
                                setTestMailsate({ ...testMailState });
                                timers[1] = null;
                            }
                        }, 5000);
                    }
                }
            })
    }

    if (settings['mail.driver'] === undefined) {
        return <Loader />
    }

    return (
        <PageWrapper title="Email Settings">
            <div className="my-6">
                <label htmlFor="mail.driver" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Email send method</label>
                <div className="w-full flex flex-col sm:flex-row gap-x-4 gap-y-1 mt-2 xl:mt-0">
                    <Switch
                        id="mail.driver.smtp"
                        name="mail.driver.smtp"
                        checked={(settings['mail.driver'] === 'smtp')}
                        onChange={changeDriver}
                        state={driverStates['smtp']}
                        label="Send with SMTP" />
                    {
                        (settings['azure.graph.tenant'] !== null && settings['azure.graph.tenant'] !== '' && settings['azure.graph.tenant'] !== undefined)
                            ? (
                                <Switch
                                    id="mail.driver.msgraph"
                                    name="mail.driver.msgraph"
                                    checked={(settings['mail.driver'] === 'msgraph')}
                                    onChange={changeDriver}
                                    state={driverStates['msgraph']}
                                    label="Send with Microsoft Azure" />
                            ) : null
                    }
                </div>
            </div>
            {
                (settings['mail.driver'] === 'smtp')
                    ? (
                        <>
                            <Input
                                id="mail.smtp.host"
                                name="mail.smtp.host"
                                label="SMTP Server Host"
                                type="text"
                                value={settings['mail.smtp.host'] || ''}
                                onChange={onType}
                                onBlur={onChange}
                                state={states['mail.smtp.host']} />
                            <Input
                                id="mail.smtp.port"
                                name="mail.smtp.port"
                                label="SMTP Server Port"
                                type="text"
                                value={settings['mail.smtp.port'] || ''}
                                onChange={onType}
                                onBlur={onChange}
                                state={states['mail.smtp.port']} />
                            <Select
                                id="mail.smtp.encryption"
                                name="mail.smtp.encryption"
                                label="SMTP Server Encryption"
                                value={settings['mail.smtp.encryption']}
                                onChange={onChange}>
                                <option value="">None</option>
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                            </Select>
                            <Input
                                id="mail.smtp.from_address"
                                name="mail.smtp.from_address"
                                label="SMTP From Email Address"
                                type="text"
                                value={settings['mail.smtp.from_address'] || ''}
                                onChange={onType}
                                onBlur={onChange}
                                state={states['mail.smtp.from_address']} />
                            <Input
                                id="mail.smtp.from_name"
                                name="mail.smtp.from_name"
                                label="SMTP From Email Name"
                                type="text"
                                value={settings['mail.smtp.from_name'] || ''}
                                onChange={onType}
                                onBlur={onChange}
                                state={states['mail.smtp.from_name']} />
                            <Input
                                id="mail.smtp.username"
                                name="mail.smtp.username"
                                label="SMTP Username"
                                type="text"
                                value={settings['mail.smtp.username'] || ''}
                                onChange={onType}
                                onBlur={onChange}
                                state={states['mail.smtp.username']} />
                            <Input
                                id="mail.smtp.password"
                                name="mail.smtp.password"
                                label="SMTP Password"
                                type="password"
                                value={settings['mail.smtp.password'] || ''}
                                onChange={onType}
                                onBlur={onChange}
                                states={states['mail.smtp.password']} />
                        </>
                    ) : null
            }
            {
                (settings['mail.driver'] === 'msgraph')
                    ? (

                        <Input
                            id="mail.msgraph.from_address"
                            name="mail.msgraph.from_address"
                            label="From Email Address"
                            type="text"
                            value={settings['mail.msgraph.from_address'] || ''}
                            onChange={onType}
                            onBlur={onChange}
                            state={states['mail.msgraph.from_address']}
                            helpText="Please enter a valid organisational email address" />
                    ) : null
            }
            <div className="h-px bg-gray-300 dark:bg-gray-700 my-4" />
            <Input
                id="testTo"
                name="testTo"
                type="text"
                label="Send test to"
                value={testTo || ''}
                onChange={updateTestTo}
                state={testMailState.state}
                error={testMailState.error}
                action={
                    <Button type="ghost" color="gray" size="small" square
                        className="uppercase mr-1 w-full sm:w-auto sm:rounded-md"
                        onClick={sendTest}>
                        Send test Email
                    </Button>
                }
            />
        </PageWrapper>
    )
}

export default withAuth(withWebApps(EmailSettings));
