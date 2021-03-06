import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APIClient, Loader } from 'webapps-react';

import { withTheme } from '../Context';
import Card from '../Components/Card';

const DatabaseSetup = ({color, routedata, setSuccess}) => {
    const {
        title,
        subtitle
    } = routedata;

    const [fields, setFields] = useState({});
    const [errors, setErrors] = useState(null);
    const [output, setOutput] = useState(null);
    const [canContinue, setCanContinue] = useState(false);
    const [sampling, setSampling] = useState(false);
    const [sample, setSample] = useState(null);
    
    const APIController = new AbortController();

    useEffect(async () => {
        setSuccess([true, false, false, false, false]);
        if (fields) {
            await APIClient('/api/install/database', undefined, { signal: APIController.signal })
                .then(json => {
                    setFields(json.data);
                })
                .catch(error => {
                    if (!error.status.isAbort) {
                        // TODO: Handle errors
                        console.error(error);
                    }
                })
        }
        
        return () => {
            APIController.abort();
        }
    }, []);

    const changeField = e => {
        fields[e.target.id] = e.target.value;
        setFields({
            ...fields,
        });
        setErrors(null);
    }

    const submitForm = async e => {
        e.preventDefault();

        await APIClient('/api/install/database', fields, { signal: APIController.signal })
            .then(async json => {
                setOutput(json.data);
                await APIClient('/api/install/database/migrate', {})
                    .then(json => {
                        setOutput(json.data);
                        setCanContinue(true);
                    })
                    .catch(error => {
                        if (!error.status.isAbort) {
                            // TODO: Handle errors
                            console.error(error);
                        }
                    });
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

    const installSampleData = async e => {
        e.preventDefault();
        setSampling(true);

        await APIClient('/api/install/database/sample', {}, { signal: APIController.signal })
            .then(json => {
                setSample(json.data);
                setSampling(false);
            })
            .catch(error => {
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            })
    }

    const CardAction = () => {
        if (!output && !errors) {
            return (
                <a href="#" onClick={submitForm} className={`ml-auto flex flex-row px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white`}>
                    <span className="pt-2">Create Tables</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            )
        } else if (output && !sample && canContinue) {
            return (
                <Link to="/install/application"
                    className={`ml-auto flex flex-row px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white`}>
                    <span className="pt-2">Continue without Sample Data</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            )
        } else if (canContinue) {
            return (
                <Link to="/install/application"
                    className={`ml-auto flex flex-row px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white`}>
                    <span className="pt-2">Continue</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            )
        }
    }

    if (!output) {
        return (
            <Card title={title} subtitle={subtitle} action={CardAction}>
                <div className="flex flex-col divde divide-y dark:divide-gray-400 w-full px-4 pt-5 sm:px-12">
                    <div className="flex flex-row py-4">
                        <div className="px-4 pt-3 sm:px-6 w-1/3">
                            <label htmlFor="DB_CONNECTION" className="font-medium">Database Type</label>
                        </div>
                        <div className="w-2/3">
                            <select name="DB_CONNECTION" id="DB_CONNECTION" value={fields?.DB_CONNECTION || ''} onChange={changeField}
                                className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.DB_CONNECTION) ? 'border-red-500 text-red-500' : ''}`}>
                                <option value="mysql">MySQL</option>
                                <option value="sqlite">SQLite</option>
                                <option value="pgsql">PostgreSQL</option>
                                <option value="sqlsrv">Microsoft SQL Server</option>
                            </select>
                            {(errors?.DB_CONNECTION) ? <div className="text-red-500">{errors.DB_CONNECTION[0]}</div> : null}
                        </div>
                    </div>
                    <div className="flex flex-row py-4">
                        <div className="px-4 pt-3 sm:px-6 w-1/3">
                            <label htmlFor="DB_HOST" className="font-medium">Server Name</label>
                        </div>
                        <div className="w-2/3">
                            <input type="text" name="DB_HOST" id="DB_HOST" value={fields?.DB_HOST || ''} onChange={changeField} className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.DB_HOST) ? 'border-red-500 text-red-500' : ''}`} />
                            {(errors?.DB_HOST) ? <div className="text-red-500">{errors.DB_HOST[0]}</div> : null}
                        </div>
                    </div>
                    <div className="flex flex-row py-4">
                        <div className="px-4 pt-3 sm:px-6 w-1/3">
                            <label htmlFor="DB_PORT" className="font-medium">Server Port</label>
                        </div>
                        <div className="w-2/3">
                            <input type="text" name="DB_PORT" id="DB_PORT" value={fields?.DB_PORT || ''} onChange={changeField} className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.DB_PORT) ? 'border-red-500 text-red-500' : ''}`} />
                            {(errors?.DB_PORT) ? <div className="text-red-500">{errors.DB_PORT[0]}</div> : null}
                        </div>
                    </div>
                    <div className="flex flex-row py-4">
                        <div className="px-4 pt-3 sm:px-6 w-1/3">
                            <label htmlFor="DB_DATABASE" className="font-medium">Database Name</label>
                        </div>
                        <div className="w-2/3">
                            <input type="text" name="DB_DATABASE" id="DB_DATABASE" value={fields?.DB_DATABASE || ''} onChange={changeField} className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.DB_DATABASE) ? 'border-red-500 text-red-500' : ''}`} />
                            {(errors?.DB_DATABASE) ? <div className="text-red-500">{errors.DB_DATABASE[0]}</div> : null}
                        </div>
                    </div>
                    <div className="flex flex-row py-4">
                        <div className="px-4 pt-3 sm:px-6 w-1/3">
                            <label htmlFor="DB_USERNAME" className="font-medium">Username</label>
                        </div>
                        <div className="w-2/3">
                            <input type="text" name="DB_USERNAME" id="DB_USERNAME" value={fields?.DB_USERNAME || ''} onChange={changeField} className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.DB_USERNAME) ? 'border-red-500 text-red-500' : ''}`} />
                            {(errors?.DB_USERNAME) ? <div className="text-red-500">{errors.DB_USERNAME[0]}</div> : null}
                        </div>
                    </div>
                    <div className="flex flex-row py-4">
                        <div className="px-4 pt-3 sm:px-6 w-1/3">
                            <label htmlFor="DB_PASSWORD" className="font-medium">Password</label>
                        </div>
                        <div className="w-2/3">
                            <input type="password" name="DB_PASSWORD" id="DB_PASSWORD" value={fields?.DB_PASSWORD || ''} onChange={changeField} className={`install-input-field focus:ring-${color}-600 dark:focus:ring-${color}-400 ${(errors?.DB_PASSWORD) ? 'border-red-500 text-red-500' : ''}`} />
                            {(errors?.DB_PASSWORD) ? <div className="text-red-500">{errors.DB_PASSWORD[0]}</div> : null}
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card title={title} subtitle={subtitle} action={CardAction}>
            <p className="pt-5 text-lg text-green-500">{output.title}</p>
            <pre className="p-4 m-5"><code>{output.body}</code></pre>
            {
                (canContinue) ?
                    (sample) ? (
                        <>
                            <p className="pt-5 text-lg text-green-500">{sample.title}</p>
                            <pre className="p-4 m-5"><code>{sample.body}</code></pre>
                        </>
                    ) :
                        (sampling) ?
                            (
                                <button onClick={() => { return null; }} className={`mb-5 flex flex-row items-center gap-2 px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white`}>
                                    <Loader type="circle" height="6" width="6" color={color} />
                                    Please Wait...
                                </button>
                            ) :
                            (
                                <button onClick={installSampleData} className={`mb-5 flex flex-row px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white`}>
                                    Install Sample Data
                                </button>
                            )
                    : null
            }
        </Card>
    )
}

export default withTheme(DatabaseSetup);