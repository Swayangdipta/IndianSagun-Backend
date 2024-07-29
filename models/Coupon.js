const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    coupon_name: {
        type: String,
        required: true,
    },
    coupon_value: {
        type: String,
        required: true,
    },
    coupon_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    coupon_validity: {
        type: Date,
        required: true
    }
},{timestamps: true})

module.exports = mongoose.model("Coupon", couponSchema)