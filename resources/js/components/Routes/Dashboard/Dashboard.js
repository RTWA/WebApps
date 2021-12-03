import React from 'react';
import { BlockCount, BlockViews, PopularBlocks, RecentBlocks } from '../../../widgets';

const Dashboard = () => {
    return (
        <div className="w-full flex flex-wrap gap-3">
            <BlockCount />
            <BlockViews />
            <div className="w-full lg:h-24"></div>
            <RecentBlocks />
            <PopularBlocks />
        </div>
    )
}

export default Dashboard;