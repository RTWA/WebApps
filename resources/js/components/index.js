import React from 'react';
import ReactDOM from 'react-dom';
import { ToastProvider } from 'react-toast-notifications';
import App from './App';
import * as serviceWorker from './serviceWorker';
import ReactTooltip from 'react-tooltip';

import { Auth } from 'webapps-react';

ReactDOM.render(
    <Auth>
        <ToastProvider autoDismiss="true" autoDismissTimeout="3000">
            <App />
            <ReactTooltip effect="solid" />
        </ToastProvider>
    </Auth>,
    document.getElementById('WebApps')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
