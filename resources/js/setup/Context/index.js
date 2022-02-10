import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import invariant from 'tiny-invariant';

export const ThemeContext = createContext({});

const ThemeProvider = props => {
    const [color, setColor] = useState('indigo');
    const [dark, setDark] = useState('user');

    useEffect(async () => {
        await axios.get('/api/theme')
            .then(json => {
                setColor(json.data['core.ui.theme']);
                setDark(json.data['core.ui.dark_mode']);
            })
            .catch(error => {
                // Not relevant?
                // TODO: Handle Errors
                console.log(error)
            })
    });

    const changeColor = async value => {
        await axios.post('/api/color', { theme: value })
            .then(json => {
                setColor(value);
            })
            .catch(error => {
                // TODO: Handle Errors
                console.log(error);
            })
    }

    const changeDark = async mode => {
        await axios.post('/api/dark', { mode: mode })
        .then(json => {
            setDark(mode);
        })
        .catch(error => {
            // TODO: Handle Errors
            console.log(error);
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