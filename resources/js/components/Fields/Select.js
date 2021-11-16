import React from 'react';
import { withWebApps } from 'webapps-react';

const Select = ({ UI, ...props }) => {
    const {
        name,
        field,
        value,
        update,
        index,
    } = props;

    const onChange = e => {
        let _value = e.target.value;
        let _name = e.target.name;

        update(_name, _value, props.for, index);
    }

    return (
        <div className="flex flex-auto px-4 lg:px-10 py-10 pt-5" data-for={name}>
            <div className="w-full lg:w-3/12">
                <label className="block py-2" htmlFor={name}>{field.label}</label>
            </div>
            <div className="w-full lg:w-9/12">
                <select name={name}
                    id={name}
                    value={value}
                    onChange={onChange}
                    className={`input-field focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`}>
                    {
                        Object.keys(field.options).map(function (f, i) {
                            return (
                                <option key={i} value={f}>{field.options[f]}</option>
                            )
                        })
                    }
                </select>
                <div className="text-red-500" id={`${name}Help`} />
            </div>
        </div>
    )
}

export default withWebApps(Select);
