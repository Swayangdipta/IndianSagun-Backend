const Coupon = require('../models/Coupon.js')
const Category = require('../models/Category.js')
const _ = require('lodash')

exports.getCouponById = async (req,res,next,id) => {
    try {
      const coupon = await Coupon.findById(id)
  
      if(!coupon || coupon.errors){
        return res.status(404).json({errors: ["No coupon found."]})
      }
  
      req.coupon = coupon
  
      next()
    } catch (error) {
      return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
  } 
  
  exports.getCoupon = (req,res) => {
    if(!req.coupon){
      return res.status(400).json({errors: ["Faild to get coupon details"]})
    }
  
    return res.status(200).json({success: true, errors: [], data: req.coupon})
  }
  
  exports.createCoupon = async (req,res) => {
    try {
      const {coupon_name,coupon_value,coupon_category,coupon_validity} = req.body
      
      if(!coupon_name || !coupon_category || !coupon_validity || !coupon_value){
        return res.status(422).json({errors: ["All fields are mandatory."], body: ""})
      }

      const coupon = new Coupon(req.body)
  
      const createdCoupon = await coupon.save()
  
      if(!createdCoupon || createdCoupon.errors){
        return res.status(400).json({errors: ["Faild to create coupon."], body: createdCoupon})
      }
  
      const pushIntoCategory = await Category.findByIdAndUpdate(coupon_category, {$push: {coupons: createdCoupon._id}})
  
      if(!pushIntoCategory || pushIntoCategory.errors){
        return res.status(400).json({errors: ["Faild to add coupon to category. Coupon created."], body: pushIntoCategory})
      }
  
      return res.status(200).json({success: true, errors: [], data: createdCoupon})
  
    } catch (error) {
      console.log(error);
      return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
  }

  exports.getAllCoupons = async (req,res) => {
    try {
      const coupons = await Coupon.find()
  
      if(!coupons || coupons.errors || coupons.length === 0){
        return res.status(404).json({errors: ["No coupons found."]})
      }
  
      return res.status(200).json({success: true, errors: [], data: coupons})
    } catch (error) {
      return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
  }
  
  exports.updateCoupon = async (req,res) => {
    try {
      let coupon = req.coupon
  
      coupon = _.extend(coupon,req.body)
  
      const updatedCoupon = await coupon.save()
  
      if(!updatedCoupon || updatedCoupon.errors){
        return res.status(400).json({errors: ["Faild to create coupon."], body: updatedCoupon})
      }
  
      if(req.body.coupon_category){
        const popFromCategory = await Category.findByIdAndUpdate(req.coupon.coupon_category, {$pull: {coupons: req.coupon._id}})
        
        if(!popFromCategory || popFromCategory.errors){
          return res.status(400).json({errors: ["Faild to remove coupon from category. Coupon updated."], body: popFromCategory})
        }
  
        const pushIntoCategory = await Category.findByIdAndUpdate(req.body.coupon_category, {$push: {coupons: req.coupon._id}})
  
        if(!pushIntoCategory || pushIntoCategory.errors){
          return res.status(400).json({errors: ["Faild to add coupon to category. Coupon updated."], body: pushIntoCategory})
        }
      }
  
      return res.status(200).json({success: true, errors: []})
    } catch (error) {
      return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
  }
  
  exports.removeCoupon = async (req,res) => {
    try {
      const popFromCategory = await Category.findByIdAndUpdate(req.coupon.coupon_category, {$pull: {coupons: req.coupon._id}})
        
      if(!popFromCategory || popFromCategory.errors){
        return res.status(400).json({errors: ["Faild to remove coupon from category."], body: popFromCategory})
      }
  
      const removedCoupon = await Coupon.findByIdAndDelete(req.coupon._id)
  
      if(!removedCoupon || removedCoupon.errors){
        return res.status(400).json({errors: ["Faild to remove coupon."], body: removedCoupon})
      }
  
      return res.status(200).json({success: true, errors: [], data: removedCoupon.coupon_name})
    } catch (error) {
      return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
  }
  
  exports.checkCoupon = async (req,res,next) => {
    try {
      const category = req.category
  
      const isPresent = category.coupons.some(coupon => coupon === req.coupon._id)
  
      if(isPresent && category._id === req.coupon.coupon_category){
        return res.status(200).json({success: true, errors: []})
      }
  
      return res.status(400).json({errors: ["This is not a valid coupon."]})
    } catch (error) {
      return res.status(500).json({errors: ["Something went wrong"], body: error })
    }
  }