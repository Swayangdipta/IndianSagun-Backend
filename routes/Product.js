const router = require("express").Router()
const { getProductById, createProduct, getAllProducts, getProduct, updateProductData, updateProductImages, removeProduct } = require("../controllers/Product.js")
const { getUserById } = require("../controllers/User.js")
const { isSignedIn, hasProductCRUDRights } = require("../controllers/Auth.js")
const { productValidation } = require("../middlewares/validations.js")


router.param("productId",getProductById)
router.param("userId",getUserById)

router.post("/add/:userId",isSignedIn,hasProductCRUDRights,createProduct)

router.get('/all',getAllProducts)
router.get('/:productId',getProduct)

router.put('/update/:productId/:userId',isSignedIn,hasProductCRUDRights,updateProductData)
router.put('/update/image/:productId/:userId',isSignedIn,hasProductCRUDRights,updateProductImages)

router.delete('/remove/:productId/:userId',isSignedIn,hasProductCRUDRights,removeProduct)

module.exports = router