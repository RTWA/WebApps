import React from 'react';
import UserAvatar from 'react-user-avatar';

const GroupList = props => {
    const {
        groups,
        selectGroup
    } = props;

    return (
        <div className="w-full dark:text-white divide-y dark:divide-gray-800 border-t border-b dark:border-gray-800">
            {
                groups?.map(function (group, i) {
                    return (
                        <div key={i} className="grid grid-cols-2 sm:grid-cols-3 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer" onClick={() => selectGroup(group)}>
                            <div className="col-span-2 pl-4 flex flex-row items-center">
                                <div className="flex-grow-0 pr-5">
                                    <UserAvatar size="48" name={group.name} src={`/group/${group.name}/photo`} />
                                </div>
                                <h6 className="py-3">{group.name}</h6>
                            </div>
                            <div className="hidden sm:block py-5">{group.users_count} Members</div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default GroupList;