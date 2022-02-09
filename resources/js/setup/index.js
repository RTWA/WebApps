import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Install from './Install';
import { Theme } from './Context';


const App = () => {
    return (
        <Theme>
            <BrowserRouter>
                <Switch>
                    <Route path="/install" name="Root" component={Install} />
                </Switch>
            </BrowserRouter>
        </Theme>
    );
}

ReactDOM.render(
    <App />, document.getElementById('WebApps_Setup')
);
