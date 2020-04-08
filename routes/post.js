import express from 'express'
import { check, validationResult } from 'express-validator'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

router.get('/', function(req, res) {
    res.redirect('/home')
})

router.post('/new', [
    check('postText')
        .trim()
        .escape()
        .isLength({ min: 1}).withMessage('Enter some text.')
        .isLength({ max: 300 }).withMessage('Posts cannot exceed 300 characters.')

], function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    database.posts.create({
        userId: req.session.userId,
        text: req.body.postText,
        timestamp: database.getTimestamp()
    })
    res.sendStatus(200)
})

router.post('/like', function(req, res) {
    console.log(req.body.postId)
    res.sendStatus(200)
})

router.post('/unlike', function(req, res) {
    console.log(req.body.postId)
    res.sendStatus(200)
})


module.exports = router
