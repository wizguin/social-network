import express from 'express'
import { check, validationResult } from 'express-validator'


const router = express.Router()

/*========== Get routes ==========*/

router.get('/', function(req, res) {
    res.redirect('/home')
})

router.get('/:thread', async function(req, res) {
    let thread = await req.app.get('db').getThread({ id: req.params.thread, myId: req.session.userId }, 0)

    res.render('thread', {
        title: `${thread.focus.text}`,
        myUsername: req.session.username,
        replyTo: thread.replyTo,
        focus: thread.focus,
        thread: thread.replies
    })
})

/*========== Pagination routes ==========*/

router.post('/:thread/load', async function(req, res) {
    let db = req.app.get('db')
    let thread = await db.getThread({ id: req.params.thread, myId: req.session.userId }, req.body.page)

    res.json({ status: 200, posts: db.renderMixin('post', 'posts', thread.replies) })
})

module.exports = router
