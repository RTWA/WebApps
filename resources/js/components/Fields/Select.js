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
        <div className="flex flex-col lg:flex-row px-4 py-4" data-for={name}>
            <label className="w-full lg:w-4/12 lg:py-2 font-medium lg:font-normal text-sm lg:text-base" htmlFor={name}>{field.label}</label>
            <div className="w-full lg:w-8/12">
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
