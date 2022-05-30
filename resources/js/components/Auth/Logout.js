import { useContext, useEffect } from 'react';
import { AuthContext } from 'webapps-react';

const Logout = () => {
    const { signOut } = useContext(AuthContext);

    useEffect(async () => {
        await signOut();
    }, []);

    return null;
}

export default Logout;