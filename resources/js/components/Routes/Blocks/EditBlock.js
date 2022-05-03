import React, { createContext, useEffect, useState } from 'react';
import { Route } from 'react-router-dom';

import ReactHtmlParser, { convertNodeToElement } from "react-html-parser";

import { Image, Repeater, Select, Switch, Text } from '../../Fields';
import PropertiesFlyout from './Flyouts/PropertiesFlyout';
import ShareBlock from './Modals/ShareBlock';
import { OrphanedBlock } from './BlockViews';
import { APIClient, Button, Icon, Input, Loader, useToasts, withWebApps } from 'webapps-react';
import html2canvas from 'html2canvas';

export const ModalContext = createContext({});

const Fields = {
    image: Image,
    repeater: Repeater,
    select: Select,
    switch: Switch,
    text: Text,
};

let value = '';
let index = 0;
let mounted = false;
let saving = false;

const EditBlock = ({ UI, ...props }) => {
    const [block, setBlock] = useState(null);
    const [repeater, setRepeater] = useState(0);
    const [modal, setModal] = useState(null);
    /* istanbul ignore next */
    const [id, setId] = useState(props.id || props.match.params.id);

    const { addToast, updateToast } = useToasts();
    let toastId = 0;

    const APIController = new AbortController();

    useEffect(() => {
        mounted = true;
        loadBlockData();

        return () => {
            APIController.abort();
            mounted = false
        };
    }, []);

    useEffect((block) => {
        /* istanbul ignore next */
        if (mounted && block !== undefined) {
            if (block.scripts !== undefined) {
                eval(block.scripts);
            }
            if (block.preview.repeater !== undefined) {
                eval(block.preview.repeater);
            }
        }
    }, [block]);

    useEffect(() => {
        if (mounted && block !== null) {
            /* istanbul ignore else */
            if (block.preview.repeater !== undefined) {
                eval(block.preview.repeater);
            }
        }
    }, [repeater]);

    const loadBlockData = async () => {
        await APIClient(`/api/blocks/${id}?edit=true`, undefined, { signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (mounted) {
                    Object.keys(json.data.styles).map(function (i) {
                        if (!document.querySelectorAll('style[ref=' + i + ']').length) {
                            let style = document.createElement("style");
                            style.setAttribute("ref", i);
                            style.innerHTML = json.data.styles[i];
                            document.head.appendChild(style);
                        }
                    });
                    setBlock(json.data.block);
                }
            })
            .catch(/* istanbul ignore next */ error => {
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            });
    }

    const saveBlockData = async e => {
        e.preventDefault();

        /* istanbul ignore else */
        if (mounted) {
            saving = true;
        }

        addToast(
            "Saving changes, please wait...",
            '',
            { appearance: 'info', autoDismiss: false },
            (id) => toastId = id
        );

        await APIClient(`/api/blocks/${id}`, { block: JSON.stringify(block) }, { method: 'PUT', signal: APIController.signal })
            .then(json => {
                /* istanbul ignore else */
                if (mounted) {
                    saving = false;

                    updateToast(
                        toastId,
                        {
                            appearance: 'success',
                            autoDismiss: true,
                            title: json.data.message
                        }
                    );
                    /* istanbul ignore next */
                    props.history?.push(`/blocks/view/${block.publicId}`);
                }
            })
            .catch(() => {
                updateToast(
                    toastId,
                    {
                        appearance: 'error',
                        autoDismiss: true,
                        autoDismissTimeout: 5000,
                        title: "An error occurred whilst saving the block."
                    }
                );

                /* istanbul ignore else */
                if (mounted)
                    saving = false;
            });
    }

    const update = (field, value, ref, index) => {
        if (ref !== undefined && mounted) {
            block.settings[ref][index][field] = value;
            setBlock({ ...block });
        } else
            /* istanbul ignore else */
            if (mounted) {
                block.settings[field] = value;
                setBlock({ ...block });
            }
    }

    const updateBlockProperties = e => {
        let name = e.target.name;
        block[name] = e.target.value;

        /* istanbul ignore else */
        if (mounted)
            setBlock({ ...block });
    }

    const toggleProperties = e => {
        e.preventDefault();
        /* istanbul ignore else */
        if (mounted && modal !== 'properties') {
            setModal('properties');
        } else if (mounted) {
            setModal(null);
        }
    }

    const toggleShare = e => {
        e.preventDefault();
        /* istanbul ignore else */
        if (mounted && modal !== 'share') {
            setModal('share');
        } else if (mounted) {
            setModal(null);
        }
    }

    const toggleRepeater = tab => {
        if (repeater === tab) {
            setRepeater(-1);
        } else {
            setRepeater(tab);
        }
    }

    const addRepeater = e => {
        e.preventDefault();

        let name = e.target.dataset.name;
        let _new = JSON.parse(JSON.stringify(block.new[name][0]));
        block.settings[name] = block.settings[name].concat(_new);
        setBlock({ ...block });
        setRepeater(block.settings[name].length - 1);
    }

    const removeRepeater = (field, i) => {
        delete block.settings[field][i];
        block.settings[field] = block.settings[field].filter(function () {
            return true;
        })
        setBlock({ ...block });
    }

    /* istanbul ignore next */
    const repeaterSortEnd = (collection, oldIndex, newIndex) => {
        let oldObject = block.settings[collection][oldIndex];
        let newObject = block.settings[collection][newIndex];

        block.settings[collection][oldIndex] = newObject;
        block.settings[collection][newIndex] = oldObject;
        setBlock({ ...block });
    }

    const transform = (node, key) => {
        let Get = get;
        if (node.type === "tag" && 'data-val' in node.attribs) {
            let variable = node.attribs['data-val'];
            if (Get(variable) !== "") {
                node.children = [{
                    data: Get(variable),
                    next: null,
                    parent: node,
                    prev: null,
                    type: "text"
                }];
                delete node.attribs['data-val'];
                return convertNodeToElement(node, key, transform);
            }
            return null;
        }
        if (node.type === "tag") {
            Object.keys(node.attribs).map(function (attr) {
                let template = node.attribs[attr];
                let r = template.match(/{[^}]+}/g);
                r && r.forEach((state) => {
                    let regex = new RegExp(state, 'g');
                    let stateItem = state.split(/{|}/g)[1];
                    /* istanbul ignore else */
                    if (stateItem !== undefined)
                        template = template.replace('{' + stateItem + '}', Get(stateItem));
                    node.attribs[attr] = template;
                });
                return convertNodeToElement(node, key, transform);
            })
        }
        if (node.type === "text") {
            let template = node.data;
            let r = template.match(/{[^}]+}/g);
            /* istanbul ignore next */
            r && r.forEach(state => {
                let regex = new RegExp(state, 'g');
                let stateItem = state.split(/{|}/g)[1];
                if (stateItem !== undefined)
                    template = template.replace(regex, Get(stateItem));
                node.data = template;
            });
            return convertNodeToElement(node, key, transform);
        }
    }

    const get = key => {
        try {
            return eval(key);
        }
        catch (exception) {
            /* istanbul ignore next */
            return '{' + key + '}';
        }
    }

    const preview = (block, transform) => {
        /* istanbul ignore next */
        if (block.preview !== Object(block.preview)) {
            value = block.settings || '';
            return (ReactHtmlParser(block.preview, { transform: transform }));
        }

        const html = [];
        html.push(ReactHtmlParser(block.preview.before));
        Object.keys(block.options).map(function (field) {
            if (block.options[field].type === "repeater") {
                Object.keys(block.settings[field]).map(function (r, idx) {
                    value = block.settings[field][r];
                    index = idx + 1;
                    html.push(ReactHtmlParser(block.preview[field].each, { transform: transform }));
                });
            } else {
                value = block.settings[field] || '';
                html.push(ReactHtmlParser(block.preview[field], { transform: transform }));
            }
        });
        html.push(ReactHtmlParser(block.preview.after));
        return html;
    }

    // render

    if (block === null) {
        return <Loader />
    }

    if (block === "Not available" || block.orphaned) {
        return <OrphanedBlock block={block} />
    }

    const { options, settings } = block;
    const _repeater = {
        open: repeater,
        add: addRepeater,
        remove: removeRepeater,
        toggle: toggleRepeater,
        sortEnd: repeaterSortEnd,
        change: setRepeater,
    };

    return (
        <div className="flex flex-wrap">
            <div className="w-full">
                <Input
                    id="block_title"
                    name="title"
                    type="text"
                    label="Block Title"
                    labelClassName="sr-only"
                    inputClassName="bg-gray-100 dark:bg-gray-800"
                    wrapperClassName="mb-4"
                    onChange={updateBlockProperties}
                    value={block.title}
                    placeholder="Unnamed Block" />
            </div>
            <div className="w-full flex flex-row justify-end mb-4 gap-2">
                <Button style="link" color="gray" className="flex flex-row items-center gap-2 font-normal" onClick={toggleShare}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Block
                </Button>
                <Button style="link" color="gray" className="flex flex-row items-center gap-2 font-normal" onClick={toggleProperties}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Block Properties
                </Button>
                <Button style="link" className="flex flex-row items-center gap-2 font-normal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Use Block
                </Button>
            </div>
            <div className="flex flex-col flex-col-reverse gap-y-4 xl:flex-row w-full">
                <div className="w-full xl:w-5/12 px-4">
                    <div className={block.plugin.slug} id="block-preview">
                        {preview(block, transform)}
                    </div>
                </div>
                <div className="w-full xl:w-7/12">
                    <div className={`overflow-hidden rounded-lg shadow-lg bg-white dark:bg-gray-800 border-${UI.theme}-600 dark:border-${UI.theme}-500 border-t-2`}>
                        <div className="flex flex-col flex-col-reverse sm:flex-row border-b border-gray-200 dark:border-gray-700 text-lg">
                            <div className="flex flex-row px-4 py-2">
                                <span className="font-medium mr-2">Plugin:</span>
                                <Icon icon={block.plugin.icon} className="h5 w-5 mt-0.5 mr-2" /> {block.plugin.name}
                            </div>
                        </div>
                        {
                            Object.keys(options).map(function (field, i) {
                                if (options[field].type === "custom") {
                                    value = block.settings;
                                    // TODO: Custom field types
                                    return null
                                }
                                let F = Fields[options[field].type];
                                return F ? (
                                    <Route key={i}
                                        render={props => (
                                            <F name={field} index={i} field={options[field]}
                                                data={settings} update={update} value={settings[field]}
                                                repeater={_repeater} {...props} />
                                        )} />)
                                    : (null);
                            })
                        }
                        <div className="border-t border-gray-200 dark:border-gray-700 w-full">
                            {
                                (saving)
                                    ? (
                                        <Button onClick={/* istanbul ignore next */ e => e.preventDefault()} style="ghost" square className="flex items-center w-full sm:w-auto">
                                            <Loader style="circle" height="5" width="5" className="mr-2" /> Saving...
                                        </Button>
                                    )
                                    : (
                                        <Button onClick={saveBlockData} style="ghost" square className="w-full sm:w-auto">
                                            Save Changes & View
                                        </Button>
                                    )
                            }
                        </div>
                    </div>
                </div>
            </div>


            <ModalContext.Provider value={{ modal, toggleProperties, toggleShare }}>
                <PropertiesFlyout block={block} setBlock={setBlock} update={updateBlockProperties} />
                <ShareBlock block={block} setBlock={setBlock} />
            </ModalContext.Provider>
        </div>
    )
}

export default withWebApps(EditBlock);
