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
      controller: 'homeController',
      templateUrl: 'partials/home.html'
    })
    .when('/login', {
      controller: 'loginController',
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
