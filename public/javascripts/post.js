/**
 * Created by Lollypop on 04.11.2015.
 */
$(document).ready(function (event) {


    $('.delete').click(function (event) {
        var postId = event.target.id;
        if (postId) {
            $.ajax({
                type: 'DELETE',
                url: 'http://nameless-dawn-6859.herokuapp.com/posts/' + postId,
                success: function (data) {

                    $('.alert').show("fast", function () {
                        // use callee so don't have to name the function
                        $('.alert').html('<p>' + data.message + (data.id ? data.id : ''));
                        $('.newpostbody').prop("disabled", true);
                        $('.excerption').prop("disabled", true);
                        $('.newposttitle').prop("disabled", true);
                    });

                    $('.post#' + postId).hide(1500, function () {
                        $(this).remove();
                    });
                }
            })
        } else {

            $('.alert').show("fast", function () {
                // use callee so don't have to name the function
                $('.alert').html('<p>Post not created ');
            });
        }
    });
    $('.addpost').click(function (event) {
        var posttitle = $('.newposttitle').val();
        var postbody = $('.newpostbody').val();
        var excerption = $('.excerption').val();

        $.ajax({
            type: 'POST',
            url: 'http://nameless-dawn-6859.herokuapp.com/posts/',
            data: {
                title: posttitle,
                body: postbody,
                excerption: excerption
            },
            success: function (data) {
                $('.update').attr("id", data.id);
                $('.delete').attr("id", data.id);

                $('.alert').show("fast", function () {
                    // use callee so don't have to name the function
                    $('.alert').html('<p>' + data.message + data.id);
                });
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
                url: 'http://nameless-dawn-6859.herokuapp.com/posts/' + postId,
                data: {
                    title: posttitle,
                    body: postbody,
                    excerption: excerption
                },
                success: function (data) {
                    $('.alert').show("fast", function () {
                        // use callee so don't have to name the function
                        $('.alert').html('<p>' + data.message + (data.id ? data.id : ''));
                    });
                }
            })
        } else {
            $('.alert').show("fast", function () {
                // use callee so don't have to name the function
                $('.alert').html('<p>' + data.message + (data.id ? data.id : ''));
            });
        }
    });

});