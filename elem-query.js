'use strict';

(function() {
  var unbind = Function.prototype.bind.bind(Function.prototype.call),
      // strings
      split = unbind(String.prototype.split),
      // arrays
      empty = function(arr) {
          return !(arr.length > 0);
      },
      each = function(list, fn, context) {
        var length = list && list.length;
        context = context || null;
        for(var i=0; i<length; i++) {
          fn.call(context, list[i], i, list);
        }
      },
      every = function(arr, fn, context) {
          var i = 0,
              length;
          if(empty(arr)) {
              return false;
          }
          length = arr.length;
          for(i; i < length; ++i) {
              if(!fn(arr[i], i)){
                  return false;
              }
          }
          return true;
      },
      reduce =  function(arr, fn, memo) {
          var i = 0,
              length = arr.length;
          for(i; i < length; i++) {
              memo = fn(memo, arr[i], i, arr);
          }
          return memo;
      },
      find = function(arr, fn, context) {
          var found;
          if(empty(arr)) {
              return null;
          }
          each(arr, function(item, i, arr) {
              if(!!fn(item, i)) {
                  if(!found) {
                      found = item;
                  }
              }
          });
          return found;
      },
      outerWidth = function(el) {
        var width = el.offsetWidth;
        var style = getComputedStyle(el);

        width += parseInt(style.marginLeft) + parseInt(style.marginRight);
        return width;
      },

      outerHeight = function(el) {
        var height = el.offsetHeight;
        var style = getComputedStyle(el);

        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
      };

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
          'resizeListener',
          function($scope, resize) {
            var getBreaks = function(str) {
                var items = split(str, ' ') || [];
                return reduce(items, function(memo, item, i, list) {
                  var split = item.split(':'),
                      obj = {
                        key: split[0],
                        val: split[1]
                      }
                  if(split[2]) {
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
