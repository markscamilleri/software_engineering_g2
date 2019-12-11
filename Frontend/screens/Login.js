import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
//import {Actions} from "react-native-router-flux";

import Logo from "./components/Logo";
import Form from "./components/Form";

export default function Login({navigation}) {

    const signup = () => {
        navigation.navigate('Signup');
    }
        return (
            <View style={styles.container}>
                <Logo/>
                <Form type={"Login"}/>
                <View style={styles.signup}>
                    <Text style={styles.signupText}>Don't have an account yet? </Text>
                    <TouchableOpacity onPress={signup}>

                        <Text style={styles.signupButton}>Sign-up</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#455a64',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    signup:{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        flexDirection: 'row'
    },
    signupText:{
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16
    },
    signupButton:{
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500'
    }
});
