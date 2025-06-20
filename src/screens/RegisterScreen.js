import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, Pressable, Alert } from 'react-native';
import PressableBtn from '../components/PressableBtn';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const RegisterScreen = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const navigation = useNavigation();

    const handleRegister = () => {
        const User = {
            name: name,
            email: email,
            password: password,
            image: image
        };

        if (!name || !email || !password || !image) {
            Alert.alert("Please fill all fields");
            return;
        }

        axios.post(`http://10.0.2.2:8000/register`, User)
            .then((response) => {
                console.log(response.data);
                Alert.alert(
                    "User registered successfully",
                    "You can now login with your credentials.",
                    [
                        { text: "OK", onPress: () => navigation.navigate('Home') }
                    ]
                );
                setName('');
                setEmail('');
                setPassword('');
                setImage('');
            }).catch((error) => {
                console.error('Error registering user:', error);
                Alert.alert("Error registering user", "An Error occurred while registering. Please try again later.");
            
            });
    };

    // ✅ This return block must be INSIDE the RegisterScreen component
    return (
        <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', padding: 10 }}>
            <KeyboardAvoidingView>
                <View style={{ marginTop: 100, alignItems: 'center' }}>
                    <Text style={{ color: "#4a55a2", fontSize: 30, fontWeight: "600" }}>Sign Up</Text>
                    <Text style={{ fontSize: 17, marginTop: 8, fontWeight: "600" }}>Register To Your Account</Text>
                </View>

                <View style={{ marginTop: 50 }}>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            placeholder='Enter Your Name'
                            placeholderTextColor={'black'}
                        />
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            placeholder='Enter Your Email'
                            placeholderTextColor={'black'}
                        />
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            value={password}
                            secureTextEntry
                            onChangeText={setPassword}
                            style={styles.input}
                            placeholder='Enter Your Password'
                            placeholderTextColor={'black'}
                        />
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Profile Picture</Text>
                        <TextInput
                            value={image}
                            onChangeText={setImage}
                            style={styles.input}
                            placeholder='Enter Your Profile Picture'
                            placeholderTextColor={'black'}
                        />
                    </View>
                </View>

                <View>
                    <PressableBtn label="Register" onPress={handleRegister} />
                </View>

                <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 16, color: 'grey' }}>
                        Already have an account?{' '}
                    </Text>
                    <Pressable onPress={() => navigation.goBack()}>
                        <Text style={{ fontSize: 16, color: '#4a55a2', fontWeight: 'bold' }}>
                            Sign In
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default RegisterScreen;

const styles = StyleSheet.create({
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: 'grey',
    },
    input: {
        fontSize: 16,
        width: 300,
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 10,
        marginTop: 10,
    }
});
