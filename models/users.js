const mongoose = require("mongoose")

var userSchema = new mongoose.Schema({
    username: String,
    usermail: String,
    userpassword: String,
    userpicture: String,
    userteam: String,
    teamname: String
})

module.exports = mongoose.model('users', userSchema, 'users');