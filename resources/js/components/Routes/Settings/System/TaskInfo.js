import React, { useCallback, useEffect, useRef, useState } from 'react';
import { APIClient, Button, ComponentError, ComponentErrorTrigger, Loader, useToasts } from 'webapps-react';
import moment from 'moment';

const TaskInfo = () => {
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState(null);

    const { addToast } = useToasts();

    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    let APIController = new AbortController();

    useEffect(async () => {
        await loadTasks();

        return () => {
            void (isMountedRef.current = false);
            APIController.abort();
        }
    }, []);

    const loadTasks = async () => {
        await APIClient('/api/system-tasks', undefined, { signal: APIController.signal })
            .then(json => {
                if (isMounted()) {
                    setTasks(json.data.tasks);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    setError(error.data.message);
                }
            });
    }

    const runTask = async command => {
        await APIClient('/api/run-task', { command: command }, { signal: APIController.signal })
            .then(json => {
                if (isMounted()) {
                    setSystemTasks(json.data.tasks);
                    addToast('Task ran successfully!', '', { appearance: 'success' });
                }
            })
            .catch(async error => {
                if (!error.status?.isAbort) {
                    addToast('Failed to run task', error.data.message, { appearance: 'error' });
                    await getErrorLog();
                }
            })
    }

    if (!tasks) {
        return <Loader height="12" width="12" type="circle" />
    }

    return (
        <ComponentError retry={() => { setError(null); loadTasks(); }}>
            {
                (error)
                    ? <ComponentErrorTrigger error={error} />
                    : (
                        <>
                            <h3 className="font-bold mb-3">Media Cleanup</h3>
                            <div className="grid grid-cols-5">
                                <h6 className="font-semibold">Items Deleted</h6>
                                <h6 className="font-semibold">Last Ran</h6>
                                <h6 className="font-semibold">Next Due</h6>
                                <h6 className="font-semibold">Schedule</h6>
                                <h6 className="font-semibold">&nbsp;</h6>
                            </div>
                            <div className="py-1 text-xs grid grid-cols-5">
                                <p className="pl-10">{tasks.cleanUpMedia.lastQty}</p>
                                <p>{moment(tasks.cleanUpMedia.lastRun).calendar()}</p>
                                <p>{
                                    moment(tasks.cleanUpMedia.lastRun)
                                        .add(tasks.cleanUpMedia.schedule[0], tasks.cleanUpMedia.schedule[1])
                                        .calendar()
                                }</p>
                                <p>Every {tasks.cleanUpMedia.schedule[0]} {tasks.cleanUpMedia.schedule[1]}</p>
                                <Button
                                    type="link"
                                    padding={false}
                                    onClick={() => runTask(tasks.cleanUpMedia.command)}
                                >
                                    Run Now
                                </Button>
                            </div>

                            <h3 className="font-bold mt-6 mb-3">Microsoft Azure Integration</h3>
                            <div className="grid grid-cols-5">
                                <h6 className="font-semibold">Task Name</h6>
                                <h6 className="font-semibold">Last Ran</h6>
                                <h6 className="font-semibold">Next Due</h6>
                                <h6 className="font-semibold">Schedule</h6>
                                <h6 className="font-semibold">&nbsp;</h6>
                            </div>
                            <div className="py-1 text-xs grid grid-cols-5">
                                <p>Sync Users and Groups</p>
                                <p>{moment(tasks.azure.sync.lastRun).fromNow()}</p>
                                <p>{
                                    moment(tasks.azure.sync.lastRun)
                                        .add(tasks.azure.sync.schedule[0], tasks.azure.sync.schedule[1])
                                        .fromNow()
                                }</p>
                                <p>Every {tasks.azure.sync.schedule[0]} {tasks.azure.sync.schedule[1]}</p>
                                <Button
                                    type="link"
                                    padding={false}
                                    onClick={() => runTask(tasks.azure.sync.command)}
                                >
                                    Run Now
                                </Button>

                                <p>Cleanup Access Tokens</p>
                                <p>{moment(tasks.azure.cleanup.lastRun).fromNow()}</p>
                                <p>{
                                    moment(tasks.azure.cleanup.lastRun)
                                        .add(tasks.azure.cleanup.schedule[0], tasks.azure.cleanup.schedule[1])
                                        .fromNow()
                                }</p>
                                <p>Every {tasks.azure.cleanup.schedule[0]} {tasks.azure.cleanup.schedule[1]}</p>
                                <Button
                                    type="link"
                                    padding={false}
                                    onClick={() => runTask(tasks.azure.cleanup.command)}
                                >
                                    Run Now
                                </Button>
                            </div>
                            {
                                (tasks.appsTasks.length > 0)
                                    ? (
                                        <>
                                            <h3 className="font-bold mt-6 mb-3">Apps Tasks</h3>
                                            <div className="grid grid-cols-6">
                                                <h6 className="font-semibold">App</h6>
                                                <h6 className="font-semibold">Command</h6>
                                                <h6 className="font-semibold">Last Ran</h6>
                                                <h6 className="font-semibold">Next Due</h6>
                                                <h6 className="font-semibold">Schedule</h6>
                                                <h6 className="font-semibold">&nbsp;</h6>
                                            </div>
                                            <div className="py-1 text-xs">
                                                {
                                                    tasks.appsTasks.map((task, i) => {
                                                        let schedule = task.schedule.split(' ');
                                                        return (
                                                            <div className="grid grid-cols-6" key={i}>
                                                                <p>{task.app}</p>
                                                                <p>{task.command.replace(`${task.app}:`, '')}</p>
                                                                <p>{moment(task.last_run).fromNow()}</p>
                                                                <p>{
                                                                    moment(task.last_run)
                                                                        .add(schedule[0][1], schedule[1])
                                                                        .fromNow()
                                                                }</p>
                                                                <p>Every {schedule[0][1]} {schedule[1]}</p>
                                                                <Button
                                                                    type="link"
                                                                    padding={false}
                                                                    onClick={() => runTask(task.command)}
                                                                >
                                                                    Run Now
                                                                </Button>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </>
                                    ) : null
                            }
                            <h3 className="font-bold mt-6 mb-3">Error Log Cleanup</h3>
                            <div className="grid grid-cols-4">
                                <h6 className="font-semibold">Last Ran</h6>
                                <h6 className="font-semibold">Next Due</h6>
                                <h6 className="font-semibold">Schedule</h6>
                                <h6 className="font-semibold">&nbsp;</h6>
                            </div>
                            <div className="py-1 text-xs grid grid-cols-4">
                                <p>{moment(tasks.cleanUpLog.lastRun).calendar()}</p>
                                <p>{
                                    moment(tasks.cleanUpLog.lastRun)
                                        .add(tasks.cleanUpLog.schedule[0], tasks.cleanUpLog.schedule[1])
                                        .calendar()
                                }</p>
                                <p>Every {tasks.cleanUpLog.schedule[0]} {tasks.cleanUpLog.schedule[1]}</p>
                                <Button
                                    type="link"
                                    padding={false}
                                    onClick={() => runTask(tasks.cleanUpLog.command)}
                                >
                                    Run Now
                                </Button>
                            </div>
                        </>
                    )
            }
        </ComponentError>
    );
}

export default TaskInfo