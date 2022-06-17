import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { MainApp } from './Layouts';
import { Login, Logout } from './Auth';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" name="Login Page" element={<Login />} />
                <Route path="/logout" name="Logout" element={<Logout />} />
                <Route path="/*" name="WebApps" element={<MainApp />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
