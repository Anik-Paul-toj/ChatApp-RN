const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/.env' });

const App = express();
const port = 8000;
const cors = require('cors');

App.use(cors());
App.use(bodyParser.urlencoded({ extended: false }));
App.use(bodyParser.json());
App.use(passport.initialize());

// Serve static files from uploads folder
App.use('/uploads', express.static('uploads'));



// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(
    'mongodb+srv://trojanik003:AnikPaul@cluster0.havbrc5.mongodb.net/',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Start server
App.listen(port, '0.0.0.0', () => {
    console.log(`Server running on 0.0.0.0:${port}`);
});

// Import schemas
const User = require('./models/Users');
const Message = require('./models/Message');

// JWT token creation
const createToken = (userId) => {
    const payload = { userId };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// User Registration
App.post("/register", (req, res) => {
    const { name, email, password, image } = req.body;
    const newUser = new User({ name, email, password, image });

    newUser.save().then(() => {
        res.status(200).json({ message: "User registered successfully", user: newUser });
    }).catch(err => {
        res.status(500).json({ message: "Error registering user", error: err.message });
    });
});

// User Login
App.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    User.findOne({ email }).then((foundUser) => {
        if (!foundUser) return res.status(404).json({ message: "User not found" });
        if (foundUser.password !== password) return res.status(401).json({ message: "Invalid password" });

        const token = createToken(foundUser._id);
        res.status(200).json({ token });
    }).catch(err => {
        res.status(500).json({ message: "Error logging in user", error: err.message });
    });
});

// Get All Users Except Logged-in
App.get("/users/:userId", (req, res) => {
    const loggedInUser = req.params.userId;
    User.find({ _id: { $ne: loggedInUser } }).then((users) => {
        res.status(200).json(users);
    }).catch(err => {
        res.status(500).json({ message: "Error fetching user profile", error: err.message });
    });
});

// Send Friend Request
App.post("/send-friend-request", async (req, res) => {
    const { currentUserId, selectedUserId } = req.body;
    try {
        console.log("Received friend request:", currentUserId, selectedUserId);
        const updatedRecipient = await User.findByIdAndUpdate(
            selectedUserId,
            { $addToSet: { friendRequest: currentUserId } }, // use $addToSet to avoid duplicates
            { new: true }
        );
        const updatedSender = await User.findByIdAndUpdate(
            currentUserId,
            { $addToSet: { sendFriendRequest: selectedUserId } },
            { new: true }
        );
        console.log("Updated recipient:", updatedRecipient);
        console.log("Updated sender:", updatedSender);
        if (!updatedRecipient || !updatedSender) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Friend request sent successfully" });
    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Error sending friend request", error: error.message });
    }
});

// Get Pending Friend Requests
App.get("/friends/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate("friendRequest", "name email image").lean();
        res.json(user.friendRequest);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Accept Friend Request
App.post('/friend-request/accept', async (req, res) => {
    try {
        const { senderId, recipientId } = req.body;
        const sender = await User.findById(senderId);
        const recipient = await User.findById(recipientId);

        sender.friends.push(recipientId);
        recipient.friends.push(senderId);
        recipient.friendRequest = recipient.friendRequest.filter(id => id.toString() !== senderId.toString());
        sender.sendFriendRequest = sender.sendFriendRequest.filter(id => id.toString() !== recipientId.toString());

        await sender.save();
        await recipient.save();

        res.status(200).json({ message: "Friend request accepted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get Accepted Friends
App.get('/accepted-friend/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate("friends", "name email image");
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Send Message (with optional image upload) - FIXED VERSION
App.post('/send-message', upload.single('imageFile'), async (req, res) => {
    try {
        const { senderId, recepientId, messageType, messageText } = req.body;

        const newMessage = new Message({
            senderId,
            recepientId,
            messageType,
            message: messageType === 'text' ? (messageText || '') : '',
            image: messageType === 'image' && req.file ? req.file.path : '',
            video: messageType === 'video' && req.file ? req.file.path : '',
            timestamp: new Date()
        });

        await newMessage.save();
        res.status(200).json({ message: "Message sent successfully", data: newMessage });

    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).json({ message: "Error sending message", error: err.message });
    }
});


// Get User Details
App.get('/user-details/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('name email image');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user details", error: error.message });
    }
});

// Get Messages Between Two Users
App.get('/messages/:senderId/:recepientId', async (req, res) => {
    try {
        const { senderId, recepientId } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId, recepientId },
                { senderId: recepientId, recepientId: senderId }
            ]
        }).populate('senderId', '_id name image');

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "Error fetching messages", error: err.message });
    }
});

//endpoint to delete the messages
App.post('/deleteMessages', async (req, res) => {
    try {
        const { message } = req.body; // message is an array of message IDs
        // If message is a single ID, wrap it in an array
        const ids = Array.isArray(message) ? message : [message];
        await Message.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: "Messages deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting messages", error: err.message });
    }
});



App.get('/friend-requests/sent/:userId', async(req,res)=>{
    try{
        const {userId} = req.params;
        const user = await User.findById(userId).populate("sendFriendRequest", "nae email image")
        const sendFriendRequest = user.sendFriendRequest;


    }catch(err){
        console.log("Error:" ,err)
        res.status(500).json({err : "Internal Server"})
    }
})

App.get('/friends/:userId', (req,res)=>{
    try{
        const {userId} = req.params
        User.findById(userId).populate("friends").then((user)=>{
            if(!user){
                return res.status(404).json({message:"User not found"})
            }

            const friendId = user.friends.map((friend)=>friend._id)

            res.status(200).json(friendId)
        })

    }catch(err){
        console.log("error:", err)
        res.status(500).json({message:"internal server error"})
    }
})