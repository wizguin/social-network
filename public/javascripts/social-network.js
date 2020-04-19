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
                $('#posts').prepend(response.post)
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

                if (window.location.pathname.startsWith('/thread')) {
                    response.post.originalPoster = null
                    if (window.location.pathname.split('/')[2] != originalPost.comment) return
                }

                $('#posts').prepend(response.post)
            }
        })
    })

    /*========== Post handlers ==========*/

    $(document).on('click', '.post.linked', function() {
        // Prevents thread focus from being clickable
        if (!($(this).parents('.thread-focus').length)) {
            window.location.href = `/thread/${$(this).data('id')}`
        }
    })

    // Stops post buttons directing to thread
    $(document).on('click', '.post .post-buttons', function(event) {
        event.stopPropagation()
    })

    $(document).on('click', '.comment-button', function() {
        originalPost.comment = $(this).data('id')
        $('#comment-modal').modal('show')
    })

    $(document).on('click', '.like-button', function() {
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

    $(document).on('click', '.repost-button', function() {
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
                let acceptedUrls = ['/home', `/user/${response.reposter}`]
                if (acceptedUrls.includes(window.location.pathname)) $('#posts').prepend(response.post)
            }
        })
    })

    /*========== Settings page handlers  ==========*/

    $('#del-account').click(function() {
        $('#del-account-modal').modal('show')
    })

    $('#del-account-confirm').click(function() {
        $('#repost-modal').modal('hide')

        $.ajax({
            url: '/settings/delete',
            type: 'post'
        })
    })

    /*========== Pagination ==========*/

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.intersectionRatio > 0) {
                loadMore($(entry.target))
            }
        })
    })

    if ($('#load-more').length) observer.observe($('#load-more')[0])

    function loadMore(page) {
        $.ajax({
            url: `${window.location.pathname}/load`,
            type: 'post',
            data: { page: page.data('page') },
            success: (response) => {
                $('#posts').append(response.posts)
                page.data().page ++
            }
        })
    }

    /*========== Functions ==========*/

    function imageButtonClick(form) {
        if (button[form]) {
            $(`${form} .image-form`).click() // Routes click from load room button to upload input
        } else {
            $(`${form} .image-form`).val('') // Resets image input
            toggleImageButton(form)
        }

        button[form] = !button[form]
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

}
