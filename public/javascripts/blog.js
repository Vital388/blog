/**
 * Created by Lollypop on 02.12.2015.
 */
angular.module('blog', ['ngRoute', 'blog.directives','ngCookies', 'ngSanitize']).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/views/index.html',
                controller: IndexCtrl
            }).
            when('/addPost', {
                templateUrl: '/views/addPost.html',
                controller: AddPostCtrl
            }).
            when('/readPost/:id', {
                templateUrl: '/views/readPost.html',
                controller: ReadPostCtrl
            }).
            when('/editPost/:id', {
                templateUrl: '/views/editPost.html',
                controller: EditPostCtrl
            }).
            when('/deletePost/:id', {
                templateUrl: '/views/deletePost.html',
                controller: DeletePostCtrl
            }).
            when('/signIn', {
                templateUrl: '/views/signIn.html',
                controller: SignIn
            }).
            when('/signOn', {
                templateUrl: '/views/signOn.html',
                controller: SignOn
            }).
            when('/categories/:catname', {
                templateUrl: '/views/category.html',
                controller: CategoryCtrl
            }).
            when('/dashboard/:username', {
                templateUrl: '/views/dashboard.html',
                controller: DashboardCtrl
            }).
            otherwise({
                redirectTo: '/'
            });
        $locationProvider.html5Mode(true);
    }])
    .run(function ($rootScope,$cookies) {
        $rootScope.currentUser=$cookies.getObject('user');
        if(!$rootScope.currentUser.nickname){
            $rootScope.currentUser=null;
        }


    });