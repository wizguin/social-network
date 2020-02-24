import express from 'express'


const router = express.Router()

router.get('/', function(req, res) {
    req.session.destroy(function(error) {
        if (error) {
            res.redirect('/home')
        } else {
            res.clearCookie('connect.sid')
            res.redirect('/login')
        }
    })
})

module.exports = router
