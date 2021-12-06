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
        <div className="flex flex-col lg:flex-row px-4 py-4" data-for={name}>
            <label className="w-full lg:w-4/12 lg:py-2 font-medium lg:font-normal text-sm lg:text-base" htmlFor={name}>{field.label}</label>
            
            <div className="relative inline-block w-10 mr-2 align-middle select-none mt-1 lg:mt-0" data-for={name}>
                <WASwitch name={name} defaultChecked={(value === "true")} onChange={onChange} state={state} />
            </div>
        </div>
    )
}

export default Switch;
