import React, {useState} from "react";
import { View, TextInput, Button, StyleSheet, Image, Text} from "react-native";

import { createStackNavigator } from '@react-navigation/stack';

import { ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

//const Stack = createStackNavigator();

const PrimTela = () => {
    const [PrimTela, setPrimTela] = useState('');
    const [cargo, setCargo] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bem-vindo à Tela Principal!</Text>
            <TextInput
                placeholder="Digite algo..."
                value={PrimTela}
                onChangeText={setPrimTela}
                style={styles.input}
            />
    
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        width: '60%',
        padding: 10,
        marginTop: 20,
        borderRadius: 15,
        backgroundColor: 'white',
    }
});


export default PrimTela;

