var mongoose = require("mongoose")

var questionSchema = new mongoose.Schema({
    question: String,
    category: String,
    subject: String,
    user: Array,
    time: {
        type: String,
        default: new Date()
    }
})

module.exports = mongoose.model('questionModel', questionSchema)