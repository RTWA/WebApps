import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FlyoutContext } from '../EditBlock';
import { APIClient, FlyoutContent, FlyoutFooter, FlyoutHeader, Input, UserAvatar, UserSuggest, useToasts } from 'webapps-react';

const ShareBlock = ({ block, setBlock }) => {
    const [users, setUsers] = useState([]);

    const { addToast } = useToasts();

    const APIController = new AbortController();
    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    useEffect(() => {
        loadUserData();

        return /* istanbul ignore next */ () => {
            APIController.abort();
            void (isMountedRef.current = false);
        }
    }, []);

    const loadUserData = async () => {
        /* istanbul ignore else */
        if (users.length === 0) {
            await APIClient('/api/users', undefined, { signal: APIController.signal })
                .then(json => {
                    /* istanbul ignore else */
                    if (isMounted()) {
                        setUsers(json.data.users);
                    }
                })
                .catch(/* istanbul ignore next */ error => {
                    if (isMounted()) {
                        addToast('An error occurred loading user data!', '', { appearance: 'error' });
                    }
                });
        }
    }

    const addShare = async user => {
        let inArray = false;
        let i;

        /* istanbul ignore else */
        if (isMounted()) {
            for (i = 0; i < block.shares?.length; i++) {
                /* istanbul ignore else */
                if (block.shares[i].id === user.id && isMounted()) {
                    inArray = true;
                }
            }
        }

        /* istanbul ignore else */
        if (!inArray) {
            await APIClient(`/api/blocks/${block.publicId}/share`,
                { user_id: user.id },
                { signal: APIController.signal }
            )
                .then(json => {
                    /* istanbul ignore else */
                    if (isMounted()) {
                        block.shares = json.data.shares;
                        setBlock({ ...block });
                    }
                })
                .catch(error => {
                    /* istanbul ignore else */
                    if (!error.status?.isAbort && isMounted()) {
                        addToast('Failed to share Block!', error.data?.message, { appearance: 'error' });
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
                /* istanbul ignore else */
                if (isMounted()) {
                    block.shares = json.data.shares;
                    setBlock({ ...block });
                }
            })
            .catch(error => {
                /* istanbul ignore else */
                if (!error.status?.isAbort && isMounted()) {
                    addToast('Failed to remove share!', error.data?.message, { appearance: 'error' });
                }
            });
    }

    const {
        context, toggleShare,
    } = useContext(FlyoutContext);

    if (context !== 'share') {
        return null;
    }

    return (
        <>
            <FlyoutHeader closeAction={toggleShare}>
                Share Block
            </FlyoutHeader>
            <FlyoutContent>
                <UserSuggest
                    id="add_share"
                    users={users}
                    placeholder="Add person by name"
                    limit={5}
                    select={addShare}
                    wrapperClassName="bg-gray-100 dark:bg-gray-800 -mt-6 -mx-6 mb-6 px-6 py-4"
                    label="Add person by name"
                    labelClassName="sr-only"
                />
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
                                                <h3 className="mb-2 sm:mb-1 text-gray-800 dark:text-gray-300 text-base font-normal leading-4">{user.name}</h3>
                                            </div>
                                        </div>
                                        <div className="relative font-normal text-xs sm:text-sm flex items-center text-gray-600 hover:text-red-500 cursor-pointer" data-user={user.id} onClick={removeShare} data-testid={`removeShare-${user.id}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </div>
                                    </div>
                                )
                            })
                        )
                        : (
                            <p className="text-sm">You have not yet shared this Block with anyone.</p>
                        )
                }
            </FlyoutContent>
            <FlyoutFooter>
                <div className="flex flex-col w-full">
                    <label htmlFor="share_link" className="text-gray-600 dark:text-gray-200 text-xs font-normal">Anyone listed above can edit the Block with this link</label>
                    <div className="mt-2">
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
            </FlyoutFooter>
        </>
    );
};

export default ShareBlock;
