const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    images: [{
        type: String
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    stock: {
        type: Number,
        default: 1
    },
    sells: {
        type: Number,
        default: 0
    },
    tags: {
        type: String,
        default: ''
    },
    reviews: [],
    coupons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    }],
    return_policy: {
        type: String
    }
},{timestamps: true})

module.exports = mongoose.model("Product",productSchema)