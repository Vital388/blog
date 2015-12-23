/**
 * Created by Lollypop on 02.12.2015.
 */

function IndexCtrl($scope, $http, $rootScope, $cookies) {
    $http.get('/api/posts').
        success(function (data, status, headers, config) {
            $scope.posts = data.posts;
            $scope.pages_count = data.pages_count;
        });
}
function ReadPostCtrl($scope, $http, $routeParams) {
    $http.get('/api/posts/' + $routeParams.id).
        success(function (data) {
            $scope.post = data.post;
        });
}
function AddPostCtrl($scope, $http, $location) {
    $scope.form = {};
    $scope.submitPost = function () {
        var formData = new FormData();
        formData.append('title', $scope.form.title);
        formData.append('body', $scope.form.body);
        formData.append('image', $scope.myFile);
        formData.append('category', $scope.form.category);
        formData.append('excerption', $scope.form.excerption);
        console.log($scope.myFile);
        $http.post('/api/posts', formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).
            success(function (status) {
                console.log(!status.access)
                if(!status.access){
                    $location.path('/signIn');
                }else{
                $location.path('/');
                }
            });
    }


}
function EditPostCtrl($scope, $http, $location, $routeParams) {
    $scope.form = {};
    $http.get('/api/posts/' + $routeParams.id).
        success(function (data) {
            $scope.form = data.post;
        });


    $scope.editPost = function () {

        var formData = new FormData();
        formData.append('title', $scope.form.title);
        formData.append('body', $scope.form.body);
        formData.append('category', $scope.form.category);
        formData.append('excerption', $scope.form.excerption);
        formData.append('image', $scope.myFile);
        console.log($scope.myFile);
        $http.put('/api/posts/' + $routeParams.id, formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).
            success(function (status) {
                console.log(!status.access)
                if(!status.access){
                    $location.path('/signIn');
                }else{
                    $location.path('/');
                }
            });

    };

}
function DeletePostCtrl($scope, $http, $location, $routeParams) {

    $scope.deletePost = function () {
        $http.delete('/api/posts/' + $routeParams.id).
            success(function (status) {
                console.log(!status.access)
                if(!status.access){
                    $location.path('/signIn');
                }else{
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
function SignOn($scope, $rootScope, $http, $location, $cookies) {
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

angular.module('blog')
    .controller('LogOutCtrl', function ($scope, $location,$rootScope,$cookies,$http) {
        $scope.logout = function () {
            $cookies.remove('user');
            $rootScope.currentUser = null;
            $http.get('/api/users/logout')
                .success(function (status) {
                    $location.path('/');
                })

        }
    })
    .controller('categoriesCtrl', function ($scope, $location,$rootScope,$cookies,$http) {
        $scope.categories={};
        $http.get('/api/posts/categories')
            .success(function (categories) {
                $scope.categories=categories;
            })



    })