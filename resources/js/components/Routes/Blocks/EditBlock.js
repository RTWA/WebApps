import React, { createContext, useEffect, useState } from 'react';
import { Route } from 'react-router-dom';

import ReactHtmlParser, { convertNodeToElement } from "react-html-parser";

import { Image, Repeater, Select, Switch, Text } from '../../Fields';
import PropertiesFlyout from './Flyouts/PropertiesFlyout';
import { OrphanedBlock } from './BlockViews';
import { APIClient, Button, Icon, Loader, useToasts, withWebApps } from 'webapps-react';

export const PropertiesContext = createContext({});

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
    const [properties, setProperties] = useState(false);
    /* istanbul ignore next */
    const [id, setId] = useState(props.id || props.match.params.id);

    const { addToast, updateToast } = useToasts();
    let toastId = 0;

    useEffect(() => {
        mounted = true;
        loadBlockData();

        return () => mounted = false;
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
        await APIClient(`/api/blocks/${id}?edit=true`)
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
        if (mounted)
            saving = true;

        addToast(
            "Saving changes, please wait...",
            '',
            { appearance: 'info', autoDismiss: false },
            (id) => toastId = id
        );

        await APIClient(`/api/blocks/${id}`, { block: JSON.stringify(block), _method: 'PUT' }, { method: 'PUT' })
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
        if (mounted)
            setProperties(!properties);
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
            <div className="w-full mb-5">
                <label htmlFor="block_title" className="sr-only">Block Title</label>
                <input
                    type="text"
                    id="block_title"
                    name="title"
                    className="mt-1 block w-full rounded-md text-xl bg-gray-100 dark:bg-gray-800 border-transparent focus:border-gray-500 focus:bg-white dark:focus:bg-gray-300 focus:ring-0"
                    onChange={updateBlockProperties}
                    value={block.title}
                    placeholder="Unnamed Block" />
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
                            <div className="w-full border-t border-gray-200 sm:border-t-0 sm:w-auto sm:ml-auto">
                                <Button onClick={toggleProperties} style="ghost" square className="w-full sm:w-auto">
                                    Block Properties
                                </Button>
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
                                        <Button onClick={/* istanbul ignore next */ e => e.preventDefault()} style="ghost" square className="flex w-full sm:w-auto">
                                            <Loader style="circle" className="h-4 w-4 mr-2 mt-1" /> Saving...
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


            <PropertiesContext.Provider value={{ properties, toggleProperties }}>
                <PropertiesFlyout block={block} setBlock={setBlock} update={updateBlockProperties} />
            </PropertiesContext.Provider>
        </div>
    )
}

export default withWebApps(EditBlock);
