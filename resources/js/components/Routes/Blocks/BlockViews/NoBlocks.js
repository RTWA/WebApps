import React from 'react';
import PropTypes from 'prop-types';

const NoBlocks = props => {
    const {
        size
    } = props;

    return (
        <div className="text-center text-gray-500 mt-20">
            <div className={`relative w-${size} h-${size} mx-auto`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute bottom-8 top-8 left-8 right-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 top-0 left-0 right-0 text-red-500 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            </div>
            {props.children}
        </div>
    )
}

NoBlocks.propTypes = {
    size: PropTypes.string,
};

NoBlocks.defaultProps = {
    size: '96',
};

export default NoBlocks;