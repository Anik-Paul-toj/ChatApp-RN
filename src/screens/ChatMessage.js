// Importing necessary components and libraries
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image
} from 'react-native';

import React, {
  useLayoutEffect,
  useState,
  useContext,
  useEffect,
  useRef
} from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';
import EmojiSelector from 'react-native-emoji-selector';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserType } from './createContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { launchImageLibrary } from 'react-native-image-picker';


const ChatMessage = () => {
  const [showEmoji, setEmoji] = useState(false);
  const [message, setMessage] = useState('');
  const { userID } = useContext(UserType);
  const route = useRoute();
  const { recepientId } = route.params;
  const [selectedImage, setSelectedImage] = useState('');
  const navigation = useNavigation();
  const [recipientData, setRecipientData] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const scrollViewRef = useRef(null)

  useEffect(()=>{
    scrollToBottom();
  },[])

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  }

  const fetchMessage = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:8000/messages/${userID}/${recepientId}`);
      const data = await response.json();
      if (response.ok) {
        setUserMessages(data);
      } else {
        console.log("error showing messages", response.status.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const pickImage = async () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setSelectedImage(response.assets[0].uri);
        }
      }
    );
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  useEffect(() => {
    const fetchRecipientData = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8000/user-details/${recepientId}`);
        const data = await response.json();
        setRecipientData(data);
      } catch (error) {
        console.error("Error fetching recipient data:", error);
      }
    };
    fetchRecipientData();
  }, []);

  const handleEmoji = () => setEmoji(!showEmoji);

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString('en-US', options);
  };

  const handleSend = async (messageType = "text", imageUrl = '') => {
    try {
      const formData = new FormData();
      formData.append('senderId', userID);
      formData.append('recepientId', recepientId);
  
      if (messageType === 'image') {
        const uriParts = imageUrl.split('/');
        const fileName = uriParts[uriParts.length - 1];
        formData.append('imageFile', {
          uri: imageUrl,
          name: fileName,
          type: 'image/jpeg',
        });
        formData.append('messageType', 'image');
        // Send a placeholder message for images to satisfy schema requirement
        formData.append('messageText', '📷 Image'); 
      } else {
        formData.append('messageType', 'text');
        formData.append('messageText', message);
      }
  
      const response = await fetch('http://10.0.2.2:8000/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
  
      const resData = await response.json();
      if (response.ok) {
        setMessage('');
        setSelectedImage('');
        fetchMessage();
      } else {
        console.warn("Message failed to send", response.status, resData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = (message) => {
    const isSelected = selectedMessages.includes(message._id);

    if (isSelected) {
      // If already selected, remove from the selection
      setSelectedMessages((prev) => prev.filter((id) => id !== message._id));
    } else {
      // If not selected, add to the selection
      setSelectedMessages((prev) => [...prev, message._id]);
    }
  };
  console.log(selectedMessages)

  const deleteMessage = async(messageId) =>{
      try{

        const response = await fetch(`http://10.0.2.2:8000/deleteMessages`, {
          method:'POST',
          headers: {
            "Content-Type" : "application/json"
          },
          body: JSON.stringify({message:messageId})
        });

        if(response.ok){
          setSelectedMessages((prevMessage) => prevMessage.filter((id)=> !messageId.includes(id)));
          fetchMessage();
        }else{
          console.log("Error deleting messages: ", response.status)
        }
        

      }catch(err){
        console.log("Error deleting messages: ",err)
      }

      
  }


  const handleOnContentSizeChange = () =>{
    scrollToBottom();


  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={styles.headerLeftContainer}>
          <Ionicons name="arrow-back" size={24} color="grey" onPress={() => navigation.goBack()} />
          {selectedMessages.length > 0 ? (
            <Text style={styles.headerNameText}>{selectedMessages.length} selected</Text>
          ) : (
            <>
              <View style={styles.profileImageContainer}>
                <Image style={styles.profileImage} source={{ uri: recipientData?.image }} />
              </View>
              <Text style={styles.headerNameText}>{recipientData?.name}</Text>
            </>
          )}
        </View>
      ),
      headerRight: () =>
        selectedMessages.length > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="arrow-redo" size={20} color="grey" />
            <Ionicons name="arrow-undo" size={20} color="grey" />
            <EvilIcons name="star" size={20} color="grey" />
            <MaterialIcons name="delete" size={20} color="grey" onPress={()=> deleteMessage(selectedMessages)}/> 
          </View>
        ) : null
    });
  }, [navigation, recipientData, selectedMessages]);


  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={{flexGrow:1}} onContentSizeChange={handleOnContentSizeChange} showsVerticalScrollIndicator={false}>
        {userMessages.map((item, index) => {
          if (item.messageType === "image" && item.image) {
            return (
              <Pressable
                onLongPress={() => handleDeleteMessage(item)}
                key={index}
                style={item?.senderId._id === userID ? styles.sentMessage : styles.receivedMessage}
              >
                <Image
                  source={{ uri: `http://10.0.2.2:8000/${item.image.replace(/\\/g, "/")}` }}
                  style={styles.chatImage}
                  resizeMode="cover"
                />
                <Text style={styles.timestampText}>{formatTime(item.timestamp)}</Text>
              </Pressable>
            );
          } else if (item.messageType === "text") {
            const isSelected = selectedMessages.includes(item._id)
            return (
              <Pressable
                onLongPress={() => handleDeleteMessage(item)}
                key={index}
                style={
                  [
                    item?.senderId._id === userID ? styles.sentMessage : styles.receivedMessage,
                    isSelected && { width: '100%', backgroundColor: '#F0FFFF' },
                  ]
                }
              >
                <Text style={[styles.messageText, { textAlign: isSelected ? "right" : "left" }]}>{item.message}</Text>
                <Text style={styles.timestampText}>{formatTime(item.timestamp)}</Text>
              </Pressable>
            );
          }
        })}
      </ScrollView>

      {selectedImage ? (
        <View style={styles.previewImageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <Pressable onPress={() => setSelectedImage('')}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.inputWrapper, { marginBottom: showEmoji ? 0 : 25 }]}>
        <Ionicons name="happy" size={24} color="grey" style={styles.iconSpacing} onPress={handleEmoji} />
        <TextInput
          value={message}
          onChangeText={setMessage}
          style={styles.textInput}
          placeholder="Type Your Message"
        />
        <Ionicons name="camera" size={24} color="grey" style={styles.icon} onPress={pickImage} />
        <Ionicons name="mic" size={24} color="grey" style={styles.icon} />
        <Pressable onPress={() => selectedImage ? handleSend('image', selectedImage) : handleSend('text')}>
          <Ionicons name="send" size={24} color="#007bff" style={styles.icon} />
        </Pressable>
      </View>

      {showEmoji && (
        <EmojiSelector
          style={{ height: 250 }}
          onEmojiSelected={(emoji) => setMessage((prev) => prev + emoji)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatMessage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
  },
  iconSpacing: {
    marginRight: 5,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 3,
  },
  icon: {
    margin: 3,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: "#DCF8C6",
    padding: 8,
    maxWidth: "60%",
    borderRadius: 7,
    margin: 10,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: "white",
    padding: 8,
    margin: 10,
    borderRadius: 7,
    maxWidth: "60%",
  },
  messageText: {
    fontSize: 13,

  },
  timestampText: {
    textAlign: "right",
    fontSize: 9,
    color: "grey",
    margin: 5,
  },
  previewImageContainer: {
    alignItems: 'center',
    marginBottom: 10
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 10
  },
  removeText: {
    color: 'red',
    marginTop: 5
  },
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#eee'
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    resizeMode: 'cover'
  },
  headerNameText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5
  }
});
