import React from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';

export default function Logo() {
        return (
            <View style={styles.container}>
                <Text style={styles.logo}>MAP APP</Text>
            </View>
        )
    }

const styles = StyleSheet.create({
    container:{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    logo:{
        color: '#ffffff',
        fontSize: 30
    },
});
