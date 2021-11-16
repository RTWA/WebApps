import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { confirmAlert } from 'react-confirm-alert';
import { useToasts } from 'react-toast-notifications';

import { Button, ConfirmDeleteModal, Loader, withWebApps } from 'webapps-react';
import { Grid, Filter, NoBlocks } from './BlockViews';

let lastUri = '';
let load = 30;

const ViewBlocks = ({ UI, modals, setModals, ...props }) => {
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

    useEffect(() => {
        // Get all available Plugins
        axios.get('/api/plugins')
            .then(json => {
                setPlugins(json.data.plugins);
            })
            .catch(/* istanbul ignore next */ error => {
                // TODO: Handle errors
                console.error(error);
            });

        // Get first set of Blocks
        let uri = (ownBlocks) ? `/api/blocks?limit=${load}&offset=0`
            : `/api/blocks/user/${username}?limit=${load}&offset=0`
        axios.get(uri)
            .then(json => {
                if (json.data.message === "No blocks found.") {
                    setHasBlocks(false);
                    return;
                }
                Object.keys(json.data.styles).map(function(i) { 
                    if (!document.querySelectorAll('style[ref=' + i + ']').length) {
                        let style = document.createElement("style");
                        style.setAttribute("ref", i);
                        style.innerHTML = json.data.styles[i];
                        document.head.appendChild(style);
                    }
                });
                if (json.data.total <= load) {
                    setHasMore(false);
                }
                setTotal(json.data.total);
                setHasBlocks((json.data.blocks.length !== 0));
                setBlocks(json.data.blocks);
            })
            .catch(/* istanbul ignore next */ error => {
                // TODO: handle errors
                console.error(error)
            });
    }, []);

    useEffect(() => {
        /* istanbul ignore else */
        if (blocks !== undefined) {
            if ((blocks.length + load) >= (total + load - 1)) {
                setHasMore(false);
            }
        }
    }, [blocks]);

    useEffect(() => {
        if (filter !== null && blocks.length === 0) {
            loadMore();
        }
    }, [filter, blocks]);

    useEffect(() => {
        if (modals.preview_blocks !== undefined) {
            modals.preview_blocks.block = curBlock;
            setModals({ ...modals });
        }
    }, [curBlock]);

    const loadMore = () => {
        let offset = (filter === null) ? blocks.length : 0;
        let uri = (ownBlocks) ? `/api/blocks?limit=${load}&offset=${offset}&filter=${filter}`
            : `/api/blocks/user/${username}?limit=${load}&offset=${offset}&filter=${filter}`;

        if (lastUri !== uri) {
            lastUri = uri;
            axios.get(uri)
                .then(json => {                    
                    Object.keys(json.data.styles).map(function(i) { 
                        if (!document.querySelectorAll('style[ref=' + i + ']').length) {
                            let style = document.createElement("style");
                            style.setAttribute("ref", i);
                            style.innerHTML = json.data.styles[i];
                            document.head.appendChild(style);
                        }
                    });
                    setTotal(json.data.total);
                    Object.keys(json.data.blocks).map(function (i) { blocks.push(json.data.blocks[i]); });
                    setBlocks([...blocks]);
                })
                .catch(/* istanbul ignore next */ error => {
                    // TODO: handle errors
                    console.error(error)
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
        setBlocks(blocks);
        setCurBlock(_block);
    }

    const renameBlock = e => {
        curBlock.title = e.target.value;
        setCurBlock({ ...curBlock });
    }

    const saveName = _block => {
        addToast(
            "Saving changes, please wait...",
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

        let formData = new FormData();
        formData.append('_method', "PUT");
        formData.append('block', JSON.stringify(tmpBlock));

        axios.post(`/api/blocks/${tmpBlock.publicId}`, formData)
            .then(json => {
                updateToast(
                    toastId,
                    {
                        appearance: 'success',
                        autoDismiss: true,
                        content: json.data.message
                    }
                );
                setBlocks(tmpBlocks);
                setCurBlock([]);
            })
            .catch(error => {
                updateToast(
                    toastId,
                    {
                        appearance: 'error',
                        autoDismiss: true,
                        content: 'An unknown error occurred.'
                    }
                )
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

    const deleteBlock = _block => {
        let formData = new FormData();
        formData.append("_method", "DELETE");

        axios.post(`/api/blocks/${_block.publicId}`, formData)
            .then(json => {
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

                addToast(json.data.message, { appearance: 'success' });
            })
            .catch(error => {
                addToast('Unable to delete block.', { appearance: 'error' });
            })
    }

    const previewBlock = _block => {
        setCurBlock(_block);
        modals.preview_blocks = {
            show: true,
            block: _block,
            delete: deleteBlock
        }
        setModals({ ...modals });
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
            <NoBlocks>
                {
                    (ownBlocks) ?
                        (<h4>You have not created any blocks yet.<br />
                            <Button style="link" to="/blocks/new">Why not create one now?</Button>
                        </h4>)
                        : (<h4>This user has not created any blocks yet.</h4>)
                }

            </NoBlocks>
        )

    return (
        <>
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
        </>
    )
}

export default withWebApps(ViewBlocks);