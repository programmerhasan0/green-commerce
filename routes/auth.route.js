const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { check, body } = require('express-validator');
const UserModel = require('../models/user.model');

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignUp);
router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage("Please Enter a valid email address.")
],
    authController.postLogin);
router.post('/logout', authController.postLogOut);
router.post('/signup',
    [check('email')
        .isEmail()
        .withMessage('Please Enter a Valid Email')
        .custom((value, { req }) => {
            return UserModel.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject(`${value} --> E-mail exists already, please pick a different one.`);
                    }
                })
        }),
    body('password', 'Please Enter a password with only numbers and text and at least 6 characters')
        .isLength({ min: 6 })
        .isAlphanumeric(),
    body('confirmPassword').custom(((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match');
        }
        return true
    }))
    ],
    authController.postSignUp);
router.post('/reset-password', authController.postReset);
router.post('/new-password', authController.postNewPassword);



module.exports = router;
