import React from 'react';

import { InfiniteScroll } from 'webapps-react';
import BlockCard from './BlockCard';

const Grid = ({ blocks, loadMore, hasMore, ...props }) => {
    if (blocks.length === 0) {
        return (
            <div className="text-center p-4">No matching blocks found.</div>
        )
    }

    return (
        <InfiniteScroll
            loadMore={loadMore}
            hasMore={hasMore}>
            <div className="flex flex-wrap gap-4">
                {
                    blocks.map((block, i) => {
                        return <BlockCard block={block} key={i} {...props} />
                    })
                }
            </div>
            {
                (hasMore)
                    ? <button type="button" onClick={loadMore} className="sr-only">Load More</button>
                    : null
            }
        </InfiniteScroll>
    )
}

export default Grid;