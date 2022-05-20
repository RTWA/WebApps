import React, { useEffect, useState } from 'react';
import SimpleReactValidator from 'simple-react-validator';
import { Loader } from 'webapps-react';

let _mounted = false;

const Login = props => {
    const theme = document.getElementsByTagName('body')[0].getAttribute('data-theme');

    const [validator] = React.useState(new SimpleReactValidator({
        element: message => <div className="text-sm text-red-500">{message}</div>
    }));

    const [value, setValue] = useState(0);

    const [state, setState] = useState({
        username: '',
        password: '',
        redirect: null
    });

    useEffect(() => {
        _mounted = true;
        return () => _mounted = false;
    }, []);

    const onChange = e => {
        let id = e.target.id;
        let value = e.target.value;

        document.getElementById(id).classList.remove('border-red-500');
        state[id] = value;
        setState({ ...state });
    }

    const handleLogin = async e => {
        e.preventDefault();

        if (validator.allValid()) {
            state.loginActive = true
            setState({ ...state });

            await props.loginUser(state.username, state.password, history)
                .catch(error => {
                    /* istanbul ignore else */
                    if (error.status.code === 422) {
                        /* istanbul ignore else */
                        if (_mounted) {
                            state.alert = error.data.errors.username;
                            state.loginActive = false;
                            state.password = '';
                            setState({ ...state });
                        }
                    } else {
                        if (_mounted) {
                            state.alert = error.data.message;
                            state.loginActive = false;
                            state.password = '';
                            setState({ ...state });
                        }
                    }
                });
        } else {
            let errors = validator.getErrorMessages();
            Object.keys(errors).map(function (field) {
                /* istanbul ignore else */
                if (errors[field] !== null)
                    document.getElementById(field).classList.add('border-red-500');
            });
            validator.showMessages();
            setValue(value + 1);
        }
    };

    if (state.loginActive) {
        return <Loader />
    }

    return (
        <form onSubmit={handleLogin} name="login">
            {
                (state.alert) ? (
                    <div className="text-center font-medium bg-red-300 border border-red-700 text-red-700 w-full mb-4 rounded py-2"
                        role="alert">
                        {state.alert}
                    </div>
                ) : null
            }
            <div className="flex flex-col mb-6">
                <label htmlFor="username" className="sr-only">Username:</label>
                <div className="relative">
                    <div className="inline-flex items-center justify-center absolute left-0 top-0 h-full w-10 text-gray-400">
                        <svg className="h-6 w-6" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>

                    <input id="username"
                        type="text"
                        name="username"
                        className={`text-sm sm:text-base placeholder-gray-500 pl-10 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-${theme}-400`}
                        placeholder="Username"
                        value={state.username || ''}
                        onChange={onChange}
                        autoComplete="no" />
                </div>
                {validator.message('username', state.username, 'required|string')}
            </div>
            <div className="flex flex-col mb-6">
                <label htmlFor="password" className="sr-only">Password:</label>
                <div className="relative">
                    <div className="inline-flex items-center justify-center absolute left-0 top-0 h-full w-10 text-gray-400">
                        <span>
                            <svg className="h-6 w-6" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </span>
                    </div>

                    <input id="password"
                        type="password"
                        name="password"
                        className={`text-sm sm:text-base placeholder-gray-500 pl-10 pr-4 rounded-lg border border-gray-400 w-full py-2 focus:outline-none focus:border-${theme}-400`}
                        placeholder="Password"
                        value={state.password || ''}
                        onChange={onChange}
                        autoComplete="no" />
                </div>
                {validator.message('password', state.password, 'required|string')}
            </div>

            <div className="flex w-full">
                {
                    (state.loginActive)
                        ? (
                            /* istanbul ignore next */
                            <button id="login-button"
                                type="submit"
                                className={`flex items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-${theme}-600 dark:bg-${theme}-500 hover:bg-${theme}-700 dark:hover:bg-${theme}-600 rounded py-2 w-full transition duration-150 ease-in`}
                                onClick={handleLogin}>
                                <span className="mr-2 uppercase">Loading...</span>
                                <Loader type="circle" className="h-5 w-5" />
                            </button>
                        )
                        : (
                            <button id="login-button"
                                type="submit"
                                className={`flex items-center justify-center focus:outline-none text-white text-sm sm:text-base bg-${theme}-600 dark:bg-${theme}-500 hover:bg-${theme}-700 dark:hover:bg-${theme}-600 rounded py-2 w-full transition duration-150 ease-in`}
                                onClick={handleLogin}>
                                <span className="mr-2 uppercase">Login</span>
                                <span>
                                    <svg className="h-6 w-6" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </button>
                        )
                }
            </div>
        </form>
    )
}

export default Login;
