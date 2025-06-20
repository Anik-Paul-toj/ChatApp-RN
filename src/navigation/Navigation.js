import { StyleSheet, Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native'
import RegisterScreen from '../screens/RegisterScreen'
import LoginScreen from '../screens/LoginScreen'
import OpenScreen from '../screens/OpenScreen'

import React from 'react'       
import FriendsScreen from '../screens/FriendsScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatMessage from '../screens/ChatMessage';

const Stack = createNativeStackNavigator()
const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={LoginScreen}  options={{headerShown:false}}/>
        <Stack.Screen name="Register" component={RegisterScreen}  options={{headerShown:false}}/>
        <Stack.Screen name= "OpenScreen" component={OpenScreen} options={{headerShown:true}}/>
        <Stack.Screen name= "Friends" component={FriendsScreen} options={{headerShown:true}}/>
        <Stack.Screen name="Chat" component={ChatScreen}  options={{headerShown:true}}/>
        <Stack.Screen name ="ChatMessage" component={ChatMessage} options={{headerShown:true}}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigation

const styles = StyleSheet.create({})