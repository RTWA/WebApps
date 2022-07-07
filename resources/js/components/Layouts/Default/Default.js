import React, { useContext } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import {
    AppError,
    Headerbar,
    Notifications,
    NotificationsProvider,
    Sidebar,
    WebAppsUXContext
} from 'webapps-react';
import * as RouteComponents from '../../Routes';

const Default = () => {
    const { theme, useNavigation } = useContext(WebAppsUXContext);
    const { navigation, toggleNavigation } = useNavigation;

    if (localStorage.getItem('WA_Login')) {
        localStorage.removeItem('WA_Login');
    }

    if (theme === undefined || !navigation.menu) {
        return null
    }

    return (
        <div className="flex md:flex-row flex-col h-full">
            <NotificationsProvider>
                <Sidebar />
                <AppError theme={theme}>
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
                            <div className="ml-auto">
                                <Notifications />
                            </div>
                        </Headerbar>
                        <div className="flex flex-col flex-auto overflow-hidden">
                            <Switch>
                                {
                                    navigation.routes?.map((route, idx) => {
                                        let C = RouteComponents[route.component];
                                        return route.component ? (
                                            <Route key={idx} path={route.path} exact={route.exact} name={route.name}
                                                render={props => (
                                                    (C !== undefined) ? <C routedata={route} {...props} />
                                                        : <div>Error: Component '{route.component}' not found!</div>
                                                )} />
                                        ) : (null);
                                    })
                                }
                                <Redirect from="/" to="/dashboard" exact />
                            </Switch>
                        </div>
                    </div>
                </AppError>
            </NotificationsProvider>
        </div>
    )
}

export default Default;
