// original script:
//  https://github.com/csuwildcat
// per:
//  http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
// performance implication discussion:
//  http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/
//  - gist is that adding an <object> tag to the dom is roughly the footprint of an <img> tag,
//    therefore it is reasonable to use as a reference point for adding media queries, as it
//    does create a browsing context that can be used to detect resizes
(function() {

  var attachEvent = document.attachEvent,
      isIE = navigator.userAgent.match(/Trident/),
      requestFrame =  window.requestAnimationFrame ||
                      window.mozRequestAnimationFrame ||
                      window.webkitRequestAnimationFrame ||
                      function(fn) {
                        return window.setTimeout(fn, 20);
                      },
      cancelFrame = window.cancelAnimationFrame ||
                    window.mozCancelAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    window.clearTimeout,
      resizeListener = function (e){
        var win = e.target || e.srcElement;
        if (win.__resizeRAF__) {
          cancelFrame(win.__resizeRAF__);
        }
        win.__resizeRAF__ = requestFrame(function() {
          var trigger = win.__resizeTrigger__;
          trigger.__resizeListeners__.forEach(function(fn) {
            fn.call(trigger, e);
          });
        });
      },
      objectLoad = function(e){
        this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
        this.contentDocument.defaultView.addEventListener('resize', resizeListener);
      },
      triggerStyles = [
        'display: block;',
        'position: absolute;',
        'top: 0; left: 0;',
        'height: 100%;',
        'width: 100%;',
        'overflow: hidden;',
        'pointer-events: none;',
        'z-index: -1;'
      ].join(''),
      addResizeListener = function(element, fn){
        if (!element.__resizeListeners__) {
          element.__resizeListeners__ = [];
          if (attachEvent) {
            element.__resizeTrigger__ = element;
            element.attachEvent('onresize', resizeListener);
          }
          else {
            if (getComputedStyle(element).position == 'static') {
              element.style.position = 'relative';
            }
            var obj = element.__resizeTrigger__ = document.createElement('object');
            obj.setAttribute('style', triggerStyles);
            obj.__resizeElement__ = element;
            obj.onload = objectLoad;
            obj.type = 'text/html';
            obj.data = 'about:blank';
            if (!isIE) element.appendChild(obj);
          }
        }
        element.__resizeListeners__.push(fn);
      },
      removeResizeListener = function(element, fn){
        element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
        if (!element.__resizeListeners__.length) {
          if (attachEvent) {
            element.detachEvent('onresize', resizeListener);
          }
          else {
            element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
            element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
          }
        }
      };

  // exports
  window.addResizeListener = addResizeListener;
  window.removeResizeListener = removeResizeListener;

})();

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
  angular.module('element-query', [])
    .directive('elementQuery', function() {
      return {
        restrict: 'A',
        scope: true,
        controller: [
          '$scope',
          'element-query-utils',
          'resizeListener',
          function($scope, utils, resize) {
            var
                // utility imports
                isString = utils.isString,
                split = utils.split,
                find = utils.find,
                each = utils.each,
                reduce = utils.reduce,
                forOwn = utils.forOwn,
                delay = utils.delay,
                getBreaks = resize.getBreakpoints,

                // controller impl
                subscriptions = {},

                currentBreakpoint = undefined,

                // @description
                //  - the callback function that will be fired whenever the element itself is resized.
                //  - this function runs repeatedly as the object is resized
                //  - this function is responsible for publishing "match" notifications when a new
                //    breakpoint match is found, but will not publish current breakpoint matches.
                // @param {HTMLElement} el: an HTML Object
                // @param {Array} breaks:  the list of breakpoints to test size against. currently represents widths
                // @param {Number} currentWidth: the width of the object
                //
                resizeTest = function(el, breaks) {
                  var width = el.offsetWidth,
                      matchBreakpoint = find(breaks, function(breakpoint) {
                        return width <= breakpoint.val;
                      });

                  if(matchBreakpoint) {
                    if(!currentBreakpoint) {
                      currentBreakpoint = matchBreakpoint;
                      console.log('setting current', currentBreakpoint, matchBreakpoint);
                    } else {
                      if(matchBreakpoint.val !== currentBreakpoint.val) {
                        currentBreakpoint = matchBreakpoint;
                        // TODO: how to namespace these....
                        console.log('match break:', matchBreakpoint.key, matchBreakpoint.val, 'to width:', width);
                        publish();
                      }
                    }
                  }
                },

                // TODO: this is internal,
                // but should it be exposed to allow other objects to trigger?
                // perhaps another component will know about a resize event?
                // also, the arguments are not awesome here, would be ideal to
                // pass a number of things:
                // var size = {
                //   width: el.offsetWidth,
                //   height: el.offsetHeight,
                //   outerWidth: outerWidth(el),
                //   outerHeight: outerHeight(el)
                // }
                // - any of the above may be useful, or allow a subscriber to
                //   tap into on the ones desired, avoiding the need for
                //   messy callback functions.
                // - this would potentially be part of the subscribe() process,
                //   not only naming the subscription but providing params?
                //   - in markup?
                //   - in js?
                publish = function() {
                  delay(function() {
                    forOwn(subscriptions, function(subscription) {
                      each(subscription, function(subscriber) {
                        subscriber(currentBreakpoint.key, currentBreakpoint.val);
                      });
                    });
                  });
                };


            // "PROTECTED" API

            // TODO:
            // provide data for all of these? or no?
            // var size = {
            //   width: el.offsetWidth,
            //   height: el.offsetHeight,
            //   outerWidth: outerWidth(el),
            //   outerHeight: outerHeight(el)
            // }
            this._initialize = function($element, queryString) {
              var el = $element[0],
                breaks = getBreaks(queryString),
                resizeListener = resizeTest.bind(null, el, breaks);

              // cache initial values
              resizeTest(el, breaks);

              // setup
              resize.addResizeListener(el, resizeListener);

              // tear down
              $scope.$on('$destroy', function() {
                resize.removeResizeListener(el, resizeListener);
              });

            };


            // "PUBLIC" API
            // TODO:
            // can optionally name the subscription & subscriber?
            this.subscribe = function(subscription, subscriber) {
              var scope;
              // if not a string, the $scope object was passed alone.
              // this supports a very simple setup with minimal control.
              if(!isString(subscription)) {
                scope = subscription;
                subscription = Date.now();
                subscriber = function(name, val, actual) {
                  scope.$apply(function() {
                    scope.breakpoint = name;
                  });
                };
              }

              if(!subscriptions[subscription]) {
                subscriptions[subscription] = [];
              }

              // adds the callback to the array & returns the index for deletion later
              var index = (subscriptions[subscription].push(subscriber) -1);

              // every time a new subscriber is added, publish out the current values for initial setup
              publish();

              // return an unsubscribe function
              return {
                unsubscribe: function() {
                  delete subscriptions[subscription][index];
                }
              }
            }


          }
        ],
        require: 'elementQuery',
        // link is only necessary to know about the DOM element & attrs
        link: function($scope, $element, $attrs, ctrl) {
          if(!$attrs.elementQuery) {
            return;
          }

          // - elementQuery link talks to its own controller to intialize.
          // - the ctrl.subscribe() function is provided for other
          //   directives on the same DOM node to listen to events published
          //   by the elementQuery directive
          ctrl._initialize($element, $attrs.elementQuery);
        }
      }
    }
  );

})();

'use strict';

// a tiny subset of the tools you would find in a utility lib such as lodash/underscore,
// just some basics to help get element-query working
angular.module('element-query')

.factory('element-query-utils', function() {

   var unbind = Function.prototype.bind.bind(Function.prototype.call),
      // strings
      toString = unbind(Object.prototype.toString),
      isString = function(obj) {
        return toString(obj) === '[object String]';
      },
      split = unbind(String.prototype.split),
      // arrays
      slice = unbind(Array.prototype.slice),
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
      hasProp = Function.prototype.call.bind(Object.prototype.hasOwnProperty),
      // get an object's keys
      objKeys = function(obj) {
          var result = [],
              prop;
          for(prop in obj) {
              if(hasProp(obj, prop)) {
                  result.push(prop);
              }
          }
          return result;
      },
      // own properties of an object
      forOwn = function(obj, fn) {
        var keys = objKeys(obj);
        each(keys, function(key) {
            fn(obj[key], key, obj);
        });
      },
      delay = function() {
        var fn = arguments[0],
            timeout = arguments[1] || 1,
            args = slice(arguments, 2);
        setTimeout(function() {
          fn(args);
        }, timeout);
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

    return {
      unbind: unbind,
      // strings
      split: split,
      toString: toString,
      isString: isString,
      // arrays
      empty: empty,
      each: each,
      every: every,
      reduce: reduce,
      find: find,
      forOwn: forOwn,
      delay: delay,
      outerWidth: outerWidth,
      outerHeight: outerHeight
    }

});

(function() {

 angular.module('element-query')
  // provided as a service, just in case it is useful elsewhere
  .factory('resizeListener', [
    'element-query-utils',
    function(utils) {

      var // utility imports
          split = utils.split,
          find = utils.find,
          each = utils.each,
          reduce = utils.reduce,
          forOwn = utils.forOwn,

          // service functions
          getBreakpoints = function(str) {
            var items = split(str, ' ') || [];
            return reduce(items, function(memo, item, i, list) {
              var parts = split(item, ':'),
                  obj = {
                    key: parts[0],
                    val: Number(parts[1])
                  }
              if(parts[2]) {
                obj.isDefault = true;
              }
              memo.push(obj);
              return memo;
            }, []);
          }


      return {
        addResizeListener: window.addResizeListener,
        removeResizeListener: window.removeResizeListener,
        getBreakpoints: getBreakpoints
      }
    }
  ]);

})();
