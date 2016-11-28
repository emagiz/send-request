# App Store Widget Boilerplate

Will send a request when loaded.

## Contributing

Pull request/forking, whatever...

## Typical usage scenario

Configure when this widget should send a request with some configured content to a configured server.
Configurable options:


## Description

Will send a request to a server with some data.

### Dojo AMD module list

The JavaScript contains an extensive list of modules that may be used to build a
widget. It is best to reduce this list to what is actually used. Use JSHint to
help identify errors and problems.

** Be sure to keep the module name array and the parameter list of the anonymous
function below the module list in sync! **

The following modules are necessary for all widgets:
- dojo/_base/declare
- mxui/widget/_WidgetBase
- dijit/_Widget

If your widget does not use an HTML template:
- Remove dijit/_TemplatedMixin from the module list
- Remove _Templated from the parameter list of the anonymous function below the module list
- Remove _Templated from the parameter list of the declare call
- Remove the templates folder

If your widget does not need jQuery:
- Remove WidgetName/widget/lib/jquery from the module list
- Remove _jQuery from the parameter list of the anonymous function below the module list
- Remove _jQuery from the parameter list of the declare call
- Remove jquery.js from src\WidgetName\widget\lib\ Or remove the lib folder if you don't include external libraries in the widget.

### AMD caveats
Working with jQuery can be difficult due to the fact that jquery does not adhere to the AMD standard correctly. Check out [Pull Request #13](https://github.com/mendix/AppStoreWidgetBoilerplate/pull/13) or the [Dojo AMD documentation](http://dojotoolkit.org/documentation/tutorials/1.10/modules/index.html) for details.

## Migrating a widget to Dojo AMD

A widget that uses Dojo AMD may not refer to functions like *dojo.forEach* etc.
All necessary modules must be declared on the module list at the top of the source.

Replacing all 'old' Dojo calls in an existing source can be a bit of a pain.

Here is a list of commonly used functions and their new counterpart:

Old | New
---------- |----------
mxui.dom              | domMx
dojo.byId             | dom.byId
dojo.query            | document.querySelector
dojo.forEach          | dojoArray.forEach
dojo.hitch            | lang.hitch
dojo.addClass         | domClass.add
dojo.removeClass      | domClass.remove
dojo.hasClass         | domClass.contains
dojo.replaceClass     | domClass.replace
dojo.empty            | domConstruct.empty
dojo.place            | domConstruct.place
dojo.on               | on
dojo.window           | win

The referenced modules are in the module list of the boilerplate JavaScript.
