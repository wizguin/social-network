const username = `(SELECT username FROM users WHERE id = p.user_id) as username,`
const isLiked = `CASE WHEN EXISTS (SELECT * FROM likes WHERE user_id = :userId AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked,`
const isReply = `CASE WHEN EXISTS (SELECT * FROM replies WHERE reply_id = p.id) THEN 1 ELSE 0 END AS isReply,`
const isMyPost = `CASE WHEN EXISTS (SELECT * FROM posts WHERE user_id = :userId AND id = p.id) THEN 1 ELSE 0 END AS isMyPost,`
const counts =
    `(SELECT COUNT(*) FROM replies WHERE post_id = p.id) AS replyCount,
    (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likeCount,
    (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) AS repostCount`

// Profile page queries

export const posts =
    `SELECT * FROM (
        SELECT p.*,

            NULL AS originalTimestamp,
            NULL AS reposter,
            ${username}
            ${isLiked}
            ${isReply}
            ${isMyPost}
            ${counts}

        FROM posts AS p WHERE user_id IN (:profileId)

        UNION

        SELECT p.id, p.user_id, p.text, p.image, r.timestamp,

            p.timestamp AS originalTimestamp,
            (SELECT username FROM users WHERE id = r.user_id) as reposter,
            ${username}
            ${isLiked}
            0 as isReply,
            ${isMyPost}
            ${counts}

        FROM posts AS p
        INNER JOIN reposts AS r
        ON r.post_id = p.id
        WHERE r.user_id IN (:profileId)
    )
    result ORDER BY timestamp DESC LIMIT :limit OFFSET :offset;`

export const likes =
    `SELECT p.*,

    (SELECT timestamp from likes WHERE post_id = p.id AND user_id = :profileId) AS likedTimestamp,
    ${username}
    ${isLiked}
    ${isMyPost}
    ${counts}

    FROM posts as p
    WHERE id IN (SELECT post_id FROM likes WHERE user_id = :profileId)
    ORDER BY likedTimestamp DESC LIMIT :limit OFFSET :offset;`

// Single post with details

export const post =
    `SELECT p.*,

    ${username}
    ${isLiked}
    ${isReply}
    ${isMyPost}
    ${counts}

    FROM posts as p
    WHERE id = :postId;`

// Thread replies

export const replies =
    `SELECT p.*,

    ${username}
    ${isLiked}
    ${isMyPost}
    ${counts}

    FROM posts as p
    WHERE id IN (SELECT reply_id FROM replies WHERE post_id = :threadId)
    ORDER BY timestamp DESC LIMIT :limit OFFSET :offset;`

// Search results

export const search =
    `SELECT p.*,

    ${username}
    ${isLiked}
    ${isReply}
    ${isMyPost}
    ${counts}

    FROM posts as p
    WHERE text LIKE :search
    ORDER BY timestamp DESC LIMIT :limit OFFSET :offset;`

export const searchFollowings =
    `SELECT p.*,

    ${username}
    ${isLiked}
    ${isReply}
    ${isMyPost}
    ${counts}

    FROM posts as p
    WHERE text LIKE :search
    AND user_id IN (:followings)
    ORDER BY timestamp DESC LIMIT :limit OFFSET :offset;`
