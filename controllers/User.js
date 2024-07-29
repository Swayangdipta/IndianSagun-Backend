const User = require('../models/User.js')
const _ = require('lodash')

exports.getUserById = async (req,res,next,id) => {
    try {
        const user = await User.findById(id).populate('orders').populate('cart').populate('products')

        if(!user || user.errors){
            return res.status(404).json({errors: ["No user found."], body: user})
        }

        req.profile = user

        next()
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.getUserData = (req,res) => {
    const {type} = req.query
    let userData = {errors: "No information available."}

    if(req.profile){
        if(type === 'cart'){
            userData = req.profile.cart
        }else if(type === 'orders'){
            userData = req.profile.orders
        }else if(type === 'role'){
            userData = req.profile.role
        }else if(type === 'products'){
            userData = req.profile.products
        }else{
            userData = req.profile
        }
    }

    return res.status(200).json(userData)
}

exports.updateUser = async (req,res) => {
    try {
        let user = req.profile

        user = _.extend(user, req.body)

        const updatedUser = await user.save()

        if(!updatedUser || updatedUser.errors){
            return res.status(500).json({errors: ["Faild to update!"], body: updatedUser})
        }

        return res.status(200).json({success: "Updated successfully."})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.addToCart = async (req,res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.profile._id,{$push: {'cart': req.body.productId}},{safe: true,upsert:true,new:true})

        if(!updatedUser || updatedUser.errors){
            return res.status(500).json({errors: ["Faild to add to cart!"], body: updatedUser})
        }

        return res.status(200).json({success: "Added successfully."})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.removeFromCart = async (req,res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.profile._id,{$pull: {'cart': req.body.productId}},{safe: true,upsert:true,new:true})

        if(!updatedUser || updatedUser.errors){
            return res.status(500).json({errors: ["Faild to remove from cart!"], body: updatedUser})
        }

        return res.status(200).json({success: "Removed successfully."})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.addToOrders = async (req,res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.profile._id,{$push: {'orders': req.body.orderId}},{safe: true,upsert:true,new:true})

        if(!updatedUser || updatedUser.errors){
            return res.status(500).json({errors: ["Faild to add to orders. Contact Support"], body: updatedUser})
        }

        return res.status(200).json({success: "Added successfully."})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}