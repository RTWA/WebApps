import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Loader, WebAppsContext } from 'webapps-react';

const Select = props => {
    const {
        id,
        name,
        label,
        action,
        helpText,
        error,
        state,
        wrapperClassName,
        labelClassName,
        inputClassName,
        children,
        ...attributes
    } = props;

    const { UI } = useContext(WebAppsContext);

    const labelClasses = classNames(
        'block',
        'mb-2',
        'text-sm',
        'font-medium',
        'text-gray-700',
        'dark:text-gray-300',
        labelClassName,
    )

    const inputClasses = classNames(
        'bg-gray-50',
        'border-2',
        'border-gray-300',
        'text-gray-900',
        'outline-none',
        'text-sm',
        'rounded-lg',
        'block',
        'w-full',
        'p-2.5',
        'dark:bg-gray-700',
        'dark:border-gray-600',
        'dark:placeholder-gray-400',
        'dark:text-white',
        'transition-colors',
        `focus:ring-${UI.theme}-600`,
        `dark:focus:ring-${UI.theme}-500`,
        `focus:border-${UI.theme}-600`,
        `dark:focus:border-${UI.theme}-500`,
        (state === 'error') ? 'border-red-500 text-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500' : '',
        (state === 'saved') ? 'border-green-500 text-green-500 focus:border-green-500 dark:focus:border-green-500 focus:ring-green-500 dark:focus:ring-green-500' : '',
        (state === 'saving') ? 'border-orange-500 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-orange-500 dark:focus:ring-orange-500' : '',
        inputClassName,
    )

    const Append = () => {
        if (state === 'saving') {
            return <Loader style="circle" className="w-5 h-5" />
        } else if (state === 'saved') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            )
        } else if (state === 'error') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        } else if (action) {
            return action;
        }
        return null;
    }

    return (
        <div className={wrapperClassName}>
            {
                (label !== '') ? <label for={id} className={labelClasses}>{label}</label> : null
            }
            <div className="relative">
                <select id={id} name={name} className={inputClasses} {...attributes}>
                    {children}
                </select>
                <div className="flex absolute inset-y-0 right-5 items-center pr-3">
                    <Append />
                </div>
            </div>
            {
                (helpText !== '' || error !== '')
                    ? (
                        <span class={`text-sm transition-colors ${(state === 'error') ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {(state === 'error') ? error : helpText}
                        </span>
                    ) : null
            }
        </div>
    );
}

Select.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    action: PropTypes.object,
    helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    error: PropTypes.string,
    state: PropTypes.oneOf(['', 'saving', 'error', 'saved']),
    wrapperClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    labelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    inputClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
}

Select.defaultProps = {
    error: '',
    state: '',
    label: '',
    helpText: '',
    wrapperClassName: 'mb-6',
    labelClassName: '',
    inputClassName: '',
}

export default Select;