const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const {authLimiter} = require('../middleware/rateLimiter');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const { register, verifyEmail, login, updateRole } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authLimiter, register);
router.post('/verify', authLimiter, verifyEmail);
router.post('/login', authLimiter, login);
router.put('/role', auth, updateRole);
router.get('/google', authLimiter, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/', session: false }),
    (req, res) => {
        const token = generateToken(req.user._id);
        const isNewUser = req.user.isNewUser;
        
        res.redirect(`${process.env.FRONTEND_URL}/OAuthCallback?token=${token}&isNewUser=${isNewUser}`);
    }
);
router.post(
    '/forgot-password',
    [
        check('email', 'Please include a valid email').isEmail()
    ],
    userController.forgotPassword
);




router.put(
    '/reset-password/:token',
    [
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    authLimiter,
    userController.resetPassword
);

module.exports = router;
