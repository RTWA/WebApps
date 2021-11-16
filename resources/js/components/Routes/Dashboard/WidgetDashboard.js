import React, { useEffect, useState } from 'react';
import GridLayout, { WidthProvider } from 'react-grid-layout';
const DashboardGridLayout = WidthProvider(GridLayout);

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Widget from './Widget';

const Dashboard = () => {
    // const [widgets, setWidgets] = useState([]);
    const [userWidgets, setUserWidgets] = useState([]);

    useEffect(() => {
        // TODO: Load available widgets list

        // TODO: Load User's widgets and layout
        if (!userWidgets[0]) {
            setUserWidgets([
                {
                    component: 'BlockCount',
                    grid: { x: 0, y: 0, w: 2, h: 2 }
                },
                {
                    component: 'BlockViews',
                    grid: { x: 2, y: 0, w: 2, h: 2 }
                },
                {
                    component: 'RecentBlocks',
                    grid: { x: 0, y: 4, w: 6, h: 5 }
                },
                {
                    component: 'PopularBlocks',
                    grid: { x: 7, y: 4, w: 6, h: 5 }
                }
            ])
        }
    }, []);

    return (
        <DashboardGridLayout className="w-full h-full" cols={12} rowHeight={58} isBounded isResizable={false} compactType={null}>
            {
                Object(userWidgets).map(function (widget) {
                    return (
                        <div key={widget.component} data-grid={widget.grid}>
                            {/* <div id={`${widget.component}_Widget`} className="w-full h-full" /> */}
                            <Widget component={widget.component} className="w-full h-full" />
                        </div>
                    )
                })
            }
        </DashboardGridLayout>
    )
}

export default Dashboard;