import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Loader } from 'webapps-react';

import Card from '../Components/Card';

const SetupComplete = (props) => {
    const {
        title,
        subtitle
    } = props.routedata

    const [message, setMessage] = useState(null);

    useEffect(async () => {
        await axios.get('/api/install/complete')
            .then(json => {
                setMessage(json.data.message);
            })
            .catch(error => {
                // TODO: Handle Errors
                console.log(error);
            })
    }, []);

    const CardAction = () => {
        return (
            <a href="/"
                className="ml-auto flex flex-row px-2 py-2 rounded-md border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white dark:hover:text-white">
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
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-center">Installation Completed!</p>
                    </div>
                </div>
                <pre className="py-4 my-5"><code>{message}</code></pre>
            </div>
        </Card>
    )
}

export default SetupComplete;