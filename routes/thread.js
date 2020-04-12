import express from 'express'
import { check, validationResult } from 'express-validator'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

/*========== Get routes ==========*/

router.get('/', function(req, res) {
    res.redirect('/home')
})

router.get('/:thread', async function(req, res) {
    let thread = await database.getThread(req.session.userId, req.params.thread)

    res.render('thread', {
        title: `${thread.focus.text}`,
        myUsername: req.session.username,
        replyTo: thread.replyTo,
        focus: thread.focus,
        thread: thread.replies
    })
})


module.exports = router
