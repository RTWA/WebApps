import React from 'react';
import { Input } from 'webapps-react';

const Text = props => {
    const {
        name,
        field,
        value,
        update,
        index,
        state,
        error,
    } = props;

    const onChange = e => {
        let _value = e.target.value;
        let _name = e.target.name;

        update(_name, _value, props.for, index)
    }

    return (
        <div className="flex flex-col lg:flex-row px-4 py-4" data-for={name}>
            <label className="w-full lg:w-4/12 lg:py-2 font-medium lg:font-normal text-sm lg:text-base" htmlFor={name}>{field.label}</label>
            <Input name={name}
                id={name}
                type="text"
                placeholder={field.placeholder || ''}
                maxLength={field.maxLength || ''}
                value={value}
                onChange={onChange}
                state={state}
                error={error}
                className="w-full lg:w-8/12" />
        </div>
    )
}

export default Text;
