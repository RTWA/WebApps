import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';

// import ReactDOM from 'react-dom';

const BlockViews = () => {
    const [views, setViews] = useState(null);

    useEffect(() => {
        axios.get('/api/blocks/views')
            .then(json => {
                setViews(json.data.views);
            })
            .catch(error => {
                // TODO: Handle errors
                console.log(error);
            });
    }, []);

    if (views === null) {
        return null;
    }

    return (
        <div className="bg-green-300 dark:bg-green-700 px-4 w-full sm:w-1/2-gap-3 lg:w-56 h-28 rounded-md shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white text-right inline-block mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <div className="text-6xl text-right -mt-16 pt-4"><CountUp end={views} useEasing delay={0.5} /></div>
            <small className="text-white uppercase font-bold block text-right mt-2">Total Block Views</small>
        </div>
    )
}

export default BlockViews;

// ReactDOM.render(
//     <BlockViews />,
//     document.getElementById('BlockViews_Widget')
// );
