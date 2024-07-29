const User = require('../models/User')
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {expressjwt} = require('express-jwt')
const {config} = require('../config/config.js')
const {sendMail, sendEmailVerification} = require('../utils/EmailService.js')

exports.register = async (req,res) => {
    const {name,email,contact,password,confirmPassword} = req.body
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array()})
    }

    if((!email || email.length === 0 || email === '') && (!contact || contact.length < 7 || contact === '')){
        return res.status(422).json({errors: ["Please provide email or mobile."]})
    }

    if(password !== confirmPassword){
        return res.status(422).json({errors: ["Passwords did not match."]})
    }

    try {
        const user = new User({name,email,contact})

        const hashedPassword = await bcrypt.hash(password,10)

        user.password = hashedPassword

        const result = await user.save()

        if(!result || result.errors){
            return res.status(400).json({errors: ["Registration faild. Try again."], body: result})
        }

        const data = {
            recipientMail: result.email,
            recipientName: result.name,
            subject: "Confirm email address",
            confirmationUrl: `/verify/email/${result._id}`
        }

        const isVerificationEmailSent = await sendEmailVerification(data)

        if(isVerificationEmailSent.errors.length > 0){
            return res.status(400).json({errors: ["Faild to sent confirmation email. Registration successful."], body: isVerificationEmailSent.errors})
        }

        return res.status(200).json({success: "Registration successful, Verification email sent.", errors: []})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong. Try again."], body: error})
    }
}

exports.login = async (req,res) => {
    const {email,password} = req.body
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).json({errors: errors.array()})
    }

    try {
        // User can login with Email or Mobile Number
        const user = await User.findOne({$or: [{"email": email}, {"contact": email}]})

        if(!user || user.errors){
            return res.status(404).json({errors: ["No user found."], body: user})
        }

        const isCorrectPassword = await bcrypt.compare(password,user.password)

        if(!isCorrectPassword){
            return res.status(422).json({errors: ["User or password is invalid."]})
        }

        const token = jwt.sign({_id: user.id},config.SECRET)

        res.cookie('token',token,{maxAge: 30 * 24 * 60 * 60 * 1000})

        return res.status(200).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                contact: user.contact,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.logout = async (req,res) => {
    try {
        res.clearCookie('token')

        return res.status(200).json({success: "User signed out."})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.getResetPasswordURL = async (req,res) => {
    const {email} = req.body

    if(!email || email === null){
        return res.status(422).json({errors:  ["Please provide an email"]})
    }

    try {
        const user = await User.findOne({email: {$eq: email}})

        if(!user || user.errors){
            return res.status(404).json({errors: ["No User Found"], body: user})
        }        
        
        let resetToken = await user.generateForgetPasswordToken()

        const updatedUser = await user.save({validateBeforeSave: false})

        if(!updatedUser || updatedUser.errors){
            return res.status(400).json({errors: ["Faild to generate reset url!"], body: updatedUser })
        }

        // console.log(req.headers);

        let resetUrl = `${req.headers.origin}/password/reset/${resetToken}`

        let data = {
            recipientMail: user.email,
            recipientName: user.name,
            resetUrl: resetUrl,
            content: '',
            subject: 'Reset Password for Indian Sagun'
        }

        // console.log(data);

        sendMail(req,res,data)
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}

exports.resetPassword = async (req,res) => {
    const {token: resetToken} = req.query
    const {password, confirmPassword} = req.body

    if(!password || !confirmPassword || password !== confirmPassword){
        return res.status(422).json({errors: ["Passwords did not match!"]})
    }

    const resetPasswordToken = 
            await crypto.createHash('sha256')
                    .update(resetToken)
                    .digest("hex")

    try {
        const user = await User.findOne({forget_password_token: resetPasswordToken,forget_password_expiry: {$gt: Date.now()}})
        
        if(!user || user.errors){
            return res.status(400).json({errors: ["Faild to get user details!"], body: user})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        user.password = hashedPassword
        user.forget_password_expiry = undefined
        user.forget_password_token = undefined

        const updatedUser = await user.save()
        
        if(!updatedUser || updatedUser.errors) {
            return res.status(400).json({errors: ["Faild to reset password!"], body: updatedUser })
        }

        return res.status(200).json({success: true,errors: []})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}

exports.verifyEmailAddress = async (req,res) => {
    try {
        const isVerified = await User.findByIdAndUpdate(req.body._id,{$set: {isEmailVerified: true}})

        if(!isVerified || isVerified.errors){
            return res.status(400).json({errors: ["Faild to verify your email address.Try Again!"], body: isVerificationEmailSent.errors})
        }

        return res.status(200).json({success: "Email has been verified.", errors: []})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}


// Middlewares
exports.isSignedIn = expressjwt({
    secret: config.SECRET,
    algorithms: ['SHA256','HS256','RS256','RSA',"sha1"],
    userProperty: "auth"
})

exports.isAuthenticated = (req,res,next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id

    if(!checker){
        return res.status(403).json({errors: ["Access Denied."]})
    }

    next()
}

exports.isAdmin = (req,res,next) => {
    if(req.profile.role !== 2){
        return res.status(403).json({errors: ["You don't have admin rights."]})
    }

    next()
}

exports.isModerator = (req,res,next) => {
    if(req.profile.role !== 1){
        return res.status(403).json({errors: ["You are not a moderator."]})
    }

    next()
}

exports.hasProductCRUDRights = (req,res,next) => {
    if(req.profile.role < 1){
        return res.status(403).json({errors: ["You do not have rights to perform this action."]})
    }

    next()
}