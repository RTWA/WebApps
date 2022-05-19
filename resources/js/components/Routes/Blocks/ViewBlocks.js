import React, { useCallback, useEffect, useRef, useState } from 'react';

import { confirmAlert } from 'react-confirm-alert';

import { APIClient, Button, ConfirmDeleteModal, Loader, PageWrapper, useToasts, withWebApps } from 'webapps-react';
import { Grid, Filter, NoBlocks } from './BlockViews';

let lastUri = '';
let load = 30;

const ViewBlocks = ({ modals, setModals, ...props }) => {
    const username = props.match.params.username;
    const ownBlocks = (username === undefined);

    const [total, setTotal] = useState(30);
    const [hasBlocks, setHasBlocks] = useState(true);
    const [blocks, setBlocks] = useState([]);
    const [tmpBlocks, setTmpBlocks] = useState([]);
    const [curBlock, setCurBlock] = useState([]);
    const [plugins, setPlugins] = useState([]);
    const [filter, setFilter] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const { addToast, updateToast } = useToasts();
    let toastId = 0;

    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    const APIController = new AbortController();

    useEffect(async () => {
        // Get all available Plugins
        await APIClient('/api/plugins/active', undefined, { signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (isMounted) {
                    setPlugins(json.data.plugins);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (!error.status?.isAbort && isMounted) {
                    // TODO: Handle errors
                    console.error(error);
                }
            });

        // Get first set of Blocks
        let uri = (ownBlocks) ? `/api/blocks?limit=${load}&offset=0`
            : `/api/blocks/user/${username}?limit=${load}&offset=0`
        await APIClient(uri, undefined, { signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (isMounted) {
                    if (json.data.message === "No blocks found.") {
                        setHasBlocks(false);
                        return;
                    }
                    Object.keys(json.data.styles).map(function (i) {
                        if (!document?.querySelectorAll('style[ref=' + i + ']').length) {
                            let style = document?.createElement("style");
                            style.setAttribute("ref", i);
                            style.innerHTML = json.data.styles[i];
                            document?.head.appendChild(style);
                        }
                    });
                    if (json.data.total <= load) {
                        setHasMore(false);
                    }
                    setTotal(json.data.total);
                    setHasBlocks((json.data.blocks.length !== 0));
                    setBlocks(json.data.blocks);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (!error.status?.isAbort && isMounted) {
                    // TODO: Handle errors
                    console.error(error);
                }
            });

        return /* istanbul ignore next */ () => {
            APIController.abort();
            void (isMountedRef.current = false);
        }
    }, []);

    useEffect(() => {
        /* istanbul ignore else */
        if (blocks !== undefined && isMounted) {
            if ((blocks.length + load) >= (total + load - 1)) {
                setHasMore(false);
            }
        }
    }, [blocks]);

    useEffect(() => {
        /* istanbul ignore else */
        if (filter !== null && blocks.length === 0 && isMounted) {
            loadMore();
        }
    }, [filter, blocks]);

    useEffect(() => {
        /* istanbul ignore else */
        if (modals.preview_blocks !== undefined && isMounted) {
            modals.preview_blocks.block = curBlock;
            setModals({ ...modals });
        }
    }, [curBlock]);

    const loadMore = async () => {
        let offset = (filter === null) ? blocks.length : 0;
        let uri = (ownBlocks) ? `/api/blocks?limit=${load}&offset=${offset}&filter=${filter}`
            : `/api/blocks/user/${username}?limit=${load}&offset=${offset}&filter=${filter}`;

        if (lastUri !== uri) {
            lastUri = uri;
            await APIClient(uri, undefined, { signal: APIController.signal })
                .then(json => {
                    /* istanbul ignore else */
                    if (document) {
                        Object.keys(json.data.styles).map(function (i) {
                            if (!document.querySelectorAll('style[ref=' + i + ']').length) {
                                let style = document.createElement("style");
                                style.setAttribute("ref", i);
                                style.innerHTML = json.data.styles[i];
                                document.head.appendChild(style);
                            }
                        });
                    }
                    Object.keys(json.data.blocks).map(function (i) { blocks.push(json.data.blocks[i]); });
                    if (isMounted) {
                        setTotal(json.data.total);
                        setBlocks([...blocks]);
                    }
                })
                .catch(/* istanbul ignore next */ error => {
                    if (!error.status?.isAbort && isMounted) {
                        // TODO: Handle errors
                        console.error(error);
                    }
                });
        }
    };

    const rename = _block => {
        blocks.map(function (b, i) {
            /* istanbul ignore else */
            if (_block.publicId === b.publicId) {
                _block.rename = true;
                blocks[i] = _block;
            }
        });
        /* istanbul ignore else */
        if (isMounted) {
            setBlocks(blocks);
            setCurBlock(_block);
        }
    }

    const renameBlock = e => {
        /* istanbul ignore else */
        if (isMounted) {
            curBlock.title = e.target.value;
            setCurBlock({ ...curBlock });
        }
    }

    const saveName = async _block => {
        addToast(
            "Saving changes, please wait...",
            '',
            { appearance: 'info', autoDismiss: false },
            (id) => toastId = id
        );

        let tmpBlocks = blocks;
        let tmpBlock = curBlock;

        tmpBlocks.map(function (b, i) {
            /* istanbul ignore else */
            if (_block === b) {
                tmpBlock.rename = false;
                tmpBlocks[i] = tmpBlock;
            }
        });

        await APIClient(`/api/blocks/${tmpBlock.publicId}`, { block: JSON.stringify(tmpBlock) }, { method: 'PUT', signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (isMounted) {
                    updateToast(
                        toastId,
                        {
                            appearance: 'success',
                            autoDismiss: true,
                            title: json.data.message
                        }
                    );
                    setBlocks(tmpBlocks);
                    setCurBlock([]);
                }
            })
            .catch(error => {
                /* istanbul ignore else */
                if (isMounted) {
                    updateToast(
                        toastId,
                        {
                            appearance: 'error',
                            autoDismiss: true,
                            title: 'An unknown error occurred.'
                        }
                    )
                }
            })
    }

    const contextDelete = _block => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <ConfirmDeleteModal
                        onConfirm={() => { deleteBlock(_block); onClose(); }}
                        onCancel={onClose}
                        message={"Are you sure you wish to delete this block?\nThis action cannot be undone"} />
                );
            }
        });
    }

    const deleteBlock = async _block => {
        await APIClient(`/api/blocks/${_block.publicId}`, undefined, { method: 'DELETE', signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (isMounted) {
                    Object(blocks).map(function (b, i) {
                        /* istanbul ignore else */
                        if (b === _block)
                            delete blocks[i];
                    });

                    let _blocks = blocks.filter(/* istanbul ignore next */ function () {
                        return true;
                    });
                    setBlocks(_blocks);
                    setCurBlock([]);

                    delete modals.preview_blocks;
                    setModals({ ...modals });

                    /* istanbul ignore else */
                    if (total === 1) {
                        setHasBlocks(false);
                    }
                    setTotal(total - 1);

                    addToast(json.data.message, '', { appearance: 'success' });
                }
            })
            .catch(error => {
                console.log(error);
                /* istanbul ignore else */
                if (isMounted) {
                    addToast('Unable to delete block.', '', { appearance: 'error' });
                }
            })
    }

    const previewBlock = _block => {
        /* istanbul ignore else */
        if (isMounted) {
            setCurBlock(_block);
            modals.preview_blocks = {
                show: true,
                block: _block,
                delete: deleteBlock
            }
            setModals({ ...modals });
        }
    }

    const blockFilter = e => {
        if (e.target.value !== filter) {
            if (e.target.value !== '' && filter === null) {
                setTmpBlocks(blocks);
                setBlocks([]);
                setTotal(30);
                setHasMore(true);
                setFilter(e.target.value);
            } else if (e.target.value !== '' && filter !== null) {
                setBlocks([]);
                setTotal(30);
                setHasMore(true);
                setFilter(e.target.value);
            } else {
                setTotal(tmpBlocks.length + 1);
                setBlocks(tmpBlocks);
                setHasMore(true);
                setTmpBlocks([]);
                setFilter(null);
            }
        }
    }

    if (blocks.length === 0 && filter === null && hasBlocks) {
        return <Loader />
    }

    if (!hasBlocks)
        return (
            <PageWrapper>
                <NoBlocks>
                    {
                        (ownBlocks) ?
                            (<h4>You have not created any blocks yet.<br />
                                <Button style="link" to="/blocks/new">Why not create one now?</Button>
                            </h4>)
                            : (<h4>This user has not created any blocks yet.</h4>)
                    }

                </NoBlocks>
            </PageWrapper>
        )

    return (
        <PageWrapper>
            <Filter plugins={plugins} blockFilter={blockFilter} />
            <Grid
                blocks={blocks}
                rename={rename}
                renameBlock={renameBlock}
                contextDelete={contextDelete}
                saveName={saveName}
                previewBlock={previewBlock}
                loadMore={loadMore}
                hasMore={hasMore} />
        </PageWrapper>
    )
}

export default withWebApps(ViewBlocks);