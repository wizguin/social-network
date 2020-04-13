import express from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'


const router = express.Router()

router.get('/', function(req, res) {
    res.render('login', { title: 'Login' })
})

router.post('/', [
    check('username', 'Enter a username (1-12 characters).')
        .trim()
        .escape()
        .isLength({ min: 1, max: 12 })
        .custom(function(value, {req}) {
            return req.app.get('db').findByUsername(value).then(function(user) {
                if (!user) return Promise.reject('That user does not exist.')
            })
        }),

    check('password', 'Enter a password (6-20 characters).')
        .trim()
        .escape()
        .isLength({ min: 6, max: 20 })

], async function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.render('login', { title: 'Login', error: errors.array()[0].msg })

    let user = await req.app.get('db').findByUsername(req.body.username)

    bcrypt.compare(req.body.password, user.password, function(error, result) {
        if (error || !result) return res.render('login', { title: 'Login', error: 'Incorrect password.' })

        // Set sesion variables
        req.session.userId = user.id
        req.session.username = user.username

        res.redirect('/home')
    })
})

module.exports = router
