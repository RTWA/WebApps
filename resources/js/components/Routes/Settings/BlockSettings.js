import React from 'react';
import { Select } from 'webapps-react';

const BlockSettings = props => {
    const {
        settings,
        typeValue,
        setValue,
        states,
    } = props;

    const onChange = e => {
        let key = e.target.id;
        let value = e.target.value;

        setValue(key, value);
    }

    return (
        <>
            <Select
                id="blocks.embed.edit_location"
                name="blocks.embed.edit_location"
                label="Edit Button Location"
                helpText="Set the location of the edit button on embedded Blocks"
                value={settings['blocks.embed.edit_location']}
                wrapperClassName="my-6"
                onChange={onChange}
                state={states['blocks.embed.edit_location']}>
                <option value="hidden">Hidden</option>
                <option value="top-0 left-0">Top Left</option>
                <option value="top-0 right-0">Top Right</option>
                <option value="bottom-0 left-0">Bottom Left</option>
                <option value="bottom-0 right-0">Bottom Right</option>
            </Select>

        </>
    )
}

export default BlockSettings;