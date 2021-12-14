import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Moment from 'react-moment';
import { Button, Loader, WebApps, WebAppsContext } from 'webapps-react';

// import ReactDOM from 'react-dom';

import { NoBlocks } from '../components/Routes/Blocks';

const RecentBlocks = () => {
    const { modals, setModals } = useContext(WebAppsContext);
    const [blocks, setBlocks] = useState(null);
    const [noAccess, setNoAccess] = useState(false);

    useEffect(() => {
        loadRecent();
        return () => {
            delete modals.preview_blocks;
            setModals({ ...modals });
        }
    }, []);

    const loadRecent = () => {
        axios.get('/api/blocks?limit=5&offset=0&filter=')
            .then(json => {
                const { blocks, styles } = json.data;
                if (blocks !== undefined) {
                    Object.keys(styles).map(function(i) { 
                        if (!document.querySelectorAll('style[ref=' + i + ']').length) {
                            let style = document.createElement("style");
                            style.setAttribute("ref", i);
                            style.innerHTML = styles[i];
                            document.head.appendChild(style);
                        }
                    });
                    setBlocks(blocks);
                } else {
                    setBlocks([]);
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 403) {
                    setNoAccess(true);
                }
            });
    }

    const previewBlock = block => {
        modals.preview_blocks = {
            show: true,
            block: block,
            delete: deleteBlock,
        }
        setModals({ ...modals });
    }

    const deleteBlock = () => {
        let formData = new FormData();
        formData.append('_method', 'DELETE');

        axios.post(`/api/blocks/${modals.preview_blocks.block.publicId}`, formData)
            .then(json => {
                Object(blocks).map(function (b, i) {
                    if (b === modals.preview_blocks.block) {
                        delete blocks[i];
                    }
                });
                let _blocks = blocks.filter(function () {
                    return true;
                });
                setBlocks(_blocks);
                delete modals.preview_blocks;
                setModals({ ...modals });
                loadRecent();
            })
            .catch(error => {
                // TODO: Handle Errors
                console.log(error);
            });
    }
    if (noAccess) {
        return null;
    }

    if (blocks === null) {
        return (
            <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full max-w-1/2-gap-3 shadow-lg rounded">
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                    <div className="flex flex-wrap items-center">
                        <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                            <h3 className="font-semibold text-base text-gray-700 dark:text-gray-300">Your Recent Blocks</h3>
                        </div>
                    </div>
                </div>
                <div className="block w-full h-full overflow-hidden">
                    <table className="items-center w-full bg-transparent border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-50 align-middle border border-gray-100 dark:border-transparent py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                    Block Type
                                </th>
                                <th className="px-6 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-50 align-middle border border-gray-100 dark:border-transparent py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                    Title
                                </th>
                                <th className="px-6 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-50 align-middle border border-gray-100 dark:border-transparent py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                    Views
                                </th>
                                <th className="px-6 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-50 align-middle border border-gray-100 dark:border-transparent py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="5">
                                    <Loader className="text-gray-600 dark:text-gray-200 top-0" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    if (blocks.length === 0) {
        return (
            <div className="w-full h-full flex flex-wrap lg:flex-auto items-center">
                <div className="-mt-20 mx-auto lg:mx-0">
                    <NoBlocks size="56" />
                </div>
                <div className="flex flex-col text-center lg:text-left w-full lg:w-auto lg:border-l border-gray-500 pl-3">
                    <p className="text-xl">You have not created any blocks yet.</p>
                    <Button href="/blocks/new" style="link" className="-mx-4">Why not create one now?</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full max-w-1/2-gap-3 shadow-lg rounded">
            <div className="rounded-t mb-0 px-4 py-3 border-0">
                <div className="flex flex-wrap items-center">
                    <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                        <h3 className="font-semibold text-base text-gray-700 dark:text-gray-300">Your Recent Blocks</h3>
                    </div>
                </div>
            </div>
            <div className="block w-full overflow-x-auto">
                <table className="items-center w-full bg-transparent border-collapse">
                    <thead>
                        <tr>
                            <th className="px-6 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-50 align-middle border border-gray-100 dark:border-transparent py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                Block Type
                            </th>
                            <th className="px-6 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-50 align-middle border border-gray-100 dark:border-transparent py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                Title
                            </th>
                            <th className="px-6 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-50 align-middle border border-gray-100 dark:border-transparent py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                Views
                            </th>
                            <th className="px-6 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-50 align-middle border border-gray-100 dark:border-transparent py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                                Created
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            blocks.map((block, i) => (
                                <tr key={i} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900" onClick={() => previewBlock(block)}>
                                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">{block.plugin.name}</td>
                                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">{block.title || block.publicId}</td>
                                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"
                                        style={{ width: '5%' }}>{block.views}</td>
                                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4"><Moment fromNow>{block.created_at}</Moment></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RecentBlocks;

// ReactDOM.render(
//     <WebApps>
//         <RecentBlocks />
//     </WebApps>,
//     document.getElementById('RecentBlocks_Widget')
// );
