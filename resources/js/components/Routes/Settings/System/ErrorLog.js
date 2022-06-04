import React, { useCallback, useEffect, useRef, useState } from 'react';
import { APIClient, ComponentError, ComponentErrorTrigger, Loader } from 'webapps-react';
import moment from 'moment';

const ErrorLog = () => {
    const [irony, setIrony] = useState(null);
    const [log, setLog] = useState(null);
    const [info, setInfo] = useState();

    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    let APIController = new AbortController();

    useEffect(async () => {
        await getErrorLog();

        return () => {
            void (isMountedRef.current = false);
            APIController.abort();
        }
    }, []);

    const getErrorLog = async () => {
        await APIClient('/api/error-log', undefined, { signal: APIController.signal })
            .then(json => {
                if (isMounted()) {
                    setLog(json.data.logs);
                }
            })
            .catch(error => {
                if (!error.status?.isAbort) {
                    setIrony(error.data.message);
                }
            });
    }

    if (!log) {
        return <Loader height="12" width="12" type="circle" />
    }

    return (
        <ComponentError title="Oh, the irony!" retry={() => { setIrony(null); getErrorLog(); }}>
            {
                (irony)
                    ? <ComponentErrorTrigger error={irony} />
                    : (
                        <>
                            <div className="grid grid-cols-5">
                                <h6 className="text-left font-semibold">When?</h6>
                                <h6 className="text-left font-semibold col-span-2">What?</h6>
                                <h6 className="text-left font-semibold col-span-2">Where?</h6>
                            </div>
                            {
                                log.map((error, i) => {
                                    return (
                                        <div
                                            className="py-1 text-xs grid grid-cols-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                                            key={i}
                                            onClick={() => { (info === i) ? setInfo() : setInfo(i) }}
                                        >
                                            <p>{moment(error.created_at).calendar()}</p>
                                            <p className="col-span-2">{error.message}</p>
                                            <p className="col-span-2">{error.file}:{error.line}</p>
                                            {
                                                (info === i)
                                                    ? <div className="col-span-5"><pre>{error.trace}</pre></div>
                                                    : null
                                            }
                                        </div>
                                    )
                                })
                            }
                        </>
                    )
            }
        </ComponentError>
    )
}

export default ErrorLog