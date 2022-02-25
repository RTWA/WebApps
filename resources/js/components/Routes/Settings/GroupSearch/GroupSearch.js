import React, { useState } from 'react';
import { Input } from 'webapps-react';

const GroupSearch = ({ id, groupData, setData, accessToken, saveChange, ...props }) => {
    const [controllers, setControllers] = useState([]);
    const [active, setActive] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const change = e => {
        // Abort any running requests
        controllers.map(function (controller, i) {
            controller?.abort();
            delete controllers[i];
        });
        let signal = new AbortController();
        setControllers([...controllers, signal]);

        let id = e.target.id;
        let value = e.target.value;

        if (groupData[id] === undefined) {
            groupData[id] = {};
        }
        groupData[id].value = value;

        let headers = new Headers();
        let bearer = `Bearer ${accessToken}`;
        headers.append('Authorization', bearer);
        let options = {
            method: "GET",
            headers: headers,
            signal: signal.signal
        };
        let graphEndpoint = `https://graph.microsoft.com/v1.0/groups?$filter=startswith(displayName, '${value}')&$select=id,displayName`;

        fetch(graphEndpoint, options)
            .then(response => response.json())
            .then(data => {
                groupData[id].data = data.value

                setData([...groupData]);
                setActive(0);
                setShowResults(true);
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    // TODO: Handle Errors
                    console.log(error)
                }
            });
    }

    const onClick = e => {
        e.stopPropagation();

        groupData[id].selected = groupData[id].data[e.currentTarget.dataset.key];
        groupData[id].value = groupData[id].data[e.currentTarget.dataset.key].displayName;
        groupData[id].data = [];

        setActive(0);
        setShowResults(false);
        setData([...groupData]);
        saveChange(id);
    }

    const onKeyDown = e => {
        if (e.keyCode === 13) {
            groupData[id].selected = groupData[id].data[active];
            groupData[id].value = groupData[id].data[active].displayName;
            setData([...groupData]);
            setShowResults(false);
            setActive(0);
            saveChange(id);
        } else if (e.keyCode === 38) {
            if (active === 0) {
                return;
            }
            setActive(active - 1);
        } else if (e.keyCode === 40) {
            if (active + 1 === groupData[id].data.length) {
                return;
            }
            setActive(active + 1);
        }
    }

    let DataListComponent;

    if (showResults && groupData[id]?.value) {
        if (groupData[id].data?.length) {
            let count = 1;
            DataListComponent = (
                <ul className="z-50 absolute inset-x-0 bg-white dark:bg-gray-700 rounded-b border border-gray-200 dark:border-gray-600 text-gray-900 text-sm font-medium dark:text-white cursor-pointer">
                    {
                        groupData[id].data.map((data, index) => {
                            if (count <= 5) {
                                let className = "flex flex-row gap-x-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-900";

                                if (index === active) {
                                    className = "flex flex-row gap-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-900";
                                }

                                count = count + 1;

                                return <li className={className} key={data.id} data-key={index} onClick={onClick}>{data.displayName}</li>
                            }
                        })
                    }
                </ul>
            )
        } else {
            DataListComponent = (
                <ul className="z-50 absolute inset-x-0 bg-white dark:bg-gray-700 rounded-b border border-gray-200 dark:border-gray-600 text-gray-900 text-sm font-medium dark:text-white cursor-pointer">
                    <li className="px-4 py-2 text-center"><em>No matching groups found!</em></li>
                </ul>
            );
        }
    }

    return (
        <div className="relative w-full">
            <Input type="text" id={`${id}`} value={groupData[id]?.value || ''} onChange={change} onKeyDown={onKeyDown} state={groupData[id]?.state} {...props} />
            {DataListComponent}
        </div>
    );
}

export default GroupSearch;