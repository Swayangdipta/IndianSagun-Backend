const Category = require('../models/Category.js')
const _ = require('lodash')

exports.getCategoryById = async (req,res,next,id) => {
    try {
        const category = await Category.findById(id).populate('products')//.populate("coupons")

        if(!category || category.errors){
            return res.status(404).json({errors: "Faild to load category.", body: category})
        }

        req.category = category

        next()
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong."], body: error})
    }
}

exports.createCategory = async (req,res) => {
    const {name} = req.body
    
    if(!name || name === '' || typeof name !== 'string'){
        return res.status(422).json({errors: ["Name is required."], body: name})
    }

    try {
        const category = new Category(req.body)

        const createdCategory = await category.save()

        if(!createdCategory || createdCategory.errors){
            return res.status(400).json({errors: ["Faild to create category."], body: createdCategory})
        }

        return res.status(200).json({success: true, errors: []})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong."], body: error})
    }
}

exports.getCategories = async (req,res) => {
    try {
        const categories = await Category.find()

        if(categories.length === 0 || !categories){
            return res.status(404).json({errors: ["No categories found."]})
        }

        return res.status(200).json(categories)
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong."], body: error})
    }
}

exports.getCategory = (req,res) => {
    if(req.category){
        return res.status(200).json(req.category)
    }

    return res.status(404).json({errors: ["No categories found."]})
}

exports.updateCategory = async (req,res) => {
    const name = req.body.name
    if(!name || name === '' || name.length === 0 || typeof name !== 'string'){
        return res.status(422).json({errors: ["Name is required."]})
    }

    try {
        let category = req.category

        category = _.extend(category, req.body)

        const updatedCategory = await category.save()

        if(!updatedCategory || updatedCategory.errors){
            return res.status(400).json({errors: ["Faild to update category."], body: updatedCategory})
        }

        return res.status(200).json({success: true, errors: []})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong."], body: error})
    }
}

exports.removeCategory = async (req,res) => {
    try {
        const removedCategory = await Category.findByIdAndDelete(req.category._id)

        if(!removedCategory || removedCategory.errors){
            return res.status(400).json({errors: ["Faild to delete category."], body: removedCategory})
        }

        return res.status(200).json({success: true, errors: []})
    } catch (error) {
        return res.status(500).json({errors: ["Something went wrong."], body: error})
    }
}