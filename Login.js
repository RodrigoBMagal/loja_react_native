import React, {useState} from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-web';

const Login = ({navigation}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (username === 'admin' && password === 'password') {
            navigation.navigate('PrimTela');
        } else {
            alert('Credenciais inválidas. Tente novamente.');
        }
    }
    

return (
    <View style={styles.container}>
      <Text style = {styles.cred}>Entre com suas credenciais</Text>

      <Text style = {styles.label}>Login</Text>
      <TextInput placeholder="Digite seu login" style={styles.input} value={username} onChangeText={setUsername} />

      <Text style = {styles.label}>Senha</Text>
      <TextInput placeholder="Digite sua senha" secureTextEntry={true} style={styles.input} value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={() => handleLogin()}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00a2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cred: {
    fontWeight: 'bold',
    fontSize: 30,
    fontFamily: 'Sans-serif',
    marginBottom: 100,
    color: 'white'
  },
  label: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 25,
    fontFamily: 'Sans-serif',
    color: 'white'
  },
  input:{
    borderWidth: 1,
    borderColor: 'gray',
    width: '60%',
    padding: 10,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: 'white',
    placeholderTextColor: '#00000075'
  },
  button: {
    marginTop: 45,
    backgroundColor: '#0077cc',
    borderRadius: 25,
    padding: 10,
    width: '75%'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 25,
    fontFamily: 'Sans-serif',
    textAlign: 'center',
  }
});
export default Login;
