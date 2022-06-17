import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, WebApps, WebAppsUX } from 'webapps-react';
import { Default } from './Default';

const MainApp = () => {
    const { authenticated } = useContext(AuthContext);
    if (!authenticated) {
        localStorage.setItem('WA_Login', window.location.href);
        navigate = useNavigate();
        navigate('/login');
    }

    return (
        <WebAppsUX>
            <WebApps>
                <Default />
            </WebApps>
        </WebAppsUX>
    )

}

export default MainApp;