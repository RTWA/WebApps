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
        <div className="flex flex-auto px-4 lg:px-10 py-10 pt-5" data-for={name}>
            <div className="w-full lg:w-3/12">
                <label className="block py-2" htmlFor={name}>{field.label}</label>
            </div>
            <div className="w-full lg:w-9/12">
                <Input name={name}
                    type="text"
                    id={name}
                    placeholder={field.placeholder || ''}
                    maxLength={field.maxLength || ''}
                    value={value}
                    onChange={onChange}
                    state={state}
                    error={error} />
            </div>
        </div>
    )
}

export default Text;
