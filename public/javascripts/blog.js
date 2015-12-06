/**
 * Created by Lollypop on 02.12.2015.
 */
angular.module('blog',['ngRoute','blog.directives'] ).
    config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        console.log( $routeProvider);
        $routeProvider.
            when('/', {
                templateUrl: '/partials/index',
                controller: IndexCtrl
            }).
            when('/addPost', {
                templateUrl: '/partials/addPost',
                controller: AddPostCtrl
            }).
            when('/readPost/:id', {
                templateUrl: '/partials/readPost',
                controller: ReadPostCtrl
            }).
            when('/editPost/:id', {
                templateUrl: '/partials/editPost',
                controller: EditPostCtrl
            }).
            when('/deletePost/:id', {
                templateUrl: '/partials/deletePost',
                controller: DeletePostCtrl
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }]);