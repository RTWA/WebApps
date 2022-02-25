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
        let _name = e.target.name;
        let _value = (props.value === "true") ? "false" : "true";
        update(_name, _value, props.for, index);
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
