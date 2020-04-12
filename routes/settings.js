import express from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()
const saltRounds = 10
const mimeTypes = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif'
}

function uploadImage(req, res, type) {
    let image = req.files[type]

    if (!req.files ||
        Object.keys(req.files).length === 0 ||
        !(image.mimetype in mimeTypes)) {
            return res.redirect('/settings')
    }

    //let id = uuidv4()
    //let type = mimeTypes[image.mimetype]
    let path = `public/images/${type}/${req.session.userId}.webp`

    image.mv(path, function(err) {
        if (err) return console.log(err)
    })

    res.redirect('/settings')
}

/*========== Get routes ==========*/

router.get('/', function(req, res) {
    res.render('settings', {
        title: 'Settings',
        myUsername: req.session.username
    })
})

/*========== Post routes ==========*/

router.post('/update-avatar', function(req, res) {
    uploadImage(req, res, 'avatar')
})

router.post('/update-header', function(req, res) {
    uploadImage(req, res, 'header')
})

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
    if (!errors.isEmpty()) return res.redirect('/settings')

    database.users.update(
        { email: req.body.email },
        { where: { id: req.session.userId }
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
    if (!errors.isEmpty()) return res.redirect('/settings')

    database.users.update(
        { bio: req.body.bio },
        { where: { id: req.session.userId }
    })
    res.redirect('/settings')
})

module.exports = router
