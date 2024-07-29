const router = require('express').Router()
const { getAddressById, getAddress, createAddress, updateAddress, removeAddress } = require('../controllers/Address.js')
const { isSignedIn, isAuthenticated } = require('../controllers/Auth.js')
const { getUserById } = require('../controllers/User.js')

router.param('addressId', getAddressById)
router.param('userId', getUserById)

router.get('/:addressId/:userId',isSignedIn, isAuthenticated, getAddress)

router.post('/:userId', isSignedIn, isAuthenticated, createAddress)

router.put('/:addressId/:userId', isSignedIn, isAuthenticated, updateAddress)

router.delete('/:addressId/:userId', isSignedIn, isAuthenticated, removeAddress)

module.exports = router