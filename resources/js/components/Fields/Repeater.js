import React, { useState } from 'react';
import classNames from 'classnames';
import { Route } from 'react-router-dom';
import { withWebApps } from 'webapps-react';

import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    restrictToVerticalAxis,
    restrictToFirstScrollableAncestor
} from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

import Image from './Image';
import Select from './Select';
import Switch from './Switch';
import Text from './Text';

const Fields = {
    image: Image,
    select: Select,
    switch: Switch,
    text: Text,
};

const SortableItem = props => {
    const {
        i,
        idx,
        name,
        field,
        repeater
    } = props;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: idx });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const value = props.data[name][i];

    const paneClass = classNames(
        'px-4',
        'bg-gray-50',
        'dark:bg-gray-800',
        (repeater.open === i) ? 'block' : 'hidden'
    );

    return (
        <div className="cursor-pointer bg-gray-100 dark:bg-gray-900 mb-1" ref={setNodeRef} style={style}>
            <div className="flex flex-row w-full">
                <div className="p-2" {...attributes} {...listeners}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                </div>
                <p className="flex-1 p-2 bg-gray-50 dark:bg-gray-700" onClick={() => repeater.toggle(i)}>{field.label}: {value[field.ref]}</p>
                {
                    (props.data[name].length !== 1)
                        ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 m-2" viewBox="0 0 20 20" fill="currentColor" onClick={() => repeater.remove(name, i)} data-testid={`remove-${i}`}>
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        ) : null
                }
            </div>
            <div className={paneClass} id={name + (i + 1)}>
                <RepeaterFields {...props} />
            </div>
        </div>
    );
};

const RepeaterFields = props => {
    const {
        name,
        update
    } = props;
    const index = props.i;

    const options = props.field.options;
    const data = props.data[name];

    return (
        Object.keys(options).map(function (f, i) {
            let F = Fields[options[f].type];
            return F ? (
                <Route key={`${index}-${i}`}
                    render={props => (
                        <F name={f} field={options[f]} value={data[index][f]} for={name} index={index} update={update} {...props} />
                    )} />
            ) : null;
        })
    );
}

const setupData = props => {
    const {
        name,
        data
    } = props;

    let idxs = [];

    Object.keys(data[name]).map(function (key) {
        if (data[name][key]['idx'] === undefined) {
            let newIdx = Math.round(Math.random() * 100);
            data[name][key]['idx'] = newIdx;
            idxs.push(newIdx);
        } else {
            idxs.push(data[name][key]['idx']);
        }
    });

    return idxs;
}

const Repeater = ({ UI, ...props }) => {
    let idxs = setupData(props);

    const {
        name,
        data,
        field,
        repeater
    } = props;

    const [drag, setDrag] = useState(null);
    const [dragKey, setDragKey] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor)
    );

    /* istanbul ignore next */
    function handleDragStart(event) {
        repeater.change(-1);
        Object.keys(data[name]).map(function (key) {
            if (data[name][key]['idx'] === event.active.id) {
                setDragKey(key);
            }
        });
        setDrag(event.active.id);
    }

    /* istanbul ignore next */
    function handleDragEnd(event) {
        const { active, over } = event;

        let overKey = null;
        let activeKey = null;

        Object.keys(data[name]).map(function (key) {
            if (data[name][key]['idx'] === event.active.id) {
                activeKey = key;
            }
            if (data[name][key]['idx'] === event.over.id) {
                overKey = key;
            }
        });

        if (active.id !== over.id && overKey !== null && activeKey !== null) {
            repeater.sortEnd(name, overKey, activeKey);
        }
        setDragKey(null);
        setDrag(null);
    }

    return (
        <div className="repeater">
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
                collisionDetection={closestCenter}
                data-name={name}
            >
                <SortableContext
                    items={idxs}
                    strategy={verticalListSortingStrategy}
                >
                    {
                        Object.keys(data[name]).map(function (i) {
                            /* istanbul ignore else */
                            if (data[name][i][field.ref] !== undefined) {
                                return <SortableItem key={i} i={i} idx={data[name][i]['idx']} {...props} />
                            }
                        })
                    }
                </SortableContext>
                <DragOverlay
                    modifiers={[restrictToFirstScrollableAncestor]}
                >
                    {
                        /* istanbul ignore next */
                        drag ? <SortableItem id={drag} i={dragKey} idx={drag} {...props} /> : null
                    }
                </DragOverlay>
            </DndContext>
            <button className={`block mx-auto outline-none hover:text-${UI.theme}-600 dark:hover:text-${UI.theme}-500 mb-1`} data-name={name} onClick={repeater.add}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block -mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New {field.label}
            </button>
        </div>
    )
}

export default withWebApps(Repeater);