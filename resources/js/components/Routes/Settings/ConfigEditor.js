import React, { useState } from 'react';
import classNames from 'classnames';
import { confirmAlert } from 'react-confirm-alert';
import { Button, AlertModal, Input, Loader, PageWrapper, withWebApps } from 'webapps-react';

const ConfigEditor = ({ UI, ...props }) => {
    const {
        settings,
        setValue,
        typeValue,
        createKey,
        deleteKey,
        states
    } = props;

    const [agree, setAgree] = useState(0);
    const [key, setKey] = useState('');

    const onType = e => {
        typeValue(e.target.id.replace('ce-', ''), e.target.value);
    }

    const onChange = e => {
        setValue(e.target.id, e.target.value, true);
    }

    const typeNewKey = e => {
        setKey(e.target.value);
    }

    const createNewKey = e => {
        e.preventDefault();
        createKey(key);
        /* istanbul ignore next */
        if (document.getElementById(key)) {
            document.getElementById(key).focus();
        }
        setKey('');
    }

    const sendDeleteKey = key => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <AlertModal
                        onConfirm={() => { deleteKey(key); onClose(); }}
                        onCancel={onClose}
                        message={"Are you sure you wish to delete this config key?\nThis action cannot be undone"} />
                );
            }
        });
    }

    const inputClasses = classNames(
        'block',
        'w-full',
        'border-transparent',
        'focus:border-gray-500',
        'focus:bg-white',
        'focus:ring-0'
    )

    /* istanbul ignore next */
    if (settings['core.ui.theme'] === undefined) {
        return <Loader />
    }

    return (
        <PageWrapper title="Config Editor (Advanced)">
            <div className="flex flex-col min-w-0 break-words w-full mx-auto shadow bg-white dark:bg-gray-800 rounded">
                <div className="py-3 px-2 bg-light-blue-300 text-light-blue-800 border border-light-blue-600 rounded-t dark:bg-light-blue-800 dark:text-light-blue-300 dark:border-light-blue-400">
                    <h4 className="font-bold">Advanced Users Only!</h4>
                    <p className="m-b-0">If you use the Config Editor incorrectly, you may cause serious problems which can only be fixed by re-installation of the application.<br />
                        Use the Config Editor at your own risk.</p>
                    <Button className={`mt-5 text-white dark:text-gray-900 ${(agree) ? 'hidden' : ''}`} color="gray" onClick={() => setAgree(1)} square>I understand</Button>
                </div>
                {
                    (agree)
                        ? (
                            <div className="pt-5" id="ce">
                                <div className="hidden lg:grid lg:grid-cols-7">
                                    <h6 className="font-semibold pl-4 col-span-3">Config Key</h6>
                                    <h6 className="font-semibold col-span-3">Config Value</h6>
                                    <div>&nbsp;</div>
                                </div>
                                {
                                    Object.keys(settings).map(function (key, i) {
                                        let value = settings[key];
                                        return (
                                            <div key={i} className={(i % 2) ? 'px-4 lg:grid lg:grid-cols-7 bg-gray-100 dark:bg-gray-700' : 'px-4 lg:grid lg:grid-cols-7'}>
                                                <div className="py-2 col-span-3 font-semibold lg:font-normal">{key}</div>
                                                <div className="col-span-4 grid grid-cols-4">
                                                    <Input type="text"
                                                        wrapperClassName={classNames(inputClasses, (i % 2) ? 'col-span-3 bg-gray-100 dark:bg-gray-700' : 'col-span-3 dark:bg-gray-800')}
                                                        id={`ce-${key}`}
                                                        value={value}
                                                        onChange={onType}
                                                        onBlur={onChange}
                                                        data-testid={`edit_${key}`}
                                                        inputClassName="border rounded-none"
                                                        state={states[`ce-${key}`]} />
                                                    <Button type="link" color="red" onClick={() => sendDeleteKey(key)} data-testid={`delete_${key}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                <div className="px-4 py-2 flex flex-col lg:grid lg:grid-cols-7 bg-gray-200 dark:bg-gray-600 border-t border-gray-800 dark:border-gray-200">
                                    <div className="flex-grow lg:pr-4 lg:col-span-3">
                                        <label className="sr-only" htmlFor="new_key">Create a new key</label>
                                        <input type="text"
                                            className="block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-600 dark:text-gray-100 focus:ring-0 dark:placeholder-gray-400"
                                            id="new_key"
                                            value={key}
                                            onChange={typeNewKey}
                                            placeholder="Create a new key" />
                                    </div>
                                    <div className="lg:col-span-4">
                                        <Button className="w-full lg:w-auto inline-block align-middle" square onClick={createNewKey}>
                                            Create Key
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )
                        : null
                }
            </div>
        </PageWrapper>
    )
}

export default withWebApps(ConfigEditor);
