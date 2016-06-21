/**
 * 应用模块以及依赖关系
 */
var myApp = angular.module('myApp', ['ngRoute', 'ngMaterial']);

/**
 * 常量配置
 */
myApp.constant('TOKEN_KEY', 'token');
myApp.constant('API', 'http://a.example.com/app_dev.php');

/**
 * 应用配置
 */
myApp.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'HomeController',
      templateUrl: 'partials/home.html'
    })
    .when('/login', {
      controller: 'LoginController',
      templateUrl: 'partials/login.html'
    });
});

/**
 * 认证服务
 */
myApp.service('TokenManager', function($http, $window, TOKEN_KEY) {

  var getToken = function() {
    var tokenify = $window.localStorage.getItem(TOKEN_KEY);

    if (null === tokenify) {
      return false;
    }

    var token = JSON.parse(tokenify);

    var dateCurrent = new Date();
    var dateExpire  = new Date(token.expire_at);

    if (dateCurrent.getTime() > dateExpire.getTime()) {
      this.removeToken();
      return false;
    }

    return token;
  }

  var setToken = function(token) {

    var date = new Date();
        date.setSeconds(date.getSeconds() + token.expire_in);

    $window.localStorage.setItem(TOKEN_KEY, JSON.stringify({
      access_token: token.access_token,
      expire_at: date
    }));
  }

  var removeToken = function() {
    $window.localStorage.removeItem(TOKEN_KEY);
  }

  return {
    'getToken': getToken,
    'setToken': setToken,
    'removeToken': removeToken
  }
});

/**
 * 配置访问权限
 */
myApp.run(function($rootScope, $location, $http, TokenManager, API) {

  $rootScope.$on('$routeChangeStart', function(event) {
    var token = TokenManager.getToken();

    if (!token) {
      $location.path('/login');
      return;
    }

    var xhr = $http.get(API + '/auth/user', {
      headers: { Authorization: token.access_token }
    });

    xhr.success(function(res) {
      if (res.code !== 200) {
        TokenManager.removeToken();
        $location.path('/login');
        return;
      }
      $rootScope.user = res.data;
    });
  });
});

/**
 * 首页控制器
 */
myApp.controller('HomeController', function($scope, $location, TokenManager) {
  $scope.processLogout = function() {
    TokenManager.removeToken();
    $location.path('/login');
  }
});

/**
 * 登录控制器
 */
myApp.controller('LoginController', function($scope, $location, $http, TokenManager, API) {
  
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
