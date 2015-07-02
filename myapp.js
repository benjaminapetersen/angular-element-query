angular.module('myapp', [
  'element-query'
])

.controller('noop', [
  function() {
    // do stuff?
  }
])

.directive('foo', function() {
  return {
    restrict: 'AE',
    scope: true,
    transclude: true,
    template: [
      '<div>',
        '<div>this is a foo</div>',
        '<div ng-transclude>',
        '</div>',
      '</div>'
    ].join(''),
    require: ['foo', 'elementQuery'],
    controller: function() {
      this.api = {
        foo: function() {
          return 'foo';
        }
      }
    },
    link: function($scope, $elem, $attrs, $require) {
      var ctrl = $require[0],
          elementQuery = $require[1];

      // console.log('foo.link()');
      // console.log('ctrl', ctrl);
      // console.log('elemQuery', elementQuery);

    }
  }
});
