import express from 'express'
import { check, validationResult } from 'express-validator'
import { v4 as uuidv4 } from 'uuid'


const router = express.Router()
const mimeTypes = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif'
}
const checkPostId = [
    check('postId')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .isNumeric()
]

function uploadImage(req, res) {
    let image = req.files.image

    if (!req.files ||
        Object.keys(req.files).length === 0 ||
        !(image.mimetype in mimeTypes)) {
            return null
    }

    let id = uuidv4()
    let path = `public/images/upload/${id}.webp`

    image.mv(path, function(err) {
        if (err) return console.log(err)
    })

    return id
}

async function deletePost(req, res) {
    let db = req.app.get('db')
    let postId = req.body.postId

    let posts = ([postId]).concat(await db.getReplyIds(postId))

    console.log(posts)

    db.posts.destroy({
        where: {
            id: posts
        }
    })
    res.json({status: 200, posts: posts })
}

/*========== Get routes ==========*/

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

], async function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    let db = req.app.get('db')
    let p = {
        userId: req.session.userId,
        text: req.body.postText,
        timestamp: req.app.get('db').getTimestamp()
    }

    if (req.files) p.image = uploadImage(req, res)

    let post = await db.posts.create(p)
    let postObj = await db.createPostObj(await db.getUserById(req.session.userId), post, req.session.userId)

    res.json({ status: 200, post: db.renderMixin('post', 'post', postObj) })
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

    let db = req.app.get('db')
    let p = {
        userId: req.session.userId,
        text: req.body.postText,
        timestamp: db.getTimestamp()
    }

    if (req.files) p.image = uploadImage(req, res)
    let post = await db.posts.create(p)
    let postObj = await db.createPostObj(await db.getUserById(req.session.userId), post, req.session.userId)

    await db.replies.create({
        postId: req.body.originalPost,
        replyId: post.id,
        timestamp: db.getTimestamp()
    })

    postObj.originalPoster = await db.getOriginalPoster(post.id)

    res.json({ status: 200, post: db.renderMixin('post', 'post', postObj) })
})

router.post('/like', checkPostId, function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    let db = req.app.get('db')
    db.likes.create({
        userId: req.session.userId,
        postId: req.body.postId,
        timestamp: db.getTimestamp()
    })
    res.sendStatus(200)
})

router.post('/unlike', checkPostId, function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    req.app.get('db').likes.destroy({
        where: {
            userId: req.session.userId,
            postId: req.body.postId
        }
    })
    res.sendStatus(200)
})

router.post('/repost', checkPostId, async function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    let db = req.app.get('db')
    db.reposts.create({
        userId: req.session.userId,
        postId: req.body.postId,
        timestamp: db.getTimestamp()
    })

    let post = await db.getPostById(req.body.postId)
    let originalPoster = await db.getUserById(post.userId)

    let postObj = await db.createPostObj(originalPoster, post, req.session.userId)
    postObj.reposter = (await db.getUserById(req.session.userId)).username

    res.json({status: 200, post: db.renderMixin('post', 'post', postObj), reposter: postObj.reposter })
})

router.post('/delete', checkPostId, function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.send(errors.array()[0].msg)

    deletePost(req, res)
})

module.exports = router
