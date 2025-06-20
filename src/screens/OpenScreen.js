import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UserType } from './createContext';
import { useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import UserMap from '../components/UserMap';


const OpenScreen = () => {
  const { userID, setUserID } = useContext(UserType);
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

  const fetchUsers = async () => {
    console.log("Fetching user data...");
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log("Token fetched:", token); // 👈 log token
  
      if (!token) {
        console.log("No token found, user not logged in");
        return;
      }
  
      console.log("Decoding token..."); // 👈 log before decode
      const decodedToken = jwtDecode(token); // 👈 might crash silently
      console.log("Decoded token:", decodedToken); // 👈 log decoded
  
      const userId = decodedToken.userId;
      console.log("Decoded userId:", userId);
      setUserID(userId);
  
      const response = await axios.get(`http://10.0.2.2:8000/users/${userId}`);
      console.log("User data fetched successfully:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
    }
  };
  

  useEffect(() => {
    fetchUsers();
  }, []);

  // Check for duplicate user IDs
  useEffect(() => {
    if (Array.isArray(users)) {
      const ids = users.map(u => u._id);
      const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
      if (duplicates.length > 0) {
        console.warn('Duplicate user IDs found:', duplicates);
      }
    }
  }, [users]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={styles.headerTitle}>ChatApp</Text>
      ),
      headerRight: () => (
        <View style={{flexDirection:'row', alignItems: 'center'}}>
          <Ionicons
            name="chatbox-ellipses-outline"
            size={28}
            color="#000"
            onPress={() => navigation.navigate('Chat')}
            style={{marginRight: 15}}
          />
          <Ionicons
            name="people-outline"
            size={28}
            color="#000"
            onPress={() => navigation.navigate('Friends')}
            style={{marginRight: 15}}
          />
          <MaterialIcons
            name="logout"
            size={28}
            color="#d9534f"
            onPress={handleLogout}
            style={{marginRight: 0}}
          />
        </View>
      ),
    });
  }, [navigation]);

  // Add logout handler
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setUserID("");
      navigation.replace('Home');
    } catch (err) {
      console.log('Logout error:', err);
    }
  };

  return (
    <View style={ styles.container}>
      {/* Logout Button at the top */}
      
      <View style={{padding:10}}>
        {users.map((item,index) => (
          <UserMap key={index} item={item}/>
        ))}
      </View>
      
      
        
    
    </View>
  );
};

export default OpenScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 15,
    alignItems: 'center',
    gap: 15,
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});