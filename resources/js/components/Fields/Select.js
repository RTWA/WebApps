import React from 'react';
import { Select as WASelect, withWebApps } from 'webapps-react';

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
        <div className="p-4" data-for={name}>
            <WASelect
                id={name}
                name={name}
                label={field.label}
                value={value}
                onChange={onChange}>
                {
                    Object.keys(field.options).map(function (f, i) {
                        return (
                            <option key={i} value={f}>{field.options[f]}</option>
                        )
                    })
                }
            </WASelect>
        </div>
    )
}

export default withWebApps(Select);
