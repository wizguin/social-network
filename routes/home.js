import express from 'express'
import { check, validationResult } from 'express-validator'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

router.get('/', function(req, res) {
    database.findById(req.session.userId).then(function(user) {
        res.render('home', {
            title: 'Home',
            myUsername: req.session.username,
            user: user.dataValues,
            avatar: user.id
        })
    })
})

module.exports = router
