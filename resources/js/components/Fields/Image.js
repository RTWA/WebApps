import React, { useContext, useEffect, useState } from 'react';
import { APIMediaClient, Input, useToasts, WebAppsUXContext } from 'webapps-react';

const Image = props => {
    const {
        name
    } = props;

    const { theme } = useContext(WebAppsUXContext);

    const [value, setValue] = useState(props.value);

    const { addToast, updateToast } = useToasts();
    let toastId = '';

    const APIController = new AbortController();

    useEffect(() => {
        return () => {
            APIController.abort();
        }
    }, []);

    useEffect(() => {
        props.update(name, value, props.for, props.index);
    }, [value]);

    const urlBtnClick = e => {
        e.preventDefault();
        value.text = '';
        value.src = '';
        value.label = 'Get from URL:';
        value.class = '';
        value.readonly = false;
        value.media_id = null;
        setValue({ ...value });
    }

    const urlChange = e => {
        value.text = e.target.value;
        value.src = e.target.value;
        value.label = 'Get from URL:';
        value.class = '';
        value.readonly = false;
        value.media_id = null;
        setValue({ ...value });
    }

    const uploadChange = async e => {
        let file = e.target.files.length ? e.target.files[0] : /* istanbul ignore next */ null;

        // Check if a file has actually been selected
        /* istanbul ignore else */
        if (file !== null) {
            addToast('Uploading image...', '', { appearence: 'info', autoDismiss: false }, id => toastId = id);

            var formData = new FormData();
            formData.append('file', file);

            await APIMediaClient('/api/media/upload', formData, { signal: APIController.signal })
                .then(json => {
                    value.text = `${json.data.media['original_filename']} (${json.data.media['filesize']})`;
                    value.label = 'Uploaded:';
                    value.class = '';
                    value.readonly = true;
                    value.src = json.data.media.URL;
                    value.media_id = json.data.media.id;
                    setValue({ ...value });

                    updateToast(
                        toastId,
                        {
                            appearance: 'success',
                            autoDismiss: true,
                            autoDismissTimeout: 3000,
                            title: "Image uploaded!"
                        }
                    );
                })
                .catch(error => {
                    /* istanbul ignore else */
                    if (!error.status?.isAbort) {
                        updateToast(
                            toastId,
                            {
                                appearance: 'error',
                                autoDismiss: true,
                                autoDismissTimeout: 5000,
                                title: 'Failed to upload image.'
                            }
                        );
                    }
                })
        } else {
            updateToast('No Image Selected!', '', { appearence: 'warning', autoDismiss: true, autoDismissTimeout: 1000 });
        }
    }

    return (
        <div className="px-4 py-2" data-for={name}>
            <div className="flex flex-col sm:flex-row text-center sm:text-left">
                <div className={`relative overflow-hidden px-4 py-2 bg-${theme}-600 dark:bg-${theme}-400 text-white dark:text-black hover:bg-${theme}-400 dark:hover:bg-${theme}-600`}>
                    <label htmlFor={`_${name}`}>Upload an Image</label>
                    <input type="file" name={`_${name}`} id={`_${name}`} onChange={uploadChange}
                        className="absolute inset-0 w-full cursor-pointer opacity-0 m-0 p-0" />
                </div>
                <span className="mx-4 my-2">-OR-</span>
                <a className={`px-4 py-2 border hover:bg-${theme}-600 text-${theme}-600 border-${theme}-600 dark:hover:bg-${theme}-600 dark:text-${theme}-500 dark:border-${theme}-500 hover:text-white dark:hover:text-white focus:ring-0 imgUrlBtn`} href="#" onClick={urlBtnClick}>Enter URL</a>
            </div>

            <div className={`relative mt-2 ${(value !== undefined) ? value.class : /* istanbul ignore next */ 'hidden'}`} id={`ig_${name}`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" id={`p_${name}`}>
                    <label htmlFor={name} className="text-gray-500 sm:text-sm">{(value !== undefined) ? value.label : /* istanbul ignore next */ 'Get from URL:'}</label>
                </div>
                <Input type="text" inputClassName="pl-28" id={name} name={name} value={value?.text || ''} onChange={urlChange} data-upload="false" readOnly={value?.readonly || false} />
                <div className="text-sm text-red-500 hidden" id={`${name}Help`}></div>
            </div>
        </div>
    );
}

export default Image;