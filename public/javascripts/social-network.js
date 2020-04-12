/*========== Functions ==========*/

function toggleImageButton() {
    $('#image-button').toggleClass('btn-primary')
    $('#image-button').toggleClass('btn-danger')
    $('#image-button i').toggleClass('far fa-image')
    $('#image-button i').toggleClass('fas fa-times')
}

/*========== On load ==========*/

window.onload = function() {

    let upload = true

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

    /*========== Post handlers ==========*/

    let originalPost = null

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

    $('#post-form').submit(function(event) {
        event.preventDefault()

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: $(this).serialize(),
            success: (response) => {
                $(this)[0].reset()
                console.log(response)
            }
        })
    })

    $('.comment-button').click(function() {
        originalPost = $(this).data('id')
        $('#commentModal').modal('show')
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
