window.onload = function() {

    /*========== Profile page handlers ==========*/

    $('#profile-follow-button').click(function() {
        let currentUrl = window.location.pathname.split('/').filter(function(i) { return i })
        let user = currentUrl[1]
        let action = $(this).data('action')

        switch (action) {
            case 'follow':
                $.ajax({
                    url: `/user/${user}/follow`,
                    type: 'post',
                    success: () => {
                        $(this).addClass('btn-danger').removeClass('btn-success')
                        $(this).html('Unfollow')
                        $(this).data('action', 'unfollow')
                    }
                })
                break

            case 'unfollow':
                $.ajax({
                    url: `/user/${user}/unfollow`,
                    type: 'post',
                    success: () => {
                        $(this).addClass('btn-success').removeClass('btn-danger')
                        $(this).html('Follow')
                        $(this).data('action', 'follow')
                    }
                })
                break
        }
    })

    /*========== Post form handlers ==========*/

    let upload = true
    let originalPost = null

    $('#image-button').click(function() {
        if (upload) {
            $('#image-form').click() // Routes click from load room button to upload input
        } else {
            $('#image-form').val('') // Resets image input
            toggleImageButton()
        }

        upload = !upload
    })

    $('#image-form').change(function(event) {
        toggleImageButton()
    })

    $('#post-form').submit(function(event) {
        event.preventDefault()

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: new FormData(this),
            processData: false,
            contentType: false,
            success: (response) => {
                $(this)[0].reset()
                $('#posts').prepend(createPostHtml(response.post))
            }
        })
    })

    $('#comment-form').submit(function(event) {
        event.preventDefault()
        $('#commentModal').modal('hide')
        console.log(originalPost)

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: $(this).serialize() + `&originalPost=${originalPost}`,
            success: (response) => {
                $(this)[0].reset()
                console.log(response)
            }
        })
    })

    /*========== Post handlers ==========*/

    $('.post').click(function() {
        // Prevents thread focus from being clickable
        if (!($(this).parents('.thread-focus').length)) {
            window.location.href = `/thread/${$(this).data('id')}`
        }
    })

    // Stops post buttons directing to thread
    $('.post .post-buttons').click(function(event) {
        event.stopPropagation()
    })

    $('.comment-button').click(function() {
        originalPost = $(this).data('id')
        $('#commentModal').modal('show')
    })

    $('.like-button').click(function() {
        let action = $(this).data('action')
        let postId = $(this).data('id')

        switch(action) {
            case 'like':
                $.ajax({
                    url: '/post/like',
                    type: 'post',
                    data: { postId: postId },
                    success: () => {
                        $(this).addClass('fas liked').removeClass('far')
                        $(this).data('action', 'unlike')
                    }
                })
                break

            case 'unlike':
                $.ajax({
                    url: '/post/unlike',
                    type: 'post',
                    data: { postId: $(this).data('id') },
                    success: () => {
                        $(this).addClass('far').removeClass('fas liked')
                        $(this).data('action', 'like')
                    }
                })
                break
        }
    })

    $('.repost-button').click(function() {
        let postId = $(this).data('id')

        $.ajax({
            url: '/post/repost',
            type: 'post',
            data: { postId: postId },
            success: (response) => {
                console.log(response)
            }
        })
    })
}

/*========== Functions ==========*/

function toggleImageButton() {
    $('#image-button').toggleClass('btn-primary')
    $('#image-button').toggleClass('btn-danger')
    $('#image-button i').toggleClass('far fa-image')
    $('#image-button i').toggleClass('fas fa-times')
}

function createPostHtml(post) {
    let isRepost = (post.reposter) ? true : false
    let isReply = (post.originalPoster) ? true : false

    let repost = ''
    if (isRepost) {
        repost = `
            <p class='repost-text'><i class='fas fa-arrow-right' aria-hidden='true'></i>
                ${post.reposter} Reposted
            </p>
        `
    } else if (isReply) {
        repost = `
            <p class='repost-text'><i class='far fa-comment' aria-hidden='true'></i>
                ${post.username} Replied to ${post.originalPoster}
            </p>
        `
    }

    let image = ''
    if (post.image) image = `<div class='post-image'><img src='/images/upload/${post.image}.webp'></div>`

    return `
        <div class='post container border-bottom' data-id='${post.id}'>
            ${repost}
            <a href='/user/${post.username}'>
                <div class='avatar-sm'><img src='/images/avatar/${post.avatar}.webp' onerror='this.src=&quot;/images/avatar/default.webp&quot;'></div>
            </a>
            <div class='h6'><a href='/user/${post.username}'>${post.username}</a></div>
            <p>${post.text}</p>
            ${image}
            <table class='post-buttons'>
                <tbody>
                    <tr>
                        <td class='i far fa-comment comment-button' data-id='${post.id}' data-toggle='modal' aria-hidden='true'></td>
                        <td class='i far fa-heart like-button' data-id='${post.id}' data-action='like' aria-hidden='true'></td>
                        <td class='i fas fa-arrow-right repost-button' data-id='${post.id}' aria-hidden='true'></td>
                        <td>${post.timestamp}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}
