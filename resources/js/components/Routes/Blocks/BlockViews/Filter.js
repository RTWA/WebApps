import React, { useContext } from 'react';
import { Input, Select, WebAppsContext } from 'webapps-react';

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
                <Input type="text" placeholder="Search..." onKeyUp={blockFilter} id="filter-search" inputClassName="bg-gray-200" />
            </div>
            <div>
                <label htmlFor="filter-plugin" className="sr-only">Filter by Plugin</label>
                <Select onChange={blockFilter} id="filter-plugin" selectClassName="bg-gray-200">
                    <option value="">Show All Block Types</option>
                    {
                        plugins.map(function (plugin, i) {
                            return (
                                <option value={plugin.id} key={i}>{plugin.name}</option>
                            )
                        })
                    }
                </Select>
            </div>
        </div>
    );
}

export default Filter;