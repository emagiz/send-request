/*global logger*/
/*
    Send request
    ========================

    @file      : SendRequest.js
    @version   : 0.0.1
    @author    : Bas Elzinga
    @date      : Timeless
    @copyright : eMagiz 2016
    @license   : MIT

    Documentation
    ========================
    Will send a request when a page is loaded.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "SendRequest/lib/jquery-1.11.2"
], function (declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, _jQuery) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare("SendRequest.widget.SendRequest", [ _WidgetBase ], {

        // DOM elements
        inputNodes: null,
        colorSelectNode: null,
        colorInputNode: null,
        infoTextNode: null,

        // Parameters configured in the Modeler.
        mfToExecute: "",
        messageString: "",
        backgroundColor: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        contextObj: null,
        _alertDiv: null,
        _readOnly: false,

        // Widget variables
        entity: null,
        staticUrl : null,
        staticRequestData : null,
        requestData : null,
        responseData : null,
        staticContentType : null,
        staticAcceptType : null,
        httpMethod : null,
        requestTrigger: null,
        responseMicroflow: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            logger.debug(this.id + ".postCreate");

            if (this.readOnly || this.get("disabled") || this.readonly) {
              this._readOnly = true;
            }

        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this.contextObj = obj;

            this.httpMethod = 'GET';
            if (this.requestData || this.staticRequestData) {
                this.httpMethod = "POST";
            }

            this.doCorseCall();

            this._resetSubscriptions();
            console.log("Hi I'm there!");
            callback();
        },


        doCorseCall : function()    {
			if (this.contextObj)	{
				var foundTrigger = this.requestTrigger && this.contextObj.get(this.requestTrigger);
				if (foundTrigger || this.requestTrigger == null) {

					var xhr = this.createCORSRequest(this.httpMethod, this.staticUrl);

					this.staticAcceptType && xhr.setRequestHeader("Accept", this.staticAcceptType);

					xhr.onload = dojoLang.hitch(this, function(e) {
					  console.log("Success: "+xhr.response);
					  if (this.responseData)    {
						  this.contextObj.set(this.responseData, xhr.response);
					  }
					});
                    
                    // Add response processing by an optional microflow.
                    xhr.onloadend = dojoLang.hitch(this, function(e){
                    if (this.responseMicroflow){
                    mx.data.action({
                        params       : {
                            actionname : this.responseMicroflow,
                            applyto     : "selection",
                            guids       : [this.contextObj.getGuid()]

                            }
                        });
                    }
                    });
                    
					if (this.requestData || this.staticRequestData) {
						this.staticContentType && xhr.setRequestHeader("Content-Type", this.staticContentType);

						if (this.requestData)    {
							var data = this.contextObj.get(this.requestData);
							if (data)   {
								try {
									xhr.send(data);
								} catch (e) {}
							}
						}
						if (this.staticRequestData) {
							try {
								xhr.send(this.staticRequestData);
							} catch (e) {}
						}
						this.requestTrigger && this.contextObj.set(this.requestTrigger, false);
					} else {
						try {
							xhr.send();
						} catch (e) {}
						this.requestTrigger && this.contextObj.set(this.requestTrigger, false);
					}
				}
			}

        },

        createCORSRequest : function(method, url) {
          var xhr = new XMLHttpRequest();
          if ("withCredentials" in xhr) {
            // Most browsers.
            xhr.open(method, url, true);
          } else if (typeof XDomainRequest != "undefined") {
            // IE8 & IE9
            xhr = new XDomainRequest();
            xhr.open(method, url);
          } else {
            // CORS not supported.
            xhr = null;
          }
          return xhr;
        },

        processRequest: function(e) {
            console.log(e);
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {
          logger.debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {
          logger.debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {
          logger.debug(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
          logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        _unsubscribe: function () {
          if (this._handles) {
              dojoArray.forEach(this._handles, function (handle) {
                  mx.data.unsubscribe(handle);
              });
              this._handles = [];
          }
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this._unsubscribe();

            // When a mendix object exists create subscribtions.
            if (this.contextObj && this.requestTrigger) {
                // var objectHandle = mx.data.subscribe({
                //     guid: this._contextObj.getGuid(),
                //     callback: dojoLang.hitch(this, function (guid) {
                //         this._updateRendering();???
                //     })
                // });

                var attrHandle = mx.data.subscribe({
                    guid: this.contextObj.getGuid(),
                    attr: this.requestTrigger,
                    callback: dojoLang.hitch(this, function (guid, attr, attrValue) {
                        this.doCorseCall();
                    })
                });

                // var validationHandle = mx.data.subscribe({
                //     guid: this._contextObj.getGuid(),
                //     val: true,
                //     callback: dojoLang.hitch(this, this._handleValidation)
                // });

                this._handles = [ attrHandle ];
            }
        }
    });
});

require(["SendRequest/widget/SendRequest"]);
