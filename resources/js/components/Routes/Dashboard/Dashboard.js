import React from 'react';
import { PageWrapper } from 'webapps-react';

import { BlockCount, BlockViews, PopularBlocks, RecentBlocks } from '../../../widgets';

const Dashboard = () => {
    return (
        <PageWrapper>
            <div className="w-full flex flex-wrap gap-3">
                <BlockCount />
                <BlockViews />
                <div className="w-full lg:h-24"></div>
                <RecentBlocks />
                <PopularBlocks />
            </div>
        </PageWrapper>
    )
}

export default Dashboard;