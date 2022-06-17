import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { APIClient, Loader } from 'webapps-react';

import { withTheme } from '../Context';
import Card from '../Components/Card';

const AdministratorUser = ({ color, ...props }) => {
    const {
        title,
        subtitle
    } = props.routedata

    const history = useHistory();

    const [exists, setExists] = useState(false);
    const [fields, setFields] = useState(null);
    const [errors, setErrors] = useState(null);

    const APIController = new AbortController();

    useEffect(() => {
        props.setSuccess([true, true, true, false, false]);
        if (!fields) {
            checkIfAdminExists();
        }

        return () => {
            APIController.abort();
        }
    }, []);

    const checkIfAdminExists = async () => {
        await APIClient('/api/install/administrator', undefined, { signal: APIController.signal })
            .then(json => {
                if (json.data.exists) {
                    setExists(true);
                    setFields({});
                } else {
                    setFields(json.data);
                }
            })
            .catch(error => {
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            });
    }

    const changeInput = e => {
        fields[e.target.id] = e.target.value;
        setFields({
            ...fields
        });
        setErrors(null);
    }

    const completeSetup = async () => {
        await APIClient('/api/install/administrator', fields, { signal: APIController.signal })
            .then(json => {
                let path = `/install/complete`;
                history.push(path);
            })
            .catch(error => {
                if (error.response.status === 422) {
                    setErrors(error.response.data.errors)
                } else {
                    if (!error.status.isAbort) {
                        // TODO: Handle errors
                        console.error(error);
                    }
                }
            });
    }

    const CardAction = () => {
        if (exists) {
            return (
                <Link to="/install/complete"
                    className={`ml-auto flex flex-row px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white`}>
                    <span className="pt-2">Complete Installation</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            )
        } else {
            return (
                <div onClick={completeSetup} className={`ml-auto flex flex-row px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white cursor-pointer`}>
                    <span className="pt-2">Complete Installation</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )
        }
    }

    if (!fields) {
        return <Loader />
    }

    return (
        <Card title={title} subtitle={subtitle} action={CardAction}>
            {
                (exists) ?
                    (
                        <div className="flex flex-col divde divide-y w-full px-4 pt-5 sm:px-24">
                            <div className="flex flex-row py-4">
                                <div className="px-4 py-3 pb-8 sm:px-6">
                                    <p className="text-center">An account already exists in the group Administrators, you can skip this step.</p>
                                    <p className="text-center">An Administrator account would have been created if you selected Sample Data on step 2.</p>
                                </div>
                            </div>
                        </div>
                    ) :
                    (
                        <div className="flex flex-col divde divide-y dark:divide-gray-400 w-full px-4 pt-5 sm:px-12">
                            <div className="flex flex-row py-4">
                                <div className="px-4 pt-3 sm:px-6 w-1/3">
                                    <label htmlFor="username" className="font-medium">Username</label>
                                </div>
                                <div className="w-2/3">
                                    <input type="text" name="username" id="username"
                                        className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.username) ? 'border-red-500 text-red-500' : ''}`}
                                        value={fields.username} onChange={changeInput} />
                                    {(errors?.username) ? <div className="text-red-500">{errors.username[0]}</div> : null}
                                </div>
                            </div>
                            <div className="flex flex-row py-4">
                                <div className="px-4 pt-3 sm:px-6 w-1/3">
                                    <label htmlFor="password" className="font-medium">Password</label>
                                </div>
                                <div className="w-2/3">
                                    <input type="password" name="password" id="password"
                                        className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.password) ? 'border-red-500 text-red-500' : ''}`}
                                        value={fields.password} onChange={changeInput} />
                                    {(errors?.password) ? <div className="text-red-500">{errors.password[0]}</div> : null}
                                </div>
                            </div>
                            <div className="flex flex-row py-4">
                                <div className="px-4 pt-3 sm:px-6 w-1/3">
                                    <label htmlFor="password_confirmation" className="font-medium">Confirm Password</label>
                                </div>
                                <div className="w-2/3">
                                    <input type="password" name="password_confirmation" id="password_confirmation" onChange={changeInput}
                                        className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.password_confirmation) ? 'border-red-500 text-red-500' : ''}`} />
                                    {(errors?.password_confirmation) ? <div className="text-red-500">{errors.password_confirmation[0]}</div> : null}
                                </div>
                            </div>
                        </div>
                    )
            }
        </Card>
    )
}

export default withTheme(AdministratorUser);