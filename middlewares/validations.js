const {body} = require('express-validator')

exports.registrationValidator = [
    body('name', 'Name is Empty').not().isEmpty(),
    body('password', 'Password can not be empty').not().isEmpty(),
    body('password', 'The minimum password length is 6 characters').isLength({min: 6}),
    body('password', 'Password should contain at least an uppercase, an lowercase, a number.').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"),
  ]

exports.loginValidator = [
  body('email', 'Please provide an email or mobile.').not().isEmpty(),
  body('password', 'Password can not be Empty').not().isEmpty()
]

exports.productValidation = [
  body('name', 'Please provide an Name.').not().isEmpty(),
  body('description', 'Please provide an description.').not().isEmpty(),
  body('price', 'Please provide an price.').not().isEmpty(),
]