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
    // Validate username
    check('username', 'Enter a username (1-12 characters).')
        .trim()
        .escape()
        .isLength({ min: 1, max: 12 })
        // Checking if username already exists in the database
        .custom(value => {
            return database.findByUsername(value).then(user => {
                if (user) {
                    console.log(user)
                    return Promise.reject('That username is already in use.')
                }
            })
        }),

    // Validate email address
    check('email', 'Enter a valid email address.')
        .trim()
        .escape()
        .isEmail()
        .normalizeEmail()
        // Checking if username already exists in the database
        .custom(value => {
            return database.findByEmail(value).then(user => {
                if (user) {
                    console.log(user)
                    return Promise.reject('That email is already in use.')
                }
            })
        }),

    // Validate password
    check('password', 'Enter a password (6-20 characters).')
        .trim()
        .escape()
        .isLength({ min: 6, max: 20 })
        // Checking if passwords match
        .custom((value, {req}) => {
            if (value !== req.body.passwordRepeat) {
                throw new Error('Passwords must match.')
            } else {
                return true
            }
        })

], function(req, res) {
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.render('register', { title: 'Sign Up', error: errors.array()[0].msg })

    } else {
        // Create new user if form validates successfully
        bcrypt.hash(req.body.password, saltRounds, function(error, hash) {
            if (error) {
                res.render('register', { title: 'Sign Up', error: error })
            } else {
                database.users.create({
                    username: req.body.username,
                    email:  req.body.email,
                    password: hash,
                    registrationTimestamp: Math.round((new Date()).getTime() / 1000)
                })

                res.render('register', { title: 'Sign Up', newAccount: true })
            }
        })
    }
})

module.exports = router
