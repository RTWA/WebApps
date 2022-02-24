import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withWebApps } from 'webapps-react';

const ColorGridSelect = props => {
    const {
        UI,
        id,
        label,
        helpText,
        wrapperClassName,
        labelClassName,
        colors,
        onSelect,
    } = props;

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
            <div className={`grid grid-cols-1 md:col-span-3 sm:grid-cols-${colors.length / 2} xl:grid-cols-${colors.length} gap-y-2 gap-x-4 mt-1 xl:mt-0 w-full`}>
                {
                    Object(colors).map(function (color) {
                        return (color.selected)
                            ? (
                                <div key={color.value} onClick={() => onSelect(color.value)} className={`border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer ring-4 ring-${UI.theme}-600 dark:ring-${UI.theme}-500 ring-opacity-50`}>
                                    <div className={`h-10 ${color.bgClasses} not-sr-only`}></div>
                                    <div className="text-center font-semibold">{color.name}</div>
                                </div>
                            )
                            : (
                                <div key={color.value} onClick={() => onSelect(color.value)} className="border-2 border-white dark:border-gray-800 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                                    <div className={`h-10 ${color.bgClasses} not-sr-only`}></div>
                                    <div className="text-center">{color.name}</div>
                                </div>
                            )
                    })
                }
            </div>
            { (helpText !== '') ? <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p> : null }
        </div>
    )
}

ColorGridSelect.propTypes = {
    id: PropTypes.string,
    label: PropTypes.string,
    helpText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    wrapperClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    labelClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]),
    colors: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    onSelect: PropTypes.func,
}

ColorGridSelect.defaultProps = {    
    id: '',
    label: '',
    helpText: '',
    wrapperClassName: 'mb-6',
    labelClassName: '',
    colors: [],
}

export default withWebApps(ColorGridSelect);