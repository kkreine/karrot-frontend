

let appConfig = ($stateProvider, $locationProvider) => {
  "ngInject";
  $locationProvider.html5Mode(true).hashPrefix('!');
  $stateProvider
    .state('app.login', {
      url: '/login',
      data: {
        loggedIn: false
      }
    })
    .state('app', {
      abstract: true,
      url: '/'
      data: {
        loggedIn: true
      }
    })
};

export default appConfig;
