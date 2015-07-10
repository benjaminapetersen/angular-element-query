# angular-element-query
An angular directive that assists other directives by notifying them of resize events on the immediate
DOM node. This allows the DOM node to be the event proxy rather than the window.

## Concept

The purpose of `element-query` is to be a directive that will notify other directives about
resize changes on the immediate DOM node rather than relying on window resize.  This allows for
the creation of context aware components.  Media queries are a proxy, and knowing only about size
changes on the browser window is not ideal.  An example: What if an event causes your
layout to change from a 2 column layout into a 3 column layout?  Each column will need to adjust in
size, and all children will have to deal with the effects.  Using media queries to restyle the elements
is messy in this case, you now have CSS in terms of the browser window **but really** in terms of the
column width changes. `element-query` aims to help reduce that complexity by providing flexibility.

## Usage

Include the `<script src="/path/to/element-query.js></script>` or minified version
`<script src="/path/to/element-query.min.js></script>` in your page.

## Demo

There is a `/demo` directory included in the repo.  Pull the code, `cd /path/to/angular-element-query/`,
`npm install`, `bower install`, then `pyton -m SimpleHTTPServer` and navigate to `localhost:8000/demo`
in your browser.  This demo makes use of [layout.attrs](https://github.com/benjaminapetersen/layout.attrs)
for some simple flexbox layout CSS.  There are no actual dependencies for `angular-element-query`.

## Example code:

The directive is named `element-query` and must be used as an attribute and a sibling to another directive.
Configure breakpoints on `element-query` by passing it a string of key-value pairs.  You may use anything
for the key, but the values must be numbers representing pixel widths that are of interest.  An example:
`element-query="sm:200 md:400 lg:600 xl:800"`.  Here I've named 4 'sizes' and set the pixels definitions
to 200,400,600 and 800.

`element-query` is now ready to talk to your directive, but you need to tell your directive to listen.
This is done by requiring the `elementQuery` controller in your directive's linking function.

### The Linking Function

The simplest version is to call `elementQuery.subscribe($scope)`, passing it your `$scope`.

```javascript
.directive('myFancyDirective', function() {
  return {
    restrict: 'A',
    scope: true,
    // require your own controller & elementQuery
    require: ['myFancyDirective', 'elementQuery'],
    // $require is now an array of the required controllers
    link: function($scope, $elem, $attrs, $require) {
      var myCtrl = $require[0],
          elementQuery = $require[1];
      // This will now set a var on your $scope when resize events on this DOM node happen
      elementQuery.subscribe($scope);
    }
```
For greater flexibility, you can pass subscribe a callback function:

```javascript
.directive('myFancyDirective', function() {
  return {
    restrict: 'A',
    scope: true,
    require: ['myFancyDirective', 'elementQuery'],
    link: function($scope, $elem, $attrs, $require) {
      var myCtrl = $require[0],
          elementQuery = $require[1];
      // Do other fancy things in this callback function....
      elementQuery.subscribe('widths', function(name, val, actual) {
        $scope.$apply(function() {
          $scope.breakpoint = name;
        });
      });
    }
```
When passing the `$scope` alone, `$scope.breakpoint` will be set to the `key` configured whenever
a resize `change` matches the px value provided.  It is important to note that events are only
fired when the matching breakpoint changes.   When passing the callback function, you can configure
the variable or do any other interesting thing you can think of.  More examples to follow.

### The Template

Now, in your directive template, you can do a number of things with the information passed.  Simplest
is simply to update a class:

```html
<!--
  myFancyDirective template
  - {{breakpoint}} will be set to sm, md, lg, xl based on events.
-->
<div class="widget widget-{{breakpoint}}">
   <!-- other things... -->
</div>
```
This allows you to use css as normal to restyle (no media queries needed!):

```css
/* default styles */
.widget {
  background-color: #090909;
}
/* style for 200-400px */
.widget-sm {
  background-color: #990000;
}
/* style for 400-600px */
.widget-md {
  background-color: #009900;
}
/* style for 600-800px */
.widget-lg {
  background-color: #000099;
}
/* style for 800px + */
.widget-xl {
  background-color: #990099;
}
```
Or, you could change the entire contents of the directive by generating new DOM:

```html
<div class="widget-{{breakpoint}}">

  <div ng-if="breakpoint === 'sm'">
    is: {{breakpoint}} - sm
  </div>


  <div ng-if="breakpoint === 'md'">
    is: {{breakpoint}} - md
  </div>


  <div ng-if="breakpoint === 'lg'">
    is: {{breakpoint}} - lg
  </div>


  <div ng-if="breakpoint === 'xl'">
    is: {{breakpoint}} - xl
  </div>
</div>
```

Or simply use `ng-show` and `ng-hide`:

```html
<div ng-show="breakpoint === 'sm'">stuff to show in sm breakpont...</div>
<div ng-hide="breakpoint === 'lg'">stuff to hide in lg breakpoint....</div>
```

### Other Possibilities

Perhaps a large number of items need to be updated but you are concerned about the performance impact.
Put `element-query` on the immediate parent node and let it broadcast events.  It will be the
proxy instead of the window:

```javascript
// change the linking function
link: function($scope, $elem, $attrs, $require) {
      var myCtrl = $require[0],
          elementQuery = $require[1];

      elementQuery.subscribe('widths', function(name, val, actual) {

        $scope.$emit('resizeWidths', {
          breakpoint: name,
          size: val,
          actualDivWidth: actual
        });

      });
    }
```

To use `$rootScope.$broadcast`, you would need to update your directive's controller to ask for
`$rootScope` via dependency injection, then provide a function from the controller to the linking function.

```javascript
// still myFancyDirective
controller: [
  '$rootScope',
  function($rootScope) {
    this.eventer = function(name, val, actual) {
      // name the event something meaningful
      $rootScope.$broadcast('myFancyDirective:resize', {
        breakpoint: name,
        size: val,
        actualDivWidth: actual
      });
    }
  }]
// then let your linking function use the above function:
require: ['myFancyDirective', 'elementQuery'],
link: function($scope, $element, $attrs, $require) {
  var myFancyCtrl = $require[0],
    elementQuery = $require[1];

  elementQuery.subscribe('widths', function(name, val, actual) {
    // delegate to the controller function to do the work here,
    // allowing other directives to listen & change their own classes or
    // update their DOM.
    myFancyCtrl.eventer(name, val, actual);
  });
}

```

## Gotchas!

### Directives need to be applied as attributes to a standard DOM node

The `<foo>` element does not register properly with the resize listener and does not work.  However
the `<div foo>` element does.  So directives set to `restrict: 'A'` are fine, but `restrict: 'E'`
are not.  This is not ideal, and an open issue.

```html

  <!--
      yup, this will work
      foo can still own the DOM and there is no problem with transclusion,
  -->
  <div
      foo
      element-query="sm:50 md:200 lg:400 xl:800"
      outline>Div Foo</div>

  <!--
      nope, gotta have a div as a root node.  this will render, but element-query won't talk.
  -->
  <foo
      element-query="sm:50 md:200 lg:400 xl:800"
      outline>Foo Element</foo>

  <!--
      well, element-query is lonely.  He's a chatty guy and no other directives are listening
  -->
  <div
      element-query="sm:50 md:200 lg:400 xl:800"
      outline>Div</div>
```

### How does it work?

The `element-query` directive takes a string of breakpoint definitions.  These are arbitrary key value
pairs, but every time there is a change in a matched query, `elementQuery` will fire an event with
`key, value, currentWidth` as three arguments.  Your directive only needs to call the
`elementQuery.subscribe($scope)` method to receive this information (or provide a callback, see example above).

The actual mechanism for listening for size change events on the element requires a small amount of DOM
manipulation.  An `<object>` tag is injected into your element, which is a special kind of tag that can
trigger the appropriate events.  [Read more here](http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/)
if you are interested.  It is important to note that if this `<object>` tag is destroyed, your directive
will no longer receive updates regarding size changes.

## Kudos

The main resize listener is built off of a
[cross-browser, event-based element resize detection](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/) by [Back Alley Coder](http://www.backalleycoder.com/about/).  He has a second post that details
the [performance considerations around element queries](http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/), and why an `<object>` tag is a good surrogate solution.  He also has his own [vanilla version](https://github.com/csuwildcat/element-queries) and one
[built with x-tags](https://github.com/csuwildcat/x-querybox).



<!--
- TODO: allow a custom name on the short registry version.... 'breakpoint' can
  be a fallback, but a user may want to change this.

- examples:
  - adding classes:  "widget widget-small widget-medium widget-large"
  - changing entire DOM structure

- describe how it works.

- Show that element-query isn't listening to window events by updating the parent div width arbitrarily. ESSENTIAL!!

- Add the items() generator to the my-fancy-directive to trigger another level of view changing, OR use ng-transclude and let the item list be provided by something else entirely. BETTER!!  far more interesting.

-->
