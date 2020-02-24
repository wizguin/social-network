import express from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

router.get('/', function(req, res) {
    res.render('login', { title: 'Login' })
})

router.post('/', [
    // Validate username
    check('username', 'Enter a username (1-12 characters).')
        .trim()
        .escape()
        .isLength({ min: 1, max: 12 })
        // Checking if username exists in the database
        .custom(value => {
            return database.findByUsername(value).then(user => {
                if (!user) {
                    return Promise.reject('That user does not exist.')
                }
            })
        }),

    // Validate password
    check('password', 'Enter a password (6-20 characters).')
        .trim()
        .escape()
        .isLength({ min: 6, max: 20 })

], function(req, res) {
    console.log(req.session)
    console.log(req.body.username, req.body.password)
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
        res.render('login', { title: 'Login', error: errors.array()[0].msg })

    } else {
        // Compare passwords if form validates successfully
        database.findByUsername(req.body.username).then(user => {
            bcrypt.compare(req.body.password, user.password, function(error, result) {
                if (result) {
                    // Set sesion variables
                    req.session.userId = user.id
                    req.session.username = user.username

                    res.redirect('/home')

                } else {
                    res.render('login', { title: 'Login', error: 'Incorrect password.' })
                }
            })
        })
    }
})

module.exports = router
