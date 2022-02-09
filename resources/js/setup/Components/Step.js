import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Step = ({ route, icon, success }) => {
    const location = useLocation();

    const [active, setActive] = useState(false);

    const [color, setColor] = useState('gray-400');
    const [darkColor, setDarkColor] = useState('gray-400');
    const [iconSuccess, setIconSuccess] = useState('gray-400');
    const [darkIconSuccess, setDarkIconSuccess] = useState('gray-400');

    useEffect(() => {
        if (route) {
            if (location.pathname === route.path) {
                setActive(true);
                console.log(`${route.path} is active!`)
            } else {
                setActive(false);
            }
        }
    }, [location]);

    useEffect(() => {
        setColor((active || success) ? 'indigo-600' : 'gray-400');
        setDarkColor((active || success) ? 'indigo-400' : 'gray-400');
        setIconSuccess((success) ? 'white bg-indigo-600' : (active) ? 'indigo-600' : 'gray-400');
        setDarkIconSuccess((success) ? 'white dark:bg-indigo-400' : (active) ? 'indigo-400' : 'gray-400');
    }, [active]);

    const displayIcon = (success) ?
        (<svg xmlns="http://www.w3.org/2000/svg" className="w-full" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>) : icon;

    return (
        <div className={`flex flex-row mx-4 py-4 border-t-4 border-${color} dark:border-${darkColor}`}>
            <div className="relative px-4">
                <div className={`w-10 h-10 mx-auto rounded-full text-lg flex items-center 
                                border-2 border-${color} dark:border-${darkColor}
                                text-${iconSuccess} dark:text-${darkIconSuccess}`}>
                    <span className="text-center w-full">{displayIcon}</span>
                </div>
            </div>
            <div className="flex flex-col font-medium -mt-1">
                <p className={`text-${color} dark:text-${darkColor} uppercase`}>
                    Step {route.step}
                </p>
                <p>{route.title}</p>
            </div>
        </div>
    )
}

export default Step;