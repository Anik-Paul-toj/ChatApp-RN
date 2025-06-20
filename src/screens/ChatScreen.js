import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { UserType } from './createContext'
import { useNavigation } from '@react-navigation/native'
import UserChat from '../components/UserChat'
import PressableBtn from '../components/PressableBtn'

const ChatScreen = () =>{

    const [acceptedFriends, setAcceptedFriends] = useState([])
    const { userID, setUserID } = useContext(UserType);
    const navigation = useNavigation();

    useEffect(() =>{
        const acceptedFriendList = async () =>{
            try{
                const response = await fetch(`http://10.0.2.2:8000/accepted-friend/${userID}`)
                const data =  await response.json();

                if(response.ok){
                    setAcceptedFriends(data)
                }

            }catch(err){
                console.log("Error fetching accepted friends:", err)
            }
        }

        acceptedFriendList();

    },[userID])

    console.log("friends:", acceptedFriends)

    // Filter out duplicate accepted friends by _id
    const uniqueAcceptedFriends = Array.isArray(acceptedFriends)
      ? acceptedFriends.filter((user, index, self) =>
          index === self.findIndex(u => u._id === user._id)
        )
      : [];

    return(
        <ScrollView style={styles.container}>
            {uniqueAcceptedFriends.length > 0 ? (
                <View>
                    {uniqueAcceptedFriends.map((item) => (
                        <UserChat key={item._id} item={item} />
                    ))}
                </View>
            ) : (
                <Text style={styles.noFriendsText}>No accepted friends yet. Start chatting!</Text>
            )}

            
        </ScrollView>

    )
}

export default ChatScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        padding: 10,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    noFriendsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
})
