import React, { useContext } from 'react';
import { WebAppsContext } from 'webapps-react';

const Filter = props => {
    const {
        plugins,
        blockFilter,
    } = props;

    const { UI } = useContext(WebAppsContext);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="hidden xl:block col-span-2">&nbsp;</div>
            <div>
                <label htmlFor="filter-search" className="sr-only">Filter by Search</label>
                <input type="text" className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500 bg-transparent`} placeholder="Search..." onKeyUp={blockFilter} id="filter-search" />
            </div>
            <div>
                <label htmlFor="filter-plugin" className="sr-only">Filter by Plugin</label>
                <select className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500 bg-transparent`} onChange={blockFilter} id="filter-plugin">
                    <option value="">Show All Block Types</option>
                    {
                        plugins.map(function (plugin, i) {
                            return (
                                <option value={plugin.id} key={i}>{plugin.name}</option>
                            )
                        })
                    }
                </select>
            </div>
        </div>
    );
}

export default Filter;