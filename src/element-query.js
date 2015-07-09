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
