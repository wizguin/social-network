import express from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'


const router = express.Router()
const saltRounds = 10

router.get('/', function(req, res) {
    res.render('register', { title: 'Sign Up' })
})

router.post('/', [
    check('username', 'Enter a username (1-12 characters).')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only include A-Z, 0-9, -,  or _.')
        .trim()
        .escape()
        .isLength({ min: 1, max: 12 })
        // Checking if username already exists in the database
        .custom(function(value, {req}) {
            return req.app.get('db').getUserByUsername(value).then(function(user) {
                if (user) return Promise.reject('That username is already in use.')
            })
        }),

    check('email', 'Enter a valid email address.')
        .trim()
        .escape()
        .isLength({ min: 1, max: 254 })
        .isEmail()
        .normalizeEmail()
        // Checking if email address already exists in the database
        .custom(function(value, {req}) {
            return req.app.get('db').getUserByEmail(value).then(function(user) {
                if (user) return Promise.reject('That email address is already in use.')
            })
        }),

    check('password', 'Enter a password (6-20 characters).')
        .trim()
        .escape()
        .isLength({ min: 6, max: 20 })
        // Checking if passwords match
        .custom(function (value, {req}) {
            if (value !== req.body.passwordRepeat) {
                throw new Error('Passwords must match.')
            } else {
                return true
            }
        })

], function(req, res) {
    let errors = validationResult(req)
    let db = req.app.get('db')

    // Return error messages to the user
    if (!errors.isEmpty()) return db.sendAlert(req, res, 'danger', errors.array()[0].msg)

    // Create new user if form validates successfully
    bcrypt.hash(req.body.password, saltRounds, function(error, hash) {
        if (error) return db.sendAlert(req, res, 'danger', 'There was an error.')

        db.users.create({
            username: req.body.username,
            email:  req.body.email,
            password: hash,
            registrationTimestamp: db.getTimestamp()
        })

        db.sendAlert(req, res, 'success', 'Account created successfully.')
    })

})

module.exports = router
