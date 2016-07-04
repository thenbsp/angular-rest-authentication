/**
 * 首页控制器
 */
angular.module('myApp')
.controller('homeController', function($scope, $http, $location, TokenManager) {

  $http.get('https://api.github.com/users/thenbsp')
    .success(function(res) {
      $scope.github = res;
    });

  $scope.processLogout = function() {
    TokenManager.removeToken();
    $location.path('/login');
  }
});