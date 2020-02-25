import express from 'express'
import { check, validationResult } from 'express-validator'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

router.get('/', function(req, res) {
    database.findById(req.session.userId).then(function(user) {
        res.render('home', {
            title: 'Home',
            myUsername: req.session.username,
            user: user.dataValues
        })
    })
})

router.post('/post', [
    check('postText')
        .trim()
        .escape()
        .isLength({ min: 1}).withMessage('Enter some text.')
        .isLength({ max: 300 }).withMessage('Posts cannot exceed 300 characters.')

], function(req, res) {
    console.log(req.body)

    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    database.posts.create({
        userId: req.session.userId,
        text: req.body.postText,
        timestamp: database.getTimestamp()
    })
    res.sendStatus(200)
})

module.exports = router
