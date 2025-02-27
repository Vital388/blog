/**
 * Created by Lollypop on 02.12.2015.
 * Modified to enhance functionality, error handling, and user experience.
 */

/**
 * IndexCtrl: Manages the main post listing with pagination.
 */
function IndexCtrl($scope, $http) {
    $scope.currentPage = 1; // Initialized to 1 for clarity
    $scope.itemsPerPage = 5;
    $scope.maxSize = 5; // Reduced from 1000 for practical pagination display
    $scope.ShowPagination = false;

    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        $http.get('/api/posts?page=' + $scope.currentPage)
            .success(function(data) {
                $scope.posts = data.posts;
                $scope.totalItems = data.pages_count;
                $scope.ShowPagination = $scope.totalItems > $scope.itemsPerPage;
            })
            .error(function(error) {
                console.error('Error fetching posts:', error);
                alert('Failed to load posts. Please try again.');
            });
    };

    $scope.pageChanged(); // Initial call to load posts
}

/**
 * AddcatCtrl: Handles adding new categories.
 */
function AddcatCtrl($scope, $http) {
    $scope.submitCat = function() {
        $http.post('/api/posts/categories/' + $scope.catname)
            .success(function(data) {
                $scope.catname = ''; // Clear input field
                alert('Category added successfully!');
            })
            .error(function(error) {
                console.error('Error adding category:', error);
                alert('Failed to add category.');
            });
    };
}

/**
 * ReadPostCtrl: Fetches and displays a single post.
 */
function ReadPostCtrl($scope, $http, $routeParams) {
    $http.get('/api/posts/' + $routeParams.id)
        .success(function(post) {
            $scope.post = post;
        })
        .error(function(error) {
            console.error('Error fetching post:', error);
            alert('Post not found or an error occurred.');
        });
}

/**
 * AddPostCtrl: Manages creating new posts.
 */
function AddPostCtrl($scope, $http, $location) {
    $scope.form = {};
    $http.get('/api/posts/categories')
        .success(function(categories) {
            $scope.categories = categories;
        })
        .error(function(error) {
            console.error('Error fetching categories:', error);
        });

    $scope.submitPost = function() {
        var formData = new FormData();
        formData.append('title', $scope.form.title);
        formData.append('body', $scope.form.body);
        formData.append('category', $scope.form.category);
        formData.append('excerption', $scope.form.excerption);

        $http.post('/api/posts', formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
            .success(function(status) {
                if (!status.access) {
                    $location.path('/signIn');
                } else {
                    $scope.postID = status.postID;
                    alert('Post added successfully!');
                }
            })
            .error(function(error) {
                console.error('Error adding post:', error);
                alert('Failed to add post.');
            });
    };
}

/**
 * EditPostCtrl: Manages editing existing posts.
 */
function EditPostCtrl($scope, $http, $location, $routeParams) {
    $scope.form = {};
    $http.get('/api/posts/' + $routeParams.id)
        .success(function(post) {
            $scope.form = post;
            $scope.postID = post._id;
            if (post.image) {
                $scope.srcImage = post.image.path;
            }
        })
        .error(function(error) {
            console.error('Error fetching post:', error);
        });

    $http.get('/api/posts/categories')
        .success(function(categories) {
            $scope.categories = categories;
        })
        .error(function(error) {
            console.error('Error fetching categories:', error);
        });

    $scope.editPost = function() {
        var formData = new FormData();
        formData.append('title', $scope.form.title);
        formData.append('body', $scope.form.body);
        formData.append('category', $scope.form.category);
        formData.append('excerption', $scope.form.excerption);
        if ($scope.myFile) {
            formData.append('image', $scope.myFile);
        }

        $http.put('/api/posts/' + $routeParams.id, formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
            .success(function(status) {
                if (!status.access) {
                    $location.path('/signIn');
                } else {
                    $location.path('/');
                    alert('Post updated successfully!');
                }
            })
            .error(function(error) {
                console.error('Error updating post:', error);
                alert('Failed to update post.');
            });
    };
}

/**
 * DeletePostCtrl: Handles post deletion with confirmation.
 */
function DeletePostCtrl($scope, $http, $location, $routeParams) {
    $scope.deletePost = function() {
        if (confirm('Are you sure you want to delete this post?')) {
            $http.delete('/api/posts/' + $routeParams.id)
                .success(function(status) {
                    if (!status.access) {
                        $location.path('/signIn');
                    } else {
                        $location.path('/');
                        alert('Post deleted successfully!');
                    }
                })
                .error(function(error) {
                    console.error('Error deleting post:', error);
                    alert('Failed to delete post.');
                });
        }
    };

    $scope.home = function() {
        $location.path('/');
    };
}

/**
 * SignIn: Manages user login.
 */
function SignIn($scope, $rootScope, $http, $location, $cookies) {
    $scope.form = {};
    $scope.signIn = function() {
        var formData = {
            login: $scope.form.login,
            password: $scope.form.password
        };
        $http.post('/api/users/signIn', formData)
            .success(function(data) {
                $rootScope.currentUser = $cookies.getObject('user');
                $location.path('/');
            })
            .error(function(error) {
                console.error('Sign-in failed:', error);
                alert('Sign-in failed. Please check your credentials.');
            });
    };
}

/**
 * SignOn: Manages user registration.
 */
function SignOn($scope, $http, $location) {
    $scope.form = {};
    $scope.signOn = function() {
        var formData = { // Simplified, no FormData needed for plain data
            login: $scope.form.login,
            password: $scope.form.password,
            nickname: $scope.form.nickname,
            email: $scope.form.email,
            date_of_birth: $scope.form.date_of_birth,
            sex: $scope.form.sex
        };
        $http.post('/api/users/signOn', formData)
            .success(function(data) {
                $location.path('/signIn');
                alert('Sign-up successful! Please sign in.');
            })
            .error(function(error) {
                console.error('Sign-up failed:', error);
                alert('Sign-up failed.');
            });
    };
}

/**
 * CategoryCtrl: Displays posts for a specific category with pagination.
 */
function CategoryCtrl($scope, $http, $routeParams) {
    $scope.EmptyCat = true;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 5;
    $scope.maxSize = 5; // Adjusted for better UX
    $scope.ShowPagination = false;

    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        $http.get('/api/posts/categories/' + $routeParams.catname + '?page=' + $scope.currentPage)
            .success(function(data) {
                $scope.posts = data.posts;
                $scope.totalItems = data.pages_count;
                $scope.EmptyCat = !$scope.totalItems;
                $scope.ShowPagination = $scope.totalItems > $scope.itemsPerPage;
            })
            .error(function(error) {
                console.error('Error fetching category posts:', error);
                alert('Failed to load category posts.');
            });
    };

    $scope.pageChanged();
}

/**
 * DashboardCtrl: Displays the logged-in user's posts with pagination.
 */
function DashboardCtrl($scope, $http, $location, $rootScope) {
    $scope.currentPage = 1;
    $scope.itemsPerPage = 5;
    $scope.maxSize = 5;
    $scope.ShowPagination = false;

    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        $http.get('/api/posts/author/' + $rootScope.currentUser._id + '?page=' + $scope.currentPage)
            .success(function(data) {
                $scope.posts = data.posts;
                $scope.totalItems = data.pages_count;
                $scope.ShowPagination = $scope.totalItems > $scope.itemsPerPage;
            })
            .error(function(error) {
                console.error('Error fetching dashboard posts:', error);
                alert('Failed to load your posts.');
            });
    };

    if ($rootScope.currentUser) {
        $scope.pageChanged();
    } else {
        $location.path('/signIn');
    }
}

/**
 * Module Controllers
 */
angular.module('blog')
    .controller('LogOutCtrl', function($scope, $location, $rootScope, $cookies, $http) {
        $scope.logout = function() {
            $cookies.remove('user');
            $rootScope.currentUser = null;
            $http.get('/api/users/logout')
                .success(function() {
                    $location.path('/');
                })
                .error(function(error) {
                    console.error('Logout failed:', error);
                    alert('Logout failed.');
                });
        };
    })
    .controller('categoriesCtrl', function($scope, $http) {
        $http.get('/api/posts/categories')
            .success(function(categories) {
                $scope.categories = categories;
            })
            .error(function(error) {
                console.error('Error fetching categories:', error);
            });
    })
    .controller('imageCtrl', function($scope, $http) {
        $scope.submitImage = function() {
            var formData = new FormData();
            formData.append('image', $scope.myFile);
            $http.post('/api/posts/image/' + $scope.postID, formData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
                .success(function(status) {
                    if (!status.access) {
                        // Handle access denial if needed
                    } else {
                        $scope.srcImage = status.image;
                        alert('Image uploaded successfully!');
                    }
                })
                .error(function(error) {
                    console.error('Image upload failed:', error);
                    alert('Failed to upload image.');
                });
        };

        $scope.deleteImage = function() {
            $http.delete('/api/posts/image/' + $scope.postID)
                .success(function(status) {
                    if (!status.access) {
                        // Handle access denial if needed
                    } else {
                        $scope.srcImage = null;
                        alert('Image deleted successfully!');
                    }
                })
                .error(function(error) {
                    console.error('Image deletion failed:', error);
                    alert('Failed to delete image.');
                });
        };
    })
    .controller('navBlogCtrl', function($scope, $location, $rootScope) {
        console.log('Current User:', $rootScope.currentUser);
        $scope.getClass = function(path) {
            return $location.path() === path ? 'active' : '';
        };
    });
