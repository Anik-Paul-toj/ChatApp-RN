import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const PressableBtn = ({label, onPress }) => {
  return (
    <Pressable onPress= {onPress} style={{
        width:200, 
        backgroundColor:"#567189", 
        padding:15, marginTop:50, 
        marginLeft:'auto', 
        marginRight:'auto',
        borderRadius:10,
        alignItems:'center',


        }}>
        <Text style={{color:'white', fontSize:16, fontWeight:'bold'}}>{label}</Text>
    </Pressable>
  )
}

export default PressableBtn

const styles = StyleSheet.create({})