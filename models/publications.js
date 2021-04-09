const mongoose = require("mongoose")

var publicationSchema = new mongoose.Schema({
    context: String,
    datetime: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
})

module.exports = mongoose.model('publications', publicationSchema, 'publications');