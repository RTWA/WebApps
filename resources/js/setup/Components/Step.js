import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { withTheme } from '../Context';

const Step = ({ route, icon, success, color }) => {
    const location = useLocation();

    const [active, setActive] = useState(false);

    const [baseColor, setBaseColor] = useState('gray-400');
    const [darkColor, setDarkColor] = useState('gray-400');
    const [iconSuccess, setIconSuccess] = useState('gray-400');
    const [darkIconSuccess, setDarkIconSuccess] = useState('gray-400');

    useEffect(() => {
        if (route) {
            if (location.pathname === route.path) {
                setActive(true);
            } else {
                setActive(false);
            }
        }
    }, [location]);

    useEffect(() => {
        setBaseColor((active || success) ? `${color}-600` : 'gray-400');
        setDarkColor((active || success) ? `${color}-400` : 'gray-400');
        setIconSuccess((success) ? `white bg-${color}-600` : (active) ? `${color}-600` : 'gray-400');
        setDarkIconSuccess((success) ? `white dark:bg-${color}-400` : (active) ? `${color}-400` : 'gray-400');
    }, [active, color]);

    const displayIcon = (success) ?
        (<svg xmlns="http://www.w3.org/2000/svg" className="w-full" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>) : icon;

    return (
        <div className={`flex flex-row mx-4 py-4 border-t-4 border-${baseColor} dark:border-${darkColor}`}>
            <div className="relative px-4">
                <div className={`w-10 h-10 mx-auto rounded-full text-lg flex items-center 
                                border-2 border-${baseColor} dark:border-${darkColor}
                                text-${iconSuccess} dark:text-${darkIconSuccess}`}>
                    <span className="text-center w-full">{displayIcon}</span>
                </div>
            </div>
            <div className="flex flex-col font-medium -mt-1">
                <p className={`text-${baseColor} dark:text-${darkColor} uppercase`}>
                    Step {route.step}
                </p>
                <p>{route.title}</p>
            </div>
        </div>
    )
}

export default withTheme(Step);