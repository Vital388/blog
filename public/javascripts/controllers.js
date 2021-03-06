/**
 * Created by Lollypop on 02.12.2015.
 */
function IndexCtrl($scope, $http) {

   // $scope.currentPage = 1;
    $scope.itemsPerPage =5;
    $scope.maxSize = 1000;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
    $scope.ShowPagination=false;
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;

    };

    $scope.pageChanged = function() {
        //$log.log('Page changed to: ' + $scope.currentPage);
        $http.get('/api/posts?page=' + $scope.currentPage).
            success(function (data, status, headers, config) {

                $scope.posts = data.posts;
                $scope.totalItems = data.pages_count;
                if ($scope.totalItems > $scope.itemsPerPage){
                    $scope.ShowPagination=true;
                }
            });
    };

    $scope.pageChanged();


}


function AddcatCtrl($scope,$http) {
    $scope.submitCat = function () {
        /* var formData = new FormData();
         formData.append('login', $scope.form.login);
         formData.append('password', $scope.form.password);*/
        $http.post('/api/posts/categories/' + $scope.catname);
    }
}

function ReadPostCtrl($scope, $http, $routeParams) {
    $http.get('/api/posts/' + $routeParams.id).
        success(function (post) {
            $scope.post = post;
        });
}
function AddPostCtrl($scope, $http, $location) {
    $scope.postID = {};
    $scope.form = {};
    $http.get('/api/posts/categories').
        success(function (categories) {
            $scope.categories =categories;
        });
    $scope.submitPost = function () {
        var formData = new FormData();
        formData.append('title', $scope.form.title);
        formData.append('body', $scope.form.body);
        formData.append('category', $scope.form.category);
        formData.append('excerption', $scope.form.excerption);
        $http.post('/api/posts', formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).
            success(function (status) {

                if (!status.access) {
                    $location.path('/signIn');
                } else {
                    $scope.postID = status.postID
                }
            });
    }


}
function EditPostCtrl($scope, $http, $location, $routeParams) {
    $scope.postID = {};
    $scope.form = {};
    $scope.categories = {};
    $http.get('/api/posts/' + $routeParams.id).
        success(function (post) {
            $scope.form = post;
            $scope.postID = post._id;
            if (post.image) {
                $scope.srcImage = post.image.path;
            }
        });
    $http.get('/api/posts/categories').
        success(function (categories) {
            $scope.categories =categories;
        });

    $scope.editPost = function () {

        var formData = new FormData();
        formData.append('title', $scope.form.title);
        formData.append('body', $scope.form.body);
        formData.append('category', $scope.form.category);
        formData.append('excerption', $scope.form.excerption);
        formData.append('image', $scope.myFile);

        $http.put('/api/posts/' + $routeParams.id, formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).
            success(function (status) {

                if (!status.access) {
                    $location.path('/signIn');
                } else {
                    $location.path('/');
                }
            });

    };

}
function DeletePostCtrl($scope, $http, $location, $routeParams) {

    $scope.deletePost = function () {
        $http.delete('/api/posts/' + $routeParams.id).
            success(function (status) {

                if (!status.access) {
                    $location.path('/signIn');
                } else {
                    $location.path('/');
                }
            });
    };

    $scope.home = function () {
        $location.path('/');
    };
}
function SignIn($scope, $rootScope, $http, $location, $cookies) {
    $scope.form = {};
    $scope.signIn = function () {
        var formData = {
            login: $scope.form.login,
            password: $scope.form.password
        }
        /* var formData = new FormData();
         formData.append('login', $scope.form.login);
         formData.append('password', $scope.form.password);*/
        $http.post('/api/users/signIn', formData /* {
         transformRequest: angular.identity,
         headers: {'Content-Type': undefined}*
         }*/).
            success(function (data) {
                $rootScope.currentUser = $cookies.getObject('user');
                $location.path('/');
            });
    }

}
function SignOn($scope,$http, $location) {
    $scope.form = {};
    $scope.signOn = function () {
        var formData = new FormData();
        formData.append('login', $scope.form.login);
        formData.append('password', $scope.form.password);
        formData.append('nickname', $scope.form.nickname);
        formData.append('email', $scope.form.email);
        formData.append('date_of_birth', $scope.form.date_of_birth);
        formData.append('sex', $scope.form.sex);
        $http.post('/api/users/signOn', formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).
            success(function (data) {
                $location.path('/signIn');
            });
    }

}
function CategoryCtrl($scope, $http, $routeParams) {

    $scope.EmptyCat=true;

    $scope.currentPage = 1;
    $scope.itemsPerPage =5;
    $scope.maxSize = 1000;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;

    };

    $scope.pageChanged = function() {
        //$log.log('Page changed to: ' + $scope.currentPage);
        $http.get('/api/posts/categories/' + $routeParams.catname+'?page='+ $scope.currentPage).
            success(function (data, status, headers, config) {

                $scope.posts = data.posts;
                $scope.totalItems = data.pages_count;
                if( $scope.totalItems) {

                    $scope.EmptyCat=false;

                    if ($scope.totalItems > $scope.itemsPerPage) {
                        $scope.ShowPagination = true;
                    }
                }
            });
    };
    $scope.pageChanged();


}
function DashboardCtrl($scope, $http, $location, $rootScope ) {
    $scope.currentPage = 1;
    $scope.itemsPerPage =5;
    $scope.maxSize = 1000;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
    $scope.ShowPagination=false;


    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;

    };

    $scope.pageChanged = function() {
        //$log.log('Page changed to: ' + $scope.currentPage);
        $http.get('/api/posts/author/' + $rootScope.currentUser._id+'?page=' + $scope.currentPage).
            success(function (data, status, headers, config) {

                $scope.posts = data.posts;
                $scope.totalItems = data.pages_count;
                if ($scope.totalItems > $scope.itemsPerPage){
                    $scope.ShowPagination=true;
                }
            });
    };


    if ($rootScope.currentUser) {


        $scope.pageChanged();


    } else {

        $location.path('/signIn');
    }
}
angular.module('blog')
    .controller('LogOutCtrl', function ($scope, $location, $rootScope, $cookies, $http) {
        $scope.logout = function () {
            $cookies.remove('user');
            $rootScope.currentUser = null;
            $http.get('/api/users/logout')
                .success(function (status) {
                    $location.path('/');
                })

        }
    })
    .controller('categoriesCtrl', function ($scope,  $http) {
        $scope.categories = {};
        $http.get('/api/posts/categories')
            .success(function (categories) {
                $scope.categories = categories;
            })


    })
    .controller('imageCtrl', function ($scope, $http) {

        $scope.submitImage = function () {
            var formData = new FormData();
            formData.append('image', $scope.myFile);
            $http.post('/api/posts/image/' + $scope.postID, formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).
                success(function (status) {
                    if (!status.access) {
                        //$location.path('/signIn');

                    } else {
                        $scope.srcImage = status.image;
                    }
                });
        };
        $scope.deleteImage = function () {
            $http.delete('/api/posts/image/' + $scope.postID)
                .success(function (status) {

                    if (!status.access) {
                        // $location.path('/signIn');
                        //$route.reload();
                    } else {
                        $scope.srcImage = null;
                        // $location.path();
                    }
                });
        }


    }).controller('navBlogCtrl', function ($scope, $location) {
        $scope.getClass = function (path) {
            if ($location.path() === path) {
                return 'active';
            } else {
                return '';
            }
        }
    })