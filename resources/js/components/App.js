import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Default } from './Layouts';
import { Login } from './Auth';

import { withAuth, WebAppsUX, WebApps } from 'webapps-react';
import { AuthenticatedRoute, UnauthenticatedRoute } from './Routes';

const App = ({ signIn, signOut }) => {
    return (
        <BrowserRouter>
            <Switch>
                <UnauthenticatedRoute exact path="/login" name="Login Page"
                    component={props => <Login loginUser={signIn} {...props} />} />
                <Route exact path="/logout" name="Logout" component={signOut} />

                <WebAppsUX>
                    <WebApps>
                        <AuthenticatedRoute path="/" name="Home" component={Default} />
                    </WebApps>
                </WebAppsUX>
            </Switch>
        </BrowserRouter>
    );
}

export default withAuth(App);
