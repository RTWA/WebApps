import React from 'react';
import { Route } from 'react-router-dom';
import { withAuth } from 'webapps-react';

const UnauthenticatedRoute = ({ authenticated, component: Component, ...rest}) => {
    const redirect = (localStorage.getItem('WA_Login')) ? localStorage.getItem('WA_Login') : '/';

    return (
        <Route {...rest} render={(props) => (
            !authenticated
                ? <Component {...props} />
                : window.location.replace(redirect)
        )} />
    );
};

export default withAuth(UnauthenticatedRoute);
