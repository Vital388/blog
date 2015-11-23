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
                success: function (result) {
                    if (result.n) {


                        $('.alert').show("fast", function () {
                            // use callee so don't have to name the function
                            $('.alert').html('<p> Post deleted');
                            $('.newpostbody').prop("disabled", true);
                            $('.excerption').prop("disabled", true);
                            $('.newposttitle').prop("disabled", true);
                        });

                        $('.post#' + postId).hide(500, function () {
                            $(this).remove();
                        })
                    } else {

                        $('.alert').show("fast", function () {
                            // use callee so don't have to name the function
                            $('.alert').html('<p>Post not deleted ');
                        });
                    }
                }
            })
        } else {
            $('.alert').show("fast", function () {
                // use callee so don't have to name the function
                $('.alert').html('<p>Post not deleted ');
            });
        }


    });
    $('.addpost').click(function (event) {
        var posttitle = $('.newposttitle').val();
        var postbody = $('.newpostbody').val();
        var excerption = $('.excerption').val();
        var category = $('.newcategory').val();
        var image = $('.newimage').val();
        var form = new FormData($('form')[0]);

        if (posttitle && postbody && excerption && category) {
            $.ajax({
                type: 'POST',
                url: '/posts',
                processData: false,
                contentType: false,
                data: form,
                success: function (data) {
                    $('.update').attr("id", data.id);
                    $('.delete').attr("id", data.id);

                    $('.alert').show("fast", function () {
                        // use callee so don't have to name the function
                        $('.alert').html('<p>Post created by id ' + data.id);
                    });
                }
            })
        } else {
            $('.alert').show("fast", function () {
                // use callee so don't have to name the function
                $('.alert').html('<p>Please complete all the fields ');
            });
        }

    });
    $('.update').click(function (event) {
        var postId = event.target.id;

        if (postId) {
            var posttitle = $('.newposttitle').val();
            var postbody = $('.newpostbody').val();
            var excerption = $('.excerption').val();
            var category = $('.newcategory').val();
            var image = $('.newimage').val();
            var form = new FormData($('form')[0]);
            if (posttitle && postbody && excerption && category) {
                $.ajax({
                    type: 'PUT',
                    url: '/posts/' + postId,
                    processData: false,
                    contentType: false,
                    data: form,
                    success: function (result) {
                        if (result.ok) {
                            $('.alert').show("fast", function () {
                                // use callee so don't have to name the function
                                $('.alert').html('<p>Post updated');
                            })
                        } else {
                            $('.alert').show("fast", function () {
                                // use callee so don't have to name the function
                                $('.alert').html('<p>Post not updated');
                            })
                        }
                    }
                })
            } else {
                $('.alert').show("fast", function () {
                    // use callee so don't have to name the function
                    $('.alert').html('<p>Please complete all the fields ');
                });

            }
        }
        else {

            $('.alert').show("fast", function () {
                // use callee so don't have to name the function
                $('.alert').html('<p>Post not updated');
            });
        }
    });

});