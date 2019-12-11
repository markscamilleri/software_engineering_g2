import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';

//import { Actions } from 'react-native-router-flux';
import Logo from './Logo';
import Form from './Form';

export default function Signup({navigation}) {
    const signIn = () => {
        //Actions.pop();
        navigation.navigate('Login');
    };
    return (
        <View style={styles.container}>
            <Logo />
            <Form type="Signup" />
            <View style={styles.signup}>
                <Text style={styles.signupText}>Already have an account? </Text>
                <TouchableOpacity onPress={signIn}>
                    <Text style={styles.signupButton}>Sign in</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#455a64',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signup: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        flexDirection: 'row',
    },
    signupText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
    },
    signupButton: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
    },
});
