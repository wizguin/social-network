import express from 'express'
import { check, validationResult } from 'express-validator'


const router = express.Router()

let currentSearch = null
let currentOpt = null

router.get('/', [
    check('search', 'Enter a search query (1-500 characters).')
        .trim()
        .escape()
        .isLength({ min: 1, max: 500 })

], async function(req, res) {
    let errors = validationResult(req)
    if (!errors.isEmpty()) return res.redirect('/home')

    currentSearch = req.query.search
    currentOpt = req.query.followingsOnly

    res.render('search', {
        title: 'Search',
        myUsername: req.session.username,
        results: await req.app.get('db').searchPosts(currentSearch, req.session.userId, 0, currentOpt)
    })
})

// Pagination

router.post('/load', async function(req, res) {
    let db = req.app.get('db')
    let content = await db.searchPosts(currentSearch, req.session.userId, req.body.page, currentOpt)

    res.json({ status: 200, posts: db.renderMixin('post', 'posts', content) })
})

module.exports = router
