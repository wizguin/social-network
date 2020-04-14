window.onload = function() {

    let originalPost = {
        comment: '',
        repost: ''
    }

    let button = {
        '#post-form': true,
        '#comment-form': true
    }

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

    $('#post-form .image-button').click(function() { imageButtonClick('#post-form') })
    $('#comment-form .image-button').click(function() { imageButtonClick('#comment-form') })

    $('#post-form .image-form').change(function() { toggleImageButton('#post-form') })
    $('#comment-form .image-form').change(function() { toggleImageButton('#comment-form') })

    $('#post-form').submit(function(event) {
        event.preventDefault()

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: new FormData(this),
            processData: false,
            contentType: false,
            success: (response) => {
                resetForm('#post-form', $(this)[0])
                $('#posts').prepend(createPostHtml(response.post))
            }
        })
    })

    $('#comment-form').submit(function(event) {
        event.preventDefault()
        $('#comment-modal').modal('hide')

        let formData = new FormData(this)
        formData.append('originalPost', originalPost.comment)

        $.ajax({
            url: $(this).attr('action'),
            type: $(this).attr('method'),
            data: formData,
            processData: false,
            contentType: false,
            success: (response) => {
                resetForm('#comment-form', $(this)[0])
                $('#posts').prepend(createPostHtml(response.post))
            }
        })
    })

    /*========== Post handlers ==========*/

    $('.post.linked').click(function() {
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
        originalPost.comment = $(this).data('id')
        $('#comment-modal').modal('show')
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
        originalPost.repost = $(this).data('id')
        $('#repost-modal').modal('show')
    })

    $('#repost-confirm').click(function() {
        $('#repost-modal').modal('hide')

        $.ajax({
            url: '/post/repost',
            type: 'post',
            data: { postId: originalPost.repost },
            success: (response) => {
                $('#posts').prepend(createPostHtml(response.post))
            }
        })
    })

    /*========== Functions ==========*/

    function imageButtonClick(form) {
        if (button[form]) {
            $(`${form} .image-form`).click() // Routes click from load room button to upload input
        } else {
            $(`${form} .image-form`).val('') // Resets image input
            toggleImageButton(form)
        }

        button[form] = !button[form]
        console.log(button)
    }

    function toggleImageButton(form) {
        $(`${form} .image-button`).toggleClass('btn-primary')
        $(`${form} .image-button`).toggleClass('btn-danger')
        $(`${form} .image-button i`).toggleClass('far fa-image')
        $(`${form} .image-button i`).toggleClass('fas fa-times')
    }

    function resetForm(formId, form) {
        form.reset()
        button[formId] = true
        $(`${formId} .image-form`).val('')

        $(`${formId} .image-button`).addClass('btn-primary')
        $(`${formId} .image-button`).removeClass('btn-danger')
        $(`${formId} .image-button i`).addClass('far fa-image')
        $(`${formId} .image-button i`).removeClass('fas fa-times')
    }

    function createPostHtml(post) {
        let isRepost = (post.reposter) ? true : false
        let isReply = (post.originalPoster) ? true : false

        let repost = ''
        let image = ''
        let like = ''

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

        if (post.image) image = `<div class='post-image'><img src='/images/upload/${post.image}.webp'></div>`

        if (post.isLiked) {
            like = `<td class='i fas fa-heart liked like-button' data-id='${post.id}' data-action='unlike' aria-hidden='true'></td>`
        } else {
            like = `<td class='i far fa-heart like-button' data-id='${post.id}' data-action='like' aria-hidden='true'></td>`
        }

        return `
            <div class='post linked container border-bottom' data-id='${post.id}'>
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
                            ${like}
                            <td class='i fas fa-arrow-right repost-button' data-id='${post.id}' aria-hidden='true'></td>
                            <td>${post.timestamp}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `
    }
}
