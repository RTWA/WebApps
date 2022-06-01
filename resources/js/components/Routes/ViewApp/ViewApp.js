import React, { useEffect } from 'react';

const ViewApp = props => {
    const { routedata, staticContext, history, location, match, ...rest } = props;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `/js/apps/${routedata.app}.js?t=${Math.floor(Date.now() / 1000)}`;
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    return (
        <div id="WebApps_AppContainer" className="h-full w-full" {...rest} />
    )
}

export default ViewApp;