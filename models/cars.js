var mongoose = require("mongoose")

var carsSchema = new mongoose.Schema({
    id: Number,
    model: String,
    year: String,
    company: String
})

module.exports = mongoose.model('cars', carsSchema)