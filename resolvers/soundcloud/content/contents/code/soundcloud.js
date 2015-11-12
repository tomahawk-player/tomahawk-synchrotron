"use strict";

(function (global) {
  var babelHelpers = global.babelHelpers = {};

  babelHelpers.inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  babelHelpers.createClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();

  babelHelpers.get = function get(_x, _x2, _x3) {
    var _again = true;

    _function: while (_again) {
      var object = _x,
          property = _x2,
          receiver = _x3;
      desc = parent = getter = undefined;
      _again = false;

      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);

      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);

        if (parent === null) {
          return undefined;
        } else {
          _x = parent;
          _x2 = property;
          _x3 = receiver;
          _again = true;
          continue _function;
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;

        if (getter === undefined) {
          return undefined;
        }

        return getter.call(receiver);
      }
    }
  };

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
})(typeof global === "undefined" ? self : global);
/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.1.0
 */

'use strict';

(function () {
  "use strict";
  function lib$rsvp$utils$$objectOrFunction(x) {
    return typeof x === 'function' || typeof x === 'object' && x !== null;
  }

  function lib$rsvp$utils$$isFunction(x) {
    return typeof x === 'function';
  }

  function lib$rsvp$utils$$isMaybeThenable(x) {
    return typeof x === 'object' && x !== null;
  }

  var lib$rsvp$utils$$_isArray;
  if (!Array.isArray) {
    lib$rsvp$utils$$_isArray = function (x) {
      return Object.prototype.toString.call(x) === '[object Array]';
    };
  } else {
    lib$rsvp$utils$$_isArray = Array.isArray;
  }

  var lib$rsvp$utils$$isArray = lib$rsvp$utils$$_isArray;

  var lib$rsvp$utils$$now = Date.now || function () {
    return new Date().getTime();
  };

  function lib$rsvp$utils$$F() {}

  var lib$rsvp$utils$$o_create = Object.create || function (o) {
    if (arguments.length > 1) {
      throw new Error('Second argument not supported');
    }
    if (typeof o !== 'object') {
      throw new TypeError('Argument must be an object');
    }
    lib$rsvp$utils$$F.prototype = o;
    return new lib$rsvp$utils$$F();
  };
  function lib$rsvp$events$$indexOf(callbacks, callback) {
    for (var i = 0, l = callbacks.length; i < l; i++) {
      if (callbacks[i] === callback) {
        return i;
      }
    }

    return -1;
  }

  function lib$rsvp$events$$callbacksFor(object) {
    var callbacks = object._promiseCallbacks;

    if (!callbacks) {
      callbacks = object._promiseCallbacks = {};
    }

    return callbacks;
  }

  var lib$rsvp$events$$default = {

    /**
      `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
      Example:
       ```javascript
      var object = {};
       RSVP.EventTarget.mixin(object);
       object.on('finished', function(event) {
        // handle event
      });
       object.trigger('finished', { detail: value });
      ```
       `EventTarget.mixin` also works with prototypes:
       ```javascript
      var Person = function() {};
      RSVP.EventTarget.mixin(Person.prototype);
       var yehuda = new Person();
      var tom = new Person();
       yehuda.on('poke', function(event) {
        console.log('Yehuda says OW');
      });
       tom.on('poke', function(event) {
        console.log('Tom says OW');
      });
       yehuda.trigger('poke');
      tom.trigger('poke');
      ```
       @method mixin
      @for RSVP.EventTarget
      @private
      @param {Object} object object to extend with EventTarget methods
    */
    'mixin': function mixin(object) {
      object['on'] = this['on'];
      object['off'] = this['off'];
      object['trigger'] = this['trigger'];
      object._promiseCallbacks = undefined;
      return object;
    },

    /**
      Registers a callback to be executed when `eventName` is triggered
       ```javascript
      object.on('event', function(eventInfo){
        // handle the event
      });
       object.trigger('event');
      ```
       @method on
      @for RSVP.EventTarget
      @private
      @param {String} eventName name of the event to listen for
      @param {Function} callback function to be called when the event is triggered.
    */
    'on': function on(eventName, callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('Callback must be a function');
      }

      var allCallbacks = lib$rsvp$events$$callbacksFor(this),
          callbacks;

      callbacks = allCallbacks[eventName];

      if (!callbacks) {
        callbacks = allCallbacks[eventName] = [];
      }

      if (lib$rsvp$events$$indexOf(callbacks, callback) === -1) {
        callbacks.push(callback);
      }
    },

    /**
      You can use `off` to stop firing a particular callback for an event:
       ```javascript
      function doStuff() { // do stuff! }
      object.on('stuff', doStuff);
       object.trigger('stuff'); // doStuff will be called
       // Unregister ONLY the doStuff callback
      object.off('stuff', doStuff);
      object.trigger('stuff'); // doStuff will NOT be called
      ```
       If you don't pass a `callback` argument to `off`, ALL callbacks for the
      event will not be executed when the event fires. For example:
       ```javascript
      var callback1 = function(){};
      var callback2 = function(){};
       object.on('stuff', callback1);
      object.on('stuff', callback2);
       object.trigger('stuff'); // callback1 and callback2 will be executed.
       object.off('stuff');
      object.trigger('stuff'); // callback1 and callback2 will not be executed!
      ```
       @method off
      @for RSVP.EventTarget
      @private
      @param {String} eventName event to stop listening to
      @param {Function} callback optional argument. If given, only the function
      given will be removed from the event's callback queue. If no `callback`
      argument is given, all callbacks will be removed from the event's callback
      queue.
    */
    'off': function off(eventName, callback) {
      var allCallbacks = lib$rsvp$events$$callbacksFor(this),
          callbacks,
          index;

      if (!callback) {
        allCallbacks[eventName] = [];
        return;
      }

      callbacks = allCallbacks[eventName];

      index = lib$rsvp$events$$indexOf(callbacks, callback);

      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    },

    /**
      Use `trigger` to fire custom events. For example:
       ```javascript
      object.on('foo', function(){
        console.log('foo event happened!');
      });
      object.trigger('foo');
      // 'foo event happened!' logged to the console
      ```
       You can also pass a value as a second argument to `trigger` that will be
      passed as an argument to all event listeners for the event:
       ```javascript
      object.on('foo', function(value){
        console.log(value.name);
      });
       object.trigger('foo', { name: 'bar' });
      // 'bar' logged to the console
      ```
       @method trigger
      @for RSVP.EventTarget
      @private
      @param {String} eventName name of the event to be triggered
      @param {*} options optional value to be passed to any event handlers for
      the given `eventName`
    */
    'trigger': function trigger(eventName, options, label) {
      var allCallbacks = lib$rsvp$events$$callbacksFor(this),
          callbacks,
          callback;

      if (callbacks = allCallbacks[eventName]) {
        // Don't cache the callbacks.length since it may grow
        for (var i = 0; i < callbacks.length; i++) {
          callback = callbacks[i];

          callback(options, label);
        }
      }
    }
  };

  var lib$rsvp$config$$config = {
    instrument: false
  };

  lib$rsvp$events$$default['mixin'](lib$rsvp$config$$config);

  function lib$rsvp$config$$configure(name, value) {
    if (name === 'onerror') {
      // handle for legacy users that expect the actual
      // error to be passed to their function added via
      // `RSVP.configure('onerror', someFunctionHere);`
      lib$rsvp$config$$config['on']('error', value);
      return;
    }

    if (arguments.length === 2) {
      lib$rsvp$config$$config[name] = value;
    } else {
      return lib$rsvp$config$$config[name];
    }
  }

  var lib$rsvp$instrument$$queue = [];

  function lib$rsvp$instrument$$scheduleFlush() {
    setTimeout(function () {
      var entry;
      for (var i = 0; i < lib$rsvp$instrument$$queue.length; i++) {
        entry = lib$rsvp$instrument$$queue[i];

        var payload = entry.payload;

        payload.guid = payload.key + payload.id;
        payload.childGuid = payload.key + payload.childId;
        if (payload.error) {
          payload.stack = payload.error.stack;
        }

        lib$rsvp$config$$config['trigger'](entry.name, entry.payload);
      }
      lib$rsvp$instrument$$queue.length = 0;
    }, 50);
  }

  function lib$rsvp$instrument$$instrument(eventName, promise, child) {
    if (1 === lib$rsvp$instrument$$queue.push({
      name: eventName,
      payload: {
        key: promise._guidKey,
        id: promise._id,
        eventName: eventName,
        detail: promise._result,
        childId: child && child._id,
        label: promise._label,
        timeStamp: lib$rsvp$utils$$now(),
        error: lib$rsvp$config$$config["instrument-with-stack"] ? new Error(promise._label) : null
      } })) {
      lib$rsvp$instrument$$scheduleFlush();
    }
  }
  var lib$rsvp$instrument$$default = lib$rsvp$instrument$$instrument;

  function lib$rsvp$$internal$$withOwnPromise() {
    return new TypeError('A promises callback cannot return that same promise.');
  }

  function lib$rsvp$$internal$$noop() {}

  var lib$rsvp$$internal$$PENDING = void 0;
  var lib$rsvp$$internal$$FULFILLED = 1;
  var lib$rsvp$$internal$$REJECTED = 2;

  var lib$rsvp$$internal$$GET_THEN_ERROR = new lib$rsvp$$internal$$ErrorObject();

  function lib$rsvp$$internal$$getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      lib$rsvp$$internal$$GET_THEN_ERROR.error = error;
      return lib$rsvp$$internal$$GET_THEN_ERROR;
    }
  }

  function lib$rsvp$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
    try {
      then.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }

  function lib$rsvp$$internal$$handleForeignThenable(promise, thenable, then) {
    lib$rsvp$config$$config.async(function (promise) {
      var sealed = false;
      var error = lib$rsvp$$internal$$tryThen(then, thenable, function (value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          lib$rsvp$$internal$$resolve(promise, value);
        } else {
          lib$rsvp$$internal$$fulfill(promise, value);
        }
      }, function (reason) {
        if (sealed) {
          return;
        }
        sealed = true;

        lib$rsvp$$internal$$reject(promise, reason);
      }, 'Settle: ' + (promise._label || ' unknown promise'));

      if (!sealed && error) {
        sealed = true;
        lib$rsvp$$internal$$reject(promise, error);
      }
    }, promise);
  }

  function lib$rsvp$$internal$$handleOwnThenable(promise, thenable) {
    if (thenable._state === lib$rsvp$$internal$$FULFILLED) {
      lib$rsvp$$internal$$fulfill(promise, thenable._result);
    } else if (thenable._state === lib$rsvp$$internal$$REJECTED) {
      thenable._onError = null;
      lib$rsvp$$internal$$reject(promise, thenable._result);
    } else {
      lib$rsvp$$internal$$subscribe(thenable, undefined, function (value) {
        if (thenable !== value) {
          lib$rsvp$$internal$$resolve(promise, value);
        } else {
          lib$rsvp$$internal$$fulfill(promise, value);
        }
      }, function (reason) {
        lib$rsvp$$internal$$reject(promise, reason);
      });
    }
  }

  function lib$rsvp$$internal$$handleMaybeThenable(promise, maybeThenable) {
    if (maybeThenable.constructor === promise.constructor) {
      lib$rsvp$$internal$$handleOwnThenable(promise, maybeThenable);
    } else {
      var then = lib$rsvp$$internal$$getThen(maybeThenable);

      if (then === lib$rsvp$$internal$$GET_THEN_ERROR) {
        lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$GET_THEN_ERROR.error);
      } else if (then === undefined) {
        lib$rsvp$$internal$$fulfill(promise, maybeThenable);
      } else if (lib$rsvp$utils$$isFunction(then)) {
        lib$rsvp$$internal$$handleForeignThenable(promise, maybeThenable, then);
      } else {
        lib$rsvp$$internal$$fulfill(promise, maybeThenable);
      }
    }
  }

  function lib$rsvp$$internal$$resolve(promise, value) {
    if (promise === value) {
      lib$rsvp$$internal$$fulfill(promise, value);
    } else if (lib$rsvp$utils$$objectOrFunction(value)) {
      lib$rsvp$$internal$$handleMaybeThenable(promise, value);
    } else {
      lib$rsvp$$internal$$fulfill(promise, value);
    }
  }

  function lib$rsvp$$internal$$publishRejection(promise) {
    if (promise._onError) {
      promise._onError(promise._result);
    }

    lib$rsvp$$internal$$publish(promise);
  }

  function lib$rsvp$$internal$$fulfill(promise, value) {
    if (promise._state !== lib$rsvp$$internal$$PENDING) {
      return;
    }

    promise._result = value;
    promise._state = lib$rsvp$$internal$$FULFILLED;

    if (promise._subscribers.length === 0) {
      if (lib$rsvp$config$$config.instrument) {
        lib$rsvp$instrument$$default('fulfilled', promise);
      }
    } else {
      lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, promise);
    }
  }

  function lib$rsvp$$internal$$reject(promise, reason) {
    if (promise._state !== lib$rsvp$$internal$$PENDING) {
      return;
    }
    promise._state = lib$rsvp$$internal$$REJECTED;
    promise._result = reason;
    lib$rsvp$config$$config.async(lib$rsvp$$internal$$publishRejection, promise);
  }

  function lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
    var subscribers = parent._subscribers;
    var length = subscribers.length;

    parent._onError = null;

    subscribers[length] = child;
    subscribers[length + lib$rsvp$$internal$$FULFILLED] = onFulfillment;
    subscribers[length + lib$rsvp$$internal$$REJECTED] = onRejection;

    if (length === 0 && parent._state) {
      lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, parent);
    }
  }

  function lib$rsvp$$internal$$publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;

    if (lib$rsvp$config$$config.instrument) {
      lib$rsvp$instrument$$default(settled === lib$rsvp$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);
    }

    if (subscribers.length === 0) {
      return;
    }

    var child,
        callback,
        detail = promise._result;

    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];

      if (child) {
        lib$rsvp$$internal$$invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }

    promise._subscribers.length = 0;
  }

  function lib$rsvp$$internal$$ErrorObject() {
    this.error = null;
  }

  var lib$rsvp$$internal$$TRY_CATCH_ERROR = new lib$rsvp$$internal$$ErrorObject();

  function lib$rsvp$$internal$$tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      lib$rsvp$$internal$$TRY_CATCH_ERROR.error = e;
      return lib$rsvp$$internal$$TRY_CATCH_ERROR;
    }
  }

  function lib$rsvp$$internal$$invokeCallback(settled, promise, callback, detail) {
    var hasCallback = lib$rsvp$utils$$isFunction(callback),
        value,
        error,
        succeeded,
        failed;

    if (hasCallback) {
      value = lib$rsvp$$internal$$tryCatch(callback, detail);

      if (value === lib$rsvp$$internal$$TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value = null;
      } else {
        succeeded = true;
      }

      if (promise === value) {
        lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$withOwnPromise());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }

    if (promise._state !== lib$rsvp$$internal$$PENDING) {
      // noop
    } else if (hasCallback && succeeded) {
        lib$rsvp$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$rsvp$$internal$$reject(promise, error);
      } else if (settled === lib$rsvp$$internal$$FULFILLED) {
        lib$rsvp$$internal$$fulfill(promise, value);
      } else if (settled === lib$rsvp$$internal$$REJECTED) {
        lib$rsvp$$internal$$reject(promise, value);
      }
  }

  function lib$rsvp$$internal$$initializePromise(promise, resolver) {
    var resolved = false;
    try {
      resolver(function resolvePromise(value) {
        if (resolved) {
          return;
        }
        resolved = true;
        lib$rsvp$$internal$$resolve(promise, value);
      }, function rejectPromise(reason) {
        if (resolved) {
          return;
        }
        resolved = true;
        lib$rsvp$$internal$$reject(promise, reason);
      });
    } catch (e) {
      lib$rsvp$$internal$$reject(promise, e);
    }
  }

  function lib$rsvp$enumerator$$makeSettledResult(state, position, value) {
    if (state === lib$rsvp$$internal$$FULFILLED) {
      return {
        state: 'fulfilled',
        value: value
      };
    } else {
      return {
        state: 'rejected',
        reason: value
      };
    }
  }

  function lib$rsvp$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
    var enumerator = this;

    enumerator._instanceConstructor = Constructor;
    enumerator.promise = new Constructor(lib$rsvp$$internal$$noop, label);
    enumerator._abortOnReject = abortOnReject;

    if (enumerator._validateInput(input)) {
      enumerator._input = input;
      enumerator.length = input.length;
      enumerator._remaining = input.length;

      enumerator._init();

      if (enumerator.length === 0) {
        lib$rsvp$$internal$$fulfill(enumerator.promise, enumerator._result);
      } else {
        enumerator.length = enumerator.length || 0;
        enumerator._enumerate();
        if (enumerator._remaining === 0) {
          lib$rsvp$$internal$$fulfill(enumerator.promise, enumerator._result);
        }
      }
    } else {
      lib$rsvp$$internal$$reject(enumerator.promise, enumerator._validationError());
    }
  }

  var lib$rsvp$enumerator$$default = lib$rsvp$enumerator$$Enumerator;

  lib$rsvp$enumerator$$Enumerator.prototype._validateInput = function (input) {
    return lib$rsvp$utils$$isArray(input);
  };

  lib$rsvp$enumerator$$Enumerator.prototype._validationError = function () {
    return new Error('Array Methods must be provided an Array');
  };

  lib$rsvp$enumerator$$Enumerator.prototype._init = function () {
    this._result = new Array(this.length);
  };

  lib$rsvp$enumerator$$Enumerator.prototype._enumerate = function () {
    var enumerator = this;
    var length = enumerator.length;
    var promise = enumerator.promise;
    var input = enumerator._input;

    for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
      enumerator._eachEntry(input[i], i);
    }
  };

  lib$rsvp$enumerator$$Enumerator.prototype._eachEntry = function (entry, i) {
    var enumerator = this;
    var c = enumerator._instanceConstructor;
    if (lib$rsvp$utils$$isMaybeThenable(entry)) {
      if (entry.constructor === c && entry._state !== lib$rsvp$$internal$$PENDING) {
        entry._onError = null;
        enumerator._settledAt(entry._state, i, entry._result);
      } else {
        enumerator._willSettleAt(c.resolve(entry), i);
      }
    } else {
      enumerator._remaining--;
      enumerator._result[i] = enumerator._makeResult(lib$rsvp$$internal$$FULFILLED, i, entry);
    }
  };

  lib$rsvp$enumerator$$Enumerator.prototype._settledAt = function (state, i, value) {
    var enumerator = this;
    var promise = enumerator.promise;

    if (promise._state === lib$rsvp$$internal$$PENDING) {
      enumerator._remaining--;

      if (enumerator._abortOnReject && state === lib$rsvp$$internal$$REJECTED) {
        lib$rsvp$$internal$$reject(promise, value);
      } else {
        enumerator._result[i] = enumerator._makeResult(state, i, value);
      }
    }

    if (enumerator._remaining === 0) {
      lib$rsvp$$internal$$fulfill(promise, enumerator._result);
    }
  };

  lib$rsvp$enumerator$$Enumerator.prototype._makeResult = function (state, i, value) {
    return value;
  };

  lib$rsvp$enumerator$$Enumerator.prototype._willSettleAt = function (promise, i) {
    var enumerator = this;

    lib$rsvp$$internal$$subscribe(promise, undefined, function (value) {
      enumerator._settledAt(lib$rsvp$$internal$$FULFILLED, i, value);
    }, function (reason) {
      enumerator._settledAt(lib$rsvp$$internal$$REJECTED, i, reason);
    });
  };
  function lib$rsvp$promise$all$$all(entries, label) {
    return new lib$rsvp$enumerator$$default(this, entries, true, /* abort on reject */label).promise;
  }
  var lib$rsvp$promise$all$$default = lib$rsvp$promise$all$$all;
  function lib$rsvp$promise$race$$race(entries, label) {
    /*jshint validthis:true */
    var Constructor = this;

    var promise = new Constructor(lib$rsvp$$internal$$noop, label);

    if (!lib$rsvp$utils$$isArray(entries)) {
      lib$rsvp$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
      return promise;
    }

    var length = entries.length;

    function onFulfillment(value) {
      lib$rsvp$$internal$$resolve(promise, value);
    }

    function onRejection(reason) {
      lib$rsvp$$internal$$reject(promise, reason);
    }

    for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
      lib$rsvp$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
    }

    return promise;
  }
  var lib$rsvp$promise$race$$default = lib$rsvp$promise$race$$race;
  function lib$rsvp$promise$resolve$$resolve(object, label) {
    /*jshint validthis:true */
    var Constructor = this;

    if (object && typeof object === 'object' && object.constructor === Constructor) {
      return object;
    }

    var promise = new Constructor(lib$rsvp$$internal$$noop, label);
    lib$rsvp$$internal$$resolve(promise, object);
    return promise;
  }
  var lib$rsvp$promise$resolve$$default = lib$rsvp$promise$resolve$$resolve;
  function lib$rsvp$promise$reject$$reject(reason, label) {
    /*jshint validthis:true */
    var Constructor = this;
    var promise = new Constructor(lib$rsvp$$internal$$noop, label);
    lib$rsvp$$internal$$reject(promise, reason);
    return promise;
  }
  var lib$rsvp$promise$reject$$default = lib$rsvp$promise$reject$$reject;

  var lib$rsvp$promise$$guidKey = 'rsvp_' + lib$rsvp$utils$$now() + '-';
  var lib$rsvp$promise$$counter = 0;

  function lib$rsvp$promise$$needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  function lib$rsvp$promise$$needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  function lib$rsvp$promise$$Promise(resolver, label) {
    var promise = this;

    promise._id = lib$rsvp$promise$$counter++;
    promise._label = label;
    promise._state = undefined;
    promise._result = undefined;
    promise._subscribers = [];

    if (lib$rsvp$config$$config.instrument) {
      lib$rsvp$instrument$$default('created', promise);
    }

    if (lib$rsvp$$internal$$noop !== resolver) {
      if (!lib$rsvp$utils$$isFunction(resolver)) {
        lib$rsvp$promise$$needsResolver();
      }

      if (!(promise instanceof lib$rsvp$promise$$Promise)) {
        lib$rsvp$promise$$needsNew();
      }

      lib$rsvp$$internal$$initializePromise(promise, resolver);
    }
  }

  var lib$rsvp$promise$$default = lib$rsvp$promise$$Promise;

  // deprecated
  lib$rsvp$promise$$Promise.cast = lib$rsvp$promise$resolve$$default;
  lib$rsvp$promise$$Promise.all = lib$rsvp$promise$all$$default;
  lib$rsvp$promise$$Promise.race = lib$rsvp$promise$race$$default;
  lib$rsvp$promise$$Promise.resolve = lib$rsvp$promise$resolve$$default;
  lib$rsvp$promise$$Promise.reject = lib$rsvp$promise$reject$$default;

  lib$rsvp$promise$$Promise.prototype = {
    constructor: lib$rsvp$promise$$Promise,

    _guidKey: lib$rsvp$promise$$guidKey,

    _onError: function _onError(reason) {
      var promise = this;
      lib$rsvp$config$$config.after(function () {
        if (promise._onError) {
          lib$rsvp$config$$config['trigger']('error', reason, promise._label);
        }
      });
    },

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.
       ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```
       Chaining
      --------
       The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.
       ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });
       findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
       ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```
       Assimilation
      ------------
       Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```
       If the assimliated promise rejects, then the downstream promise will also reject.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```
       Simple Example
      --------------
       Synchronous Example
       ```javascript
      var result;
       try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```
       Advanced Example
      --------------
       Synchronous Example
       ```javascript
      var author, books;
       try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
       function foundBooks(books) {
       }
       function failure(reason) {
       }
       findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```
       @method then
      @param {Function} onFulfillment
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
    then: function then(onFulfillment, onRejection, label) {
      var parent = this;
      var state = parent._state;

      if (state === lib$rsvp$$internal$$FULFILLED && !onFulfillment || state === lib$rsvp$$internal$$REJECTED && !onRejection) {
        if (lib$rsvp$config$$config.instrument) {
          lib$rsvp$instrument$$default('chained', parent, parent);
        }
        return parent;
      }

      parent._onError = null;

      var child = new parent.constructor(lib$rsvp$$internal$$noop, label);
      var result = parent._result;

      if (lib$rsvp$config$$config.instrument) {
        lib$rsvp$instrument$$default('chained', parent, child);
      }

      if (state) {
        var callback = arguments[state - 1];
        lib$rsvp$config$$config.async(function () {
          lib$rsvp$$internal$$invokeCallback(state, child, callback, result);
        });
      } else {
        lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
       ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }
       // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }
       // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```
       @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
    'catch': function _catch(onRejection, label) {
      return this.then(undefined, onRejection, label);
    },

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves
       Synchronous example:
       ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }
       try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```
       Asynchronous example:
       ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```
       @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
    'finally': function _finally(callback, label) {
      var promise = this;
      var constructor = promise.constructor;

      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      }, label);
    }
  };

  function lib$rsvp$all$settled$$AllSettled(Constructor, entries, label) {
    this._superConstructor(Constructor, entries, false, /* don't abort on reject */label);
  }

  lib$rsvp$all$settled$$AllSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
  lib$rsvp$all$settled$$AllSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
  lib$rsvp$all$settled$$AllSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;
  lib$rsvp$all$settled$$AllSettled.prototype._validationError = function () {
    return new Error('allSettled must be called with an array');
  };

  function lib$rsvp$all$settled$$allSettled(entries, label) {
    return new lib$rsvp$all$settled$$AllSettled(lib$rsvp$promise$$default, entries, label).promise;
  }
  var lib$rsvp$all$settled$$default = lib$rsvp$all$settled$$allSettled;
  function lib$rsvp$all$$all(array, label) {
    return lib$rsvp$promise$$default.all(array, label);
  }
  var lib$rsvp$all$$default = lib$rsvp$all$$all;
  var lib$rsvp$asap$$len = 0;
  var lib$rsvp$asap$$toString = ({}).toString;
  var lib$rsvp$asap$$vertxNext;
  function lib$rsvp$asap$$asap(callback, arg) {
    lib$rsvp$asap$$queue[lib$rsvp$asap$$len] = callback;
    lib$rsvp$asap$$queue[lib$rsvp$asap$$len + 1] = arg;
    lib$rsvp$asap$$len += 2;
    if (lib$rsvp$asap$$len === 2) {
      // If len is 1, that means that we need to schedule an async flush.
      // If additional callbacks are queued before the queue is flushed, they
      // will be processed by this flush that we are scheduling.
      lib$rsvp$asap$$scheduleFlush();
    }
  }

  var lib$rsvp$asap$$default = lib$rsvp$asap$$asap;

  var lib$rsvp$asap$$browserWindow = typeof window !== 'undefined' ? window : undefined;
  var lib$rsvp$asap$$browserGlobal = lib$rsvp$asap$$browserWindow || {};
  var lib$rsvp$asap$$BrowserMutationObserver = lib$rsvp$asap$$browserGlobal.MutationObserver || lib$rsvp$asap$$browserGlobal.WebKitMutationObserver;
  var lib$rsvp$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]';

  // test for web worker but not in IE10
  var lib$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

  // node
  function lib$rsvp$asap$$useNextTick() {
    var nextTick = process.nextTick;
    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
    // setImmediate should be used instead instead
    var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
    if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
      nextTick = setImmediate;
    }
    return function () {
      nextTick(lib$rsvp$asap$$flush);
    };
  }

  // vertx
  function lib$rsvp$asap$$useVertxTimer() {
    return function () {
      lib$rsvp$asap$$vertxNext(lib$rsvp$asap$$flush);
    };
  }

  function lib$rsvp$asap$$useMutationObserver() {
    var iterations = 0;
    var observer = new lib$rsvp$asap$$BrowserMutationObserver(lib$rsvp$asap$$flush);
    var node = document.createTextNode('');
    observer.observe(node, { characterData: true });

    return function () {
      node.data = iterations = ++iterations % 2;
    };
  }

  // web worker
  function lib$rsvp$asap$$useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = lib$rsvp$asap$$flush;
    return function () {
      channel.port2.postMessage(0);
    };
  }

  function lib$rsvp$asap$$useSetTimeout() {
    return function () {
      setTimeout(lib$rsvp$asap$$flush, 1);
    };
  }

  var lib$rsvp$asap$$queue = new Array(1000);
  function lib$rsvp$asap$$flush() {
    for (var i = 0; i < lib$rsvp$asap$$len; i += 2) {
      var callback = lib$rsvp$asap$$queue[i];
      var arg = lib$rsvp$asap$$queue[i + 1];

      callback(arg);

      lib$rsvp$asap$$queue[i] = undefined;
      lib$rsvp$asap$$queue[i + 1] = undefined;
    }

    lib$rsvp$asap$$len = 0;
  }

  function lib$rsvp$asap$$attemptVertex() {
    try {
      var r = require;
      var vertx = r('vertx');
      lib$rsvp$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return lib$rsvp$asap$$useVertxTimer();
    } catch (e) {
      return lib$rsvp$asap$$useSetTimeout();
    }
  }

  var lib$rsvp$asap$$scheduleFlush;
  // Decide what async method to use to triggering processing of queued callbacks:
  if (lib$rsvp$asap$$isNode) {
    lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useNextTick();
  } else if (lib$rsvp$asap$$BrowserMutationObserver) {
    lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMutationObserver();
  } else if (lib$rsvp$asap$$isWorker) {
    lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMessageChannel();
  } else if (lib$rsvp$asap$$browserWindow === undefined && typeof require === 'function') {
    lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$attemptVertex();
  } else {
    lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useSetTimeout();
  }
  function lib$rsvp$defer$$defer(label) {
    var deferred = {};

    deferred['promise'] = new lib$rsvp$promise$$default(function (resolve, reject) {
      deferred['resolve'] = resolve;
      deferred['reject'] = reject;
    }, label);

    return deferred;
  }
  var lib$rsvp$defer$$default = lib$rsvp$defer$$defer;
  function lib$rsvp$filter$$filter(promises, filterFn, label) {
    return lib$rsvp$promise$$default.all(promises, label).then(function (values) {
      if (!lib$rsvp$utils$$isFunction(filterFn)) {
        throw new TypeError("You must pass a function as filter's second argument.");
      }

      var length = values.length;
      var filtered = new Array(length);

      for (var i = 0; i < length; i++) {
        filtered[i] = filterFn(values[i]);
      }

      return lib$rsvp$promise$$default.all(filtered, label).then(function (filtered) {
        var results = new Array(length);
        var newLength = 0;

        for (var i = 0; i < length; i++) {
          if (filtered[i]) {
            results[newLength] = values[i];
            newLength++;
          }
        }

        results.length = newLength;

        return results;
      });
    });
  }
  var lib$rsvp$filter$$default = lib$rsvp$filter$$filter;

  function lib$rsvp$promise$hash$$PromiseHash(Constructor, object, label) {
    this._superConstructor(Constructor, object, true, label);
  }

  var lib$rsvp$promise$hash$$default = lib$rsvp$promise$hash$$PromiseHash;

  lib$rsvp$promise$hash$$PromiseHash.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
  lib$rsvp$promise$hash$$PromiseHash.prototype._superConstructor = lib$rsvp$enumerator$$default;
  lib$rsvp$promise$hash$$PromiseHash.prototype._init = function () {
    this._result = {};
  };

  lib$rsvp$promise$hash$$PromiseHash.prototype._validateInput = function (input) {
    return input && typeof input === 'object';
  };

  lib$rsvp$promise$hash$$PromiseHash.prototype._validationError = function () {
    return new Error('Promise.hash must be called with an object');
  };

  lib$rsvp$promise$hash$$PromiseHash.prototype._enumerate = function () {
    var enumerator = this;
    var promise = enumerator.promise;
    var input = enumerator._input;
    var results = [];

    for (var key in input) {
      if (promise._state === lib$rsvp$$internal$$PENDING && Object.prototype.hasOwnProperty.call(input, key)) {
        results.push({
          position: key,
          entry: input[key]
        });
      }
    }

    var length = results.length;
    enumerator._remaining = length;
    var result;

    for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
      result = results[i];
      enumerator._eachEntry(result.entry, result.position);
    }
  };

  function lib$rsvp$hash$settled$$HashSettled(Constructor, object, label) {
    this._superConstructor(Constructor, object, false, label);
  }

  lib$rsvp$hash$settled$$HashSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$promise$hash$$default.prototype);
  lib$rsvp$hash$settled$$HashSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
  lib$rsvp$hash$settled$$HashSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;

  lib$rsvp$hash$settled$$HashSettled.prototype._validationError = function () {
    return new Error('hashSettled must be called with an object');
  };

  function lib$rsvp$hash$settled$$hashSettled(object, label) {
    return new lib$rsvp$hash$settled$$HashSettled(lib$rsvp$promise$$default, object, label).promise;
  }
  var lib$rsvp$hash$settled$$default = lib$rsvp$hash$settled$$hashSettled;
  function lib$rsvp$hash$$hash(object, label) {
    return new lib$rsvp$promise$hash$$default(lib$rsvp$promise$$default, object, label).promise;
  }
  var lib$rsvp$hash$$default = lib$rsvp$hash$$hash;
  function lib$rsvp$map$$map(promises, mapFn, label) {
    return lib$rsvp$promise$$default.all(promises, label).then(function (values) {
      if (!lib$rsvp$utils$$isFunction(mapFn)) {
        throw new TypeError("You must pass a function as map's second argument.");
      }

      var length = values.length;
      var results = new Array(length);

      for (var i = 0; i < length; i++) {
        results[i] = mapFn(values[i]);
      }

      return lib$rsvp$promise$$default.all(results, label);
    });
  }
  var lib$rsvp$map$$default = lib$rsvp$map$$map;

  function lib$rsvp$node$$Result() {
    this.value = undefined;
  }

  var lib$rsvp$node$$ERROR = new lib$rsvp$node$$Result();
  var lib$rsvp$node$$GET_THEN_ERROR = new lib$rsvp$node$$Result();

  function lib$rsvp$node$$getThen(obj) {
    try {
      return obj.then;
    } catch (error) {
      lib$rsvp$node$$ERROR.value = error;
      return lib$rsvp$node$$ERROR;
    }
  }

  function lib$rsvp$node$$tryApply(f, s, a) {
    try {
      f.apply(s, a);
    } catch (error) {
      lib$rsvp$node$$ERROR.value = error;
      return lib$rsvp$node$$ERROR;
    }
  }

  function lib$rsvp$node$$makeObject(_, argumentNames) {
    var obj = {};
    var name;
    var i;
    var length = _.length;
    var args = new Array(length);

    for (var x = 0; x < length; x++) {
      args[x] = _[x];
    }

    for (i = 0; i < argumentNames.length; i++) {
      name = argumentNames[i];
      obj[name] = args[i + 1];
    }

    return obj;
  }

  function lib$rsvp$node$$arrayResult(_) {
    var length = _.length;
    var args = new Array(length - 1);

    for (var i = 1; i < length; i++) {
      args[i - 1] = _[i];
    }

    return args;
  }

  function lib$rsvp$node$$wrapThenable(_then, promise) {
    return {
      then: function then(onFulFillment, onRejection) {
        return _then.call(promise, onFulFillment, onRejection);
      }
    };
  }

  function lib$rsvp$node$$denodeify(nodeFunc, options) {
    var fn = function fn() {
      var self = this;
      var l = arguments.length;
      var args = new Array(l + 1);
      var arg;
      var promiseInput = false;

      for (var i = 0; i < l; ++i) {
        arg = arguments[i];

        if (!promiseInput) {
          // TODO: clean this up
          promiseInput = lib$rsvp$node$$needsPromiseInput(arg);
          if (promiseInput === lib$rsvp$node$$GET_THEN_ERROR) {
            var p = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);
            lib$rsvp$$internal$$reject(p, lib$rsvp$node$$GET_THEN_ERROR.value);
            return p;
          } else if (promiseInput && promiseInput !== true) {
            arg = lib$rsvp$node$$wrapThenable(promiseInput, arg);
          }
        }
        args[i] = arg;
      }

      var promise = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);

      args[l] = function (err, val) {
        if (err) lib$rsvp$$internal$$reject(promise, err);else if (options === undefined) lib$rsvp$$internal$$resolve(promise, val);else if (options === true) lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$arrayResult(arguments));else if (lib$rsvp$utils$$isArray(options)) lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$makeObject(arguments, options));else lib$rsvp$$internal$$resolve(promise, val);
      };

      if (promiseInput) {
        return lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);
      } else {
        return lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);
      }
    };

    fn.__proto__ = nodeFunc;

    return fn;
  }

  var lib$rsvp$node$$default = lib$rsvp$node$$denodeify;

  function lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {
    var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
    if (result === lib$rsvp$node$$ERROR) {
      lib$rsvp$$internal$$reject(promise, result.value);
    }
    return promise;
  }

  function lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self) {
    return lib$rsvp$promise$$default.all(args).then(function (args) {
      var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
      if (result === lib$rsvp$node$$ERROR) {
        lib$rsvp$$internal$$reject(promise, result.value);
      }
      return promise;
    });
  }

  function lib$rsvp$node$$needsPromiseInput(arg) {
    if (arg && typeof arg === 'object') {
      if (arg.constructor === lib$rsvp$promise$$default) {
        return true;
      } else {
        return lib$rsvp$node$$getThen(arg);
      }
    } else {
      return false;
    }
  }
  var lib$rsvp$platform$$platform;

  /* global self */
  if (typeof self === 'object') {
    lib$rsvp$platform$$platform = self;

    /* global global */
  } else if (typeof global === 'object') {
      lib$rsvp$platform$$platform = global;
    } else {
      throw new Error('no global: `self` or `global` found');
    }

  var lib$rsvp$platform$$default = lib$rsvp$platform$$platform;
  function lib$rsvp$race$$race(array, label) {
    return lib$rsvp$promise$$default.race(array, label);
  }
  var lib$rsvp$race$$default = lib$rsvp$race$$race;
  function lib$rsvp$reject$$reject(reason, label) {
    return lib$rsvp$promise$$default.reject(reason, label);
  }
  var lib$rsvp$reject$$default = lib$rsvp$reject$$reject;
  function lib$rsvp$resolve$$resolve(value, label) {
    return lib$rsvp$promise$$default.resolve(value, label);
  }
  var lib$rsvp$resolve$$default = lib$rsvp$resolve$$resolve;
  function lib$rsvp$rethrow$$rethrow(reason) {
    setTimeout(function () {
      throw reason;
    });
    throw reason;
  }
  var lib$rsvp$rethrow$$default = lib$rsvp$rethrow$$rethrow;

  // defaults
  lib$rsvp$config$$config.async = lib$rsvp$asap$$default;
  lib$rsvp$config$$config.after = function (cb) {
    setTimeout(cb, 0);
  };
  var lib$rsvp$$cast = lib$rsvp$resolve$$default;
  function lib$rsvp$$async(callback, arg) {
    lib$rsvp$config$$config.async(callback, arg);
  }

  function lib$rsvp$$on() {
    lib$rsvp$config$$config['on'].apply(lib$rsvp$config$$config, arguments);
  }

  function lib$rsvp$$off() {
    lib$rsvp$config$$config['off'].apply(lib$rsvp$config$$config, arguments);
  }

  // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
  if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
    var lib$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];
    lib$rsvp$config$$configure('instrument', true);
    for (var lib$rsvp$$eventName in lib$rsvp$$callbacks) {
      if (lib$rsvp$$callbacks.hasOwnProperty(lib$rsvp$$eventName)) {
        lib$rsvp$$on(lib$rsvp$$eventName, lib$rsvp$$callbacks[lib$rsvp$$eventName]);
      }
    }
  }

  var lib$rsvp$umd$$RSVP = {
    'race': lib$rsvp$race$$default,
    'Promise': lib$rsvp$promise$$default,
    'allSettled': lib$rsvp$all$settled$$default,
    'hash': lib$rsvp$hash$$default,
    'hashSettled': lib$rsvp$hash$settled$$default,
    'denodeify': lib$rsvp$node$$default,
    'on': lib$rsvp$$on,
    'off': lib$rsvp$$off,
    'map': lib$rsvp$map$$default,
    'filter': lib$rsvp$filter$$default,
    'resolve': lib$rsvp$resolve$$default,
    'reject': lib$rsvp$reject$$default,
    'all': lib$rsvp$all$$default,
    'rethrow': lib$rsvp$rethrow$$default,
    'defer': lib$rsvp$defer$$default,
    'EventTarget': lib$rsvp$events$$default,
    'configure': lib$rsvp$config$$configure,
    'async': lib$rsvp$$async
  };

  /* global define:true module:true window: true */
  if (typeof define === 'function' && define['amd']) {
    define(function () {
      return lib$rsvp$umd$$RSVP;
    });
  } else if (typeof module !== 'undefined' && module['exports']) {
    module['exports'] = lib$rsvp$umd$$RSVP;
  } else if (typeof lib$rsvp$platform$$default !== 'undefined') {
    lib$rsvp$platform$$default['RSVP'] = lib$rsvp$umd$$RSVP;
  }
}).call(undefined);
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

"use strict";

var requirejs, require, define;
(function (undef) {
    var main,
        req,
        makeMap,
        handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts,
            nameSegment,
            mapValue,
            foundMap,
            lastIndex,
            foundI,
            foundStarMap,
            starI,
            i,
            j,
            part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = map && map['*'] || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return config && config.config && config.config[name] || {};
        };
    }

    handlers = {
        require: function require(name) {
            return makeRequire(name);
        },
        exports: function exports(name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return defined[name] = {};
            }
        },
        module: function module(name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule,
            depName,
            ret,
            map,
            i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) || hasProp(waiting, depName) || hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef && cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
})();
define('tomahawk/plugin-manager', ['exports', 'rsvp'], function (exports, _rsvp) {
    'use strict';

    var PluginManager = (function () {
        function PluginManager() {
            babelHelpers.classCallCheck(this, PluginManager);

            this.objects = {};
            this.resolve = [];
            this.objectCounter = 0;
        }

        babelHelpers.createClass(PluginManager, [{
            key: 'identifyObject',
            value: function identifyObject(object) {
                if (!object.hasOwnProperty('id')) {
                    object.id = this.objectCounter++;
                }

                return object.id;
            }
        }, {
            key: 'registerPlugin',
            value: function registerPlugin(type, object) {
                this.objects[this.identifyObject(object)] = object;
                if (type === 'collection') {
                    Tomahawk.collections.push(object);
                }

                Tomahawk.log("registerPlugin: " + type + " id: " + object.id);
                Tomahawk.registerScriptPlugin(type, object.id);
            }
        }, {
            key: 'unregisterPlugin',
            value: function unregisterPlugin(type, object) {
                this.objects[this.identifyObject(object)] = object;

                Tomahawk.log("unregisterPlugin: " + type + " id: " + object.id);
                Tomahawk.unregisterScriptPlugin(type, object.id);
            }
        }, {
            key: 'invokeSync',
            value: function invokeSync(requestId, objectId, methodName, params) {
                if (!window.resolverInstance.apiVersion || window.resolverInstance.apiVersion < 0.9) {
                    if (methodName === 'artistAlbums') {
                        methodName = 'albums';
                    } else if (methodName === 'albumTracks') {
                        methodName = 'tracks';
                    }
                }

                var pluginManager = this;
                if (!this.objects[objectId]) {
                    Tomahawk.log("Object not found! objectId: " + objectId + " methodName: " + methodName);
                } else {
                    if (!this.objects[objectId][methodName]) {
                        Tomahawk.log("Function not found: " + methodName);
                    }
                }

                if (typeof this.objects[objectId][methodName] === 'function') {
                    if (!window.window.resolverInstance.apiVersion || window.window.resolverInstance.apiVersion < 0.9) {
                        if (methodName == 'artists') {
                            return new _rsvp['default'].Promise(function (resolve, reject) {
                                pluginManager.resolve[requestId] = resolve;
                                window.resolverInstance.artists(requestId);
                            });
                        } else if (methodName == 'albums') {
                            return new _rsvp['default'].Promise(function (resolve, reject) {
                                pluginManager.resolve[requestId] = resolve;
                                window.resolverInstance.albums(requestId, params.artist);
                            });
                        } else if (methodName == 'tracks') {
                            return new _rsvp['default'].Promise(function (resolve, reject) {
                                pluginManager.resolve[requestId] = resolve;
                                window.resolverInstance.tracks(requestId, params.artist, params.album);
                            });
                        } else if (methodName == 'lookupUrl') {
                            return new _rsvp['default'].Promise(function (resolve, reject) {
                                pluginManager.resolve[params.url] = resolve;
                                window.resolverInstance.lookupUrl(params.url);
                            });
                        } else if (methodName == 'getStreamUrl') {
                            return new _rsvp['default'].Promise(function (resolve, reject) {
                                pluginManager.resolve[requestId] = resolve;
                                window.resolverInstance.getStreamUrl(requestId, params.url);
                            });
                        } else if (methodName == 'resolve') {
                            return new _rsvp['default'].Promise(function (resolve, reject) {
                                pluginManager.resolve[requestId] = resolve;
                                window.resolverInstance.resolve(requestId, params.artist, params.album, params.track);
                            });
                        } else if (methodName == 'search') {
                            return new _rsvp['default'].Promise(function (resolve, reject) {
                                pluginManager.resolve[requestId] = resolve;
                                window.resolverInstance.search(requestId, params.query);
                            });
                        }
                    }

                    return this.objects[objectId][methodName](params);
                }

                return this.objects[objectId][methodName];
            }
        }, {
            key: 'invoke',
            value: function invoke(requestId, objectId, methodName, params) {
                _rsvp['default'].Promise.resolve(this.invokeSync(requestId, objectId, methodName, params)).then(function (result) {
                    Tomahawk.reportScriptJobResults({
                        requestId: requestId,
                        data: result
                    });
                }, function (error) {
                    Tomahawk.reportScriptJobResults({
                        requestId: requestId,
                        error: error
                    });
                });
            }
        }]);
        return PluginManager;
    })();

    exports['default'] = PluginManager;
});
define("rsvp", ["exports"], function (exports) {
  "use strict";

  exports["default"] = RSVP;
});
define('main', ['exports', 'tomahawk/resolver', 'tomahawk/url-types', 'tomahawk/resolver-capabilities', 'tomahawk/request', 'tomahawk/collection'], function (exports, _tomahawkResolver, _tomahawkUrlTypes, _tomahawkResolverCapabilities, _tomahawkRequest, _tomahawkCollection) {
    /* === This file is part of Tomahawk Player - <http://tomahawk-player.org> ===
     *
     *   Copyright 2012, Thierry Göckel <thierry@strayrayday.lu>
     *   Copyright 2013, Uwe L. Korn <uwelk@xhochy.com>
     *   Copyright 2015, Enno Gottschalk <mrmaffen@googlemail.com>
     *   Copyright 2015, Dominik Schmidt <domme@tomahawk-player.org>
     *
     *   Tomahawk is free software: you can redistribute it and/or modify
     *   it under the terms of the GNU General Public License as published by
     *   the Free Software Foundation, either version 3 of the License, or
     *   (at your option) any later version.
     *
     *   Tomahawk is distributed in the hope this it will be useful,
     *   but WITHOUT ANY WARRANTY; without even the implied warranty of
     *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
     *   GNU General Public License for more details.
     *
     *   You should have received a copy of the GNU General Public License
     *   along with Tomahawk. If not, see <http://www.gnu.org/licenses/>.
     */

    'use strict';

    var SoundcloudResolver = (function (_Resolver) {
        babelHelpers.inherits(SoundcloudResolver, _Resolver);

        function SoundcloudResolver() {
            babelHelpers.classCallCheck(this, SoundcloudResolver);

            babelHelpers.get(Object.getPrototypeOf(SoundcloudResolver.prototype), 'constructor', this).call(this);

            this.settings = {
                name: 'SoundCloud',
                icon: 'soundcloud-icon.png',
                weight: 85,
                timeout: 15
            };

            this.apiVersion = 0.9;
            this.soundcloudClientId = "TiNg2DRYhBnp01DA3zNag";
            this.echonestClientId = "JRIHWEP6GPOER2QQ6";
            this.baseUrl = "https://api.soundcloud.com/";
        }

        babelHelpers.createClass(SoundcloudResolver, [{
            key: 'getConfigUi',
            value: function getConfigUi() {
                var uiData = Tomahawk.readBase64("config.ui");
                return {
                    "widget": uiData,
                    fields: [{
                        name: "includeCovers",
                        widget: "covers",
                        property: "checked"
                    }, {
                        name: "includeRemixes",
                        widget: "remixes",
                        property: "checked"
                    }, {
                        name: "includeLive",
                        widget: "live",
                        property: "checked"
                    }],
                    images: [{
                        "soundcloud.png": Tomahawk.readBase64("soundcloud.png")
                    }]
                };
            }
        }, {
            key: 'newConfigSaved',
            value: function newConfigSaved(newConfig) {
                this.includeCovers = newConfig.includeCovers;
                this.includeRemixes = newConfig.includeRemixes;
                this.includeLive = newConfig.includeLive;
            }

            /**
             * Initialize the Soundcloud resolver.
             */
        }, {
            key: 'init',
            value: function init() {
                // Set userConfig here
                var userConfig = this.getUserConfig();
                if (userConfig) {
                    this.includeCovers = userConfig.includeCovers;
                    this.includeRemixes = userConfig.includeRemixes;
                    this.includeLive = userConfig.includeLive;
                } else {
                    this.includeCovers = false;
                    this.includeRemixes = false;
                    this.includeLive = false;
                }

                Tomahawk.reportCapabilities(_tomahawkResolverCapabilities['default'].UrlLookup);
            }
        }, {
            key: '_isValidTrack',
            value: function _isValidTrack(trackTitle, origTitle) {
                if (!this.includeCovers && trackTitle.search(/cover/i) >= 0 && origTitle.search(/cover/i) < 0) {
                    return false;
                }
                if (!this.includeRemixes && trackTitle.search(/mix/i) >= 0 && origTitle.search(/mix/i) < 0) {
                    return false;
                }
                if (!this.includeLive && trackTitle.search(/live/i) >= 0 && origTitle.search(/live/i) < 0) {
                    return false;
                }
                return true;
            }
        }, {
            key: 'resolve',
            value: function resolve(_ref) {
                var _this = this;

                var artist = _ref.artist;
                var album = _ref.album;
                var track = _ref.track;

                var url = this.baseUrl + "tracks.json";
                var settings = {
                    data: {
                        consumer_key: this.soundcloudClientId,
                        filter: "streamable",
                        limit: 20,
                        q: [artist, track].join(" ")
                    }
                };
                return (0, _tomahawkRequest.get)(url, settings).then(function (response) {
                    var results = [];
                    for (var i = 0; i < response.length; i++) {
                        // Check if the title-string contains the track name we are looking for. Also check
                        // if the artist name can be found in either the title-string or the username. Last
                        // but not least we make sure this we only include covers/remixes and live versions
                        // if the user wants us to.
                        if (!response[i] || !response[i].title || response[i].title.toLowerCase().indexOf(artist.toLowerCase()) < 0 && response[i].user.username.toLowerCase().indexOf(artist.toLowerCase()) < 0 || response[i].title.toLowerCase().indexOf(track.toLowerCase()) < 0 || !_this._isValidTrack(response[i].title, track)) {
                            continue;
                        }

                        var guessedMetaData = _this._guessMetaData(response[i].title);
                        var title = guessedMetaData ? guessedMetaData.track : response[i].title;

                        var result = {
                            track: title,
                            artist: artist,
                            bitrate: 128,
                            mimetype: "audio/mpeg",
                            source: _this.settings.name,
                            duration: response[i].duration / 1000,
                            year: response[i].release_year,
                            url: response[i].stream_url + ".json?client_id=" + _this.soundcloudClientId
                        };
                        if (response[i].permalink_url) {
                            result.linkUrl = response[i].permalink_url;
                        }
                        results.push(result);
                    }
                    return results;
                });
            }
        }, {
            key: '_guessMetaData',
            value: function _guessMetaData(title) {
                var matches = title.match(/\s*(.+?)\s*(?:\s[-\u2014]|\s["']|:)\s*["']?(.+?)["']?\s*$/);
                if (matches && matches.length > 2) {
                    return {
                        track: matches[2],
                        artist: matches[1]
                    };
                }
                matches = title.match(/\s*(.+?)\s*[-\u2014]+\s*(.+?)\s*$/);
                if (matches && matches.length > 2) {
                    return {
                        track: matches[2],
                        artist: matches[1]
                    };
                }
            }
        }, {
            key: 'search',
            value: function search(_ref2) {
                var _this2 = this;

                var query = _ref2.query;

                var url = this.baseUrl + "tracks.json";
                var settings = {
                    data: {
                        consumer_key: this.soundcloudClientId,
                        filter: "streamable",
                        limit: 50,
                        q: query.replace("'", "")
                    }
                };
                return (0, _tomahawkRequest.get)(url, settings).then(function (response) {
                    var promises = [];
                    var results = [];
                    for (var i = 0; i < response.length; i++) {
                        // Make sure this we only include covers/remixes and live versions if the user wants
                        // us to.
                        if (!response[i] || !response[i].title || !_this2._isValidTrack(response[i].title, "")) {
                            continue;
                        }

                        var candidate = {
                            mimetype: "audio/mpeg",
                            bitrate: 128,
                            duration: response[i].duration / 1000,
                            year: response[i].release_year,
                            url: response[i].stream_url + ".json?client_id=" + _this2.soundcloudClientId
                        };
                        if (response[i].permalink_url) {
                            candidate.linkUrl = response[i].permalink_url;
                        }

                        var guessedMetaData = _this2._guessMetaData(response[i].title);
                        if (guessedMetaData) {
                            candidate.track = guessedMetaData.track;
                            candidate.artist = guessedMetaData.artist;

                            // We guessed the track and artist name of the track. Now we need to make sure
                            // this they are not accidentally interchanged.
                            var url = "https://developer.echonest.com/api/v4/artist/extract";
                            var settingsArtist = {
                                data: {
                                    api_key: _this2.echonestClientId,
                                    format: "json",
                                    results: 1,
                                    bucket: ["hotttnesss", "familiarity"],
                                    text: candidate.artist
                                }
                            };
                            var settingsTrack = {
                                data: {
                                    api_key: _this2.echonestClientId,
                                    format: "json",
                                    results: 1,
                                    bucket: ["hotttnesss", "familiarity"],
                                    text: candidate.track
                                }
                            };
                            (function (candidate) {
                                promises.push(RSVP.all([(0, _tomahawkRequest.get)(url, settingsArtist), (0, _tomahawkRequest.get)(url, settingsTrack)]).then(function (responses) {
                                    // We have the results from Echonest and can now determine whether the
                                    // assumed track name is more likely to be the artist name. If this's
                                    // the case we simply swap them and voila.
                                    var scoreArtist = 0;
                                    var scoreTrack = 0;
                                    if (responses[0] && responses[0].response.artists && responses[0].response.artists.length > 0) {
                                        scoreArtist = responses[0].response.artists[0].hotttnesss + responses[0].response.artists[0].familiarity;
                                    }
                                    if (responses[1] && responses[1].response.artists && responses[1].response.artists.length > 0) {
                                        scoreTrack = responses[1].response.artists[0].hotttnesss + responses[1].response.artists[0].familiarity;
                                    }
                                    if (scoreTrack > scoreArtist) {
                                        var track = candidate.track;
                                        candidate.track = candidate.artist;
                                        candidate.artist = track;
                                    }
                                    return candidate;
                                }));
                            })(candidate);
                        } else if (response[i].user.username) {
                            // We weren't able to guess the artist and track name, so we assume the username
                            // as the artist name. No further check with Echonest needed since it's very
                            // unlikely that the username actually is the name of the track and not of the
                            // artist.
                            candidate.track = response[i].title;
                            candidate.artist = response[i].user.username;
                            results.push(candidate);
                        }
                    }
                    return RSVP.allSettled(promises).then(function (responses) {
                        for (var i = 0; i < responses.length; i++) {
                            if (responses[i].state == 'fulfilled') {
                                results.push(responses[i].value);
                            }
                        }
                        return results;
                    });
                });
            }
        }, {
            key: 'canParseUrl',
            value: function canParseUrl(_ref3) {
                var url = _ref3.url;
                var type = _ref3.type;

                // Soundcloud only returns tracks and playlists
                switch (type) {
                    case TomahawkUrlType.Album:
                        return false;
                    case TomahawkUrlType.Artist:
                        return false;
                    default:
                        return (/https?:\/\/(www\.)?soundcloud.com\//.test(url)
                        );
                }
            }
        }, {
            key: '_convertTrack',
            value: function _convertTrack(track) {
                var result = {
                    type: _tomahawkUrlTypes['default'].Track,
                    track: track.title,
                    artist: track.user.username
                };

                if (!(track.stream_url === null || typeof track.stream_url === "undefined")) {
                    result.hint = track.stream_url + "?client_id=" + this.soundcloudClientId;
                }
                return result;
            }
        }, {
            key: 'lookupUrl',
            value: function lookupUrl(_ref4) {
                var _this3 = this;

                var url = _ref4.url;

                var queryUrl = this.baseUrl + "resolve.json";
                var settings = {
                    data: {
                        client_id: this.soundcloudClientId,
                        url: url.replace(/\/likes$/, '')
                    }
                };
                return (0, _tomahawkRequest.get)(queryUrl, settings).then(function (response) {
                    if (response.kind == "playlist") {
                        var result = {
                            type: _tomahawkUrlTypes['default'].Playlist,
                            title: response.title,
                            guid: 'soundcloud-playlist-' + response.id.toString(),
                            info: response.description,
                            creator: response.user.username,
                            linkUrl: response.permalink_url,
                            tracks: []
                        };
                        response.tracks.forEach(function (item) {
                            result.tracks.push(_this3._convertTrack(item));
                        });
                        return result;
                    } else if (response.kind == "track") {
                        return _this3._convertTrack(response);
                    } else if (response.kind == "user") {
                        var url2 = response.uri;
                        var prefix = 'soundcloud-';
                        var title = response.full_name + "'s ";
                        if (url.indexOf("/likes") === -1) {
                            url2 += "/tracks.json?client_id=" + _this3.soundcloudClientId;
                            prefix += 'user-';
                            title += "Tracks";
                        } else {
                            url2 += "/favorites.json?client_id=" + _this3.soundcloudClientId;
                            prefix += 'favortites-';
                            title += "Favorites";
                        }
                        return Tomahawk.get(url2).then(function (response) {
                            var result = {
                                type: _tomahawkUrlTypes['default'].Playlist,
                                title: title,
                                guid: prefix + response.id.toString(),
                                info: title,
                                creator: response.username,
                                linkUrl: response.permalink_url,
                                tracks: []
                            };
                            response.forEach(function (item) {
                                result.tracks.push(_this3._convertTrack(item));
                            });
                            return result;
                        });
                    } else {
                        Tomahawk.log("Could not parse SoundCloud URL: " + url);
                        throw new Error("Could not parse SoundCloud URL: " + url);
                    }
                });
            }
        }]);
        return SoundcloudResolver;
    })(_tomahawkResolver['default']);

    exports['default'] = SoundcloudResolver;
});
define('tomahawk/resolver', ['exports'], function (exports) {
    'use strict';

    var Resolver = (function () {
        function Resolver() {
            babelHelpers.classCallCheck(this, Resolver);
        }

        babelHelpers.createClass(Resolver, [{
            key: 'scriptPath',
            value: function scriptPath() {
                return Tomahawk.resolverData().scriptPath;
            }
        }, {
            key: 'getConfigUi',
            value: function getConfigUi() {
                return {};
            }
        }, {
            key: 'getUserConfig',
            value: function getUserConfig() {
                return JSON.parse(window.localStorage[this.scriptPath()] || "{}");
            }
        }, {
            key: 'saveUserConfig',
            value: function saveUserConfig() {
                window.localStorage[this.scriptPath()] = JSON.stringify(Tomahawk.resolverData().config);
                this.newConfigSaved(Tomahawk.resolverData().config);
            }
        }, {
            key: 'newConfigSaved',
            value: function newConfigSaved() {}
        }, {
            key: 'getStreamUrl',
            value: function getStreamUrl(params) {
                return params;
            }
        }, {
            key: 'getSettings',
            value: function getSettings() {
                return this.settings;
            }
        }, {
            key: '_convertUrls',
            value: function _convertUrls(results) {
                var that = this;
                return results.map(function (r) {
                    if (r && r.url) {
                        r.url = that._urlProtocol + '://' + r.url;
                    }
                    return r;
                });
            }
        }, {
            key: '_adapter_resolve',
            value: function _adapter_resolve(qid, artist, album, title) {
                var that = this;
                var collectionPromises = [];
                Tomahawk.collections.forEach(function (col) {
                    if (col.resolve) {
                        collectionPromises.push(col.resolve({ artist: artist, album: album, track: title }));
                    }
                });
                RSVP.Promise.all(collectionPromises).then(function (collectionResults) {
                    var merged = [];
                    return merged.concat.apply(merged, collectionResults);
                }).then(function (collectionResults) {
                    RSVP.Promise.resolve(that.resolve({
                        artist: artist,
                        album: album,
                        track: title
                    })).then(function (results) {
                        Tomahawk.addTrackResults({
                            'qid': qid,
                            'results': that._convertUrls(results.concat(collectionResults))
                        });
                    });
                });
            }
        }, {
            key: '_adapter_init',
            value: function _adapter_init() {
                this._urlProtocol = this.settings.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
                Tomahawk.addCustomUrlHandler(this._urlProtocol, 'getStreamUrl', true);
                Tomahawk.log('Registered custom url handler for protocol "' + this._urlProtocol + '"');
                this.init();
            }
        }, {
            key: '_adapter_getStreamUrl',
            value: function _adapter_getStreamUrl(params) {
                params.url = params.url.slice(this._urlProtocol.length + 3);
                RSVP.Promise.resolve(this.getStreamUrl(params)).then(function (result) {
                    Tomahawk.reportStreamUrl(params.qid, result.url, result.headers);
                });
            }
        }, {
            key: '_adapter_search',
            value: function _adapter_search(qid, query) {
                var that = this;
                var collectionPromises = [];
                Tomahawk.collections.forEach(function (col) {
                    if (col.search) {
                        collectionPromises.push(col.search({ query: query }));
                    }
                });
                RSVP.Promise.all(collectionPromises).then(function (collectionResults) {
                    var merged = [];
                    return merged.concat.apply(merged, collectionResults);
                }).then(function (collectionResults) {
                    RSVP.Promise.resolve(that.search({ query: query })).then(function (results) {
                        Tomahawk.addTrackResults({
                            'qid': qid,
                            'results': that._convertUrls(results.concat(collectionResults))
                        });
                    });
                });
            }
        }, {
            key: '_adapter_testConfig',
            value: function _adapter_testConfig(config) {
                return RSVP.Promise.resolve(this.testConfig(config)).then(function () {
                    return { result: Tomahawk.ConfigTestResultType.Success };
                });
            }
        }]);
        return Resolver;
    })();

    exports['default'] = Resolver;
    ;
});
define("tomahawk/resolver-capabilities", ["exports"], function (exports) {
    "use strict";

    exports["default"] = {
        NullCapability: 0,
        Browsable: 1,
        PlaylistSync: 2,
        AccountFactory: 4,
        UrlLookup: 8
    };
});
define("tomahawk/collection", ["exports"], function (exports) {
    "use strict";

    var BrowseCapability = {
        Artists: 1,
        Albums: 2,
        Tracks: 4
    };

    exports.BrowseCapability = BrowseCapability;

    var Transaction = (function () {
        function Transaction(collection, id) {
            babelHelpers.classCallCheck(this, Transaction);

            this.collection = collection;
            this.id = id;
        }

        babelHelpers.createClass(Transaction, [{
            key: "ensureDb",
            value: function ensureDb() {
                var _this = this;

                return new RSVP.Promise(function (resolve, reject) {
                    if (!_this.collection.cachedDbs[_this.id]) {
                        Tomahawk.log("Opening database");
                        var estimatedSize = 5 * 1024 * 1024; // 5MB
                        _this.collection.cachedDbs[id] = openDatabase(_this.id + "_collection", "", "Collection", estimatedSize);

                        _this.collection.cachedDbs[_this.id].transaction(function (tx) {
                            Tomahawk.log("Creating initial db tables");
                            tx.executeSql("CREATE TABLE IF NOT EXISTS artists(" + "_id INTEGER PRIMARY KEY AUTOINCREMENT," + "artist TEXT ," + "artistDisambiguation TEXT," + "UNIQUE (artist, artistDisambiguation) ON CONFLICT IGNORE)", []);
                            tx.executeSql("CREATE TABLE IF NOT EXISTS albumArtists(" + "_id INTEGER PRIMARY KEY AUTOINCREMENT," + "albumArtist TEXT ," + "albumArtistDisambiguation TEXT," + "UNIQUE (albumArtist, albumArtistDisambiguation) ON CONFLICT IGNORE)", []);
                            tx.executeSql("CREATE TABLE IF NOT EXISTS albums(" + "_id INTEGER PRIMARY KEY AUTOINCREMENT," + "album TEXT," + "albumArtistId INTEGER," + "UNIQUE (album, albumArtistId) ON CONFLICT IGNORE," + "FOREIGN KEY(albumArtistId) REFERENCES albumArtists(_id))", []);
                            tx.executeSql("CREATE TABLE IF NOT EXISTS artistAlbums(" + "_id INTEGER PRIMARY KEY AUTOINCREMENT," + "albumId INTEGER," + "artistId INTEGER," + "UNIQUE (albumId, artistId) ON CONFLICT IGNORE," + "FOREIGN KEY(albumId) REFERENCES albums(_id)," + "FOREIGN KEY(artistId) REFERENCES artists(_id))", []);
                            tx.executeSql("CREATE TABLE IF NOT EXISTS tracks(" + "_id INTEGER PRIMARY KEY AUTOINCREMENT," + "track TEXT," + "artistId INTEGER," + "albumId INTEGER," + "url TEXT," + "duration INTEGER," + "albumPos INTEGER," + "linkUrl TEXT," + 'releaseyear INTEGER,' + 'bitrate INTEGER,' + "UNIQUE (track, artistId, albumId) ON CONFLICT IGNORE," + "FOREIGN KEY(artistId) REFERENCES artists(_id)," + "FOREIGN KEY(albumId) REFERENCES albums(_id))", []);
                        });
                    }
                    resolve(_this.collection.cachedDbs[_this.id]);
                });
            }
        }, {
            key: "beginTransaction",
            value: function beginTransaction() {
                var _this2 = this;

                return this.ensureDb().then(function (db) {
                    return new RSVP.Promise(function (resolve, reject) {
                        _this2.statements = [];
                        resolve();
                    });
                });
            }
        }, {
            key: "execDeferredStatements",
            value: function execDeferredStatements(resolve, reject) {
                var _this3 = this;

                this.stmtsToResolve = this.statements.length;
                this.results = this.statements.slice();
                Tomahawk.log('Executing ' + this.stmtsToResolve + ' deferred SQL statements in transaction');
                return new RSVP.Promise(function (resolve, reject) {
                    if (_this3.statements.length == 0) {
                        resolve([]);
                    } else {
                        _this3.db.transaction(function (tx) {
                            for (var i = 0; i < _this3.statements.length; ++i) {
                                var stmt = _this3.statements[i];
                                tx.executeSql(stmt.statement, stmt.args, (function () {
                                    //A function returning a function to
                                    //capture value of i
                                    var originalI = i;
                                    return function (tx, results) {
                                        if (typeof this.statements[originalI].map !== 'undefined') {
                                            var map = this.statements[originalI].map;
                                            this.results[originalI] = [];
                                            for (var ii = 0; ii < results.rows.length; ii++) {
                                                this.results[originalI].push(map(results.rows.item(ii)));
                                            }
                                        } else {
                                            this.results[originalI] = results;
                                        }
                                        this.stmtsToResolve--;
                                        if (this.stmtsToResolve == 0) {
                                            this.statements = [];
                                            resolve(this.results);
                                        }
                                    };
                                })(), function (tx, error) {
                                    Tomahawk.log("Error in tx.executeSql: " + error.code + " - " + error.message);
                                    this.statements = [];
                                    reject(error);
                                });
                            }
                        });
                    }
                });
            }
        }, {
            key: "sql",
            value: function sql(sqlStatement, sqlArgs, mapFunction) {
                this.statements.push({ statement: sqlStatement, args: sqlArgs, map: mapFunction });
            }
        }, {
            key: "sqlSelect",
            value: function sqlSelect(table, mapResults, fields, where, join) {
                var whereKeys = [];
                var whereValues = [];
                for (var whereKey in where) {
                    if (where.hasOwnProperty(whereKey)) {
                        whereKeys.push(table + "." + whereKey + " = ?");
                        whereValues.push(where[whereKey]);
                    }
                }
                var whereString = whereKeys.length > 0 ? " WHERE " + whereKeys.join(" AND ") : "";

                var joinString = "";
                for (var i = 0; join && i < join.length; i++) {
                    var joinConditions = [];
                    for (var joinKey in join[i].conditions) {
                        if (join[i].conditions.hasOwnProperty(joinKey)) {
                            joinConditions.push(table + "." + joinKey + " = " + join[i].table + "." + join[i].conditions[joinKey]);
                        }
                    }
                    joinString += " INNER JOIN " + join[i].table + " ON " + joinConditions.join(" AND ");
                }

                var fieldsString = fields && fields.length > 0 ? fields.join(", ") : "*";
                var statement = "SELECT " + fieldsString + " FROM " + table + joinString + whereString;
                return this.sql(statement, whereValues, mapResults);
            }
        }, {
            key: "sqlInsert",
            value: function sqlInsert(table, fields) {
                var fieldsKeys = [];
                var fieldsValues = [];
                var valuesString = "";
                for (var key in fields) {
                    fieldsKeys.push(key);
                    fieldsValues.push(fields[key]);
                    if (valuesString.length > 0) {
                        valuesString += ", ";
                    }
                    valuesString += "?";
                }
                var statement = "INSERT INTO " + table + " (" + fieldsKeys.join(", ") + ") VALUES (" + valuesString + ")";
                return this.sql(statement, fieldsValues);
            }
        }, {
            key: "sqlDrop",
            value: function sqlDrop(table) {
                var statement = "DROP TABLE IF EXISTS " + table;
                return this.sql(statement, []);
            }
        }]);
        return Transaction;
    })();

    var Collection = (function () {
        function Collection() {
            babelHelpers.classCallCheck(this, Collection);

            this.cachedDbs = Object.create(null);
        }

        babelHelpers.createClass(Collection, [{
            key: "addTracks",
            value: function addTracks(_ref) {
                var id = _ref.id;
                var tracks = _ref.tracks;

                var that = this;

                var cachedAlbumArtists = {},
                    cachedArtists = {},
                    cachedAlbums = {},
                    cachedArtistIds = {},
                    cachedAlbumIds = {};

                var t = new Transaction(this, id);
                return t.beginTransaction().then(function () {
                    // First we insert all artists and albumArtists
                    t.sqlInsert("artists", {
                        artist: "Various Artists",
                        artistDisambiguation: ""
                    });
                    for (var i = 0; i < tracks.length; i++) {
                        tracks[i].track = tracks[i].track || "";
                        tracks[i].album = tracks[i].album || "";
                        tracks[i].artist = tracks[i].artist || "";
                        tracks[i].artistDisambiguation = tracks[i].artistDisambiguation || "";
                        tracks[i].albumArtist = tracks[i].albumArtist || "";
                        tracks[i].albumArtistDisambiguation = tracks[i].albumArtistDisambiguation || "";
                        (function (track) {
                            t.sqlInsert("artists", {
                                artist: track.artist,
                                artistDisambiguation: track.artistDisambiguation
                            });
                            t.sqlInsert("albumArtists", {
                                albumArtist: track.albumArtist,
                                albumArtistDisambiguation: track.albumArtistDisambiguation
                            });
                        })(tracks[i]);
                    }
                    return t.execDeferredStatements();
                }).then(function () {
                    // Get all artists' and albumArtists' db ids
                    t.sqlSelect("albumArtists", function (r) {
                        return {
                            albumArtist: r.albumArtist,
                            albumArtistDisambiguation: r.albumArtistDisambiguation,
                            _id: r._id
                        };
                    });
                    t.sqlSelect("artists", function (r) {
                        return {
                            artist: r.artist,
                            artistDisambiguation: r.artistDisambiguation,
                            _id: r._id
                        };
                    });
                    return t.execDeferredStatements();
                }).then(function (resultsArray) {
                    // Store the db ids in a map
                    var i,
                        row,
                        albumArtists = {};
                    for (i = 0; i < resultsArray[0].length; i++) {
                        row = resultsArray[0][i];
                        albumArtists[row.albumArtist + "♣" + row.albumArtistDisambiguation] = row._id;
                    }
                    for (i = 0; i < resultsArray[1].length; i++) {
                        row = resultsArray[1][i];
                        cachedArtists[row.artist + "♣" + row.artistDisambiguation] = row._id;
                        cachedArtistIds[row._id] = {
                            artist: row.artist,
                            artistDisambiguation: row.artistDisambiguation
                        };
                    }

                    for (i = 0; i < tracks.length; i++) {
                        var track = tracks[i];
                        var album = cachedAlbumArtists[track.album];
                        if (!album) {
                            album = cachedAlbumArtists[track.album] = {
                                artists: {}
                            };
                        }
                        album.artists[track.artist] = true;
                        var artistCount = Object.keys(album.artists).length;
                        if (artistCount == 1) {
                            album.albumArtistId = cachedArtists[track.artist + "♣" + track.artistDisambiguation];
                        } else if (artistCount == 2) {
                            album.albumArtistId = cachedArtists["Various Artists♣"];
                        }
                    }
                }).then(function () {
                    // Insert all albums
                    for (var i = 0; i < tracks.length; i++) {
                        (function (track) {
                            var albumArtistId = cachedAlbumArtists[track.album].albumArtistId;
                            t.sqlInsert("albums", {
                                album: track.album,
                                albumArtistId: albumArtistId
                            });
                        })(tracks[i]);
                    }
                    return t.execDeferredStatements();
                }).then(function () {
                    // Get the albums' db ids
                    t.sqlSelect("albums", function (r) {
                        return {
                            album: r.album,
                            albumArtistId: r.albumArtistId,
                            _id: r._id
                        };
                    });
                    return t.execDeferredStatements();
                }).then(function (results) {
                    // Store the db ids in a map
                    results = results[0];
                    for (var i = 0; i < results.length; i++) {
                        var row = results[i];
                        cachedAlbums[row.album + "♣" + row.albumArtistId] = row._id;
                        cachedAlbumIds[row._id] = {
                            album: row.album,
                            albumArtistId: row.albumArtistId
                        };
                    }
                }).then(function () {
                    // Now we are ready to insert the tracks
                    for (var i = 0; i < tracks.length; i++) {
                        (function (track) {
                            // Get all relevant ids that we stored in the previous steps
                            var artistId = cachedArtists[track.artist + "♣" + track.artistDisambiguation];
                            var albumArtistId = cachedAlbumArtists[track.album].albumArtistId;
                            var albumId = cachedAlbums[track.album + "♣" + albumArtistId];
                            // Insert the artist <=> album relations
                            t.sqlInsert("artistAlbums", {
                                albumId: albumId,
                                artistId: artistId
                            });
                            // Insert the tracks
                            t.sqlInsert("tracks", {
                                track: track.track,
                                artistId: artistId,
                                albumId: albumId,
                                url: track.url,
                                duration: track.duration,
                                linkUrl: track.linkUrl,
                                releaseyear: track.releaseyear,
                                bitrate: track.bitrate,
                                albumPos: track.albumpos
                            });
                        })(tracks[i]);
                    }
                    return t.execDeferredStatements();
                }).then(function () {
                    var resultMap = function resultMap(r) {
                        return {
                            _id: r._id,
                            artistId: r.artistId,
                            albumId: r.albumId,
                            track: r.track
                        };
                    };
                    // Get the tracks' db ids
                    t.sqlSelect("tracks", resultMap, ["_id", "artistId", "albumId", "track"]);
                    return t.execDeferredStatements();
                }).then(function (results) {
                    this._trackCount = results[0].length;
                    Tomahawk.log("Added " + results[0].length + " tracks to collection '" + id + "'");
                    // Add the db ids together with the basic metadata to the fuzzy index list
                    var fuzzyIndexList = [];
                    for (var i = 0; i < results[0].length; i++) {
                        var row = results[0][i];
                        fuzzyIndexList.push({
                            id: row._id,
                            artist: cachedArtistIds[row.artistId].artist,
                            album: cachedAlbumIds[row.albumId].album,
                            track: row.track
                        });
                    }
                    Tomahawk.createFuzzyIndex(fuzzyIndexList);
                });
            }
        }, {
            key: "wipe",
            value: function wipe(_ref2) {
                var id = _ref2.id;

                var that = this;

                var t = new Transaction(this, id);
                return t.beginTransaction().then(function () {
                    t.sqlDrop("artists");
                    t.sqlDrop("albumArtists");
                    t.sqlDrop("albums");
                    t.sqlDrop("artistAlbums");
                    t.sqlDrop("tracks");
                    return t.execDeferredStatements();
                }).then(function () {
                    return new RSVP.Promise(function (resolve, reject) {
                        this.cachedDbs[id].changeVersion(this.cachedDbs[id].version, "", null, function (err) {
                            if (console.error) {
                                console.error("Error!: %o", err);
                            }
                            reject();
                        }, function () {
                            delete this.cachedDbs[id];
                            Tomahawk.deleteFuzzyIndex(id);
                            Tomahawk.log("Wiped collection '" + id + "'");
                            resolve();
                        });
                    });
                });
            }
        }, {
            key: "_fuzzyIndexIdsToTracks",
            value: function _fuzzyIndexIdsToTracks(resultIds, id) {
                if (typeof id === 'undefined') {
                    id = this.settings.id;
                }
                var t = new Transaction(this, id);
                return t.beginTransaction().then(function () {
                    var mapFn = function mapFn(row) {
                        return {
                            artist: row.artist,
                            artistDisambiguation: row.artistDisambiguation,
                            album: row.album,
                            track: row.track,
                            duration: row.duration,
                            url: row.url,
                            linkUrl: row.linkUrl,
                            releaseyear: row.releaseyear,
                            bitrate: row.bitrate,
                            albumpos: row.albumPos
                        };
                    };
                    for (var idx = 0; resultIds && idx < resultIds.length; idx++) {
                        var trackid = resultIds[idx][0];
                        var where = { _id: trackid };
                        t.sqlSelect("tracks", mapFn, [], where, [{
                            table: "artists",
                            conditions: {
                                artistId: "_id"
                            }
                        }, {
                            table: "albums",
                            conditions: {
                                albumId: "_id"
                            }
                        }]);
                    }
                    return t.execDeferredStatements();
                }).then(function (results) {
                    var merged = [];
                    return merged.concat.apply(merged, results.map(function (e) {
                        //every result has one track
                        return e[0];
                    }));
                });
            }
        }, {
            key: "resolve",
            value: function resolve(_ref3) {
                var artist = _ref3.artist;
                var album = _ref3.album;
                var track = _ref3.track;

                var resultIds = Tomahawk.resolveFromFuzzyIndex(artist, album, track);
                return this._fuzzyIndexIdsToTracks(resultIds);
            }
        }, {
            key: "search",
            value: function search(_ref4) {
                var query = _ref4.query;

                var resultIds = Tomahawk.searchFuzzyIndex(query);
                return this._fuzzyIndexIdsToTracks(resultIds);
            }
        }, {
            key: "tracks",
            value: function tracks(_ref5) {
                var id = _ref5.id;
                var where = _ref5.where;

                //TODO filter/where support
                if (typeof id === 'undefined') {
                    id = this.settings.id;
                }

                var t = new Transaction(this, id);
                return t.beginTransaction().then(function () {
                    var mapFn = function mapFn(row) {
                        return {
                            artist: row.artist,
                            artistDisambiguation: row.artistDisambiguation,
                            album: row.album,
                            track: row.track,
                            duration: row.duration,
                            url: row.url,
                            linkUrl: row.linkUrl,
                            releaseyear: row.releaseyear,
                            bitrate: row.bitrate,
                            albumpos: row.albumPos
                        };
                    };
                    t.sqlSelect("tracks", mapFn, [], where, [{
                        table: "artists",
                        conditions: {
                            artistId: "_id"
                        }
                    }, {
                        table: "albums",
                        conditions: {
                            albumId: "_id"
                        }
                    }]);
                    return t.execDeferredStatements();
                }).then(function (results) {
                    return { results: resolverInstance._convertUrls(results[0]) };
                });
            }
        }, {
            key: "albums",
            value: function albums(_ref6) {
                var id = _ref6.id;
                var where = _ref6.where;

                //TODO filter/where support
                if (typeof id === 'undefined') {
                    id = this.settings.id;
                }

                var t = new Transaction(this, id);
                return t.beginTransaction().then(function () {
                    var mapFn = function mapFn(row) {
                        return {
                            albumArtist: row.artist,
                            albumArtistDisambiguation: row.artistDisambiguation,
                            album: row.album
                        };
                    };
                    t.sqlSelect("albums", mapFn, ["album", "artist", "artistDisambiguation"], where, [{
                        table: "artists",
                        conditions: {
                            albumArtistId: "_id"
                        }
                    }]);
                    return t.execDeferredStatements();
                }).then(function (results) {
                    results = results[0].filter(function (e) {
                        return e.albumArtist != '' && e.album != '';
                    });
                    return {
                        artists: results.map(function (i) {
                            return i.albumArtist;
                        }),
                        albums: results.map(function (i) {
                            return i.album;
                        })
                    };
                });
            }
        }, {
            key: "artists",
            value: function artists(_ref7) {
                var id = _ref7.id;
                var where = _ref7.where;

                //TODO filter/where support
                if (typeof id === 'undefined') {
                    id = this.settings.id;
                }

                var t = new Transaction(this, id);
                return t.beginTransaction().then(function () {
                    var mapFn = function mapFn(r) {
                        return r.artist;
                    };
                    t.sqlSelect("artists", mapFn, ["artist", "artistDisambiguation"]);
                    return t.execDeferredStatements();
                }).then(function (artists) {
                    return { artists: artists[0] };
                });
            }

            //TODO: not exactly sure how is this one supposed to work
            //albumArtists: function (params) {
            //var id = params.id;

            //var t = new Transaction(this, id);
            //return t.beginTransaction().then(function () {
            //var mapFn = function(row) {
            //return {
            //albumArtist: row.albumArtist,
            //albumArtistDisambiguation: row.albumArtistDisambiguation
            //};
            //};
            //t.sqlSelect("albumArtists", ["albumArtist", "albumArtistDisambiguation"]);
            //return t.execDeferredStatements();
            //}).then(function (results) {
            //return results[0];
            //});
            //},

        }, {
            key: "artistAlbums",
            value: function artistAlbums(_ref8) {
                var id = _ref8.id;
                var where = _ref8.where;

                //TODO filter/where support
                if (typeof id === 'undefined') {
                    id = this.settings.id;
                }
                var artist = params.artist;
                //var artistDisambiguation = params.artistDisambiguation;

                var t = new Transaction(this, id);
                return t.beginTransaction().then(function () {

                    t.sqlSelect("artists", function (r) {
                        return r._id;
                    }, ["_id"], {
                        artist: artist
                        //artistDisambiguation: artistDisambiguation
                    });
                    return t.execDeferredStatements();
                }).then(function (results) {
                    var artistId = results[0][0];
                    t.sqlSelect("artistAlbums", function (r) {
                        return r.album;
                    }, ["albumId", 'album'], {
                        artistId: artistId
                    }, [{
                        table: "albums",
                        conditions: {
                            albumId: "_id"
                        }
                    }]);
                    return t.execDeferredStatements();
                }).then(function (results) {
                    return {
                        artist: artist,
                        albums: results[0]
                    };
                });
            }
        }, {
            key: "albumTracks",
            value: function albumTracks(_ref9) {
                var id = _ref9.id;
                var where = _ref9.where;

                //TODO filter/where support
                if (typeof id === 'undefined') {
                    id = this.settings.id;
                }
                var albumArtist = params.artist;
                //var albumArtistDisambiguation = params.albumArtistDisambiguation;
                var album = params.album;

                var that = this;

                var t = new Transaction(this, id);
                return t.beginTransaction().then(function () {
                    t.sqlSelect("artists", function (r) {
                        return r._id;
                    }, ["_id"], {
                        artist: albumArtist
                        //artistDisambiguation: albumArtistDisambiguation
                    });
                    return t.execDeferredStatements();
                }).then(function (results) {
                    var albumArtistId = results[0][0];
                    t.sqlSelect("albums", function (r) {
                        return r._id;
                    }, ["_id"], {
                        album: album,
                        albumArtistId: albumArtistId
                    });
                    return t.execDeferredStatements();
                }).then(function (results) {
                    var albumId = results[0][0];
                    return this.tracks(params, {
                        albumId: albumId
                    });
                });
            }
        }, {
            key: "collection",
            value: function collection() {
                this.settings.trackcount = this._trackCount;
                if (!this.settings.description) {
                    this.settings.description = this.settings.prettyname;
                }
                this.settings.capabilities = [Tomahawk.Collection.BrowseCapability.Artists, Tomahawk.Collection.BrowseCapability.Albums, Tomahawk.Collection.BrowseCapability.Tracks];
                return this.settings;
            }
        }]);
        return Collection;
    })();

    exports["default"] = Collection;
});
define("tomahawk/url-types", ["exports"], function (exports) {
    "use strict";

    exports["default"] = {
        Any: 0,
        Playlist: 1,
        Track: 2,
        Album: 3,
        Artist: 4,
        XspfPlaylist: 5
    };
});
define("tomahawk/request", ["exports"], function (exports) {
    //Statuses considered a success for HTTP request
    "use strict";

    exports["default"] = ajax;
    exports.post = post;
    exports.get = get;
    var httpSuccessStatuses = [200, 201];

    /**
     * Possible options:
     *  - method: The HTTP request method (default: GET)
     *  - username: The username for HTTP Basic Auth
     *  - password: The password for HTTP Basic Auth
     *  - errorHandler: callback called if the request was not completed
     *  - data: body data included in POST requests
     *  - needCookieHeader: boolean indicating whether or not the request needs to be able to get the
     *                      "Set-Cookie" response header
     */
    var asyncRequest = function asyncRequest(url, callback, extraHeaders, options) {
        // unpack options
        var opt = options || {};
        var method = opt.method || 'GET';

        if (environment.shouldDoNativeRequest(url, callback, extraHeaders, options)) {
            // Assign a request Id to the callback so we can use it when we are
            // returning from the native call.
            var reqId = Tomahawk.asyncRequestIdCounter;
            Tomahawk.asyncRequestIdCounter++;
            Tomahawk.asyncRequestCallbacks[reqId] = {
                callback: callback,
                errorHandler: opt.errorHandler
            };
            Tomahawk.nativeAsyncRequest(reqId, url, extraHeaders, options);
        } else {
            var xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open(method, url, true, opt.username, opt.password);
            if (extraHeaders) {
                for (var headerName in extraHeaders) {
                    xmlHttpRequest.setRequestHeader(headerName, extraHeaders[headerName]);
                }
            }
            xmlHttpRequest.onreadystatechange = function () {
                if (xmlHttpRequest.readyState == 4 && httpSuccessStatuses.indexOf(xmlHttpRequest.status) != -1) {
                    callback.call(window, xmlHttpRequest);
                } else if (xmlHttpRequest.readyState === 4) {
                    Tomahawk.log("Failed to do " + method + " request: to: " + url);
                    Tomahawk.log("Status Code was: " + xmlHttpRequest.status);
                    if (opt.hasOwnProperty('errorHandler')) {
                        opt.errorHandler.call(window, xmlHttpRequest);
                    }
                }
            };
            xmlHttpRequest.send(opt.data || null);
        }
    };

    /**
     * This method is externalized from Tomahawk.asyncRequest, so that other clients
     * (like tomahawk-android) can inject their own logic that determines whether or not to do a request
     * natively.
     *
     * @returns boolean indicating whether or not to do a request with the given parameters natively
     */
    window.environment = window.environment || {};
    environment.shouldDoNativeRequest = environment.shouldDoNativeRequest || function (url, callback, extraHeaders, options) {
        return extraHeaders && (extraHeaders.hasOwnProperty("Referer") || extraHeaders.hasOwnProperty("referer") || extraHeaders.hasOwnProperty("User-Agent"));
    };

    function ajax(url, settings) {
        if (typeof url === "object") {
            settings = url;
        } else {
            settings = settings || {};
            settings.url = url;
        }

        settings.type = settings.type || settings.method || 'get';
        settings.method = settings.type;
        settings.dataFormat = settings.dataFormat || 'form';

        if (settings.data) {
            var formEncode = function formEncode(obj) {
                var str = [];
                for (var p in obj) {
                    if (obj[p] !== undefined) {
                        if (Array.isArray(obj[p])) {
                            for (var i = 0; i < obj[p].length; i++) {
                                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p][i]));
                            }
                        } else {
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        }
                    }
                }

                str.sort();

                return str.join("&");
            };
            if (typeof settings.data === 'object') {
                if (settings.dataFormat == 'form') {
                    settings.data = formEncode(settings.data);
                    settings.contentType = settings.contentType || 'application/x-www-form-urlencoded';
                } else if (settings.dataFormat == 'json') {
                    settings.data = JSON.stringify(settings.data);
                    settings.contentType = settings.contentType || 'application/json';
                } else {
                    throw new Error("Tomahawk: ajax: unknown dataFormat requested: " + settings.dataFormat);
                }
            } else {
                throw new Error("Tomahawk: ajax: data should be either object or string");
            }

            if (settings.type.toLowerCase() === 'get') {
                settings.url += '?' + settings.data;
                delete settings.data;
            } else {
                settings.headers = settings.headers || {};
                if (!settings.headers.hasOwnProperty('Content-Type')) {
                    settings.headers['Content-Type'] = settings.contentType;
                }
            }
        }

        return new RSVP.Promise(function (resolve, reject) {
            settings.errorHandler = reject;
            asyncRequest(settings.url, resolve, settings.headers, settings);
        }).then(function (xhr) {
            if (settings.rawResponse) {
                return xhr;
            }
            var responseText = xhr.responseText;
            var contentType;
            if (settings.dataType === 'json') {
                contentType = 'application/json';
            } else if (settings.dataType === 'xml') {
                contentType = 'text/xml';
            } else if (typeof xhr.getResponseHeader !== 'undefined') {
                contentType = xhr.getResponseHeader('Content-Type');
            } else if (xhr.hasOwnProperty('contentType')) {
                contentType = xhr['contentType'];
            } else {
                contentType = 'text/html';
            }

            if (~contentType.indexOf('application/json')) {
                return JSON.parse(responseText);
            }

            if (~contentType.indexOf('text/xml')) {
                var domParser = new DOMParser();
                return domParser.parseFromString(responseText, "text/xml");
            }

            return xhr.responseText;
        });
    }

    ;

    function post(url, settings) {
        if (typeof url === "object") {
            settings = url;
        } else {
            settings = settings || {};
            settings.url = url;
        }

        settings.method = 'POST';

        return ajax(settings);
    }

    ;

    function get(url, settings) {
        return ajax(url, settings);
    }

    ;
});
'use strict';

var Tomahawk = Tomahawk || {};
Tomahawk.collections = [];
Tomahawk.PluginManager = new (require('tomahawk/plugin-manager')['default'])();

// install RSVP error handler for uncaught(!) errors
RSVP.on('error', function (reason) {
    var resolverName = "";
    if (window.resolverInstance) {
        resolverName = window.resolverInstance.getSettings().name + " - ";
    }
    if (reason) {
        console.error(resolverName + 'Uncaught error:' + JSON.stringify(reason));
        if (reason.message) {
            console.error(resolverName + 'Uncaught error:', reason.message, reason.stack);
        }
    } else {
        console.error(resolverName + 'Uncaught error: error thrown from RSVP but it was empty');
    }
});

// ATTENTION: Do we still need the following?!

// Legacy compability for 0.8 and before
Tomahawk.reportCapabilities = function (capabilities) {
    if (capabilities & TomahawkResolverCapability.Browsable) {
        Tomahawk.PluginManager.registerPlugin("collection", Tomahawk.resolver.instance);
    }

    Tomahawk.nativeReportCapabilities(capabilities);
};

Tomahawk.addArtistResults = Tomahawk.addAlbumResults = Tomahawk.addAlbumTrackResults = function (result) {
    Tomahawk.PluginManager.resolve[result.qid](result);
    delete Tomahawk.PluginManager.resolve[result.qid];
};

Tomahawk.addTrackResults = function (result) {
    Tomahawk.PluginManager.resolve[result.qid](result.results);
    delete Tomahawk.PluginManager.resolve[result.qid];
};

Tomahawk.reportStreamUrl = function (qid, streamUrl, headers) {
    Tomahawk.PluginManager.resolve[qid]({
        url: streamUrl,
        headers: headers
    });
    delete Tomahawk.PluginManager.resolve[qid];
};

Tomahawk.addUrlResult = function (url, result) {
    /* Merge the whole mess into one consistent result which is independent of type
     var cleanResult = {
     type: result.type,
     guid: result.guid,
     info: result.info,
     creator: result.creator,
     linkUrl: result.url
     };
     if (cleanResult.type == "track") {
     cleanResult.track = result.title;
     cleanResult.artist = result.artist;
     } else if (cleanResult.type == "artist") {
     cleanResult.artist = result.name;
     } else if (cleanResult.type == "album") {
     cleanResult.album = result.name;
     cleanResult.artist = result.artist;
     } else if (cleanResult.type == "playlist") {
     cleanResult.title = result.title;
     } else if (cleanResult.type == "xspf-url") {
     cleanResult.url = result.url;
     }
     if (result.tracks) {
     cleanResult.tracks = [];
     var i;
     for (i=0;i<result.tracks.length;i++) {
     var cleanTrack = {
     track: result.tracks[i].title,
     artist: result.tracks[i].artist
     };
     cleanResult.push(cleanTrack)
     }
     Tomahawk.PluginManager.resolve[url](cleanResult);
     */
    Tomahawk.PluginManager.resolve[url](result);
    delete Tomahawk.PluginManager.resolve[url];
};

