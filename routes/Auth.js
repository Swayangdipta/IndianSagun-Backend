const router = require('express').Router()
const { register, login, logout,getResetPasswordURL, verifyEmailAddress } = require('../controllers/Auth.js')
const { registrationValidator, loginValidator } = require('../middlewares/validations.js')

router.post('/registar',registrationValidator,register)
router.post('/login',loginValidator,login)

router.get('/logout', logout)

router.post('/forgot', getResetPasswordURL)

router.post('/verify/email',verifyEmailAddress)

module.exports = router