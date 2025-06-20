import { Pressable, StyleSheet, Text, View, Image, Alert } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { UserType } from '../screens/createContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const UserMap = ({ item }) => {
  const { userID, setUserID } = useContext(UserType);
  const navigation = useNavigation();

  const [requestSent, setRequestSent] = useState(false);
  const [friendReq, setFriendReq] = useState([]);
  const [userFriendReq, setUserFriendReq] = useState([]);

  // Fetch sent friend requests
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8000/friend-requests/sent/${userID}`);
        const data = await response.json(); // ✅ FIXED
        if (response.ok) {
          setFriendReq(data);
        } else {
          console.log('Friend request fetch error status:', response.status);
        }
      } catch (err) {
        console.log('Fetch friend requests error:', err);
      }
    };
    fetchFriends();
  }, [userID]);

  // Fetch actual friends
  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8000/friends/${userID}`);
        const data = await response.json(); // ✅ FIXED
        if (response.ok) {
          setUserFriendReq(data);
        } else {
          console.log('User friends fetch error status:', response.status);
        }
      } catch (err) {
        console.log('Fetch user friends error:', err);
      }
    };
    fetchUserFriends();
  }, [userID]);

  // Send friend request
  const sendFriendRequest = async (currentUserId, selectedUserId) => {
    console.log(`Sending friend request with: currentUserId: ${currentUserId}, selectedUserId: ${selectedUserId}`);
    try {
      const response = await fetch('http://10.0.2.2:8000/send-friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentUserId, selectedUserId }),
      });

      const data = await response.json();

      if (response.ok) {
        setRequestSent(true);
        Alert.alert('Success', 'Friend request sent successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to send friend request');
      }
    } catch (error) {
      console.log('Send friend request error:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setUserID('');
      navigation.replace('Login');
    } catch (err) {
      console.log('Logout error:', err);
    }
  };

  const isAlreadyFriend =
    Array.isArray(userFriendReq) &&
    userFriendReq.some(friend =>
      (typeof friend === 'string' && friend === item._id) ||
      (friend && friend.toString && friend.toString() === item._id)
    );
  const isRequestAlreadySent =
    requestSent || (Array.isArray(friendReq) && friendReq.some(friend => friend._id === item._id));

  const handleOpenChat = () => {
    navigation.navigate('ChatMessage', {
      recepientId: item._id,
    });
  };

  return (
    <Pressable
      style={{ flexDirection: 'row', alignContent: 'center', marginVertical: 10 }}
      onPress={isAlreadyFriend ? handleOpenChat : undefined}
    >
      <View>
        <Image
          source={{ uri: item.image }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 50,
            resizeMode: 'cover',
          }}
        />
      </View>
      <View style={{ marginLeft: 10, flex: 1 }}>
        <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
        <Text style={{ marginTop: 4, color: 'grey' }}>{item.email}</Text>
      </View>
      {isAlreadyFriend ? (
        <Pressable
          style={{
            backgroundColor: '#82CD47',
            padding: 10,
            width: 105,
            borderRadius: 6,
            justifyContent: 'center',
          }}
          onPress={handleOpenChat}
        >
          <Text style={{ textAlign: 'center', color: 'white' }}>Friends</Text>
        </Pressable>
      ) : isRequestAlreadySent ? (
        <Pressable
          style={{
            backgroundColor: 'gray',
            padding: 10,
            width: 105,
            borderRadius: 6,
            justifyContent: 'center',
          }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontSize: 13 }}>Request Sent</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => sendFriendRequest(userID, item._id)}
          style={{
            backgroundColor: '#567189',
            padding: 10,
            borderRadius: 6,
            width: 105,
            justifyContent: 'center',
          }}
        >
          <Text style={{ textAlign: 'center', color: 'white', fontSize: 13 }}>Add Friend</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

export default UserMap;

const styles = StyleSheet.create({});
