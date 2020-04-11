import express from 'express'
import { check, validationResult } from 'express-validator'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

router.get('/', function(req, res) {
    res.redirect('/home')
})

/*========== Post routes ==========*/

router.post('/new', [
    check('postText')
        .trim()
        .escape()
        .isLength({ min: 1 }).withMessage('Enter some text.')
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

router.post('/comment', [
    check('postText')
        .trim()
        .escape()
        .isLength({ min: 1 }).withMessage('Enter some text.')
        .isLength({ max: 300 }).withMessage('Posts cannot exceed 300 characters.'),

    check('originalPost')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .isNumeric()

], async function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    let post = await database.posts.create({
        userId: req.session.userId,
        text: req.body.postText,
        timestamp: database.getTimestamp()
    })

    database.replies.create({
        postId: req.body.originalPost,
        replyId: post.id,
        timestamp: database.getTimestamp()
    })
    res.sendStatus(200)
})

router.post('/like', [
    check('postId')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .isNumeric()

], function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    database.likes.create({
        userId: req.session.userId,
        postId: req.body.postId,
        timestamp: database.getTimestamp()
    })
    res.sendStatus(200)
})

router.post('/unlike', [
    check('postId')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .isNumeric()

], function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    database.likes.destroy({
        where: {
            userId: req.session.userId,
            postId: req.body.postId
        }
    })
    res.sendStatus(200)
})

router.post('/repost', [
    check('postId')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .isNumeric()

], function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    database.reposts.create({
        userId: req.session.userId,
        postId: req.body.postId,
        timestamp: database.getTimestamp()
    })
    res.sendStatus(200)
})

module.exports = router
