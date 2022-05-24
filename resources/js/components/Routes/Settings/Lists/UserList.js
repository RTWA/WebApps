import React, { useEffect, useState } from 'react';
import UserAvatar from 'react-user-avatar';
import ReactTooltip from 'react-tooltip';

const UserList = props => {
    const {
        users,
        selectUser
    } = props;

    const [grouped, setGrouped] = useState({});

    useEffect(() => {
        ReactTooltip.rebuild();
    }, [grouped]);

    useEffect(() => {
        let _grouped = users;

        const obj = _grouped.reduce((acc, user) => {
            const letter = user.name[0].toUpperCase();
            acc[letter] = (acc[letter] || []).concat(user);
            return acc;
        }, {})

        _grouped = Object.entries(obj).map(([letter, users]) => {
            return { letter, users }
        }).sort((a, b) => a.letter > b.letter);

        setGrouped(_grouped);

        ReactTooltip.rebuild();
    }, [users]);

    const azure = (
        <div className="absolute bottom-0 right-5">
            <svg data-tip="Provisioned by Azure" data-place="right" className="w-3 h-3" viewBox="0 0 161.67 129" xmlns="http://www.w3.org/2000/svg">
                <path d="m88.33 0-47.66 41.33-40.67 73h36.67zm6.34 9.67-20.34 57.33 39 49-75.66 13h124z" fill="#0072c6" />
            </svg>
        </div>
    );

    return (
        <div className="w-full">
            {
                Object.keys(grouped).map(function (i) {
                    let letter = grouped[i].letter;
                    return (
                        <div key={i}>
                            <div className="px-6 py-1 md:px-8 border-t border-b dark:border-gray-800 font-medium uppercase text-secondary bg-gray-50 dark:bg-gray-900 dark:text-white">{letter}</div>
                            <div className="divide-y dark:divide-gray-800">
                            {
                                grouped[i].users.map(function (user) {
                                    return (
                                        <div key={`user-${user.id}`} className="grid grid-cols-2 xl:grid-cols-4 dark:text-white bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 cursor-pointer" onClick={() => selectUser(user)}>
                                            <div className="col-span-2 py-2 flex flex-row items-center">
                                                <div className="flex-grow-0 pr-5 relative">
                                                    <UserAvatar size="48" name={user.name} src={`/user/${user.id}/photo`} />
                                                    {(user.azure_id !== null) ? azure : null}
                                                </div>
                                                {user.name}
                                            </div>
                                            <div className="hidden xl:block py-5 font-medium">{user._CurrentGroup}</div>
                                            <div className="hidden xl:block py-5">{user.number_of_blocks} {
                                                (user.number_of_blocks > 1 || user.number_of_blocks === 0)
                                                    ? 'Blocks'
                                                    : 'Block'
                                            }</div>
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </div>
                    )
                })
            }
        </div >
    )
}

export default UserList;