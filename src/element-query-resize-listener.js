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
