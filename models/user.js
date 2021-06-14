const mongoose = require("mongoose");

const date = new Date();
const lastNoti = new Date(date - (1000*60*61));

const userSchema = new mongoose.Schema({
    uid: {type: Number},
    username: {type: String},
    age: {type: Number},
    pincode: {type: Number},
    lastNotified: {type: String, default: lastNoti},
    date: { type: String, default: Date.now }
})

module.exports = mongoose.model('User', userSchema);