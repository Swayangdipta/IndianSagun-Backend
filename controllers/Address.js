const Address = require("../models/Address.js")
const _ = require("lodash")

exports.getAddressById = async (req,res,next,id) => {
    try {
        const address = await Address.findById(id)
    
        if(!address || address.errors){
          return res.status(404).json({errors: ["No address found."], body: address})
        }
    
        req.address = address
    
        next()
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
} 

exports.createAddress = async (req,res) => {
    try {
        const {name, contact, full_address , reference_name} = req.body

        if(req.profile.addresses.length > 2){
            return res.status(400).json({errors: ["You can not have more than 3 addresses"], body: ''})
        }

        if(!name || !contact || !full_address || !reference_name){
            return res.status(422).json({errors: ["All fields are required."], body: ''})
        }

        const address = new Address(req.body)

        const createdAddress = await address.save()

        if(!createdAddress || createdAddress.errors){
            return res.status(400).json({errors: ["Faild to create address."], body: createdAddress})
        }

        const pushIntoUser = await UserActivation.findByIdAndUpdate(req.profile._id, {$push: {"addresses": createdAddress}})

        if(!pushIntoUser || pushIntoUser.errors){
            return res.status(400).json({errors: ["Faild to add address."], body: pushIntoUser})
        }

        return res.status(200).json({success: true, errors: [], data: createdAddress})
    
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}

exports.getAddress = async (req,res) => {
    if(!req.address){
        return res.status(400).json({errors: ["Faild to get address details"]})
      }
    
    return res.status(200).json({success: true, errors: [], data: req.address})
}

exports.updateAddress = async (req,res) => {
    try {
        let address = req.address
        address = _.extend(address,req.body)
    
        const updatedAddress = await address.save()

        if(!updatedAddress || updatedAddress.errors){
            return res.status(400).json({errors: ["Faild to update address."], body: updatedAddress})
        }

        return res.status(200).json({success: true, errors: [], data: updatedAddress})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}

exports.removeAddress = async (req,res) => {
    try {
        const popFromUser = await UserActivation.findByIdAndUpdate(req.profile._id, {$pull: {"addresses": req.address._id}})

        if(!popFromUser || popFromUser.errors){
            return res.status(400).json({errors: ["Faild to add address."], body: popFromUser})
        }

        const address = await Address.findByIdAndDelete(req.address._id)
        
        if(!address || address.errors){
          return res.status(404).json({errors: ["Faild to remove address."], body: address})
        }
    
        return res.status(200).json({success: true, errors: [], data: address.reference_name})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
}