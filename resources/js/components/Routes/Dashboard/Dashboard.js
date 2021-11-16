import React from 'react';
import { BlockCount, BlockViews, PopularBlocks, RecentBlocks } from '../../../widgets';

const Dashboard = () => {
    return (
        <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-x-3 gap-y-10">
            <BlockCount />
            <BlockViews />
            <div className="col-span-4" />
            <div className="col-span-3 row-span-3">
                <RecentBlocks />
            </div>   
            <div className="col-span-3 row-span-3">
                <PopularBlocks />
            </div>         
        </div>
    )
}

export default Dashboard;