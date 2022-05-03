import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import UserAvatar from 'react-user-avatar';
import { ModalContext } from '../EditBlock';
import { APIClient, Input, UserSuggest, useToasts } from 'webapps-react';

let _mounted = false;

const ShareBlock = ({ block, setBlock }) => {
    const [users, setUsers] = useState([]);

    const { addToast } = useToasts();

    const APIController = new AbortController();

    useEffect(async () => {
        _mounted = true;

        /* istanbul ignore else */
        if (users.length === 0) {
            await APIClient('/api/users', undefined, { signal: APIController.signal })
                .then(json => {
                    /* istanbul ignore else */
                    if (_mounted) {
                        setUsers(json.data.users);
                    }
                })
                .catch(/* istanbul ignore next */ error => {
                    if (_mounted) {
                        addToast('An error occurred loading user data!', '', { appearance: 'error' });
                    }
                });
        }

        return /* istanbul ignore next */ () => {
            APIController.abort();
            _mounted = false;
        }
    }, []);

    const addShare = async user => {
        let inArray = false;
        let i;

        for (i = 0; i < block.shares?.length; i++) {
            if (block.shares[i].id === user.id) {
                inArray = true;
            }
        }

        if (!inArray) {
            await APIClient(`/api/blocks/${block.publicId}/share`,
                { user_id: user.id },
                { signal: APIController.signal, method: 'POST' }
            )
                .then(json => {
                    block.shares = json.data.shares;
                    setBlock({ ...block });
                })
                .catch(error => {
                    if (!error.status?.isAbort) {
                        // TODO: Handle Errors
                        console.log(error);
                    }
                });
        }
    }

    const removeShare = async e => {
        let user = e.currentTarget.dataset.user;

        await APIClient(`/api/blocks/${block.publicId}/share`,
            { user_id: user },
            { signal: APIController.signal, method: 'DELETE' }
        )
            .then(json => {
                block.shares = json.data.shares;
                setBlock({ ...block });
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    // TODO: Handle Errors
                    console.log(error);
                }
            });
    }

    const {
        modal, toggleShare,
    } = useContext(ModalContext);

    const modalClass = classNames(
        'absolute',
        'inset-0',
        'overflow-hidden',
        (modal === 'share') ? 'z-50' : '-z-10'
    )

    const bdClass = classNames(
        'absolute',
        'inset-0',
        'bg-gray-500',
        'bg-opacity-75',
        'transition-opacity',
        'duration-500',
        'ease-in-out',
        (modal === 'share') ? 'opacity-100' : 'opacity-0'
    )

    const panelClass = classNames(
        'transition',
        'delay-500',
        'duration-500',
        'ease-in-out',
        'md:mt-0',
        'mt-8',
        'top-0',
        'left-0',
        'sm:ml-10',
        'md:ml-10',
        'w-10/12',
        'md:w-1/2',
        (modal === 'share') ? 'opacity-100' : 'opacity-0',
    )

    return (

        <div className={modalClass}>
            <div className={bdClass} aria-hidden="true" onClick={toggleShare}></div>
            <section className="h-screen w-full fixed left-0 top-0 flex justify-center items-center">
                <div className={panelClass}>
                    <div className="w-full bg-white rounded shadow-2xl">
                        <div className="bg-gray-200 rounded-t py-4 px-4 xl:px-8 flex flex-row gap-4">
                            <UserSuggest id="add_share" users={users} placeholder="Add person by name" limit={5} select={addShare} wrapperClassName="relative w-full" />
                            <button className="rounded-md text-gray-600 hover:text-gray-900" onClick={toggleShare}>
                                <span className="sr-only">Close panel</span>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="w-full h-full px-4 xl:px-8 pt-3 pb-5">
                            <p className="text-sm mb-4">The following people also have access to edit this Block.</p>
                            {
                                (block.shares?.length >= 1)
                                    ? (
                                        block.shares.map(function (user, i) {
                                            return (
                                                <div className="flex justify-between items-center" key={i}>
                                                    <div className="flex items-center gap-x-4">
                                                        <UserAvatar size="48" name={user.name} src={`/user/${user.id}/photo`} />
                                                        <div>
                                                            <h3 className="mb-2 sm:mb-1 text-gray-800 text-base font-normal leading-4">{user.name}</h3>
                                                        </div>
                                                    </div>
                                                    <div className="relative font-normal text-xs sm:text-sm flex items-center text-gray-600 hover:text-red-500 cursor-pointer" data-user={user.id} onClick={removeShare}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )
                                    : (
                                        <>No Shares Setup... Test Build etc.</>
                                    )
                            }
                            <hr className="my-5 border-t border-gray-200" />
                            <label htmlFor="share_link" className="text-gray-600 text-xs font-normal">Anyone listed above can edit the Block with this link</label>
                            <div className="flex items-stretch mt-2">
                                <div className="relative w-full">
                                    <CopyToClipboard text={window.location.href} onCopy={/* istanbul ignore next */ () => { addToast("Copied to clipboard!", '', { appearance: 'success' }) }}>
                                        <Input
                                            id="share_link"
                                            name="share_link"
                                            action={
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            }
                                            actionLocation="left"
                                            wrapperClassName=""
                                            readOnly
                                            value={window.location.href}
                                        />
                                    </CopyToClipboard>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ShareBlock;
