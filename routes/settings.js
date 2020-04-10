import express from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
//import { v4 as uuidv4 } from 'uuid'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()
const saltRounds = 10
const mimeTypes = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif'
}

/*========== Get routes ==========*/

router.get('/', function(req, res) {
    res.render('settings', {
        title: 'Settings',
    })
})

/*========== Post routes ==========*/

router.post('/update-password', [
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
    if (!errors.isEmpty()) return console.log(errors.array()[0].msg)

    bcrypt.hash(req.body.password, saltRounds, function(error, hash) {
        if (error) return res.redirect('/settings')

        database.users.update(
            { password: hash },
            { where: { id: req.session.userId }
        })

        res.redirect('/settings')
    })
})

router.post('/update-email', [
    check('email', 'Enter a valid email address.')
        .trim()
        .escape()
        .isLength({ min: 1, max: 254 })
        .isEmail()
        .normalizeEmail()

], function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.render('settings')

    database.users.update(
        { email: req.body.email },
        { where: { id: req.session.userId }
    })
    res.redirect('/settings')
})

router.post('/update-avatar', function(req, res) {
    let avatar = req.files.avatar

    if (!req.files ||
        Object.keys(req.files).length === 0 ||
        !(avatar.mimetype in mimeTypes)) {
            return res.redirect('/settings')
    }

    //let id = uuidv4()
    let type = mimeTypes[avatar.mimetype]
    let path = `public/images/avatar/${req.session.userId}.webp`

    avatar.mv(path, function(err) {
        if (err) return console.log(err)
    })

    res.redirect('/settings')
})

router.post('/update-header', function(req, res) {
    let header = req.files.header

    if (!req.files ||
        Object.keys(req.files).length === 0 ||
        !(header.mimetype in mimeTypes)) {
            return res.redirect('/settings')
    }

    //let id = uuidv4()
    let type = mimeTypes[header.mimetype]
    let path = `public/images/header/${req.session.userId}.webp`

    header.mv(path, function(err) {
        if (err) return console.log(err)
    })

    res.redirect('/settings')
})

router.post('/update-bio', [
    check('bio', 'Enter a bio (1-200 characters).')
        .trim()
        .escape()
        .isLength({ min: 1, max: 200 })

], function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.render('settings')

    database.users.update(
        { bio: req.body.bio },
        { where: { id: req.session.userId }
    })
    res.redirect('/settings')
})

module.exports = router
