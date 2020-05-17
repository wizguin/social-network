import express from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'


const router = express.Router()
const saltRounds = 10
const mimeTypes = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif'
}

function uploadImage(req, res, type) {
    let db = req.app.get('db')
    if (!req.files || !req.files[type]) return db.sendAlert(req, res, 'danger', `Please select a file.`)

    let image = req.files[type]

    if (!req.files || Object.keys(req.files).length === 0 || !(image.mimetype in mimeTypes)) {
        return db.sendAlert(req, res, 'danger', `There was an error updating your ${type}.`)
    }

    let path = `public/images/${type}/${req.session.userId}.webp`

    image.mv(path, function(err) {
        if (err) return db.sendAlert(req, res, 'danger', `There was an error updating your ${type}.`)
    })

    db.sendAlert(req, res, 'success', `Your ${type} was updated successfully.`)
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
    let db = req.app.get('db')

    if (!errors.isEmpty()) return db.sendAlert(req, res, 'danger', errors.array()[0].msg)

    bcrypt.hash(req.body.password, saltRounds, function(error, hash) {
        if (error) return db.sendAlert(req, res, 'danger', 'There was an error updating your password.')

        db.users.update(
            { password: hash },
            { where: { id: req.session.userId }
        })

        db.sendAlert(req, res, 'success', 'Password updated successfully.')
    })
})

router.post('/update-email', [
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
        })

], function(req, res) {
    let errors = validationResult(req)
    let db = req.app.get('db')

    if (!errors.isEmpty()) return db.sendAlert(req, res, 'danger', errors.array()[0].msg)

    db.users.update(
        { email: req.body.email },
        { where: { id: req.session.userId }
    })

    db.sendAlert(req, res, 'success', 'Email updated successfully.')
})

router.post('/update-bio', [
    check('bio', 'Enter a bio (1-200 characters).')
        .trim()
        .escape()
        .isLength({ min: 1, max: 200 })

], function(req, res) {
    let errors = validationResult(req)
    let db = req.app.get('db')

    if (!errors.isEmpty()) return db.sendAlert(req, res, 'danger', errors.array()[0].msg)

    db.users.update(
        { bio: req.body.bio },
        { where: { id: req.session.userId }
    })

    db.sendAlert(req, res, 'success', 'Bio updated successfully.')
})

router.post('/delete', function(req, res) {
    req.app.get('db').users.destroy({
        where: {
            id: req.session.userId,
        }
    })

    res.sendStatus(200)
})

module.exports = router
