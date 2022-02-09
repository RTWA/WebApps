import React from 'react';
import { Route, Switch } from 'react-router-dom';

import * as RouteComponents from '../Routes';
import Step from '../Components/Step';

const routes = [
    {
        title: 'Install WebApps',
        subtitle: 'This wizard will guide you through the installation process. To begin with, check the requirements and permissions below.',
        component: 'SystemRequirements',
        path: '/install',
    },
    {
        title: 'Database Setup',
        subtitle: 'Complete the form with the details for the database you have already created.',
        component: 'DatabaseSetup',
        path: '/install/database',
    },
    {
        title: 'WebApps Setup',
        subtitle: 'Lets set some basic WebApps Settings',
        component: 'ApplicationSetup',
        path: '/install/application',
    },
    {
        title: 'Create Administrator Account',
        subtitle: 'WebApps must always have at least one internal administrator account!',
        component: 'AdministratorUser',
        path: '/install/administrator',
    },
    {
        title: 'Installation Complete',
        subtitle: 'WebApps is installed!',
        component: 'SetupComplete',
        path: '/install/complete',
    },
];

const icons = {
    requirements: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    database: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
    ),
    settings: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    administrator: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    complete: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
    ),
};

const Install = () => {
    return (
        <div className="py-6 px-24 text-gray-700 bg-gray-200 dark:bg-gray-900 dark:text-white">
            <div className="grid grid-cols-5">
                <Step title="Check System Requirements" step="1" icon={icons.requirements} />
                <Step title="Database Setup" step="2" icon={icons.database} />
                <Step title="WebApps Setup" step="3" icon={icons.settings} />
                <Step title="Administrator Account" step="4" icon={icons.administrator} />
                <Step title="Setup Complete!" step="5" icon={icons.complete} />
            </div>

            <Switch>
                {
                    routes.map((route, idx) => {
                        let C = RouteComponents[route.component];
                        return route.component ? (
                            <Route key={idx} path={route.path} exact name={route.title}
                                render={props => (
                                    (C !== undefined) ? <C routedata={route} {...props} />
                                        : <div>Error: Component '{route.component}' not found!</div>
                                )} />
                        ) : (null);
                    })
                }
            </Switch>
        </div>
    )
}

export default Install;
