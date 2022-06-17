import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route } from 'react-router-dom';
import Install from './Install';
import { Theme } from './Context';

const App = () => {
    return (
        <Theme>
            <BrowserRouter>
                <Route path="/install" name="Root" component={Install} />
            </BrowserRouter>
        </Theme>
    );
}

const root = createRoot(document.getElementById('WebApps_Setup'));
root.render(<App />);
