/**
 * 登录控制器
 */
angular.module('myApp')
.controller('loginController', function($scope, $location, $http, TokenManager, API) {
  $scope.credentials = {
    username: 'thenbsp',
    password: '123456'
  };

  $scope.processForm = function(credentials) {
    $http.post(API + '/auth/login', $scope.credentials)
      .success(function(res) {
        if (res.code !== 200) {
          alert(res.data);
          return false;
        }
        TokenManager.setToken(res.data);
        $location.path('/');
      });
  }
});