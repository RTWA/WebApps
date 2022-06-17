import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import SimpleReactValidator from 'simple-react-validator';
import { Button, Loader, Input, AuthContext } from 'webapps-react';

const Login = props => {
    const { authenticated, signIn } = useContext(AuthContext);
    if (authenticated) {
        let redirect = (localStorage.getItem('WA_Login')) ? localStorage.getItem('WA_Login') : '/';
        window.location.replace(redirect)
    }

    const theme = document.getElementsByTagName('body')[0].getAttribute('data-theme');
    let timer = null;

    const isMountedRef = useRef(true);
    const isMounted = useCallback(() => isMountedRef.current, []);

    const [validator] = useState(new SimpleReactValidator());

    const [value, setValue] = useState(0);

    const [errors, setErrors] = useState({});
    const [states, setStates] = useState({});
    const [state, setState] = useState({
        username: '',
        password: '',
        redirect: null
    });

    useEffect(() => {
        return () => {
            void (isMountedRef.current = false);
            /* istanbul ignore else */
            if (timer) {
                clearTimeout(timer);
            }
        }
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
            state.alert = '';
            setState({ ...state });

            await signIn(state.username, state.password)
                .catch(error => {
                    /* istanbul ignore else */
                    if (error.status.code === 422) {
                        /* istanbul ignore else */
                        if (isMounted()) {
                            state.alert = error.data.errors.username;
                            state.loginActive = false;
                            state.password = '';
                            setState({ ...state });
                        }
                    } else {
                        /* istanbul ignore else */
                        if (isMounted()) {
                            state.alert = error.data.message;
                            state.loginActive = false;
                            state.password = '';
                            setState({ ...state });
                        }
                    }
                });
        } else {
            state.loginActive = true;
            state.alert = '';
            setState({ ...state });

            timer = setTimeout(() => {
                let e = validator.getErrorMessages();
                Object.keys(e).map((field) => {
                    /* istanbul ignore else */
                    if (e[field] !== null) {
                        states[field] = 'error';
                        errors[field] = e[field];
                    }
                    setStates({ ...states });
                    setErrors({ ...errors });
                });
                setValue(value + 1);
                state.loginActive = false;
                setState({ ...state });
            }, 1000);
        }
    };

    /* istanbul ignore next */
    const keyDown = e => {
        if (e.keyCode === 13) {
            handleLogin(e);
        }
    }

    return (
        <form onSubmit={handleLogin} name="login" onKeyDown={keyDown}>
            {
                (state.alert) ? (
                    <div className="text-center font-medium bg-red-300 border border-red-700 text-red-700 w-full mb-4 rounded py-2"
                        role="alert">
                        {state.alert}
                    </div>
                ) : null
            }
            <div className="flex flex-col mb-6">
                <label htmlFor="username" className="sr-only">Username</label>
                <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={state.username || ''}
                    onChange={onChange}
                    autoComplete="no"
                    state={states.username}
                    error={errors.username}
                    action={
                        <svg className="h-5 w-5 text-gray-400" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                    actionLocation="left"
                    wrapperClassName=""
                    inputClassName={`focus:border-${theme}-600 dark:focus:border-${theme}-500`}
                />
                {validator.message('username', state.username, 'required|string')}
            </div>
            <div className="flex flex-col mb-6">
                <label htmlFor="password" className="sr-only">Password</label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={state.password || ''}
                    onChange={onChange}
                    autoComplete="no"
                    state={states.password}
                    error={errors.password}
                    action={
                        <svg className="h-5 w-5 text-gray-400" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    }
                    actionLocation="left"
                    wrapperClassName=""
                    inputClassName={`focus:border-${theme}-600 dark:focus:border-${theme}-500`}
                />
                {validator.message('password', state.password, 'required|string')}
            </div>

            <div className="flex w-full">
                {
                    (state.loginActive)
                        ? (
                            /* istanbul ignore next */
                            <Button
                                id="login-button"
                                onClick={handleLogin}
                                className="flex items-center justify-between w-full cursor-wait"
                                color="gray"
                            >
                                <span className="mr-2 uppercase">Logging In</span>
                                <Loader type="circle" height="5" width="5" color={theme} />
                            </Button>
                        )
                        : (
                            <Button
                                id="login-button"
                                onClick={handleLogin}
                                className="flex items-center justify-between w-full"
                                color={theme}
                            >
                                <span className="mr-2 uppercase">Login</span>
                                <span>
                                    <svg className="pt-0.5 h-6 w-6" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </Button>
                        )
                }
            </div>
        </form>
    )
}

export default Login;
