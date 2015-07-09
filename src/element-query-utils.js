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
