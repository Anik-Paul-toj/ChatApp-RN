import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { KeyboardAvoidingView } from 'react-native';
import { useState } from 'react';
import PressableBtn from '../components/PressableBtn';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({navigation}) => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        const checkLoginStatus = async () => {

            try{
                const token = await AsyncStorage.getItem('authToken');
                if (token) {
                    // User is already logged in, navigate to Home
                    navigation.replace('OpenScreen');
                }else{
                    // User is not logged in, stay on Login screen
                    console.log("User is not logged in");
                }
            } catch (error) {
                console.error('Error checking login status:', error);
                Alert.alert("Error", "An error occurred while checking login status. Please try again later.");
            }
           
        }

        checkLoginStatus();
    }, []);

    const handleLogin = () => {
        const userData = {
            email: email,
            password: password
        }

        if (!email || !password) {
            Alert.alert("Please fill all fields");
            return;
        }

        axios.post(`http://10.0.2.2:8000/login`, userData).then((response) => {
            console.log(response.data);
            const token = response.data.token;

            AsyncStorage.setItem('authToken', token);
            Alert.alert("Login Successful");
            navigation.navigate('OpenScreen');
            
        }).catch((error) => {
            console.error('Error logging in:', error);
            Alert.alert("Login Failed", "Invalid email or password. Please try again.");
        });
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', padding: 10 }}>
            <KeyboardAvoidingView>
                <View style={{ marginTop: 100, alignItems: 'center' }}>
                    <Text style={{ color: "#4a55a2", fontSize: 30, fontWeight: "600" }}>Sign In</Text>
                    <Text style={{ fontSize: 17, marginTop: 8, fontWeight: "600" }}>Sign In to your account</Text>
                </View>
                <View style={{ marginTop: 50 }}>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: 'grey' }}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            style={{ fontSize: email ? 18 : 15, width: 300, height: 50, borderWidth: 1, borderRadius: 10, paddingLeft: 10, marginTop: 10 }}
                            placeholder='Enter Your Email'
                            placeholderTextColor={'black'} />
                    </View>


                    <View>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: 'grey' }}>Password</Text>
                        <TextInput
                            value={password}
                            secureTextEntry={true}
                            onChangeText={(text) => setPassword(text)}
                            style={{ fontSize: email ? 18 : 15, width: 300, height: 50, borderWidth: 1, borderRadius: 10, paddingLeft: 10, marginTop: 10 }}
                            placeholder='Enter Your Password'
                            placeholderTextColor={'black'} />
                    </View>
                </View>


                <View>
                    <PressableBtn label="Login" onPress={handleLogin}/>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, color: 'grey' }}>
                        Don't have an account?{' '}
                    </Text>
                    <Pressable onPress={() => navigation.navigate('Register')}>
                        <Text style={{ fontSize: 16, color: '#4a55a2', fontWeight: 'bold' }}>
                            Sign Up
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}

export default LoginScreen

const styles = StyleSheet.create({})