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
