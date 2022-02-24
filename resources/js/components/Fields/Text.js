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
        <div className="p-4" data-for={name}>
            <Input
                id={name}
                name={name}
                label={field.label}
                type="text"
                placeholder={field.placeholder || ''}
                maxLength={field.maxLength || ''}
                value={value}
                onChange={onChange}
                state={state}
                error={error}
            />
        </div>
    )
}

export default Text;
