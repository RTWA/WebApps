import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Default } from './Layouts';
import { Login, Logout } from './Auth';

import { AuthContext, WebAppsUX, WebApps } from 'webapps-react';
import { AuthenticatedRoute, UnauthenticatedRoute } from './Routes';

const App = ()=> {
    const { signIn } = useContext(AuthContext);

    return (
        <BrowserRouter>
            <Switch>
                <UnauthenticatedRoute exact path="/login" name="Login Page"
                    component={props => <Login loginUser={signIn} {...props} />} />
                <Route exact path="/logout" name="Logout" component={Logout} />

                <WebAppsUX>
                    <WebApps>
                        <AuthenticatedRoute path="/" name="Home" component={Default} />
                    </WebApps>
                </WebAppsUX>
            </Switch>
        </BrowserRouter>
    );
}

export default App;
