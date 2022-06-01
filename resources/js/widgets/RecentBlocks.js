import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Moment from 'react-moment';
import { APIClient, Button, Loader } from 'webapps-react';

// import ReactDOM from 'react-dom';

import { NoBlocks } from '../components/Routes/Blocks';

const RecentBlocks = () => {
    const [blocks, setBlocks] = useState(null);
    const [noAccess, setNoAccess] = useState(false);

    const APIController = new AbortController();

    const history = useHistory();
    const handleClick = (block) => history.push(`/blocks/edit/${block.publicId}`);

    useEffect(() => {
        loadRecent();
        return () => {
            APIController.abort();
        }
    }, []);

    const loadRecent = async () => {
        await APIClient('/api/blocks?limit=5&offset=0&filter=', undefined, { signal: APIController.signal })
            .then(json => {
                const { blocks, styles } = json.data;
                if (blocks !== undefined) {
                    Object.keys(styles).map(function (i) {
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

    if (noAccess) {
        return null;
    }

    if (blocks === null) {
        return (
            <div className="relative flex flex-col min-w-0 break-words dark:text-white bg-white dark:bg-gray-800 w-full max-w-1/2-gap-3 shadow-lg rounded">
                <div className="rounded-t mb-0 px-4 py-3 border-0">
                    <div className="flex flex-wrap items-center">
                        <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                            <h3 className="font-semibold text-base text-gray-700 dark:text-gray-300">Your Recent Blocks</h3>
                        </div>
                    </div>
                </div>
                <div className="block w-full h-full min-h-[17.5rem] overflow-hidden">
                    <table className="items-center w-full h-full bg-transparent border-collapse">
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
                                    <Loader className="text-gray-600 dark:text-gray-200" />
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
                    <Button href="/blocks/new" type="link" className="-mx-4">Why not create one now?</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative flex flex-col min-w-0 break-words dark:text-white bg-white dark:bg-gray-800 w-full max-w-1/2-gap-3 shadow-lg rounded">
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
                                <tr key={i} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleClick(block)}>
                                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">{(block.plugin) ? block.plugin.name : 'Unavailable'}</td>
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
