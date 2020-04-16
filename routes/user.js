import express from 'express'


const router = express.Router()

async function renderProfile(req, res, contentType, template = contentType, page = 0) {
    let isMyUser = (req.params.username == req.session.username) ? true : false
    let db = req.app.get('db')
    let user = await db.getUserByUsername(req.params.username)

    if (!user) return res.redirect('/home')

    let content = await getContent(db, contentType, { id: user.id, myId: req.session.userId }, page)

    let profile = {
        id: user.id,
        username: user.dataValues.username,
        bio: user.dataValues.bio,
        contentType: contentType,
        content: content,
        postCount: await db.getPostCount(user.id),
        likeCount: await db.getLikeCount(user.id),
        followerCount: await db.getFollowerCount(user.id),
        followingCount: await db.getFollowingCount(user.id)
    }
    if (!isMyUser) profile.isFollowing = await db.isFollowing(req.session.userId, user.id)

    res.render(template, {
        title: `${req.params.username}'s Profile`,
        myUsername: req.session.username,
        isMyUser: isMyUser,
        profile: profile
    })
}

async function paginate(req, res, contentType, file, mixin) {
    let db = req.app.get('db')
    let id = await db.usernameToId(req.params.username)
    let content = await getContent(db, contentType, { id: id, myId: req.session.userId }, req.body.page)

    res.json({ status: 200, posts: db.renderMixin(file, mixin, content) })
}

async function getContent(db, contentType, id, page) {
    let contentTypes = {
        'posts': db.getPosts.bind(db),
        'likes': db.getLikes.bind(db),
        'followers': db.getFollowers.bind(db),
        'following': db.getFollowings.bind(db)
    }

    return await contentTypes[contentType](id, page)
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
    renderProfile(req, res, 'following', 'followers')
})

/*========== Post routes ==========*/

router.post('/:username/follow', async function(req, res) {
    let isMyUser = (req.params.username == req.session.username) ? true : false
    let db = req.app.get('db')
    let profileId = await db.usernameToId(req.params.username)
    let isFollowing = await db.isFollowing(req.session.userId, profileId)

    if (isMyUser || isFollowing) return res.sendStatus(202)

    db.followings.create({
        userId: req.session.userId,
        followingId:  profileId
    })
    res.sendStatus(200)
})

router.post('/:username/unfollow', async function(req, res) {
    let isMyUser = (req.params.username == req.session.username) ? true : false
    let db = req.app.get('db')
    let profileId = await db.usernameToId(req.params.username)
    let isFollowing = await db.isFollowing(req.session.userId, profileId)

    if (isMyUser || !isFollowing) return res.sendStatus(202)

    db.followings.destroy({
        where: {
            userId: req.session.userId,
            followingId:  profileId
        }
    })
    res.sendStatus(200)
})

/*========== Pagination routes ==========*/

router.post('/:username/load', function(req, res) {
    paginate(req, res, 'posts', 'post', 'posts')
})

router.post('/:username/likes/load', function(req, res) {
    paginate(req, res, 'likes', 'post', 'posts')
})

router.post('/:username/followers/load', function(req, res) {
    paginate(req, res, 'followers', 'followers', 'users')
})

router.post('/:username/following/load', function(req, res) {
    paginate(req, res, 'following', 'followers', 'users')
})

module.exports = router
