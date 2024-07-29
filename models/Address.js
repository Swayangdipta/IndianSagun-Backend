const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    full_address: {
        type: String,
        required: true
    },
    reference_name: {
        type: String,
        required: true
    }
},{timestamps: true})

module.exports = mongoose.model("Address",addressSchema)