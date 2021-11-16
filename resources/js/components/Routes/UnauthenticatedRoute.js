import React from 'react';
import { Route } from 'react-router-dom';
import { withAuth } from 'webapps-react';

const UnauthenticatedRoute = ({ authenticated, component: Component, ...rest}) => {
    let redirect = (localStorage.getItem('WA_Login')) ? localStorage.getItem('WA_Login') : '/';
    if (authenticated) {
        localStorage.removeItem('WA_Login');
    }

    return (
        <Route {...rest} render={(props) => (
            !authenticated
                ? <Component {...props} />
                : window.location.replace(redirect)
        )} />
    );
};

export default withAuth(UnauthenticatedRoute);
