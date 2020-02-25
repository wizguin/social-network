import express from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()
const saltRounds = 10

router.get('/', function(req, res) {
    res.render('register', { title: 'Sign Up' })
})

router.post('/', [
    check('username', 'Enter a username (1-12 characters).')
        .trim()
        .escape()
        .isLength({ min: 1, max: 12 })
        // Checking if username already exists in the database
        .custom(function(value) {
            return database.findByUsername(value).then(function(user) {
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
        .custom(function(value) {
            return database.findByEmail(value).then(function(user) {
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

    // Return error messages to the user
    if (!errors.isEmpty()) return res.render('register', { title: 'Sign Up', error: errors.array()[0].msg })

    // Create new user if form validates successfully
    bcrypt.hash(req.body.password, saltRounds, function(error, hash) {
        if (error) return res.render('register', { title: 'Sign Up', error: error })

        database.users.create({
            username: req.body.username,
            email:  req.body.email,
            password: hash,
            registrationTimestamp: database.getTimestamp()
        })

        res.render('register', { title: 'Sign Up', newAccount: true })
    })

})

module.exports = router
