import express from 'express'
import { check, validationResult } from 'express-validator'


const router = express.Router()

router.get('/', function(req, res) {
    let db = req.app.get('db')

    db.getUserById(req.session.userId).then(async function(user) {
        res.render('home', {
            title: 'Home',
            myUsername: req.session.username,
            user: user.dataValues,
            avatar: user.id,
            feed: await db.getFeed(req.session.userId, 0)
        })
    })
})

module.exports = router
