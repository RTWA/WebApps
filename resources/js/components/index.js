import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import ReactTooltip from 'react-tooltip';

import { CoreError, Auth } from 'webapps-react';

ReactDOM.render(
    <CoreError>
        <Auth>
            <App />
            <ReactTooltip effect="solid" />
        </Auth>
    </CoreError>,
    document.getElementById('WebApps')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
