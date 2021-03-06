angular.module('stumblefeed.controllers', [])

    .config(function($compileProvider){
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data|local):/);
    })

    .controller('AppCtrl', function ($scope, $state, OpenFB) {

        $scope.revokePermissions = function () {
            OpenFB.revokePermissions().then(
                function () {
                    $state.go('login');
                },
                function () {
                    alert('Revoke permissions failed');
                });
        };

    })

    .controller('LoginCtrl', function ($scope, $location, OpenFB) {

        $scope.facebookLogin = function () {

            OpenFB.login('email,read_stream,publish_stream').then(
                function () {
                    $location.path('/app/feed');
                },
                function () {
                    alert('OpenFB login failed');
                });
        };

    })

    .controller('LogoutCtrl', function ($scope, $location, OpenFB) {

        $scope.logout = function () {
            OpenFB.logout();
            $location.path('/login');
        };

    })

    .controller('CaptionCtrl', function ($scope, $location, IMAGEURI, Post) {
        $scope.postData = {};

        $scope.createPost = function() {
                $scope.postData.image = IMAGEURI.getData();
                $scope.postData.date = Date.now();
                $scope.postData.caption = this.formData;
                Post.post($scope.postData)
                    .success(function(data) {
                        $location.path('/app/feed');
                    });
          };

          $scope.cancel = function() {
                $location.path('/app/feed');
          };
    })

    .controller('FeedCtrl', function ($scope, $stateParams, OpenFB, Post, $ionicLoading, $state, Cam, IMAGEURI) {

            $scope.getPicture = function() {
                Cam.getPicture().then(function(imageURI) {

                    IMAGEURI.setData("data:image/jpeg;base64," + imageURI);
                    $state.go('caption');
            }, function(err) {
                console.error(err);
            });
          };

        $scope.show = function() {
            $scope.loading = $ionicLoading.show({
                content: 'Loading feed...'
            });
        };
        $scope.hide = function(){
            $scope.loading.hide();
        };

        function loadFeed() {
              $scope.show();
              Post.get()
                .success(function(data) {
                    $scope.hide();
                    $scope.items = data;
                    $scope.$broadcast('scroll.refreshComplete');
                }).error(function(data) {
                    $scope.hide();
                    console.error(data);
                });
        }

        $scope.doRefresh = loadFeed;

        loadFeed();

    });