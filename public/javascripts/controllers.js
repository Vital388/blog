/**
 * Created by Lollypop on 02.12.2015.
 */
function IndexCtrl($scope, $http) {
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
        console.log($scope.myFile);
        $http.post('/api/posts', formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).
            success(function (data) {
                $location.path('/');
            });

    };
}
function EditPostCtrl($scope, $http, $location, $routeParams) {
    $scope.form = {};
    $http.get('/api/posts/' + $routeParams.id).
        success(function (data) {
            $scope.form = data.post;
        });


    $scope.submitPost = function () {

        var formData = new FormData();
        formData.append('title', $scope.form.title);
        formData.append('body', $scope.form.body);
        formData.append('image', $scope.myFile);
        console.log($scope.myFile);
        $http.put('/api/posts/'+$routeParams.id, formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).
            success(function (data) {
                $location.path('/');
            });

    };

}
function DeletePostCtrl($scope, $http, $location, $routeParams) {

    $scope.deletePost = function () {
        $http.delete('/api/posts/' + $routeParams.id).
            success(function (data) {
                $location.url('/');
            });
    };

    $scope.home = function () {
        $location.url('/');
    };
}