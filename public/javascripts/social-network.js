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

    $('#post-form').submit(function(event) {
        event.preventDefault()

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: $(this).serialize(),
            success: (response) => {
                console.log(response)
            }
        })
    })

    $('.like-button').click(function() {
        let action = $(this).data('action')

        switch(action) {
            case 'like':
                $.ajax({
                    url: '/post/like',
                    type: 'post',
                    data: { postId: 0 },
                    success: () => {
                        $(this).addClass('fas liked').removeClass('far')
                        $(this).data('action', 'unlike')
                    }
                })
                break

            case 'unlike':
                $.ajax({
                    url: '/post/like',
                    type: 'post',
                    data: { postId: 0 },
                    success: () => {
                        $(this).addClass('far').removeClass('fas liked')
                        $(this).data('action', 'like')
                    }
                })
                break
        }
    })
}
