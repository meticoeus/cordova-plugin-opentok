// Generated by CoffeeScript 1.3.1
(function() {
  var TBError, TBPublisher, TBSession, TBSubscriber, TBSuccess, TBUpdateObjects, getPosition, replaceWithObject;

  getPosition = function(divName) {
    var curleft, curtop, height, pubDiv, width;
    pubDiv = document.getElementById(divName);
    width = pubDiv.style.width;
    height = pubDiv.style.height;
    curtop = curleft = 0;
    if (pubDiv.offsetParent) {
      curleft += pubDiv.offsetLeft;
      curtop += pubDiv.offsetTop;
      while ((pubDiv = pubDiv.offsetParent)) {
        curleft += pubDiv.offsetLeft;
        curtop += pubDiv.offsetTop;
      }
    }
    return {
      top: curtop,
      left: curleft,
      width: width,
      height: height
    };
  };

  replaceWithObject = function(divName, streamId, properties) {
    var newId, objDiv, oldDiv;
    newId = "TBStreamConnection" + streamId;
    objDiv = document.getElementById(newId);
    if (objDiv != null) {
      return objDiv;
    } else {
      oldDiv = document.getElementById(divName);
      objDiv = document.createElement("object");
      objDiv.id = newId;
      objDiv.style.width = properties.width + "px";
      objDiv.style.height = properties.height + "px";
      objDiv.setAttribute('streamId', streamId);
      objDiv.textContext = streamId;
      objDiv.className = 'TBstreamObject';
      oldDiv.parentNode.replaceChild(objDiv, oldDiv);
      return objDiv;
    }
  };

  TBError = function(error) {
    return navigator.notification.alert(error);
  };

  TBSuccess = function() {
    return console.log("TB NOTHING IS CALLED!");
  };

  TBUpdateObjects = function() {
    var e, id, objects, position, streamId, _i, _len;
    console.log("JS: Objects being updated");
    objects = document.getElementsByClassName('TBstreamObject');
    for (_i = 0, _len = objects.length; _i < _len; _i++) {
      e = objects[_i];
      console.log("JS: Object updated");
      streamId = e.getAttribute('streamId');
      id = e.id;
      position = getPosition(id);
      Cordova.exec(TBSuccess, TBError, "Tokbox", "updateView", [streamId, position.top, position.left, position.width, position.height]);
    }
  };

  window.TB = {
    initSession: function(sid, production) {
      return new TBSession(sid, production);
    },
    initPublisher: function(key, domId, properties) {
      return new TBPublisher(key, domId, properties);
    },
    setLogLevel: function(a) {
      return console.log("Log Level Set");
    },
    addEventListener: function(event, handler) {
      if (event === "exception") {
        console.log("JS: TB Exception Handler added");
        return Cordova.exec(handler, TBError, "Tokbox", "exceptionHandler", []);
      }
    }
  };

  TBPublisher = (function() {

    TBPublisher.name = 'TBPublisher';

    function TBPublisher(key, domId, properties) {
      var height, name, position, publishAudio, publishVideo, width, _ref, _ref1, _ref2;
      this.key = key;
      this.domId = domId;
      this.properties = properties != null ? properties : {};
      console.log("JS: Publish Called");
      width = 160;
      height = 120;
      name = "TBNameHolder";
      publishAudio = "true";
      publishVideo = "true";
      if ((this.properties != null)) {
        width = (_ref = this.properties.width) != null ? _ref : 160;
        height = (_ref1 = this.properties.height) != null ? _ref1 : 120;
        name = (_ref2 = this.properties.name) != null ? _ref2 : "";
        if ((this.properties.publishAudio != null) && this.properties.publishAudio === false) {
          publishAudio = "false";
        }
        if ((this.properties.publisherVideo != null) && this.properties.publishVideo === false) {
          publishVideo = "false";
        }
      }
      this.obj = replaceWithObject(this.domId, "TBPublisher", {
        width: width,
        height: height
      });
      position = getPosition(this.obj.id);
      TBUpdateObjects();
      Cordova.exec(TBSuccess, TBError, "Tokbox", "initPublisher", [position.top, position.left, width, height, name, publishAudio, publishVideo]);
    }

    return TBPublisher;

  })();

  TBSession = (function() {

    TBSession.name = 'TBSession';

    function TBSession(sid, production) {
      this.sessionId = sid;
      if ((this.production != null) && production) {
        this.production = "true";
      } else {
        this.production = "false";
      }
      Cordova.exec(TBSuccess, TBSuccess, "Tokbox", "initSession", [this.sessionId, this.production]);
    }

    TBSession.prototype.cleanUpDom = function() {
      var e, objects, _i, _len, _results;
      objects = document.getElementsByClassName('TBstreamObject');
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        e = objects[_i];
        _results.push(element.parentNode.removeChild(e));
      }
      return _results;
    };

    TBSession.prototype.sessionDisconnectedHandler = function(event) {
      console.log("JS: Session Disconnected Handler Called");
      return this.cleanUpDom();
    };

    TBSession.prototype.addEventListener = function(event, handler) {
      var _this = this;
      console.log("JS: Add Event Listener Called");
      if (event === 'sessionConnected') {
        return this.sessionConnectedHandler = function(event) {
          _this.connection = event.connection;
          return handler(event);
        };
      } else if (event === 'streamCreated') {
        this.streamCreatedHandler = function(response) {
          var arr, stream;
          arr = response.split(' ');
          stream = {
            connection: {
              connectionId: arr[0]
            },
            streamId: arr[1]
          };
          return handler({
            streams: [stream]
          });
        };
        return Cordova.exec(this.streamCreatedHandler, TBSuccess, "Tokbox", "streamCreatedHandler", []);
      } else if (event === 'sessionDisconnected') {
        return this.sessionDisconnectedHandler = function(event) {
          this.cleanUpDom();
          return handler(event);
        };
      }
    };

    TBSession.prototype.connect = function(apiKey, token, properties) {
      console.log("JS: Connect Called");
      this.apiKey = apiKey;
      this.token = token;
      Cordova.exec(this.sessionConnectedHandler, TBError, "Tokbox", "connect", [this.apiKey, this.token]);
      Cordova.exec(this.streamDisconnectedHandler, TBError, "Tokbox", "streamDisconnectedHandler", []);
      Cordova.exec(this.sessionDisconnectedHandler, TBError, "Tokbox", "sessionDisconnectedHandler", []);
    };

    TBSession.prototype.disconnect = function() {
      return Cordova.exec(this.sessionDisconnectedHandler, TBError, "Tokbox", "disconnect", []);
    };

    TBSession.prototype.publish = function(divName, properties) {
      this.publisher = new TBPublisher(divName, properties, this);
      return this.publisher;
    };

    TBSession.prototype.publish = function(publisher) {
      var newId;
      this.publisher = publisher;
      newId = "TBStreamConnection" + this.connection.connectionId;
      this.publisher.obj.id = newId;
      return Cordova.exec(TBSuccess, TBError, "Tokbox", "publish", []);
    };

    TBSession.prototype.unpublish = function() {
      var element, elementId;
      console.log("JS: Unpublish");
      elementId = "TBStreamConnection" + this.connection.connectionId;
      element = document.getElementById(elementId);
      if (element) {
        element.parentNode.removeChild(element);
        TBUpdateObjects();
      }
      return Cordova.exec(TBSuccess, TBError, "Tokbox", "unpublish", []);
    };

    TBSession.prototype.subscribe = function(stream, divName, properties) {
      return new TBSubscriber(stream, divName, properties);
    };

    TBSession.prototype.streamDisconnectedHandler = function(streamId) {
      var element, elementId;
      console.log("JS: Stream Disconnected Handler Executed");
      elementId = "TBStreamConnection" + streamId;
      element = document.getElementById(elementId);
      if (element) {
        element.parentNode.removeChild(element);
        TBUpdateObjects();
      }
    };

    return TBSession;

  })();

  TBSubscriber = function(stream, divName, properties) {
    var height, name, obj, position, subscribeToVideo, width, _ref, _ref1, _ref2;
    console.log("JS: Subscribing");
    width = 160;
    height = 120;
    subscribeToVideo = "true";
    if ((properties != null)) {
      width = (_ref = properties.width) != null ? _ref : 160;
      height = (_ref1 = properties.height) != null ? _ref1 : 120;
      name = (_ref2 = properties.name) != null ? _ref2 : "";
      if ((properties.subscribeToVideo != null) && properties.subscribeToVideo === false) {
        subscribeToVideo = "false";
      }
    }
    obj = replaceWithObject(divName, stream.streamId, {
      width: width,
      height: height
    });
    position = getPosition(obj.id);
    return Cordova.exec(TBSuccess, TBError, "Tokbox", "subscribe", [stream.streamId, position.top, position.left, width, height, subscribeToVideo]);
  };

}).call(this);
