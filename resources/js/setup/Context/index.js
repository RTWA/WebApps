import React, { createContext, useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { APIClient } from 'webapps-react';

export const ThemeContext = createContext({});

const ThemeProvider = props => {
    const [color, setColor] = useState('indigo');
    const [dark, setDark] = useState('user');

    const APIController = new AbortController();

    useEffect(async () => {
        await APIClient('/api/theme', undefined, { signal: APIController.signal })
            .then(json => {
                setColor(json.data['core.ui.theme']);
                setDark(json.data['core.ui.dark_mode']);
            })
            .catch(error => {
                // Not relevant?
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            })

        return () => {
            APIController.abort();
        }
    }, []);

    const changeColor = async value => {
        await APIClient('/api/color', { theme: value }, { signal: APIController.signal })
            .then(json => {
                setColor(value);
            })
            .catch(error => {
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            })
    }

    const changeDark = async mode => {
        await APIClient('/api/dark', { mode: mode }, { signal: APIController.signal })
            .then(json => {
                setDark(mode);
            })
            .catch(error => {
                if (!error.status.isAbort) {
                    // TODO: Handle errors
                    console.error(error);
                }
            })
    }

    return (
        <ThemeContext.Provider
            value={{
                color,
                dark,
                changeColor,
                changeDark
            }}>
            {props.children || null}
        </ThemeContext.Provider>
    )
}

export const Theme = props => {
    return <ThemeProvider {...props} />
}

export const withTheme = (Component) => {
    const displayName = `withTheme(${Component.displayName || Component.name})`;

    const C = (props) => {
        return (
            <ThemeContext.Consumer>
                {(context) => {
                    invariant(
                        context,
                        `You should not use <${displayName} /> outside a <Theme>`
                    );
                    return <Component {...props} {...context} />
                }}
            </ThemeContext.Consumer>
        );
    };

    C.displayName = displayName;

    return C;
}