import express from 'express'
import { check, validationResult } from 'express-validator'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()


async function renderThread(req, res) {
    let threadId = req.params.thread
    let post = await database.getPostById(threadId)

    res.render('thread', {
        title: `${post.text}`,
        myUsername: req.session.username,
        post: post
    })
}

/*========== Get routes ==========*/

router.get('/', function(req, res) {
    res.redirect('/home')
})

router.get('/:thread', function(req, res) {
    renderThread(req, res)
})


module.exports = router
