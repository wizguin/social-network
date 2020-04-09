import express from 'express'
import { check, validationResult } from 'express-validator'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

router.get('/', function(req, res) {
    res.render('settings', {
        title: 'Settings',
    })
})

router.post('/update-bio', [
    check('bio', 'Enter a bio (1-200 characters).')
        .trim()
        .escape()
        .isLength({ min: 1, max: 200 })

], async function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.render('settings')

    database.users.update(
        { bio: req.body.bio },
        { where: { id: req.session.userId }
    })
    res.redirect('/settings')
})

module.exports = router
