import express from 'express'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

router.get('/', function(req, res) {
    database.findById(req.session.userId).then(user => {
        res.render('home', {
            title: 'Home',
            myUsername: req.session.username,
            user: user.dataValues
        })
    })
})

module.exports = router
