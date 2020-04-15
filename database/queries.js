export const posts =
    `SELECT * FROM (
        SELECT p.*,
            NULL AS originalTimestamp,
            (SELECT username FROM users WHERE id = p.user_id) as username,
            NULL AS reposter,
            CASE WHEN EXISTS (SELECT * FROM replies WHERE reply_id = p.id) THEN 1 ELSE 0 END AS isReply,
            CASE WHEN EXISTS (SELECT * FROM likes WHERE user_id = :userId AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked
        FROM posts AS p WHERE user_id IN (:profileId)

        UNION

        SELECT p.id, p.user_id, p.text, p.image, r.timestamp,
            p.timestamp AS originalTimestamp,
            (SELECT username FROM users WHERE id = p.user_id) as username,
            (SELECT username FROM users WHERE id = r.user_id) as reposter,
            0 as isReply,
            CASE WHEN EXISTS (SELECT * FROM likes WHERE user_id = :userId AND post_id = p.id) THEN 1 ELSE 0 END AS isLiked
        FROM posts AS p
        INNER JOIN reposts AS r
        ON r.post_id = p.id
        WHERE r.user_id IN (:profileId)
    )
    result ORDER BY timestamp DESC LIMIT :limit OFFSET :offset;`
