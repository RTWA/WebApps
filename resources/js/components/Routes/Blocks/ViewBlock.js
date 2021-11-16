import React, { useEffect, useState } from 'react';
import axios from 'axios';

import ReactHtmlParser from "react-html-parser";
import UseBlock from './UseBlock';
import { Link } from 'react-router-dom';
import { Icon, Loader, withWebApps } from 'webapps-react';

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

    const loadBlockData = () => {
        axios.get(`/api/blocks/${props.match.params.id}`)
            .then(json => {
                /* istanbul ignore else */
                if (_mounted) {
                    Object.keys(json.data.styles).map(function (i) {
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
        <div className="flex flex-wrap pt-10">
            <div className="w-5/12 px-4">
                <div id="block-preview">
                    {ReactHtmlParser(block.output)}
                </div>
            </div>
            <div className="w-7/12">
                <div className={`overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 border-${UI.theme}-600 dark:border-${UI.theme}-500 border-t-2`}>
                    <div className="flex flex-row border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-lg">
                        <span className="font-medium mr-2">Plugin:</span>
                        <Icon icon={block.plugin.icon} className="h5 w-5 mt-0.5 mr-2" /> {block.plugin.name}
                    </div>
                    <div className="px-4 pb-2 pt-7">
                        <UseBlock block={block} />
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 w-full">
                        <Link
                            to={`/blocks/edit/${block.publicId}`}
                            className={`inline-block p-2 hover:bg-${UI.theme}-600 text-${UI.theme}-600 dark:hover:bg-${UI.theme}-600 dark:text-${UI.theme}-500 hover:text-white dark:hover:text-white focus:ring-0`}>
                            Edit this block
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withWebApps(ViewBlock);
