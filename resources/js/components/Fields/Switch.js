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
        <div className="flex flex-auto px-4 lg:px-10 py-10 pt-5" data-for={name}>
            <div className="w-full lg:w-3/12">
                <label className="block py-2" htmlFor={name}>{field.label}</label>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none" data-for={name}>
                <WASwitch name={name} defaultChecked={(value === "true")} onChange={onChange} state={state} />
            </div>
        </div>
    )
}

export default Switch;
