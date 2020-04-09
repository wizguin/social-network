import express from 'express'
import Database from '../database/Database'


const router = express.Router()
const database = new Database()

const contentTypes = {
    'posts': database.getAllPosts.bind(database),
    'likes': database.getLikes.bind(database),
    'followers': database.getFollowers.bind(database),
    'following': database.getFollowings.bind(database)
}

async function renderProfile(req, res, contentType, template = contentType) {
    let isMyUser = (req.params.username == req.session.username) ? true : false
    let user = await database.findByUsername(req.params.username)

    if (!user) return res.redirect('/home')

    let content = await contentTypes[contentType]({
        profile: user.dataValues,
        profileId: user.id,
        userId: req.session.userId
    })

    let profile = {
        username: user.dataValues.username,
        avatar: user.dataValues.avatar,
        header: user.dataValues.header,
        bio: user.dataValues.bio,
        contentType: contentType,
        content: content,
        postCount: await database.getPostCount(user.id),
        likeCount: await database.getLikeCount(user.id),
        followerCount: await database.getFollowerCount(user.id),
        followingCount: await database.getFollowingCount(user.id)
    }
    if (!isMyUser) profile.isFollowing = await database.isFollowing(req.session.userId, user.id)

    res.render(template, {
        title: `${req.params.username}'s Profile`,
        myUsername: req.session.username,
        isMyUser: isMyUser,
        profile: profile
    })
}

/*========== Get routes ==========*/

router.get('/:username', function(req, res) {
    renderProfile(req, res, 'posts')
})

router.get('/:username/likes', function(req, res) {
    renderProfile(req, res, 'likes', 'posts')
})

router.get('/:username/followers', function(req, res) {
    renderProfile(req, res, 'followers')
})

router.get('/:username/following', function(req, res) {
    renderProfile(req, res, 'following')
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
