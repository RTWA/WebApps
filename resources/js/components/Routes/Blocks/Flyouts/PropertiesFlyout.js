import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import UserAvatar from 'react-user-avatar';
import {
    APIClient,
    Button,
    FlyoutContent,
    FlyoutHeader,
    Input,
    UserSuggest,
    useToasts,
    withAuth,
} from 'webapps-react';

import { FlyoutContext } from '../EditBlock';

const PropertiesFlyout = ({ user, checkPermission, ...props }) => {
    const {
        block,
        setBlock,
        update
    } = props;

    const {
        context, toggleProperties
    } = useContext(FlyoutContext);

    const [chown, setChown] = useState(false);
    const [users, setUsers] = useState([]);
    const [newOwner, setNewOwner] = useState({});

    const [canChown, setCanChown] = useState();

    const { addToast } = useToasts();

    const APIController = new AbortController();
    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    useEffect(async () => {
        /* istanbul ignore next */
        if (typeof checkPermission === 'function') {
            await checkPermission('admin.access')
                .then(response => {
                    if (isMounted) {
                        setCanChown(response);
                    }
                });
        } else if (process.env.JEST_WORKER_ID !== undefined && process.env.NODE_ENV === 'test' && isMounted) {
            setCanChown(true);
        }

        return /* istanbul ignore next */ () => {
            APIController.abort();
            void (isMountedRef.current = false);
        }
    }, []);

    useEffect(async () => {
        /* istanbul ignore else */
        if (users.length === 0) {
            await APIClient('/api/users', undefined, { signal: APIController.signal })
                .then(json => {
                    /* istanbul ignore else */
                    if (isMounted) {
                        setUsers(json.data.users);
                    }
                })
                .catch(/* istanbul ignore next */ error => {
                    if (isMounted) {
                        addToast('An error occurred loading user data!', '', { appearance: 'error' });
                    }
                });
        }
    }, [chown]);

    const chownSelect = user => {
        setNewOwner(user);
    }

    const changeOwner = async () => {
        /* istanbul ignore next */
        if (newOwner.id === undefined && isMounted) {
            setChown(false);
            setNewOwner({});
            return;
        }

        if (block.owner === newOwner.id && isMounted) {
            addToast('Unable to change owner to the same user!', '', { appearance: 'error' });
            setChown(false);
            setNewOwner({});
            return;
        }

        await APIClient(`/api/blocks/${block.publicId}/chown`, { old_owner_id: block.owner, new_owner_id: newOwner.id }, { signal: APIController.signal })
            .then(response => {
                /* istanbul ignore else */
                if (isMounted) {
                    newOwner.number_of_blocks++;
                    setNewOwner(newOwner);

                    block.owner = newOwner.id;
                    block.user = newOwner;
                    setBlock(block);

                    addToast('Owner changed successfully!', '', { appearance: 'success' });
                    setChown(false);
                    setNewOwner({});
                }
            })
            .catch(error => {
                /* istanbul ignore else */
                if (isMounted) {
                    addToast(error.data.message, '', { appearance: 'error' });
                    setChown(false);
                    setNewOwner({});
                }
            })
    }

    if (context !== 'properties') {
        return null;
    }

    return (
        <>
            <FlyoutHeader closeAction={toggleProperties}>
                Block Properties
            </FlyoutHeader>
            <FlyoutContent>
                <Input
                    id="prop-title"
                    name="title"
                    label="Block Title:"
                    type="text"
                    value={block.title || ''}
                    onChange={update} />
                <Input
                    id="notes"
                    name="notes"
                    label="Block Notes:"
                    type="text"
                    value={block.notes || ''}
                    onChange={update} />

                <p className="mt-5 text-gray-500">This Block is owned by:</p>
                <div className="flex flex-col border rounded mx-8 my-2">
                    <div className="flex flex-col sm:flex-row items-center p-4 relative">
                        <UserAvatar size="48" name={block.user.name} src={`/user/${block.user.id}/photo`} />
                        <p className="ml-4 text-black dark:text-white font-medium">{block.user.name}</p>
                        {
                            (block.id)
                                ? <p className="mt-3 sm:mt-0 sm:ml-24"><strong>{block.user.number_of_blocks - 1}</strong> other Blocks</p>
                                : <p className="mt-3 sm:mt-0 sm:ml-24"><strong>{block.user.number_of_blocks}</strong> other Blocks</p>
                        }
                        {
                            (canChown && !chown)
                                ? (
                                    <div className="absolute -bottom-0 right-0">
                                        <Button onClick={() => setChown(true)} type="ghost" size="small" color="orange" square className="rounded-br">
                                            Change Owner
                                        </Button>
                                    </div>
                                )
                                : null
                        }
                    </div>
                    {
                        (chown)
                            ? (
                                <div className="px-2 py-1 border-t relative">
                                    <label htmlFor="ownerSuggest" className="sr-only">Enter new owner's username</label>
                                    <UserSuggest id="ownerSuggest" wrapperClassName="" users={users} placeholder="Enter new owner's username" limit={5} select={chownSelect} />
                                    <Button onClick={changeOwner} type="ghost" size="small" color="orange" padding={false} className="px-2 py-1.5 absolute top-3 right-4">
                                        Change Owner
                                    </Button>
                                </div>
                            ) : null
                    }
                </div>

                <p className="mt-5 text-gray-500">
                    This Block has been viewed <span className="text-black dark:text-white font-medium">{block.views || 0}</span> times.
                </p>
            </FlyoutContent>
        </>
    )
}

export default withAuth(PropertiesFlyout);
