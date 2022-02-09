import React from 'react';

const Step = props => {
    const {
        step,
        title,
        active,
        success,
    } = props;

    const color = (active || success) ? 'indigo-600' : 'gray-400';
    const darkColor = (active || success) ? 'indigo-400' : 'gray-400';

    const iconSuccess = (success) ? 'white bg-indigo-600' : (active) ? 'indigo-600' : 'gray-400';
    const darkIconSuccess = (success) ? 'white dark:bg-indigo-400' : (active) ? 'indigo-400' : 'gray-400';

    const icon = (success) ?
        (<svg xmlns="http://www.w3.org/2000/svg" className="w-full" width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>) : props.icon;

    return (
        <div className={`flex flex-row mx-4 py-4 border-t-4 border-${color} dark:border-${darkColor}`}>
            <div className="relative px-4">
                <div className={`w-10 h-10 mx-auto rounded-full text-lg flex items-center 
                                border-2 border-${color} dark:border-${darkColor}
                                text-${iconSuccess} dark:text-${darkIconSuccess}`}>
                    <span className="text-center w-full">{icon}</span>
                </div>
            </div>
            <div className="flex flex-col font-medium -mt-1">
                <p className={`text-${color} dark:text-${darkColor} uppercase`}>
                    Step {step}
                </p>
                <p>{title}</p>
            </div>
        </div>
    )
}

export default Step;