# angular-element-query
An angular directive that assists in helping other directives know about changes in the size of their bounding box (parent)


## Concept

The goal of angular-element-query is to make a directive that will tell other directives about
resize changes on their parent element rather than browser resize changes.  The idea is to make
smarter, more composable elements.

This is definitely in a prototype stage, so will break often.

## Example code:

The directive name itself `element-query` is likely to change.  The attribute to configure it `breakpoints`
will probably change as well, as these should match.  Conceptually, the idea is to let element-query
be configured to watch certain breakpoints in sizes on the parent (NOT the browser window) and notify
the other directive, allowing that directive to make template/view updates.


## Gotchas!

### Directives need to be applied as attributes to a standard DOM node

The `<foo>` element does not register properly with the resize listener and does not work.  However
the `<div foo>` element does.  So directives set to `restrict: 'A'` are fine, but `restrict: 'E'`
are not.  This seems to be a bit of a deal breaker, so completing the breakpoint broadcast component
is on hold until the actual query mechanism is worked out.


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
pairs, but every time there is a change in a matched query, element-query will fire an event with
`key, value, currentWidth` as three arguments.  Your directive only needs to call the `elementQuery.subscribe($scope)`
method to receive this information (there are two ways to subscribe, more on that to come).

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
- describe how it works.

- Show that element-query isn't listening to window events by updating the parent div width arbitrarily. ESSENTIAL!!

- Add the items() generator to the my-fancy-directive to trigger another level of view changing, OR use ng-transclude and let the item list be provided by something else entirely. BETTER!!  far more interesting.

-->
