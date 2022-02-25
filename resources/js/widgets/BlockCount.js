import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { APIClient } from 'webapps-react';

// import ReactDOM from 'react-dom';

const BlockCount = () => {
    const [count, setCount] = useState(null);

    const APIController = new AbortController();

    useEffect(async () => {
        await APIClient('/api/blocks/count', undefined, { signal: APIController.signal })
            .then(json => {
                setCount(json.data.count);
            })
            .catch(error => {
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            });

        return () => {
            APIController.abort();
        }
    }, []);

    if (count === null) {
        return null;
    }

    return (
        <div className="bg-indigo-300 dark:bg-indigo-800 px-4 w-full sm:w-1/2-gap-3 lg:w-56 h-28 rounded-md shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white text-right inline-block mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <div className="text-6xl text-right -mt-16 pt-4"><CountUp end={count} useEasing delay={0.5} /></div>
            <small className="text-white uppercase font-bold block text-right mt-2">Blocks Created</small>
        </div>
    )
}

export default BlockCount;

// ReactDOM.render(
//     <BlockCount />,
//     document.getElementById('BlockCount_Widget')
// );
