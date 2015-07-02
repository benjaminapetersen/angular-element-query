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

```html
  <div
      foo
      element-query
      breakpoints="sm:50 md:200 lg:400:default xl:800"
      outline>Div Foo</div>

  <foo
      element-query
      breakpoints="sm:50 md:200 lg:400:default xl:800"
      outline>Foo Element</foo>

  <div
      element-query
      breakpoints="sm:50 md:200 lg:400:default xl:800"
      outline>Div</div>
```

## Current problem

The `<foo>` element does not register properly with the resize listener and does not work.  However
the `<div foo>` element does.  So directives set to `restrict: 'A'` are fine, but `restrict: 'E'`
are not.  This seems to be a bit of a deal breaker, so completing the breakpoint broadcast component
is on hold until the actual query mechanism is worked out.

## Kudos

The main resize listener is built off of a
[cross-browser, event-based element resize detection](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/) by [Back Alley Coder](http://www.backalleycoder.com/about/).
