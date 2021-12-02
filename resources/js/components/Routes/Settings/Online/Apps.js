import React from 'react';
import { AppCard, Button, Loader, withWebApps } from 'webapps-react';

const Apps = ({ apps }) => {
    if (apps.online === undefined) {
        return <Loader />
    }

    if (apps.online === null) {
        return (
            <section>
                <Button to="/settings/appsplugins" style="link" className="flex flex-auto -mt-8 text-sm uppercase">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Apps & Plugins
                </Button>
                <h2 className="mb-2 text-center text-2xl">Choose an App to install</h2>
                <div className="block text-center py-6">There are currently no Apps available for your version of WebApps!</div>
            </section>
        )
    }

    return (
        <section>
            <Button to="/settings/appsplugins" style="link" className="flex flex-auto -mt-8 text-sm uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Apps & Plugins
            </Button>
            <h2 className="mb-2 text-center text-2xl">Choose an App to install</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5 py-4 px-6">
                {
                    Object.keys(apps.online).map((key, i) => {
                        return <AppCard key={i} app={apps.online[key]} showActions={true} />
                    })
                }
            </div>
        </section>
    )
}

export default withWebApps(Apps);
