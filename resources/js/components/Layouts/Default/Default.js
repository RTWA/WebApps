import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoutes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import {
    AppError,
    Headerbar,
    Loader,
    Sidebar,
    WebAppsUXContext
} from 'webapps-react';
import * as RouteComponents from '../../Routes';

const AppRoutes = ({ routes }) => {
    let element = useRoutes(routes);
    return element;
}

const Default = () => {
    const { theme, useNavigation } = useContext(WebAppsUXContext);
    const { navigation, toggleNavigation } = useNavigation;
    const [routes, setRoutes] = useState([]);

    const location = useLocation();

    if (localStorage.getItem('WA_Login')) {
        localStorage.removeItem('WA_Login');
    }

    useEffect(() => {
        let _routes = [];
        navigation.routes?.map((route, idx) => {
            let C = RouteComponents[route.element];
            if (C !== undefined) {
                let el = {
                    path: route.path,
                    name: route.name,
                    element: <C routedata={route} key={idx} />
                };
                _routes.push(el);
            }
        });
        _routes.push({
            name: 'Redirect',
            path: '/',
            element: <Navigate to="/dashboard" replace />
        });
        setRoutes(_routes);
    }, [navigation]);

    if (theme === undefined || !navigation.menu) {
        return null
    }

    return (
        <div className="flex md:flex-row flex-col h-full">
            <Sidebar />
            <AppError theme={theme} path={location.pathname}>
                <div className="flex flex-col flex-auto w-full min-w-0 h-full overflow-hidden" id="app-content">
                    <Headerbar>
                        <button
                            className="cursor-pointer text-gray-600 dark:text-gray-400 text-xl leading-none bg-transparent outline-none"
                            type="button"
                            onClick={toggleNavigation}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </Headerbar>
                    <div className="flex flex-col flex-auto overflow-hidden">
                        {
                            (routes.length !== 0)
                                ? <AppRoutes routes={routes} />
                                : <Loader />
                        }
                    </div>
                </div>
            </AppError>
        </div>
    )
}

export default Default;
