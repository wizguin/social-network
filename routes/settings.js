import express from 'express'
import { check, validationResult } from 'express-validator'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

router.get('/', function(req, res) {
    res.render('settings', {
        title: 'Settings',
    })
})

module.exports = router
