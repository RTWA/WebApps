import React, { useEffect, useState } from 'react';
import { GridSelect, Select } from 'webapps-react';

const BlockSettings = props => {
    const {
        settings,
        typeValue,
        setValue,
        states,
    } = props;

    const [options, setOptions] = useState([]);

    useEffect(() => {
        setOptions([
            {
                value: 'cube',
                selected: (settings['blocks.button.icon'] === 'cube'),
                object: icons.cube
            },
            {
                value: 'cog',
                selected: (settings['blocks.button.icon'] === 'cog'),
                object: icons.cog
            },
            {
                value: 'dots',
                selected: (settings['blocks.button.icon'] === 'dots'),
                object: icons.dots
            },
            {
                value: 'dotsAlt',
                selected: (settings['blocks.button.icon'] === 'dotsAlt'),
                object: icons.dotsAlt
            },
            {
                value: 'link',
                selected: (settings['blocks.button.icon'] === 'link'),
                object: icons.link
            },
            {
                value: 'info',
                selected: (settings['blocks.button.icon'] === 'info'),
                object: icons.info
            },
            {
                value: 'edit',
                selected: (settings['blocks.button.icon'] === 'edit'),
                object: icons.edit
            }
        ])
    }, [settings['blocks.button.icon']]);

    const onChange = e => {
        let key = e.target.id;
        let value = e.target.value;

        setValue(key, value);
    }

    const setIcon = icon => {
        setValue('blocks.button.icon', icon);
    }

    const icons = {
        cube: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
        ),
        cog: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        dots: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        dotsAlt: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
        ),
        link: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        ),
        info: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        edit: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        )
    }

    return (
        <>
            <Select
                id="blocks.button.location"
                name="blocks.button.location"
                label="Edit Button Location"
                helpText="Set the location of the edit button on embedded Blocks"
                value={settings['blocks.button.location']}
                wrapperClassName="my-6"
                onChange={onChange}
                state={states['blocks.button.location']}>
                <option value="hidden">Hidden</option>
                <option value="top-0 left-0">Top Left</option>
                <option value="top-0 right-0">Top Right</option>
                <option value="bottom-0 left-0">Bottom Left</option>
                <option value="bottom-0 right-0">Bottom Right</option>
            </Select>
            <GridSelect
                id="blocks.button.icon"
                name="blocks.button.icon"
                label="Edit Button Icon"
                value={settings['blocks.button.icon']}
                onSelect={setIcon}
                options={options} />
            <Select
                id="blocks.button.action"
                name="blocks.button.action"
                label="Edit Button Action"
                value={settings['blocks.button.action']}
                wrapperClassName="my-6"
                onChange={onChange}
                state={states['blocks.button.action']}>
                <option value="edit">Open edit Block page in new tab</option>
                <option value="popup">Display informative pop-up</option>
            </Select>
        </>
    )
}

export default BlockSettings;