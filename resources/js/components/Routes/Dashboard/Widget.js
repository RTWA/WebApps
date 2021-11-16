import React, { useEffect } from 'react';

const Widget = props => {
    const { component, staticContext, ...rest } = props;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `/js/widgets/${component}.js?v=${Math.floor(Date.now() / 1000)}`;
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    return (
        <div id={`${component}_Widget`} {...rest} />
    )
}

export default Widget;