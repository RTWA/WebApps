import React, { useEffect } from 'react';
import UserAvatar from 'react-user-avatar';
import ReactTooltip from 'react-tooltip';
import ContentLoader from "react-content-loader"

const UserList = props => {
    const {
        users,
        disabled,
        selectUser
    } = props;

    useEffect(() => {
        ReactTooltip.rebuild();
    }, [users]);

    const azure = (
        <svg data-tip="Provisioned by Azure" data-place="right" className="w-3 h-3" viewBox="0 0 161.67 129" xmlns="http://www.w3.org/2000/svg">
            <path d="m88.33 0-47.66 41.33-40.67 73h36.67zm6.34 9.67-20.34 57.33 39 49-75.66 13h124z" fill="#0072c6" />
        </svg>
    );

    return (
        <div className="w-full">
            {
                users.map(function (user, i) {
                    return (
                        <div key={i} className="grid grid-cols-4 bg-white dark:bg-gray-800 rounded mb-1 cursor-pointer" onClick={() => selectUser(user)}>
                            <div className="py-2 pl-4 flex flex-row">
                                <div className="flex-grow-0 pr-5 relative">
                                    <UserAvatar size="48" name={user.name} src={`/user/${user.id}/photo`} />
                                    <div className="absolute bottom-0 right-5">
                                        {(user.azure_id !== null) ? azure : null}
                                    </div>
                                </div>
                                <div className="flex-grow flex flex-col">
                                    {user.name}
                                    <span className="text-gray-400 italic">{user.username}</span>
                                </div>
                            </div>
                            <div className="py-5">{user.email}</div>
                            <div className="py-5 font-medium">{user._CurrentGroup}</div>
                            <div className="py-5">{user.number_of_blocks} {
                                (user.number_of_blocks > 1 || user.number_of_blocks === 0)
                                    ? 'Blocks'
                                    : 'Block'
                            }</div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default UserList;