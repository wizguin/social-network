window.onload = function() {

    let originalPost = null

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
