const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recepientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video'],
        required: true
    },
    message: {
        type: String,
        required: function() {
            // Only require message if messageType is 'text'
            return this.messageType === 'text';
        },
        default: ''
    },
    image: {
        type: String,
        required: function() {
            // Only require image if messageType is 'image'
            return this.messageType === 'image';
        },
        default: ''
    },
    video: {
        type: String,
        required: function() {
            // Only require video if messageType is 'video'
            return this.messageType === 'video';
        },
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;