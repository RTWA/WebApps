import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route } from 'react-router-dom';
import Install from './Install';
import { Theme } from './Context';
import { Routes } from 'react-router-dom';

const App = () => {
    return (
        <Theme>
            <BrowserRouter>
                <Routes>
                    <Route path="/install" name="Root" component={Install} />
                </Routes>
            </BrowserRouter>
        </Theme>
    );
}

const root = createRoot(document.getElementById('WebApps_Setup'));
root.render(<App />);
