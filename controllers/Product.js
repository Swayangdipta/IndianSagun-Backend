const { validationResult, body } = require("express-validator")
const Product = require("../models/Product.js")
const User = require("../models/User.js")
const Category = require("../models/Category.js")
const formidable = require("formidable")
const fs = require("fs")
const { upload } = require("../utils/ImageUpload.js")
const _ = require("lodash")


exports.getProductById = async (req,res,next,id) => {
    try {
        const product = await Product.findById(id)//.populate('seller').populate('coupons')

        if(!product || product.errors){
            return res.status(404).json({errors: ["No product found."], body: product})
        }

        req.product = product

        next()
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.createProduct = async (req,res) => {
    try {
        const form = new formidable.IncomingForm({keepExtensions: true,multiples: true})
        
        form.parse(req,async (err,fields,files) => {

            if(err){
                return res.status(422).json({errors: ["Faild to upload product image"], body:err})
            }

            let {name, description, price, stock, sells, return_policy, seller,tags,category} = fields
            
            name = typeof name !== 'string' ? name[0] : name
            seller = seller && typeof seller !== 'string' ? seller[0] : seller
            description = typeof description !== 'string' ? description[0] : description
            price = typeof price !== 'number' ? price[0] : price
            stock = stock && typeof stock !== 'number' ? stock[0] : stock
            sells = sells && typeof sells !== 'number' ? sells[0] : sells
            tags = tags && typeof tags !== 'string' ? tags[0] : tags
            category = category && typeof category !== 'string' ? category[0] : category
            return_policy = return_policy && typeof return_policy !== 'string' ? return_policy[0] : return_policy

            const product = new Product({name,seller,description,price,sells,stock,return_policy})

            if(!name || !description || !price){
                return res.status(422).json({errors: ["Please provide all the required fields"]})
            }

            const images = files.images
            const uploadErrors = []

            for (let index = 0; index < images.length; index++) {
                const file = images[index]

                if(file.size > 2100000){
                    return res.status(422).json({errors: ["Maximum image size is 2 MB."], body: file.originalFilename})
                }

                if(file.mimetype !== "image/jpg" && file.mimetype !== "image/png" && file.mimetype !== "image/webp" && file.mimetype !== "image/jpeg"){
                    return res.status(422).json({errors: ["File type not supported."], body: file.mimetype})
                }

                const uploadedImage = await upload(file.filepath)

                if(uploadedImage.errors){
                    uploadErrors.push(uploadedImage.errors)
                }else{
                    product.images.push(uploadedImage)
                }
            }

            if(uploadErrors.length > 0) {
                return res.status(400).json({errors: uploadErrors})
            }

            const createdProduct = await product.save()
            
            if(!createdProduct || createdProduct.errors){
                // Come back here for reverting/ deleting the uploaded images
                return res.status(400).json({errors: ["Faild to add product."], body: createdProduct})
            }

            const pushProductIntoSeller = await User.findByIdAndUpdate(seller,{$push: {products: createdProduct._id}})
            const pushProductIntoCategory = await Category.findByIdAndUpdate(category,{$push: {products: createdProduct._id}})

            if(!pushProductIntoSeller || pushProductIntoSeller.errors){
                return res.status(400).json({errors: ["Faild to add product to seller account."], body: createdProduct})
            }

            if(!pushProductIntoCategory || pushProductIntoCategory.errors){
                return res.status(400).json({errors: ["Faild to add product to the specified category."], body: createdProduct})
            }

            return res.status(200).json({success: true, errors: [],product: createdProduct})
        })
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.getAllProducts = async (req,res) => {
    try {
        const page = req.body.page
        const limit = req.body.limit || 20
        const offset = (page - 1) * limit

        const products = await Product.find().skip(offset).limit(limit)

        if(!products || products.length === 0 || products.errors){
            return res.status(404).json({errors: ["No prodcuts found."]})
        }

        return res.status(200).json({success: true, errors: [], products: products})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.getProduct = (req,res) => {
    if(req.product){
        return res.status(200).json({success: true, errors: [], product: req.product})
    }

    return res.status(400).json({errors: ["Faild to load product."]})
}

exports.updateProductData = async (req,res) => {
    try {
        let product = req.product

        product = _.extend(product,req.body)

        const updatedProduct = await product.save()

        if(!updatedProduct || updatedProduct.errors){
            return res.status(400).json({errors: ["Faild to update product."], body: updatedProduct})
        }

        return res.status(200).json({success: true,errors: []})
    } catch (error) {
        console.log(error);
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.updateProductImages = async (req,res) => {
    try {
        const form = new formidable.IncomingForm({keepExtensions: true,multiples: true})
        const product = req.product

        form.parse(req,async (err,fields,files) => {
            const images = files.images
            const uploadErrors = []
            const uploadedImages = []

            for (let index = 0; index < images.length; index++) {
                const file = images[index]

                if(file.size > 2100000){
                    return res.status(422).json({errors: ["Maximum image size is 2 MB."], body: file.originalFilename})
                }

                if(file.mimetype !== "image/jpg" && file.mimetype !== "image/png" && file.mimetype !== "image/webp" && file.mimetype !== "image/jpeg"){
                    return res.status(422).json({errors: ["File type not supported."], body: file.mimetype})
                }

                const uploadedImage = await upload(file.filepath)

                if(uploadedImage.errors){
                    uploadErrors.push(uploadedImage.errors)
                }else{
                    uploadedImages.push(uploadedImage)
                }
            }

            if(uploadErrors.length > 0) {
                return res.status(400).json({errors: uploadErrors})
            }
            // TODO: Before saving the new images, remove the previous images from cloudinary
            product.images = uploadedImages

            const updatedProduct = await product.save()

            if(!updatedProduct || updatedProduct.errors){
                return res.status(400).json({errors: ["Faild to update product."], body: updatedProduct})
            }
    
            return res.status(200).json({success: true,errors: [], images: updatedProduct.images})
        })
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}

exports.removeProduct = async (req,res) => {
    try {

        const popProductFromSeller = await User.findByIdAndUpdate(req.body.seller,{$pull: {products: createdProduct._id}})
        const popProductFromCategory = await Category.findByIdAndUpdate(req.body.category,{$pull: {products: createdProduct._id}})

        if(!popProductFromSeller || popProductFromSeller.errors){
            return res.status(400).json({errors: ["Faild to add product to seller account."], body: createdProduct})
        }

        if(!popProductFromCategory || popProductFromCategory.errors){
            return res.status(400).json({errors: ["Faild to add product to the specified category."], body: createdProduct})
        }

        const removedProduct = await Product.findByIdAndDelete(req.product._id)

        if(!removedProduct || removedProduct.errors){
            return res.status(400).json({errors: ["Faild to delete product."], body: updatedProduct})
        }

        // TODO: Before returning the response, remove images from cloudinary
        // Log everything

        return res.status(200).json({success: true, errors: []})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong!"], body: error})
    }
}