const router = require('express').Router()
const { isSignedIn, isAdmin } = require('../controllers/Auth.js')
const { getCouponById, createCoupon, updateCoupon, removeCoupon, getCoupon, getAllCoupons } = require('../controllers/Coupon.js')
const { getUserById } = require('../controllers/User.js')

router.param("couponId", getCouponById)
router.param("userId", getUserById)

router.get("/a/:couponId", getCoupon)
router.get("/all", getAllCoupons)

router.post("/:userId",isSignedIn,isAdmin, createCoupon)
router.put("/:couponId/:userId",isSignedIn, isAdmin, updateCoupon)
router.delete("/:couponId/:userId",isSignedIn, isAdmin, removeCoupon)

module.exports = router