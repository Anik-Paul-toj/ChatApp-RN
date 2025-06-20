import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { UserType } from './createContext'
import FriendRequest from '../components/FriendRequest'

const FriendsScreen = () => {

    const { userID, setUserID } = useContext(UserType)
    const [friendRequests, setFriendRequests] = useState([])


    const fetchFriendRequest = async () => {
        try {
            console.log("Fetching friend requests for userID:", userID)
            const response = await axios.get(`http://10.0.2.2:8000/friends/${userID}`)
            console.log("Response data:", response.data)
            
            if (response.status === 200) {
                let data = response.data
                
                // Handle empty string response
                if (typeof data === 'string' && data.trim() === '') {
                    console.log("Empty response received, setting empty friend requests")
                    setFriendRequests([])
                    return
                }
                
                // If the response is a string, try to parse it as JSON
                if (typeof data === 'string') {
                    try {
                        data = JSON.parse(data)
                    } catch (e) {
                        console.log("Failed to parse response data as JSON:", e)
                        setFriendRequests([])
                        return
                    }
                }
                
                // Ensure data is an array
                if (!Array.isArray(data)) {
                    console.log("Response data is not an array:", data)
                    setFriendRequests([])
                    return
                }
                
                // Filter out duplicate friend requests based on _id
                const uniqueFriendRequests = [];
                const seenIds = new Set();

                data.forEach(request => {
                    if (!seenIds.has(request._id)) {
                        uniqueFriendRequests.push(request);
                        seenIds.add(request._id);
                    }
                });

                const friendRequestData = uniqueFriendRequests.map((friendRequest) => ({
                    _id: friendRequest._id,
                    name: friendRequest.name,
                    email: friendRequest.email,
                    image: friendRequest.image
                }))
                setFriendRequests(friendRequestData)
                
            }

        } catch (error) {
            console.log("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            })
            setFriendRequests([])
        }
    }


    useEffect(() => {
        fetchFriendRequest();
    }, [])

    console.log(friendRequests)
    
    return (
<View style={{padding:10, marginHorizontal:12}}>
    {friendRequests.length > 0 ? (
        <View>
            <Text style={{margin:10, fontSize:16, fontWeight:'semibold'}}>Your Friend Requests</Text>
            {friendRequests.map((item,index) => {
            return (
            <FriendRequest 
            key={item._id}
            item={item} 
            friendRequests ={friendRequests} 
            setFriendRequest={setFriendRequests} />
            )
            })}
        </View>
    ) : (
        <Text style={{textAlign: 'center', marginTop: 20}}>No friend requests found.</Text>
    )}
</View>
    )
}

export default FriendsScreen

const styles = StyleSheet.create({

})