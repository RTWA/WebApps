import React, { useContext, useEffect, useState } from 'react';

import ReactHtmlParser from "react-html-parser";
import UseBlock from './UseBlock';
import { APIClient, Button, Icon, Loader, PageWrapper, WebAppsUXContext } from 'webapps-react';

let _mounted = false;

const ViewBlock = props => {
    const [block, setBlock] = useState(null);

    const { theme } = useContext(WebAppsUXContext);

    const APIController = new AbortController();

    useEffect(() => {
        _mounted = true;
        loadBlockData();

        return () => {
            APIController.abort();
            _mounted = false
        };
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
        await APIClient(`/api/blocks/${props.match.params.id}`, undefined, { signal: APIController.signal })
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
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            });
    }

    if (block === null) {
        return <Loader />
    }

    return (
        <PageWrapper>
            <div className="flex flex-col flex-col-reverse gap-y-4 gap-x-6 xl:flex-row w-full">
                <div className="w-full xl:w-5/12">
                    <div id="block-preview">
                        {ReactHtmlParser(block.output)}
                    </div>
                </div>
                <div className="w-full xl:w-7/12">
                    <div className={`overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 border-${theme}-600 dark:border-${theme}-500 border-t-2`}>
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
        </PageWrapper>
    )
}

export default ViewBlock;
