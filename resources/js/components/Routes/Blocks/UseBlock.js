import React, { useState } from 'react';
import classNames from 'classnames';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useToasts } from 'react-toast-notifications';
import { withWebApps } from 'webapps-react';

const UseBlock = props => {
    const { block, UI } = props;

    const [tab, setTab] = useState(0);

    const { addToast } = useToasts();

    const tabClass = id => classNames(
        'text-gray-600',
        'dark:text-gray-300',
        'py-2',
        'text-sm',
        'flex-grow',
        'hover:text-gray-800',
        'dark:hover:text-gray-500',
        'focus:outline-none',
        (tab === id) ? 'border-b-2' : '',
        (tab === id) ? 'font-medium' : '',
        (tab === id) ? 'border-gray-600' : ''
    )

    const paneClass = id => classNames(
        'pt-10',
        (tab === id) ? 'block' : 'hidden'
    )
    
    /* istanbul ignore next */ 
    const URL = `${location.protocol}//${location.hostname}${(location.port ? `:${location.port}` : '')}`;
    const link = `${URL}/embed/${block.publicId}`;
    const textarea = `<!-- TO MAKE CHANGES TO THIS BLOCK, PLEASE RETURN TO ${URL}/blocks/edit/${block.publicId} -->\r\n` +
        `<iframe src="${link}" style="width=100%;height:100%;border:0;overflow:hidden;" scrolling="no"></iframe>`;

    return (
        <div>
            <nav className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-800 -my-5 -mx-4 sm:-mx-6">
                <button className={tabClass(0)} onClick={() => setTab(0)}>
                    Simple
                </button>
                <button className={tabClass(1)} onClick={() => setTab(1)}>
                    Advanced
                </button>
            </nav>
            <div className={paneClass(0)}>
                <ol className="list-decimal px-6">
                    <li>Click into the box below to automatically copy the text.</li>
                    <li>Go the page you wish to display it on and enter edit mode.</li>
                    <li>Insert an HTML/Embed option and paste (<kbd>Ctrl</kbd>+<kbd>V</kbd>) the text below.</li>
                </ol>
                <label htmlFor="simple-text" className="sr-only">Simple Text to Copy</label>
                <CopyToClipboard text={textarea} onCopy={/* istanbul ignore next */ () => { addToast("Copied to clipboard!", { appearance: 'success' }) }}>
                    <textarea className={`mt-2 w-full bg-gray-200 dark:bg-gray-700 focus:ring-0 focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`} 
                                value={textarea} readOnly rows="4" id="simple-text" />
                </CopyToClipboard>
            </div>
            <div className={paneClass(1)}>
                <ol className="list-decimal px-6">
                    <li>Click in the box below to automatically copy the text.</li>
                    <li>Go the page you wish to display it on and enter edit mode.</li>
                    <li>Select the Web Page/iFrame option.</li>
                    <li>Paste (<kbd>Ctrl</kbd>+<kbd>V</kbd>) the Web Page Address into the correct field.</li>
                    <li>In the Height field enter the a value you think represents the height of your Block (in pixels).</li>
                    <li>Set the scrollbars to <strong>Off</strong>.</li>
                    <li>Press done to embed the block onto the page.</li>
                </ol>
                <label htmlFor="advanced-text" className="sr-only">Advanced Text to Copy</label>
                <CopyToClipboard text={link} onCopy={/* istanbul ignore next */ () => { addToast("Copied to clipboard!", { appearance: 'success' }) }}>
                    <input type="text" className={`mt-2 w-full bg-gray-200 dark:bg-gray-700 focus:ring-0 focus:border-${UI.theme}-600 dark:focus:border-${UI.theme}-500`}
                                value={link} readOnly id="advanced-text" />
                </CopyToClipboard>
            </div>
        </div>
    )
}

export default withWebApps(UseBlock);
