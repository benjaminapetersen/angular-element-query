angular.module('myapp', [
  'element-query'
])

.service('items', function() {
  var times = function(num, fn) {
    var list = [];
    for(var i=0; i <=num; i++) {
      list.push(fn(i));
    }
    return list;
  };

  return {
    // generates a number of arbitrary meaningless objects
    // useful only for triggering iterations
    make: function(howMany) {
      return times(howMany, function(i) {
        return {
          id: Date.now(),
          name: 'name_' + Date.now()
        }
      })
    }
  }
})

.controller('itemsController', [
  '$scope',
  'items',
  function($scope, items) {
    var numberToMake = 10;
    // testing how many items we can put on a page
    // before the element queries blow things up.
    // - 10 is fast
    // - 100... so so
    // - 500... sad face.
    $scope.items = items.make(numberToMake);
  }
])

.directive('myFancyDirective', function() {
  return {
    restrict: 'A',
    scope: true,
    transclude: true,
    templateUrl: './directive-my-fancy.html',
    controller: [function() {}],
    require: ['myFancyDirective', 'elementQuery'],
    link: function($scope, $elem, $attrs, $require) {
      var myCtrl = $require[0],
          elementQuery = $require[1];

      // less control, just pass the scope.
      // NOTE: means that elementQuery automatically is assinging the
      // variable 'breakpoint' to $scope!
      elementQuery.subscribe($scope);

      // more control, name the subscription & provide the callback function.
      // elementQuery.subscribe('widths', function(name, val, actual) {
      //   $scope.$apply(function() {
      //     $scope.breakpoint = name;
      //   });
      // });

    }
  }
});
