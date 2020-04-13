import express from 'express'
import { check, validationResult } from 'express-validator'


const router = express.Router()

router.get('/', function(req, res) {
    req.app.get('db').findById(req.session.userId).then(function(user) {
        res.render('home', {
            title: 'Home',
            myUsername: req.session.username,
            user: user.dataValues,
            avatar: user.id
        })
    })
})

module.exports = router
