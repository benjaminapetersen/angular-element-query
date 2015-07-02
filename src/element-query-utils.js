'use strict';

// a tiny subset of the tools you would find in a utility lib such as lodash/underscore,
// just some basics to help get element-query working
angular.module('element-query')

.factory('element-query-utils', function() {

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

    return {
      unbind: unbind,
      split: split,
      empty: empty,
      each: each,
      every: every,
      reduce: reduce,
      find: find,
      outerWidth: outerWidth,
      outerHeight: outerHeight
    }

});
