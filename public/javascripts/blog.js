/**
 * Created by Lollypop on 02.12.2015.
 */
angular.module('blog', ['ngRoute', 'blog.directives', 'ngCookies', 'ngSanitize', 'ui.bootstrap']).
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
    when('/addCat', {
        templateUrl: '/views/addCategory.html',
        controller: AddcatCtrl
    }).
    when('/about', {
        templateUrl: '/views/about.html',
    }).
    otherwise({
        redirectTo: '/'
    });
    $locationProvider.html5Mode(true);
}])
    .run(function ($rootScope, $cookies, $routeParams) {
        var userCookie = $cookies.getObject('user');
        $rootScope.currentUser = userCookie && userCookie.nickname ? userCookie : null;
    });
