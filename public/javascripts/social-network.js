window.onload = function() {

    /*========== Profile page handlers ==========*/

    $('#profile-follow-button').click(function() {
        let currentUrl = $(location).attr('href')
        let action = $(this).data('action')

        switch(action) {
            case 'follow':
                $.ajax({
                    url: `${currentUrl}/follow`,
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
                    url: `${currentUrl}/unfollow`,
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

}
