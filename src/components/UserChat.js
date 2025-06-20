import { useNavigation, useIsFocused } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { UserType } from '../screens/createContext';


const UserChat = ({ index, item }) => {

    const { userID } = useContext(UserType);
    const [messages, setMessage] = useState([])

    const fetchMessage = async () => {
        try {
          const response = await fetch(`http://10.0.2.2:8000/messages/${userID}/${item._id}`);
          const data = await response.json();
          if (response.ok) {
            setMessage(data);
          } else {
            console.log("error showing messages", response.status.message);
          }
        } catch (err) {
          console.log(err);
        }
      };

      const isFocused = useIsFocused();

      useEffect(() => {
        if (isFocused) {
          fetchMessage();
        }
      }, [isFocused]);

      const getLastMessage = () => {
        if (!messages || messages.length === 0) return null;
        // Find the last message regardless of type
        return messages[messages.length - 1];
      };
      const lastMessage = getLastMessage();
    




    const navigation = useNavigation();
    return (
        <Pressable style={{
            flexDirection:'row', 
            alignItems:'center', 
            gap:10,
            borderBottomWidth: 0.7,
            borderColor:'#D0D0D0',
            padding:10
            }}
            onPress={() => navigation.navigate('ChatMessage',{
                recepientId :item._id,

            })}>

            <Image style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginRight: 10,
            }} source={{ uri: item.image }} />

            <View style={{flex:1}}>
                <Text style={{fontSize:15, fontWeight:'500'}}>{item?.name}</Text>
                <Text style={{color:'grey', marginTop:3, fontWeight:'500'}}>
                  {lastMessage
                    ? lastMessage.messageType === 'image'
                      ? 'Sent an image'
                      : lastMessage.message
                    : "No messages yet"}
                </Text>
            </View>

            <View>
                <Text style={{fontSize:11,fontWeight:'400', color:'#585858'}}>
                  {lastMessage && lastMessage.timestamp ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                </Text>
            </View>

        </Pressable>
        
    )
}

export default UserChat;

const styles = StyleSheet.create({})
