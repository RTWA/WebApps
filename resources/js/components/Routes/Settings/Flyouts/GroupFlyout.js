import React, { useContext } from 'react';
import { ConfirmDeleteButton, FlyoutContent, FlyoutHeader, FlyoutFooter, Input } from 'webapps-react';

import { FlyoutsContext } from '../UsersGroups';

const GroupFlyout = props => {
    const {
        group,
        renameGroup,
        saveRenameGroup,
        deleteGroup
    } = props;

    const {
        groupFlyout, closeAllFlyouts,
    } = useContext(FlyoutsContext);

    if (!groupFlyout) {
        return null;
    }

    return (
        <>
            <FlyoutHeader closeAction={closeAllFlyouts}>
                {group.name}
            </FlyoutHeader>
            <FlyoutContent>
                <Input
                    id="name_gf"
                    name="groupName"
                    label="Group Name"
                    type="text"
                    value={group.name || ''}
                    onChange={renameGroup}
                    onBlur={saveRenameGroup}
                    error={group.error || ''}
                    state={group.state || ''}
                    wrapperClassName="mt-4" />
            </FlyoutContent>
            <FlyoutFooter>
                <ConfirmDeleteButton
                    text="Delete Group"
                    confirmText="Are you sure?"
                    type="outline"
                    square
                    className="flex"
                    onClick={deleteGroup} />
            </FlyoutFooter>
        </>
    )
}

export default GroupFlyout;
