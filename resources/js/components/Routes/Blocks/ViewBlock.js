import React, { useEffect, useState } from 'react';
import axios from 'axios';

import ReactHtmlParser from "react-html-parser";
import UseBlock from './UseBlock';
import { Button, Icon, Loader, withWebApps } from 'webapps-react';

let _mounted = false;

const ViewBlock = ({ UI, ...props }) => {
    const [block, setBlock] = useState(null);

    useEffect(() => {
        _mounted = true;
        loadBlockData();

        return () => _mounted = false;
    }, []);

    useEffect(() => {
        if (block !== null) {
            /* istanbul ignore else */
            if (block.scripts !== undefined) {
                eval(block.scripts);
            }
        }
    }, [block]);

    const loadBlockData = async () => {
        await axios.get(`/api/blocks/${props.match.params.id}`)
            .then(json => {
                /* istanbul ignore else */
                if (_mounted) {
                    Object.keys(json.data.styles).map(function (i) {
                        /* istanbul ignore else */
                        if (!document.querySelectorAll('style[ref=' + i + ']').length) {
                            let style = document.createElement("style");
                            style.setAttribute("ref", i);
                            style.innerHTML = json.data.styles[i];
                            document.head.appendChild(style);
                        }
                    });
                    setBlock(json.data.block);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                // TODO: handle errors
                console.log(error);
            });
    }

    if (block === null) {
        return <Loader />
    }

    return (
        <div className="flex flex-col flex-col-reverse xl:flex-row gapy-y-4 pt-10 w-full">
            <div className="w-full xl:w-5/12 px-4">
                <div id="block-preview">
                    {ReactHtmlParser(block.output)}
                </div>
            </div>
            <div className="w-full xl:w-7/12">
                <div className={`overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 border-${UI.theme}-600 dark:border-${UI.theme}-500 border-t-2`}>
                    <div className="flex flex-row border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-lg">
                        <span className="font-medium mr-2">Plugin:</span>
                        <Icon icon={block.plugin.icon} className="h5 w-5 mt-0.5 mr-2" /> {block.plugin.name}
                    </div>
                    <div className="px-4 pb-2 pt-7">
                        <UseBlock block={block} />
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 w-full">
                        <Button to={`/blocks/edit/${block.publicId}`} style="ghost" square className="inline-block text-center w-full sm:w-auto">
                            Edit this Block
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withWebApps(ViewBlock);
