import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { DropDownButton, InfiniteScroll } from 'webapps-react';
import BlockCard from './BlockCard';

const Grid = ({ blocks, loadMore, hasMore, ...props }) => {

    const dots = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
    )

    if (blocks.length === 0) {
        return (
            <div className="text-center p-4">No matching blocks found.</div>
        )
    }

    return (
        <InfiniteScroll
            loadMore={loadMore}
            hasMore={hasMore}>
            <div className="flex flex-wrap gap-4">
                {
                    blocks.map((block, i) => {
                        return <BlockCard block={block} key={i} {...props} />
                        return (
                            <div key={i} id={block.publicId} className="block relative shadow-lg rounded-2xl p-4 bg-white dark:bg-gray-700 sm:mx-4 mb-4">
                                <div className="flex items-center justify-between mb-6">
                                    <span onClick={() => { previewBlock(block) }}
                                        className={(block.rename === true) ? 'hidden' : 'font-bold text-md text-black dark:text-white ml-2'}>
                                        {block.title || block.publicId}
                                    </span>
                                    <label className="sr-only" htmlFor={`rename-${block.publicId}`}>Rename Block: {block.publicId}</label>
                                    <input type="text" value={block.title || ''} placeholder="Unnamed Block"
                                        className={classNames(
                                            'block w-full -my-2 bg-gray-100 dark:bg-gray-600 border-0 focus:ring-0',
                                            (block.rename !== true) ? 'hidden' : ''
                                        )}
                                        id={`rename-${block.publicId}`}
                                        onChange={renameBlock} onBlur={() => { saveName(block) }} />

                                    <div className="flex items-center">
                                        <DropDownButton text={dots} style="link" dropClassNames="-mt-2" color="gray" buttonClassNames="-my-2" size="small" data-testid={`context-${block.publicId}`}>
                                            <div>
                                                <a href="#" onClick={(e) => { e.preventDefault(); previewBlock(block); }}
                                                    className="flex flex-row px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Preview
                                                </a>
                                            </div>
                                            <div>
                                                <Link to={`/blocks/edit/${block.publicId}`}
                                                    className="flex flex-row px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                            </div>
                                            <div>
                                                <a href="#" onClick={(e) => { e.preventDefault(); rename(block); }}
                                                    className="flex flex-row px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                    Rename
                                                </a>
                                            </div>
                                            <div>
                                                <a href="#" onClick={(e) => { e.preventDefault(); contextDelete(block); }}
                                                    className="flex flex-row px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </a>
                                            </div>
                                        </DropDownButton>
                                    </div>
                                </div>

                                <div onClick={() => { previewBlock(block) }}>
                                    <div className="output preview overflow-hidden">{ReactHtmlParser(block.output)}</div>
                                    <div className="overlay z-10">{block.notes}</div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
            {
                (hasMore)
                    ? <button type="button" onClick={loadMore} className="sr-only">Load More</button>
                    : null
            }
        </InfiniteScroll>
    )
}

export default Grid;