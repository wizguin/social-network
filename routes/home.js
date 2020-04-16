import express from 'express'


const router = express.Router()

router.get('/', async function(req, res) {
    let db = req.app.get('db')
    let user = await db.getUserById(req.session.userId)

    res.render('home', {
        title: 'Home',
        myUsername: req.session.username,
        user: user.dataValues,
        avatar: user.id,
        feed: await db.getFeed(req.session.userId, 0)
    })
})

// Pagination

router.post('/load', async function(req, res) {
    let db = req.app.get('db')
    let content = await db.getFeed(req.session.userId, req.body.page)

    res.json({ status: 200, posts: db.renderMixin('post', 'posts', content) })
})

module.exports = router
