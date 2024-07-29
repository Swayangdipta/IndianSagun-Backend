const router = require('express').Router()
const { isSignedIn, isAdmin } = require('../controllers/Auth.js')
const { getCategoryById, createCategory, getCategories, getCategory, updateCategory, removeCategory } = require('../controllers/Category.js')
const { getUserById } = require('../controllers/User.js')

router.param("categoryId",getCategoryById)
router.param("userId",getUserById)

router.post('/create/:userId',isSignedIn,isAdmin,createCategory)

router.get('/all',getCategories)
router.get('/:categoryId',getCategory)

router.put('/update/:categoryId/:userId',isSignedIn,isAdmin,updateCategory)

router.delete('/remove/:categoryId/:userId',isSignedIn,isAdmin,removeCategory)

module.exports = router
