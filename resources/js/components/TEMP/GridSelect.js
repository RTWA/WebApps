import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { WebAppsContext } from 'webapps-react';

const GridSelect = props => {
    const {
        id,
        label,
        helpText,
        wrapperClassName,
        labelClassName,
        options,
        onSelect,
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

    return (
        <div className={wrapperClassName}>
            <label className={labelClasses} htmlFor={id}>{label}</label>
            <div className={`grid grid-cols-1 md:col-span-3 sm:grid-cols-${options.length / 2} xl:grid-cols-${options.length} gap-y-2 gap-x-4 mt-1 xl:mt-0 w-full`}>
                {
                    Object(options).map(function (option) {
                        return (option.selected)
                            ? (
                                <div key={option.value} onClick={() => onSelect(option.value)} className={`border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer ring-4 ring-${UI.theme}-600 dark:ring-${UI.theme}-500 ring-opacity-50`}>
                                    <div className="flex justify-center h-14 p-2 bg-gray-300 dark:bg-gray-700 not-sr-only">
                                        {option.object}
                                    </div>
                                </div>
                            )
                            : (
                                <div key={option.value} onClick={() => onSelect(option.value)} className="border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                    <div className="flex justify-center h-14 p-2 bg-gray-300 dark:bg-gray-700 not-sr-only">
                                        {option.object}
                                    </div>
                                </div>
                            )
                    })
                }
            </div>
            { (helpText !== '') ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p> : null }
        </div>
    )
}

GridSelect.propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    wrapperClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    labelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    onSelect: PropTypes.func,
}

GridSelect.defaultProps = {    
    id: '',
    label: '',
    helpText: '',
    wrapperClassName: 'mb-6',
    labelClassName: '',
    options: [],
}

export default GridSelect;