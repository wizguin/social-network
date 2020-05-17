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
            return req.app.get('db').getUserByUsername(value).then(function(user) {
                if (!user) return Promise.reject('That user does not exist.')
            })
        }),

    check('password', 'Enter a password (6-20 characters).')
        .trim()
        .escape()
        .isLength({ min: 6, max: 20 })

], async function(req, res) {
    let errors = validationResult(req)
    let db = req.app.get('db')

    if (!errors.isEmpty()) return db.sendAlert(req, res, 'danger', errors.array()[0].msg)

    let user = await db.getUserByUsername(req.body.username)

    bcrypt.compare(req.body.password, user.password, function(error, result) {
        if (error || !result) return db.sendAlert(req, res, 'danger', 'Incorrect Password.')

        // Set sesion variables
        req.session.userId = user.id
        req.session.username = user.username

        res.json({ status: 200, success: true })
    })
})

module.exports = router
