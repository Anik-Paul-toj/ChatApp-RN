import React, { useContext } from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { UserType } from '../screens/createContext'
import { useNavigation } from '@react-navigation/native'

const FriendRequest = ({ item, setFriendRequest }) =>{

    const { userID, setUserID } = useContext(UserType)
    const navigation = useNavigation();

    const handleRequest = async (senderIdToAccept) =>{

        try{
            const response = await fetch("http://10.0.2.2:8000/friend-request/accept", {
                method: 'POST',
                headers:{
                    "Content-Type" : "application/json"
                },
                body:JSON.stringify({
                    senderId: senderIdToAccept,
                    recipientId: userID
                })
            })

            if(response.ok){
                setFriendRequest(prevRequests => prevRequests.filter((request) => request._id !== senderIdToAccept))
                navigation.navigate("Chat")
            } else {
                console.log("Failed to accept friend request:", response.status, await response.text());
            }

        }catch(err){
            console.log("error accepting the friend request", err)
        }

    }

    return (
        <Pressable style={styles.container}>
            <Image style={styles.image} source={{ uri: item.image }} />

            <View style={styles.contentContainer}>
                <Text style={styles.nameText}>{item.name}</Text>
                <Text style={styles.messageText}>sent you a friend request</Text>
            </View>
            
            <View style={styles.buttonContainer}>
                <Pressable style={styles.acceptButton} onPress={() => handleRequest(item._id)}>
                    <Text style={styles.acceptButtonText}>Accept</Text>
                </Pressable>
                {/* You can add a Reject button here if needed */}
                {/* <Pressable style={styles.rejectButton}>
                    <Text style={styles.rejectButtonText}>Reject</Text>
                </Pressable> */}
            </View>
        </Pressable>
    )
}

export default FriendRequest

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    contentContainer: {
        flex: 1,
        flexShrink: 1,
        justifyContent: 'center',
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageText: {
        fontSize: 14,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        flexShrink: 0,
    },
    acceptButton: {
        backgroundColor: '#0066b2',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 5,
    },
    acceptButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    // rejectButton: {
    //     backgroundColor: '#dc3545',
    //     paddingVertical: 8,
    //     paddingHorizontal: 15,
    //     borderRadius: 5,
    //     marginLeft: 5,
    // },
    // rejectButtonText: {
    //     color: 'white',
    //     fontWeight: 'bold',
    // },
})