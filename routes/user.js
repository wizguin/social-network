import express from 'express'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

router.get('/:username', async function(req, res) {
    let isMyUser = (req.params.username == req.session.username) ? true : false
    let user = await database.findByUsername(req.params.username)

    if (!user) return res.redirect('/home')

    user.posts = await database.getPosts(user.id)
    user.likes = []
    user.followerCount = await database.getFollowerCount(user.id)
    user.followingCount = await database.getFollowingCount(user.id)
    user.likeCount = 0
    if (!isMyUser) user.isFollowing = await database.isFollowing(req.session.userId, user.id)

    res.render('user', {
        title: `@${req.params.username}`,
        myUsername: req.session.username,
        isMyUser: isMyUser,
        user: user,
        userData: user.dataValues
    })
})

/*========== Post routes ==========*/

router.post('/:username/follow', async function(req, res) {
    let isMyUser = (req.params.username == req.session.username) ? true : false
    let profileId = await database.usernameToId(req.params.username)
    let isFollowing = await database.isFollowing(req.session.userId, profileId)

    if (isMyUser || isFollowing) return res.sendStatus(202)

    database.followings.create({
        userId: req.session.userId,
        followingId:  profileId
    })
    res.sendStatus(200)
})

router.post('/:username/unfollow', async function(req, res) {
    let isMyUser = (req.params.username == req.session.username) ? true : false
    let profileId = await database.usernameToId(req.params.username)
    let isFollowing = await database.isFollowing(req.session.userId, profileId)

    if (isMyUser || !isFollowing) return res.sendStatus(202)

    database.followings.destroy({
        where: {
            userId: req.session.userId,
            followingId:  profileId
        }
    })
    res.sendStatus(200)
})

module.exports = router
