import React, { useCallback, useContext, useRef, useState } from 'react';
import classNames from 'classnames';
import ReactHtmlParser from 'react-html-parser';

import { Button, ConfirmDeleteButton, WebAppsUXContext, withWebApps } from 'webapps-react';
import UseBlock from './UseBlock';

const PreviewModal = ({ modals, setModals }) => {
    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    const [tab, setTab] = useState(0);

    const { theme } = useContext(WebAppsUXContext);

    const previewModal = (modals.preview_blocks === undefined) ? false : modals.preview_blocks.show;
    const curBlock = (modals.preview_blocks === undefined) ? null : modals.preview_blocks.block;
    const deleteBlock = (modals.preview_blocks === undefined) ? null : modals.preview_blocks.delete;

    const closeModal = () => {
        delete modals.preview_blocks;
        setModals({ ...modals });
    }

    const modalClass = classNames(
        'absolute',
        'inset-0',
        'overflow-hidden',
        (previewModal) ? 'z-[1100]' : '-z-10'
    )

    const bdClass = classNames(
        'absolute',
        'inset-0',
        'bg-gray-500',
        'bg-opacity-75',
        'transition-opacity',
        'duration-500',
        'ease-in-out',
        (previewModal) ? 'opacity-100' : 'opacity-0'
    )

    const panelClass = classNames(
        'relative',
        'w-screen',
        'max-w-2xl',
        'transform',
        'transition',
        'ease-in-out',
        'duration-500',
        'delay-500',
        (previewModal) ? 'opacity-100' : 'opacity-0'
    )

    const tabClass = id => classNames(
        'text-gray-600',
        'dark:text-gray-300',
        'py-4',
        'flex-grow',
        'hover:text-gray-800',
        'dark:hover:text-gray-500',
        'focus:outline-none',
        (tab === id) ? 'border-b-2' : '',
        (tab === id) ? 'font-medium' : '',
        (tab === id) ? `border-${theme}-600` : '',
        (tab === id) ? `dark:border-${theme}-500` : ''
    )

    const paneClass = id => classNames(
        'py-5',
        'text-gray-700',
        'dark:text-white',
        (tab === id) ? 'block' : 'hidden'
    )

    const deleteAction = () => {
        if (isMounted) {
            deleteBlock(curBlock);
            closeModal();
        }
    }

    if (curBlock === undefined || curBlock === null) {
        return null;
    }

    return (
        <div className={modalClass}>
            <div className={bdClass} aria-hidden="true" onClick={closeModal}></div>
            <section className="h-screen w-full fixed left-0 top-0 flex justify-center items-center" aria-labelledby="slide-over-heading">
                <div className={panelClass}>
                    <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
                        <div className={`px-4 py-4 bg-${theme}-600 dark:bg-${theme}-500 text-white relative`}>
                            <div className="absolute top-0 right-0 -ml-8 pt-4 pr-2 flex sm:-ml-10 sm:pr-4">
                                <button className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                    onClick={closeModal}>
                                    <span className="sr-only">Close panel</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <h2 id="slide-over-heading" className="text-lg font-medium">Block Preview</h2>
                        </div>
                        <nav className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-800">
                            <button className={tabClass(0)} onClick={() => setTab(0)}>
                                Preview
                            </button>
                            <button className={tabClass(1)} onClick={() => setTab(1)}>
                                Use this Block
                            </button>
                            <button className={tabClass(2)} onClick={() => setTab(2)}>
                                Delete this Block
                            </button>
                        </nav>
                        <div className="px-4 sm:px-6">
                            <div className={paneClass(0)}>
                                <div className="flex flex-row">
                                    <div className="w-5/12 px-2" id="block-preview">
                                        {
                                            /* istanbul ignore next */
                                            (curBlock !== undefined) ? ReactHtmlParser(curBlock.output) : ''
                                        }
                                    </div>
                                    <div className="w-7/12">
                                        <h5 className="font-medium text-lg">{curBlock.title}</h5>
                                        <p>{curBlock.notes}</p>
                                        <hr className="py-2" />
                                        <p>This block has been viewed {curBlock.views} times.</p>
                                    </div>
                                </div>
                            </div>
                            <div className={paneClass(1)}>
                                <UseBlock block={curBlock} />
                            </div>
                            <div className={classNames(paneClass(2), 'py-20')}>
                                <ConfirmDeleteButton text="Delete Block" onClick={deleteAction} square size="large" className="mx-auto" />
                            </div>
                        </div>
                        <div className={`border-t border-${theme}-600 dark:border-${theme}-500`}>
                            <Button to={`/blocks/edit/${curBlock.publicId}`} onClick={closeModal} className={`inline-block`} square style="ghost">Edit Block</Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default withWebApps(PreviewModal);
