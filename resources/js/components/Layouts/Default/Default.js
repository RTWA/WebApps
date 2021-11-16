import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { AppError, Banner, Loader, Sidebar, withWebApps } from 'webapps-react';
import * as RouteComponents from '../../Routes';
import Modals from './Modals';

const Default = ({ navigation, UI }) => {
    if (UI.theme === undefined) {
        return <Loader />
    }

    return (
        <div className="flex md:flex-row flex-col h-full">
            <Sidebar />
            <AppError theme={UI.theme}>
                <div className="px-8 py-4 text-gray-700 bg-gray-200 dark:bg-gray-900 dark:text-white h-screen w-screen overflow-auto" id="app-content">
                    {
                        (UI.envWriteable) ? <Banner color="red-300" className="rounded-b-lg -my-4"><strong>The WebApps <code>.env</code> file is writeable, you should change the permissions!</strong></Banner> : null
                    }
                    {
                        (navigation.routes === undefined)
                            ? <Loader />
                            : <Switch>
                                {
                                    navigation.routes.map((route, idx) => {
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
                    }
                </div>
            </AppError>
            <Modals />
        </div>
    )
}

export default withWebApps(Default);
