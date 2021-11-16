import React, { useState } from 'react';
import { Icon, Loader, withWebApps } from 'webapps-react';
import EditBlock from './EditBlock';

const NewBlock = ({ plugins, ...props }) => {
    const [plugin, setPlugin] = useState(null);

    const selectPlugin = (e, plugin) => {
        e.preventDefault();
        setPlugin(plugin);
    }

    if (plugins.active === null || plugins.active === undefined) {
        return <Loader />
    }

    if (plugins.active.length === 0) {
        return (
            <div className="text-center text-gray-500 mt-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-40 w-40 mb-3 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                <h2 className="mb-4 text-center">No Active Plugins!</h2>
                <p className="text-center text-gray-400">Please contact your System Administrator.</p>
            </div>
        )
    }

    if (plugin === null) {
        return (
            <section>
                <h2 className="mb-2 text-center text-2xl">Select the Plugin you wish to use...</h2>
                <div className="flex flex-wrap">
                    {
                        plugins.active.map(({ slug, icon, name }, i) => (
                            <div key={i} className="my-1 px-1 w-full md:w-4/12 lg:my-4 lg:px-4 lg:w-2/12 plugin">
                                <a href="#" onClick={e => { selectPlugin(e, slug) }}>
                                    <div className="overflow-hidden rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-4 hover:bg-gray-800 dark:hover:bg-gray-600 hover:text-white">
                                        <Icon icon={icon} className="h-20 w-20 mx-auto" />
                                        <div className="text-center pt-4">
                                            {name}
                                        </div>
                                    </div>
                                </a>
                            </div>
                        ))
                    }
                </div>
            </section>
        )
    }

    return <EditBlock {...props} id={plugin} />
}

export default withWebApps(NewBlock);
