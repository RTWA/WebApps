import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APIClient, Loader } from 'webapps-react';

import { withTheme } from '../Context';
import Card from '../Components/Card';

const SystemRequirements = ({color, routedata}) => {
    const {
        title,
        subtitle
    } = routedata;

    const [requirements, setRequirements] = useState(null);
    const [phpSupportInfo, setPHPSupportInfo] = useState(null);
    const [permissions, setPermissions] = useState(null);

    useEffect(async () => {
        if (!requirements && !phpSupportInfo && !permissions) {
            APIClient('/api/install/requirements')
                .then(json => {
                    setRequirements(json.data.requirements);
                    setPHPSupportInfo(json.data.phpSupportInfo);
                    setPermissions(json.data.permissions);
                })
                .catch(error => {
                    if (!error.status.isAbort) {
                        // TODO: Handle errors
                        console.error(error);
                    }
                })
        }
    }, []);

    const CardAction = () => {
        if (!phpSupportInfo['supported'] || requirements['errors'] || permissions['errors']) {
            return (
                <div className="ml-auto flex flex-row px-2 py-2 rounded-md border border-red-500 text-red-500 font-medium">
                    <span className="pt-2">Fix errors to continue</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                    </svg>
                </div>
            )
        } else {
            return (
                <Link to="/install/database"
                    className={`ml-auto flex flex-row px-2 py-2 rounded-md border border-${color}-600 dark:border-${color}-400 text-${color}-600 dark:text-${color}-400 font-medium hover:bg-${color}-600 dark:hover:bg-${color}-400 hover:text-white dark:hover:text-white`}>
                    <span className="pt-2">Setup Database</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            )
        }
    }

    if (!requirements || !phpSupportInfo || !permissions) {
        return <Loader />;
    }

    return (
        <Card title={title} subtitle={subtitle} action={CardAction}>
            <div className="sm:grid sm:grid-cols-2">
                <div className="flex flex-col mx-auto w-full items-center">
                    <div className="px-4 pt-5 sm:px-6 w-full">
                        <h3 className="text-lg text-center leading-6 font-medium text-gray-900 dark:text-gray-300">
                            PHP Version and Extensions
                        </h3>
                    </div>
                    <ul className="flex flex-col divide divide-y dark:divide-gray-400 w-full px-4 sm:pr-24 sm:pl-6 mb-4">
                        <li className="flex flex-row">
                            <div className="flex flex-1 py-4">
                                <div className="mr-4">
                                    <div className="font-medium uppercase">php</div>
                                </div>
                                <div className="flex-1 pt-1 text-gray-600 dark:text-gray-200 text-xs mr-16">(version {phpSupportInfo['minimum']} required)</div>
                                <div className={`${(phpSupportInfo['supported']) ? 'text-green-500' : 'text-red-500'} font-medium`}>{phpSupportInfo['current']}</div>
                            </div>
                        </li>
                        {
                            Object.keys(requirements.requirements).map(function (type, index) {
                                return Object.keys(requirements.requirements[type]).map(function (extension, index) {
                                    return (
                                        <li className="flex flex-row" key={index}>
                                            <div className="flex flex-1 py-2">
                                                <div className="flex-1">
                                                    <div className="font-medium">{extension}</div>
                                                </div>
                                                <div>{
                                                    (requirements.requirements[type][extension])
                                                        ? <svg xmlns="http://www.w3.org/2000/svg" className="text-green-500 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        : <svg xmlns="http://www.w3.org/2000/svg" className="text-red-500 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                                                        </svg>
                                                }</div>
                                            </div>
                                        </li>
                                    )
                                })
                            })
                        }
                    </ul>
                </div>

                <div className="flex flex-col mx-auto w-full items-center">
                    <div className="px-4 pt-5 sm:px-6 w-full">
                        <h3 className="text-lg text-center leading-6 font-medium text-gray-900 dark:text-gray-300">
                            File and Folder Permissions
                        </h3>
                    </div>
                    <ul className="flex flex-col divide divide-y dark:divide-gray-400 w-full px-4 sm:pr-24 sm:pl-6 mb-4">
                        {
                            Object.keys(permissions.permissions).map(function (index) {
                                let permission = permissions.permissions[index];
                                return (
                                    <li className="flex flex-row" key={index}>
                                        <div className="flex flex-1 py-4">
                                            <div className="flex-1">
                                                <div className="font-medium">{permission['folder']}</div>
                                            </div>
                                            <div className="flex-1 pt-1 text-gray-600 dark:text-gray-200 text-xs mr-16">{permission['permission']}</div>
                                            <div className="text-gray-600">
                                                {
                                                    (permission['isSet'])
                                                        ? <svg xmlns="http://www.w3.org/2000/svg" className="text-green-500 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        : <svg xmlns="http://www.w3.org/2000/svg" className="text-red-500 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                                                        </svg>
                                                }
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        </Card>
    )
}

export default withTheme(SystemRequirements);