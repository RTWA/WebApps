import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import UserAvatar from 'react-user-avatar';
import { Button, UserSuggest, withAuth, useToasts, withWebApps, APIClient } from 'webapps-react';
import { PropertiesContext } from '../EditBlock';

let _mounted = false;

const PropertiesFlyout = ({ user, checkPermission, UI, ...props }) => {
    const {
        block,
        setBlock,
        update
    } = props;

    const {
        properties, toggleProperties,
    } = useContext(PropertiesContext);

    const [chown, setChown] = useState(false);
    const [users, setUsers] = useState([]);
    const [newOwner, setNewOwner] = useState({});

    const [canChown, setCanChown] = useState();

    const { addToast } = useToasts();

    useEffect(async () => {
        _mounted = true;

        /* istanbul ignore next */
        if (typeof checkPermission === 'function') {
            await checkPermission('admin.access')
                .then(response => {
                    if (_mounted) {
                        setCanChown(response);
                    }
                });
        } else if (process.env.JEST_WORKER_ID !== undefined && process.env.NODE_ENV === 'test') {
            setCanChown(true);
        }

        return /* istanbul ignore next */ () => { _mounted = false; }
    }, []);

    useEffect(async () => {
        /* istanbul ignore else */
        if (users.length === 0) {
            await APIClient('/api/users')
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
    }, [chown]);

    const chownSelect = user => {
        setNewOwner(user);
    }

    const changeOwner = async () => {
        /* istanbul ignore next */
        if (newOwner.id === undefined) {
            setChown(false);
            setNewOwner({});
            return;
        }

        if (block.owner === newOwner.id) {
            addToast('Unable to change owner to the same user!', '', { appearance: 'error' });
            setChown(false);
            setNewOwner({});
            return;
        }

        await APIClient(`/api/blocks/${block.publicId}/chown`, { old_owner_id: block.owner, new_owner_id: newOwner.id })
            .then(response => {
                /* istanbul ignore else */
                if (_mounted) {
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
                if (_mounted) {
                    addToast(error.data.message, '', { appearance: 'error' });
                    setChown(false);
                    setNewOwner({});
                }
            })
    }

    const flyoutClass = classNames(
        'absolute',
        'inset-0',
        'overflow-hidden',
        (properties) ? 'z-50' : '-z-10'
    )

    const bdClass = classNames(
        'absolute',
        'inset-0',
        'bg-gray-500',
        'bg-opacity-75',
        'transition-opacity',
        'duration-500',
        'ease-in-out',
        (properties) ? 'opacity-100' : 'opacity-0'
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
        (properties) ? 'translate-x-0' : 'translate-x-full'
    )

    return (
        <div className={flyoutClass}>
            <div className={bdClass} aria-hidden="true" onClick={toggleProperties}></div>
            <section className="absolute inset-y-0 right-0 sm:pl-10 max-w-full flex" aria-labelledby="slide-over-heading">
                <div className={panelClass}>
                    <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl overflow-y-auto relative">
                        <div className={`px-4 sm:px-6 py-6 bg-${UI.theme}-600 dark::bg-${UI.theme}-500 text-white dark:text-gray-200`}>
                            <div className="absolute top-0 right-0 -ml-8 pt-6 pr-2 flex sm:-ml-10 sm:pr-4">
                                <button className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                    onClick={toggleProperties}>
                                    <span className="sr-only">Close panel</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <h2 id="slide-over-heading" className="text-lg font-medium">Block Properties</h2>
                        </div>
                        <div className="mt-6 relative flex-1 px-4 sm:px-6">
                            <div className="absolute inset-0 px-4 sm:px-6">
                                <div className="h-full" aria-hidden="true">
                                    <div className="text-gray-500"><label htmlFor="prop-title">Block Title:</label></div>
                                    <input name="title"
                                        type="text"
                                        id="prop-title"
                                        value={block.title || ''}
                                        onChange={update}
                                        className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`} />

                                    <div className="mt-5 text-gray-500"><label htmlFor="notes">Block Notes:</label></div>
                                    <textarea name="notes"
                                        type="text"
                                        id="notes"
                                        value={block.notes || ''}
                                        onChange={update}
                                        className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`} />

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
                                                            <Button onClick={() => setChown(true)} style="ghost" size="small" color="orange" square className="rounded-br">
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
                                                    <div className="px-2 pb-2 border-t relative">
                                                        <label htmlFor="ownerSuggest" className="sr-only">Enter new owner's username</label>
                                                        <UserSuggest id="ownerSuggest" users={users} placeholder="Enter new owner's username" limit={5} select={chownSelect} />
                                                        <Button onClick={changeOwner} style="ghost" size="small" color="orange" square className="absolute inset-y-2 right-2">
                                                            Change Owner
                                                        </Button>
                                                    </div>
                                                ) : null
                                        }
                                    </div>

                                    <p className="mt-5 text-gray-500">
                                        This Block has been viewed <span className="text-black dark:text-white font-medium">{block.views || 0}</span> times.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default withAuth(withWebApps(PropertiesFlyout));
