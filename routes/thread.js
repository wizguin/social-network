import express from 'express'
import { check, validationResult } from 'express-validator'


const router = express.Router()

/*========== Get routes ==========*/

router.get('/', function(req, res) {
    res.redirect('/home')
})

router.get('/:thread', async function(req, res) {
    let thread = await req.app.get('db').getThread(req.params.thread, req.session.userId, 0)

    res.render('thread', {
        title: `${thread.focus.text}`,
        myUsername: req.session.username,
        replyTo: thread.replyTo,
        focus: thread.focus,
        thread: thread.replies
    })
})


module.exports = router
