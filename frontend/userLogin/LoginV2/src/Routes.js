import React from 'react';
import {
    Router,
    Stack,
    Scene} from "react-native-router-flux";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
export default function Routes() {
    return(
        <Router>
            <Stack key="root" hideNavBar={true}>
                <Scene key="Login" component={Login} title="Login" initial={true} />
                <Scene key="Signup" component={Signup} title="Signup" />
            </Stack>
        </Router>
    )
}
