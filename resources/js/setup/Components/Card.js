import React from 'react';
import { withTheme } from '../Context';

const Card = ({ color, ...props }) => {
    const {
        title,
        subtitle,
        children,
        action,
    } = props;

    return (
        <div className="relative flex flex-col min-w-0 break-words mb-6 mt-12 mx-24 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-600 overflow-hidden">
            <div className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 mb-0 px-6 py-6">
                <h3 className={`text-2xl leading-6 font-medium text-${color}-600 dark:text-${color}-400`}>{title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                    {subtitle}
                </p>
            </div>
            <div className="flex-auto px-4 lg:px-10">
                {children}
            </div>

            <div className="flex p-2 border-t border-gray-200 dark:border-gray-500">
                {action()}
            </div>
        </div>
    )
}

export default withTheme(Card);