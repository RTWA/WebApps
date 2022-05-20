import React, { useContext, useEffect, useState } from 'react';
import { APIClient, Button, FlyoutContent, FlyoutHeader, FlyoutFooter, Input, useToasts } from 'webapps-react';
import { FlyoutsContext } from '../UsersGroups';

const CreateGroupFlyout = props => {
    const {
        pushGroup
    } = props;

    const { addToast } = useToasts();

    const {
        createGroupFlyout, closeAllFlyouts,
    } = useContext(FlyoutsContext);

    const [name, setName] = useState('');
    const [state, setState] = useState('');
    const [error, setError] = useState('');

    const APIController = new AbortController();

    useEffect(() => {
        return () => {
            APIController.abort();
        }
    }, []);

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

    const createGroup = async () => {
        setState('saving');
        await APIClient('/api/group', { name: name }, { signal: APIController.signal })
            .then(json => {
                pushGroup(json.data.group);
                addToast(json.data.message, '', { appearance: 'success' });
                toggleCreateGroupFlyout();
                setState('');
            })
            .catch(error => {
                setState('error');
                setError(error.data.errors.name[0]);
            });
    }

    if (!createGroupFlyout) {
        return null;
    }

    return (
        <>
            <FlyoutHeader>Add New Group</FlyoutHeader>
            <FlyoutContent>
                <Input
                    id="name_cgf"
                    name="name"
                    label="Groups Name"
                    type="text"
                    value={name}
                    onChange={typeValue}
                    error={error}
                    state={state}
                    wrapperClassName="mt-4" />
            </FlyoutContent>
            <FlyoutFooter>
                <Button onClick={createGroup} square>Create Group</Button>
                <Button onClick={closeAllFlyouts} className="ml-auto" color="gray" type="outline" square>Cancel</Button>
            </FlyoutFooter>
        </>
    )
}

export default CreateGroupFlyout;
