import React, { useEffect, useState } from 'react';
import { APIClient, Loader } from 'webapps-react';

import { withTheme } from '../Context';
import Card from '../Components/Card';

const SetupComplete = ({ color, routedata, setSuccess }) => {
    const {
        title,
        subtitle
    } = routedata;

    const [message, setMessage] = useState(null);

    const APIController = new AbortController();

    useEffect(async () => {
        setSuccess([true, true, true, true, false]);
        await APIClient('/api/install/complete', undefined, { signal: APIController.signal })
            .then(json => {
                setMessage(json.data.message);
            })
            .catch(error => {
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            })

        return () => {
            APIController.abort();
        }
    }, []);

    const CardAction = () => {
        return (
            <a href="/"
                className={`ml-auto flex flex-row px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white`}>
                <span className="pt-2">Go to WebApps</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </a>
        )
    }

    if (!message) {
        return <Loader />
    }

    return (
        <Card title={title} subtitle={subtitle} action={CardAction}>
            <div className="flex flex-col w-full px-4 pt-5 sm:px-24">
                <div className="flex flex-row py-4 text-center">
                    <div className="py-3 pb-8 text-green-500 text-center w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-64 mx-auto">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-center">Installation Completed!</p>
                    </div>
                </div>
                <pre className="py-4 my-5"><code>{message}</code></pre>
            </div>
        </Card>
    )
}

export default withTheme(SetupComplete);