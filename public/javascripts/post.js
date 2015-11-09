/**
 * Created by Lollypop on 04.11.2015.
 */
$(document).ready(function (event) {


    $('.delete').click(function (event) {
        var postId = event.target.id;
        if (postId) {
            $.ajax({
                type: 'DELETE',
                url: 'http://localhost:3000/posts/' + postId,
                success: function (data) {
                    $('.alert').html('<p>Post deleted by id ' + (data.id ? data.id : data));

                    $('.post#' + postId).hide(1500, function () {
                        $(this).remove();
                    });
                }
            })
        } else {
            $('.alert').html('<p>Post not created ');
        }
    });
    $('.addpost').click(function (event) {
        var posttitle = $('.newposttitle').val();
        var postbody = $('.newpostbody').val();
        var excerption = $('.excerption').val();

        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/posts/',
            data: {
                title: posttitle,
                body: postbody,
                excerption: excerption
            },
            success: function (data) {
                $('.update').attr("id", data.id);
                $('.delete').attr("id", data.id);
                $('.alert').html('<p>Post added by id ' + data.id);
            }
        })

    });
    $('.update').click(function (event) {
        var postId = event.target.id;
        if (postId) {
            var posttitle = $('.newposttitle').val();
            var postbody = $('.newpostbody').val();
            var excerption = $('.excerption').val();
            $.ajax({
                type: 'PUT',
                url: 'http://localhost:3000/posts/' + postId,
                data: {
                    title: posttitle,
                    body: postbody,
                    excerption: excerption
                },
                success: function (data) {
                    $('.alert').html('<p>Post updated by id ' + (data.id ? data.id : data));
                }
            })
        } else {
            $('.alert').html('<p>Post not created');
        }
    });

});