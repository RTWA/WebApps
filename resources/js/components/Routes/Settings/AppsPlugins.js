import React from 'react';
import { AppCard, Button, Link, PageWrapper, PluginCard, withWebApps } from 'webapps-react';

const AppPlugins = ({ apps, plugins }) => {
    return (
        <PageWrapper title="Apps & Plugins">
            <h6 className="mb-4 text-gray-600 dark:text-gray-400 text-xl">Apps</h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mb-6">
                {
                    (apps.local === null || apps.local === undefined || typeof apps !== 'object' || apps.local.length === 0) ?
                        (
                            <div className="md:col-span-5 text-center font-medium">
                                <p className="mb-4">No Apps Downloaded!</p>
                                <Button to="/settings/online/apps" square color="gray" type="outline">
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
                <div className="w-full">
                    <Link to="/settings/online/apps" className="border-2 border-dashed hover:border-solid border-gray-400 dark:border-gray-800 text-gray-400 dark:text-gray-800 rounded-lg h-full min-h-[302px] flex flex-col items-center justify-between justify-around">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-44 w-44" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-lg font-bold uppercase">Get More Apps</span>
                    </Link>
                </div>
            </div>

            <h6 className="mb-4 text-gray-600 dark:text-gray-400 text-xl">Plugins</h6>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {
                    (plugins.all === null || plugins.all === undefined || typeof plugins !== 'object' || plugins.all.length === 0) ?
                        (
                            <div className="md:col-span-5 text-center font-medium">
                                <p className="mb-4">No Plugins Downloaded!</p>
                                <Button to="/settings/online/plugins" square color="gray" type="outline">
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
                <div className="w-full">
                    <Link to="/settings/online/plugins" className="border-2 border-dashed hover:border-solid border-gray-400 dark:border-gray-800 text-gray-400 dark:text-gray-800 rounded-lg h-full min-h-[302px] flex flex-col items-center justify-between justify-around">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-44 w-44" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-lg font-bold uppercase">Get More Plugins</span>
                    </Link>
                </div>
            </div>
        </PageWrapper>
    )
}

export default withWebApps(AppPlugins);
