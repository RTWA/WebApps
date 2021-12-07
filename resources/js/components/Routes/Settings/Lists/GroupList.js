import React from 'react';
import UserAvatar from 'react-user-avatar';
import ContentLoader from "react-content-loader"

const GroupList = props => {
    const {
        groups,
        selectGroup
    } = props;

    // render
    return (
        <div className="w-full">
            {
                (groups.length === 0) ?
                    (
                        <div className="bg-white dark:bg-gray-800 rounded mb-1 cursor-wait text-center py-2 pl-4" data-testid="group-loader">
                            <ContentLoader
                                speed={2}
                                width="100%"
                                height={48}
                                foregroundColor="#FFF"
                            >
                                <rect x="70" y="8" rx="3" ry="3" width="110" height="8" />
                                <rect x="280" y="18" rx="3" ry="3" width="400" height="8" />
                                <rect x="70" y="30" rx="3" ry="3" width="80" height="6" />
                                <circle cx="24" cy="24" r="24" />
                            </ContentLoader>
                        </div>
                    )
                    : (
                        groups.map(function (group, i) {
                            return (
                                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 bg-white dark:bg-gray-800 rounded mb-1" onClick={() => selectGroup(group)} style={{ cursor: 'pointer' }}>
                                    <div className="py-2 pl-4 flex flex-row">
                                        <div className="flex-grow-0 pr-5">
                                            <UserAvatar size="48" name={group.name} />
                                        </div>
                                        <h6 className="py-3">{group.name}</h6>
                                    </div>
                                    <div className="hidden sm:block py-5">{group.users_count} Members</div>
                                </div>
                            )
                        })
                    )
            }
        </div>
    )
}

export default GroupList;