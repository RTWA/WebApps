import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';
import { Button, Input, withWebApps } from 'webapps-react';
import { FlyoutsContext } from '../UsersGroups';

const CreateGroupFlyout = ({ UI, ...props }) => {
    const {
        pushGroup
    } = props;

    const { addToast } = useToasts();

    const {
        createGroupFlyout, toggleCreateGroupFlyout,
    } = useContext(FlyoutsContext);

    const [name, setName] = useState('');
    const [state, setState] = useState('');
    const [error, setError] = useState('');

    const flyoutClass = classNames(
        'absolute',
        'inset-0',
        'overflow-hidden',
        (createGroupFlyout) ? 'z-50' : '-z-10'
    )

    const bdClass = classNames(
        'absolute',
        'inset-0',
        'bg-gray-500',
        'bg-opacity-75',
        'transition-opacity',
        'duration-500',
        'ease-in-out',
        (createGroupFlyout) ? 'opacity-100' : 'opacity-0'
    )

    const panelClass = classNames(
        'relative',
        'w-screen',
        'max-w-2xl',
        'transform',
        'transition',
        'ease-in-out',
        'duration-500',
        'delay-500',
        (createGroupFlyout) ? 'translate-x-0' : 'translate-x-full'
    )

    const typeValue = e => {
        let _field = e.target.name;
        let _value = e.target.value;

        // istanbul ignore else
        if (_field === "name") {
            setName(_value);
            setState('');
            setError('');
        }
    }

    const createGroup = () => {
        setState('saving');
        let formData = new FormData();
        formData.append('name', name);

        axios.post('/api/group', formData)
            .then(json => {
                pushGroup(json.data.group);
                addToast(json.data.message, { appearance: 'success' });
                toggleCreateGroupFlyout();
                setState('');
            })
            .catch(error => {
                setState('error');
                setError(error.response.data.errors.name[0]);
            });
    }

    return (
        <div className={flyoutClass}>
            <div className={bdClass} aria-hidden="true"></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex" aria-labelledby="slide-over-heading">
                <div className={panelClass}>
                    <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl overflow-y-auto relative">
                        <div className={`px-4 sm:px-6 py-6 bg-${UI.theme}-600 dark:bg-${UI.theme}-500 text-white dark:text-gray-200`}>
                            <h2 id="slide-over-heading" className="text-lg font-medium">Add New Group</h2>
                        </div>
                        <div className="mt-6 relative flex-1 px-4 sm:px-6">
                            <div className="absolute inset-0 px-4 sm:px-6">
                                <div className="h-full" aria-hidden="true">
                                    <div className="text-gray-500"><label htmlFor="name_cgf">Groups Name</label></div>
                                    <Input name="name"
                                        type="text"
                                        id="name_cgf"
                                        value={name}
                                        onChange={typeValue}
                                        error={error}
                                        state={state} />
                                </div>
                            </div>
                        </div>
                        <div className={`relative bg-gray-100 dark:bg-gray-800 border-t-2 py-2 px-4 border-${UI.theme}-600 dark:border-${UI.theme}-500 flex flex-row`}>
                            <Button onClick={createGroup} square>Create Group</Button>
                            <Button onClick={toggleCreateGroupFlyout} className="ml-auto" color="gray" style="outline" square>Cancel</Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default withWebApps(CreateGroupFlyout);
