import React from 'react';
import { AppCard, Button, PluginCard, withWebApps } from 'webapps-react';

const AppPlugins = ({ apps, plugins }) => {
    return (
        <>
            <Button to="/settings" style="link" className="flex flex-auto -mt-8 text-sm uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to settings
            </Button>
            <div className="w-full md:px-4 md:py-6">
                <div className="flex flex-row mt-8">
                    <h6 className="text-gray-600 dark:text-gray-400 text-2xl font-bold md:ml-6">Apps</h6>
                    <div className="flex-1 text-right mt-2">
                        <Button to="/settings/online/apps" square>
                            Get More Apps
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5 py-4 px-6">
                    {
                        (apps.local === null || apps.local === undefined || typeof apps !== 'object' || apps.local.length === 0) ?
                            (
                                <div className="w-full text-center font-medium">
                                    <p className="mb-4">No Apps Downloaded!</p>
                                    <Button to="/settings/online/apps" square color="gray" style="outline">
                                        Get Some Apps
                                    </Button>
                                </div>
                            )
                            :
                            (
                                Object.keys(apps.local).map(function (key, i) {
                                    return (
                                        <AppCard key={i} app={apps.local[key]} showActions={true} />
                                    )
                                })
                            )
                    }
                </div>

                <div className="flex flex-row mt-8">
                    <h6 className="text-gray-600 dark:text-gray-400 text-2xl font-bold md:ml-6">Plugins</h6>
                    <div className="flex-1 text-right mt-2">
                        <Button to="/settings/online/plugins" square>
                            Get More Plugins
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5 py-4 px-6">
                    {
                        (plugins.all === null || plugins.all === undefined || typeof plugins !== 'object' || plugins.all.length === 0) ?
                            (
                                <div className="w-full text-center font-medium">
                                    <p className="mb-4">No Plugins Downloaded!</p>
                                    <Button to="/settings/online/plugins" square color="gray" style="outline">
                                        Get Some Plugins
                                    </Button>
                                </div>
                            )
                            :
                            (
                                Object.keys(plugins.all).map(function (key, i) {
                                    return <PluginCard key={i} plugin={plugins.all[key]} showActions={true} />
                                })
                            )
                    }
                </div>
            </div>
        </>
    )
}

export default withWebApps(AppPlugins);
