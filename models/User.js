const mongoose = require('mongoose')
const crypto = require('crypto')
const { type } = require('os')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    contact: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 0
    },
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    }], 
    orders: {
        type: String
    },
    products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    forget_password_token: {
        type: String
    },
    forget_password_expiry: {
        type: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    }
},{timestamps: true})

userSchema.methods = {
    generateForgetPasswordToken: function(){
        const token = crypto.randomBytes(20).toString('hex')

        this.forgetPasswordToken = 
                crypto.createHash('sha256')
                .update(token)
                .digest('hex')

        this.forgetPasswordExpiry = Date.now() + 15 * 60 * 1000
        return token
    }
}

module.exports = mongoose.model("User",userSchema)