angular.module('myapp')
.directive('foo', function() {
  return {
    restrict: 'AE',
    scope: true,
    transclude: true,
    templateUrl: './directive-foo.html',
    require: ['foo', 'elementQuery'],
    controller: function() { },
    link: function($scope, $elem, $attrs, $require) {
      // separate the two controllers
      var fooCtrl = $require[0],
          elementQuery = $require[1];

      elementQuery.subscribe('widths', function(name, val, actual) {
        $scope.$apply(function() {
          $scope.breakpoint = name;
        });
      });
    }
  }
});
