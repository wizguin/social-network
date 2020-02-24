window.onload = function() {

    /*========== Profile page handlers ==========*/

    $('#profile-follow-button').click(function() {
        let currentPage = $(location).attr('href')
        let action = $(this).data('action')

        switch(action) {
            case 'follow':
                $.ajax({
                    url: `${currentPage}/follow`,
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
                    url: `${currentPage}/unfollow`,
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

}
