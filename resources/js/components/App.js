import React, { useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Default } from './Layouts';
import { Login, Logout } from './Auth';

import { AuthContext, WebAppsUX, WebApps } from 'webapps-react';
import { AuthenticatedRoute, UnauthenticatedRoute } from './Routes';

const App = ()=> {
    const { signIn } = useContext(AuthContext);

    return (
        <BrowserRouter>
            <Routes>
                <UnauthenticatedRoute exact path="/login" name="Login Page"
                    component={props => <Login loginUser={signIn} {...props} />} />
                <Route exact path="/logout" name="Logout" component={Logout} />

                <WebAppsUX>
                    <WebApps>
                        <AuthenticatedRoute path="/" name="Home" component={Default} />
                    </WebApps>
                </WebAppsUX>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
