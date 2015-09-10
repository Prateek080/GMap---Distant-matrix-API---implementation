var app = angular.module('testapp', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider){
      $stateProvider
        .state('/', {
          url: '/',
          templateUrl: 'template/test.html',
          controller: 'MainCtrl',
          resolve: {
                postPromise: ['poster', function(poster){
                  console.log("call");
                  return poster.getAll();
                }]
              }
        });

      $urlRouterProvider.otherwise('/');
    }]);


app.factory('poster', ['$http', function($http){
    var o = {
      post: [],
      comment: []
    };

     o.getAll = function() {
    return $http.get('data.json').success(function(data){
      angular.copy(data, o.post);
    });
     };

     o.getdata=function(argument){
      var lat=argument.pickup_latitude+'';
      var log=argument.pickup_longitude+'';
      var des_lat=argument.drop_latitude;
      var des_lon=argument.drop_longitude;

      var api='AIzaSyB-UAeifaI-VadElGpEFbrGxT3nI4T22yc'
      var request = new XMLHttpRequest(); 
      
      request.open('GET', "https://maps.googleapis.com/maps/api/distancematrix/json?origins="+lat+","+log+"&destinations="+des_lat+","+des_lon+"&mode=driving&language=en-EN&key=AIzaSyB-UAeifaI-VadElGpEFbrGxT3nI4T22yc", false);  // `false` makes the request synchronous
      request.send(null);
      data=request.responseText
      data=JSON.parse( data);
      return data;
 
}
    return o;
}]);



app.controller('MainCtrl', [
  '$scope',
  'poster',
  function($scope, poster){
      $scope.datasets=[]; 
    for(var i=0 ; i<300 ; i++){
      data=poster.getdata(poster.post[i]);

      var given_Distance=poster.post[i].metered_distance * 1000;
      var given_Time=poster.post[i].metered_time*60;

      var google_Distance=data.rows[0].elements[0].distance.value;
      var google_Time=data.rows[0].elements[0].duration.value;

      $scope.resultDistancePercentage=100*Math.abs(given_Distance-google_Distance)/google_Distance;
      $scope.resultTimePercentage=100*Math.abs(given_Time-google_Time)/google_Time;

      var Faulty="No";

      if($scope.resultDistancePercentage > 10 || $scope.resultTimePercentage > 10){
         Faulty="Yes";
      }
    
    $scope.datasets.push({
            engagement_id:poster.post[i].engagement_id,
            metered_distance: poster.post[i].metered_distance,
            metered_time: poster.post[i].metered_time,
            deviation_time:$scope.resultTimePercentage,
            deviation_distance:$scope.resultDistancePercentage,
            check_faulty: Faulty
    });
        
  }
  }]);




