import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import axios from 'axios';

import { Default } from './Layouts';
import { Login } from './Auth';

import { withAuth, WebApps } from 'webapps-react';
import { AuthenticatedRoute, UnauthenticatedRoute } from './Routes';

const App = ({ signIn, signOut }) => {

    axios.interceptors.response.use(
        response => response,
        error => {
            if (error.response.status === 401) {
                localStorage.setItem('WA_Login', window.location.href);
                signOut();
            }
            return Promise.reject(error);
        }
    );

    return (
        <BrowserRouter>
            <Switch>
                <UnauthenticatedRoute exact path="/login" name="Login Page"
                    component={props => <Login loginUser={signIn} {...props} />} />
                <Route exact path="/logout" name="Logout" component={signOut} />

                <WebApps>
                    <AuthenticatedRoute path="/" name="Home" component={Default} />
                </WebApps>
            </Switch>
        </BrowserRouter>
    );
}

export default withAuth(App);
