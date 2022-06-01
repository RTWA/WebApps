import React from 'react';
import { Button, DropDownButton, DropDownItem, Input, Select } from 'webapps-react';

const Filter = props => {
    const {
        plugins,
        blockFilter,
        sort,
        setSort,
    } = props;

    const sortOrder = () => {
        if (sort.order === 'ASC') {
            sort.order = 'DESC';
        } else {
            sort.order = 'ASC'
        }
        setSort({ ...sort });
    }

    const setSortCreated = () => {
        if (sort.by !== 'Created') {
            sort.by = 'Created';
            setSort({ ...sort });
        }
    }

    const setSortPopularity = () => {
        if (sort.by !== 'Popularity') {
            sort.by = 'Popularity';
            setSort({ ...sort });
        }
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 -mt-4">
            <div className="flex flex-row items-center gap-2">
                <Button
                    type="link"
                    color="gray"
                    padding={false}
                    onClick={sortOrder}
                >
                    {
                        (sort.order === 'ASC')
                            ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                            )
                            : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                </svg>
                            )
                    }
                </Button>
                <DropDownButton
                    color="gray"
                    type="link"
                    origin="left"
                    padding={false}
                    text={sort.by}
                >
                    <DropDownItem
                        color="gray"
                        align="left"
                        active={(sort.by === 'Created')}
                        onClick={setSortCreated}
                    >
                        Created
                    </DropDownItem>
                    <DropDownItem
                        color="gray"
                        align="left"
                        active={(sort.by === 'Popularity')}
                        onClick={setSortPopularity}
                    >
                        Popularity
                    </DropDownItem>
                </DropDownButton>
            </div>
            <div className="hidden xl:block">&nbsp;</div>
            <>
                <label htmlFor="filter-search" className="sr-only">Filter by Search</label>
                <Input type="text" placeholder="Search..." onKeyUp={blockFilter} id="filter-search" />
            </>
            <>
                <label htmlFor="filter-plugin" className="sr-only">Filter by Plugin</label>
                <Select onChange={blockFilter} id="filter-plugin">
                    <option value="">Show All Block Types</option>
                    {
                        plugins.map(function (plugin, i) {
                            return (
                                <option value={plugin.id} key={i}>{plugin.name}</option>
                            )
                        })
                    }
                </Select>
            </>
        </div>
    );
}

export default Filter;