const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    info: {
        type: Boolean
    },
    age: {
        type: Number
    },
    location: {
        type: String
    },
    infoUpdate: {
        type: Boolean,
        default: false
    },
    todos: [
        {
            title: String,
            body: String,
            time: Number,
        }
    ]
});

module.exports = User = mongoose.model('users', UserSchema);
