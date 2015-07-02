'use strict';

(function() {

  // Newest APIs are Mutation Observers:
  //  https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  //  boo, not available yet.
  //
  // Next, would be nice to .bind('resize') but this isn't
  //  a real event.  scratch.
  //
  // Next, using the resize-listener.js mini-lib,
  // this is taken from/inspired by back alley coder, depending on how much i modify
  // it feels very hacky in the way it has to use <objects> to emulate <iframes>
  // to get the browser to give up some resize events...
  //
  angular.module('element-query', [

  ])

  // provided as a service, just in case it is useful elsewhere
  .factory('resizeListener', [
    function() {
      return {
        addResizeListener: window.addResizeListener,
        removeResizeListener: window.removeResizeListener
      }
    }
  ])

  // provided as a directive so other directives can tie in via DOM
  .directive('elementQuery', function() {
      return {
        restrict: 'A',
        scope: true,
        controller: [
          '$scope',
          'element-query-utils',
          'resizeListener',
          function($scope, utils, resize) {
            var split = utils.split,
                find = utils.find,
                reduce = utils.reduce,
                getBreaks = function(str) {
                var items = split(str, ' ') || [];
                return reduce(items, function(memo, item, i, list) {
                  var parts = split(item, ':'),
                      obj = {
                        key: parts[0],
                        val: parts[1]
                      }
                  if(parts[2]) {
                    obj.isDefault = true;
                  }
                  memo.push(obj);
                  return memo;
                }, []);
              },
              getDefault = function(breaks) {
                return find(breaks, function(item) {
                  return item.isDefault;
                });
              };


            // TODO:
            // provide data for all of these? or no?
            // var size = {
            //   width: el.offsetWidth,
            //   height: el.offsetHeight,
            //   outerWidth: outerWidth(el),
            //   outerHeight: outerHeight(el)
            // }
            this.api = {
              setup: function($element, $attrs) {
                var el = $element[0],
                  breaks = getBreaks($attrs.breakpoints),
                  currentWidth = getDefault(breaks).val || 0,
                  resizeTest = function() {
                    var width = el.offsetWidth,
                        matchWidth = find(breaks, function(breakpoint) {
                          return width <= breakpoint.val;
                        });
                    if(matchWidth) {

                      if(!currentWidth) {
                        currentWidth = matchWidth;
                        // fire event, this is the first match
                      } else {
                        if(matchWidth === currentWidth) {
                          // do nothing, we don't want to fire unless its a CHANGE
                        } else {
                          currentWidth = matchWidth;
                          console.log('changed', matchWidth.key, matchWidth.val);
                        }
                      }
                    }
                  };
                // setup
                resize.addResizeListener(el, resizeTest);
                // tear down
                $scope.$on('$destroy', function() {
                  resize.removeResizeListener(el, resizeTest);
                });
              }
            }
          }
        ],
        require: 'elementQuery',
        // link is only necessary to know about the DOM element & attrs
        link: function($scope, $element, $attrs, ctrl) {
          if(!$attrs.breakpoints) {
            return;
          }
          ctrl.api.setup($element, $attrs);
        }
      }
    }
  );

})();
