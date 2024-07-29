const router = require('express').Router()
const { isSignedIn, isAuthenticated } = require('../controllers/Auth.js')
const { getUserById, getUserData, updateUser, addToCart, removeFromCart } = require('../controllers/User.js')

router.param("userId",getUserById)

router.get('/:userId',isSignedIn,isAuthenticated,getUserData)
router.put('/u/:userId',isSignedIn,isAuthenticated,updateUser)

router.post('/cart/add/:userId',isSignedIn,isAuthenticated,addToCart)
router.post('/cart/remove/:userId',isSignedIn,isAuthenticated,removeFromCart)
.js

module.exports = router