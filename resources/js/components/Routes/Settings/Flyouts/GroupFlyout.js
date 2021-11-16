import React, { useContext } from 'react';
import classNames from 'classnames';
import { ConfirmDeleteButton, Input, withWebApps } from 'webapps-react';

import { FlyoutsContext } from '../UsersGroups';

const GroupFlyout = ({ UI, ...props }) => {
    const {
        group,
        renameGroup,
        saveRenameGroup,
        deleteGroup
    } = props;

    const {
        groupModal, toggleGroupModal,
    } = useContext(FlyoutsContext);

    const flyoutClass = classNames(
        'absolute',
        'inset-0',
        'overflow-hidden',
        (groupModal) ? 'z-50' : '-z-10'
    )

    const bdClass = classNames(
        'absolute',
        'inset-0',
        'bg-gray-500',
        'bg-opacity-75',
        'transition-opacity',
        'duration-500',
        'ease-in-out',
        (groupModal) ? 'opacity-100' : 'opacity-0'
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
        (groupModal) ? 'translate-x-0' : 'translate-x-full'
    )

    return (
        <div className={flyoutClass}>
            <div className={bdClass} aria-hidden="true" onClick={toggleGroupModal}></div>
            <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex" aria-labelledby="slide-over-heading">
                <div className={panelClass}>
                    <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
                        <div className={`px-4 sm:px-6 py-6 bg-${UI.theme}-600 dark:bg-${UI.theme}-500 text-white dark:text-gray-200 relative`}>
                            <div className="absolute top-0 right-0 -ml-8 pt-6 pr-2 flex sm:-ml-10 sm:pr-4">
                                <button className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                    onClick={toggleGroupModal}>
                                    <span className="sr-only">Close panel</span>
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <h2 id="slide-over-heading" className="text-lg font-medium">{group.name} - Group Properties</h2>
                        </div>
                        <div className="mt-6 relative flex-1 px-4 sm:px-6">
                            <div className="absolute inset-0 px-4 sm:px-6">
                                <div className="h-full" aria-hidden="true">
                                    <div className="flex flex-auto">
                                        <div className="w-full lg:w-3/12">
                                            <label className="block py-2" htmlFor="name_gf">Group Name</label>
                                        </div>
                                        <div className="w-full lg:w-9/12">
                                            <Input name="groupName"
                                                type="text"
                                                id="name_gf"
                                                value={group.name || ''}
                                                onChange={renameGroup}
                                                onBlur={saveRenameGroup}
                                                error={group.error || ''}
                                                state={group.state || ''} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`bg-gray-100 dark:bg-gray-800 border-t-2 py-3 px-4 border-${UI.theme}-600 dark:border-${UI.theme}-500`}>
                            <ConfirmDeleteButton
                                text="Delete Group"
                                confirmText="Are you sure?"
                                style="outline"
                                square
                                className="flex"
                                onClick={deleteGroup} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default withWebApps(GroupFlyout);
