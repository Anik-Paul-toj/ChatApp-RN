const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email :{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    friendRequest: {
        type: [mongoose.Types.ObjectId],   // <- as an array
        ref: 'User',
        default: []
    },
    friends: {
        type: [mongoose.Types.ObjectId],   // <- as an array
        ref: 'User',
        default: []
    },
    sendFriendRequest: {
        type: [mongoose.Types.ObjectId],   // <- as an array
        ref: 'User',
        default: []
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
