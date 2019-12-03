import React from 'react';
import {
    Router,
    Stack,
    Scene,
} from 'react-native-router-flux';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function Routes() {
    return (
        <Router>
            <Stack key="root" hideNavBar>
                <Scene key="Login" component={Login} title="Login" initial />
                <Scene key="Signup" component={Signup} title="Signup" />
            </Stack>
        </Router>
    );
}
