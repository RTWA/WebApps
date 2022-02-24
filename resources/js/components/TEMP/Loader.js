import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withWebApps } from 'webapps-react';

const Loader = props => {
    const {
        UI,
        className,
        style,
        color,
        height,
        width,
        alignment,
        ...attributes
    } = props;

    const classes = classNames(
        'loader',
        `text-${color || UI.theme}-300`,
        `dark:text-${color || UI.theme}-500`,
        `h-${height}`,
        `w-${width}`,
        (alignment === 'left') ? 'mr-auto' : '',
        (alignment === 'center') ? 'mx-auto' : '',
        (alignment === 'right') ? 'ml-auto' : '',
        className,
    );

    const circleClasses = classNames(
        'animate-spin',
        'inline',
        'text-gray-200',
        'dark:text-gray-600',
        `fill-${color || UI.theme}-600`,
        `h-${height}`,
        `w-${width}`,
        className,
    );

    if (style === 'circle') {
        return (
            <div className={`text-${alignment}`}>
                <svg role="status" class={circleClasses} viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
            </div>
        );
    }

    return (
        <div className={classes} {...attributes}>
            <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                <g fill="none" fillRule="evenodd" transform="translate(1 1)" strokeWidth={2}>
                    <circle cx={22} cy={22} r={6} strokeOpacity={0}>
                        <animate attributeName="r" begin="1.5s" dur="3s" values="6;22" calcMode="linear" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" begin="1.5s" dur="3s" values="1;0" calcMode="linear" repeatCount="indefinite" />
                        <animate attributeName="stroke-width" begin="1.5s" dur="3s" values="2;0" calcMode="linear" repeatCount="indefinite" />
                    </circle>
                    <circle cx={22} cy={22} r={6} strokeOpacity={0}>
                        <animate attributeName="r" begin="3s" dur="3s" values="6;22" calcMode="linear" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" begin="3s" dur="3s" values="1;0" calcMode="linear" repeatCount="indefinite" />
                        <animate attributeName="stroke-width" begin="3s" dur="3s" values="2;0" calcMode="linear" repeatCount="indefinite" />
                    </circle>
                    <circle cx={22} cy={22} r={8}>
                        <animate attributeName="r" begin="0s" dur="1.5s" values="6;1;2;3;4;5;6" calcMode="linear" repeatCount="indefinite" />
                    </circle>
                </g>
            </svg>
        </div>
    );
}

Loader.propsTypes = {
    style: PropTypes.oneOf(['', 'circle']),
    color: PropTypes.string,
    height: PropTypes.string,
    width: PropTypes.string,
    alignment: PropTypes.oneOf(['left', 'center', 'right']),
}

Loader.defaultProps = {
    style: '',
    height: '24',
    width: '24',
    alignment: 'center',
}

export default withWebApps(Loader);