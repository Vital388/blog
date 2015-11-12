/**
 * Created by Lollypop on 04.11.2015.
 */
$(document).ready(function (event) {


    $('.delete').click(function (event) {
        var postId = event.target.id;
        if (postId) {
            $.ajax({
                type: 'DELETE',
                url: '/posts/' + postId,
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
        if(posttitle&&postbody&&excerption){
        $.ajax({
            type: 'POST',
            url: '/posts',
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
                    $('.alert').html('<p>Post created by id '+data.id);
                });
            }
        })}else{
            $('.alert').show("fast", function () {
                // use callee so don't have to name the function
                $('.alert').html('<p>Please complete all the fields ');
            });
        }

    });
    $('.update').click(function (event) {
        var postId = event.target.id;
        var ajaxdata={};
        if (postId) {
            var posttitle = $('.newposttitle').val();
            var postbody = $('.newpostbody').val();
            var excerption = $('.excerption').val();
            if(posttitle&&postbody&&excerption){
            $.ajax({
                type: 'PUT',
                url: '/posts/' + postId,
                data: {
                    title: posttitle,
                    body: postbody,
                    excerption: excerption
                },
                success: function (data) {
                    ajaxdata=data;
                    $('.alert').show("fast", function () {
                        // use callee so don't have to name the function
                        $('.alert').html('<p>' + ajaxdata.message + (ajaxdata.id ? ajaxdata.id : ''));
                    });
                }
            })
        }else{
                $('.alert').show("fast", function () {
                    // use callee so don't have to name the function
                    $('.alert').html('<p>Please complete all the fields ');
                });

            }
        }
            else {

            $('.alert').show("fast", function () {
                // use callee so don't have to name the function
                $('.alert').html('<p>' + (ajaxdata.message?ajaxdata.message:'Post not created') + (ajaxdata.id ? ajaxdata.id : ''));
            });
        }
    });

});