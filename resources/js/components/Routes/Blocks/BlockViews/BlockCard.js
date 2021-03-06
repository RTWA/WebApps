import React from 'react';
import parse from 'html-react-parser';
import { Link } from 'react-router-dom';

const BlockCard = ({ block, curBlock, rename, renameBlock, saveName, contextDelete, ...props }) => {
    return (
        <div id={block.publicId} className="w-56 relative rounded bg-white dark:bg-gray-800 p-2 pb-0 shadow focus:outline-none" {...props}>
            <div className="flex items-center border-b border-gray-200 dark:border-gray-900 pb-2">
                <div className="flex w-full items-start justify-between">
                    <div className="w-full truncate">
                        <div className={(block.rename === true) ? 'hidden' : ''}>
                            <p className="truncate text-xl font-medium leading-5 text-gray-800 dark:text-gray-300 focus:outline-none">
                                {block.title || block.publicId}
                            </p>
                        </div>
                        <div className={(block.rename === true) ? '' : 'hidden'}>
                            <label className="sr-only" htmlFor={`rename-${block.publicId}`}>Rename Block: {block.publicId}</label>
                            <input type="text" value={curBlock.title || ''} placeholder="Unnamed Block"
                                className="block w-full -my-2 bg-gray-100 dark:bg-gray-600 border-0 focus:ring-0"
                                id={`rename-${block.publicId}`}
                                onChange={renameBlock} onBlur={() => { saveName(block) }} />
                        </div>
                    </div>
                    {/* {
                        (block.is_pinned)
                            ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-orange-500 fill-orange-500 cursor-pointer" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            )
                            : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-gray-800 dark:stroke-gray-400 hover:stroke-orange-500 dark:hover:stroke-orange-500 hover:fill-orange-500 cursor-pointer transition-color duration-500" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            )
                    } */}
                </div>
            </div>
            <div className="w-54 h-54 overflow-hidden">
                <div className="output preview">{parse(block.output)}</div>
            </div>
            <div className="flex flex-row items-center gap-3 justify-between z-50 rounded-b text-gray-700 bg-gray-800/40 hover:bg-gray-800/80 dark:bg-gray-600/90 dark:hover:bg-gray-600/100 absolute bottom-0 left-0 right-0 p-2 transition-all duration-500">
                <Link to={`/blocks/edit/${block.publicId}`}
                    className="flex items-center gap-1.5 w-5 min-w-5 overflow-hidden hover:w-24 hover:text-lime-600 transition-all ease-in-out duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-lime-600 h-5 w-5 min-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                </Link>
                <a href="#" onClick={(e) => { e.preventDefault(); rename(block); }} data-testid={`rename-${block.publicId}`}
                    className="flex items-center gap-1.5 w-5 min-w-5 overflow-hidden hover:w-24 hover:text-orange-600 transition-all ease-in-out duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-orange-600 h-5 w-5 min-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Rename
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); contextDelete(block); }} data-testid={`delete-${block.publicId}`}
                    className="flex items-center gap-1.5 w-5 min-w-5 overflow-hidden hover:w-24 hover:text-red-600 transition-all ease-in-out duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="text-red-600 h-5 w-5 min-w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                </a>
            </div>
        </div>
    );
}

export default BlockCard;