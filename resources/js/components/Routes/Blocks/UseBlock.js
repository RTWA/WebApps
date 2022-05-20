import React, { useContext, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Input, useToasts, WebAppsUXContext } from 'webapps-react';

const UseBlock = props => {
    const { block } = props;
    const { theme } = useContext(WebAppsUXContext);

    const { addToast } = useToasts();

    /* istanbul ignore next */
    const URL = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;
    const link = `${URL}/embed/${block.publicId}`;
    const textarea = `<!-- TO MAKE CHANGES TO THIS BLOCK, PLEASE RETURN TO ${URL}/blocks/edit/${block.publicId} -->\r\n` +
        `<iframe src="${link}" style="width=100%;height:100%;border:0;overflow:hidden;" scrolling="no"></iframe>`;

    return (
        <>
            <label htmlFor="simple-text" className="text-gray-600 dark:text-gray-400 text-sm font-normal">Embed the Block in your web page</label>
            <CopyToClipboard text={textarea} onCopy={/* istanbul ignore next */ () => { addToast("Copied to clipboard!", '', { appearance: 'success' }) }}>
                <textarea className={`bg-gray-50 border-2 border-gray-300 text-gray-900 outline-none text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-colors focus:ring-${theme}-600 dark:focus:ring-${theme}-500 focus:border-${theme}-600 dark:focus:border-${theme}-500`}
                    value={textarea} readOnly rows="4" id="simple-text" />
            </CopyToClipboard>
            <div className="relative my-6 h-px bg-gray-600 dark:bg-gray-400">
                <div className="absolute left-0 top-0 flex justify-center w-full -mt-2">
                    <span className="bg-white dark:bg-gray-900 px-4 text-xs text-gray-600 dark:text-gray-400 uppercase">Or</span>
                </div>
            </div>
            <label htmlFor="advanced-text" className="text-gray-600 dark:text-gray-400 text-sm font-normal">Provide a link to the Block</label>
            <CopyToClipboard text={link} onCopy={/* istanbul ignore next */ () => { addToast("Copied to clipboard!", '', { appearance: 'success' }) }}>
                <Input
                    id="advanced-text"
                    name="advanced-text"
                    action={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    }
                    actionLocation="left"
                    wrapperClassName=""
                    readOnly
                    value={link}
                />
            </CopyToClipboard>
        </>
    )
}

export default UseBlock;