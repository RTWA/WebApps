import React, { useState } from 'react';
import { Switch as WASwitch } from 'webapps-react';

const Switch = props => {
    const {
        name,
        field,
        value,
        update,
        index
    } = props;

    const [state, setState] = useState('');

    const onChange = e => {
        setState('saving');
        update(
            e.target.name,
            (value === "true") ? "false" : "true",
            props.for,
            index
        );
        setState('');
    }

    return (
        <div className="p-4" data-for={name}>
            <WASwitch
                id={name}
                name={name}
                label={field.label}
                defaultChecked={(value === "true")}
                onChange={onChange}
                state={state}
            />
        </div>
    )
}

export default Switch;
