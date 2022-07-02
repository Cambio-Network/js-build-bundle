(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@polkadot/keyring'), require('@polkadot/util'), require('@polkadot/types'), require('@polkadot/util-crypto')) :
  typeof define === 'function' && define.amd ? define(['exports', '@polkadot/keyring', '@polkadot/util', '@polkadot/types', '@polkadot/util-crypto'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.polkadotApi = {}, global.polkadotKeyring, global.polkadotUtil, global.polkadotTypes, global.polkadotUtilCrypto));
})(this, (function (exports, keyring, util, types, utilCrypto) { 'use strict';

  const global = window;

  function _classPrivateFieldBase(receiver, privateKey) {
    if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
      throw new TypeError("attempted to use private field on non-instance");
    }
    return receiver;
  }

  var id = 0;
  function _classPrivateFieldKey(name) {
    return "__private_" + id++ + "_" + name;
  }

  ({
    name: '@polkadot/x-global',
    path: (({ url: (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href)) }) && (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))) ? new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.substring(0, new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.lastIndexOf('/') + 1) : 'auto',
    type: 'esm',
    version: '9.7.1'
  });

  function evaluateThis(fn) {
    return fn('return this');
  }
  const xglobal = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : evaluateThis(Function);

  ({
    name: '@polkadot/x-fetch',
    path: (({ url: (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href)) }) && (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))) ? new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.substring(0, new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.lastIndexOf('/') + 1) : 'auto',
    type: 'esm',
    version: '9.7.1'
  });

  const fetch = xglobal.fetch;

  function isFunction$1(value) {
    return typeof value === 'function';
  }

  const UNKNOWN = -99999;
  function extend(that, name, value) {
    Object.defineProperty(that, name, {
      configurable: true,
      enumerable: false,
      value
    });
  }
  class RpcError extends Error {
    constructor(message = '', code = UNKNOWN, data) {
      super();
      extend(this, 'message', String(message));
      extend(this, 'name', this.constructor.name);
      extend(this, 'data', data);
      extend(this, 'code', code);
      if (isFunction$1(Error.captureStackTrace)) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        const {
          stack
        } = new Error(message);
        stack && extend(this, 'stack', stack);
      }
    }
    static CODES = {
      ASSERT: -90009,
      INVALID_JSONRPC: -99998,
      METHOD_NOT_FOUND: -32601,
      UNKNOWN
    };
  }

  function formatErrorData(data) {
    if (util.isUndefined(data)) {
      return '';
    }
    const formatted = `: ${util.isString(data) ? data.replace(/Error\("/g, '').replace(/\("/g, '(').replace(/"\)/g, ')').replace(/\(/g, ', ').replace(/\)/g, '') : util.stringify(data)}`;
    return formatted.length <= 256 ? formatted : `${formatted.substring(0, 255)}…`;
  }
  function checkError(error) {
    if (error) {
      const {
        code,
        data,
        message
      } = error;
      throw new RpcError(`${code}: ${message}${formatErrorData(data)}`, code, data);
    }
  }
  class RpcCoder {
    #id = 0;
    decodeResponse(response) {
      if (!response || response.jsonrpc !== '2.0') {
        throw new Error('Invalid jsonrpc field in decoded object');
      }
      const isSubscription = !util.isUndefined(response.params) && !util.isUndefined(response.method);
      if (!util.isNumber(response.id) && (!isSubscription || !util.isNumber(response.params.subscription) && !util.isString(response.params.subscription))) {
        throw new Error('Invalid id field in decoded object');
      }
      checkError(response.error);
      if (response.result === undefined && !isSubscription) {
        throw new Error('No result found in jsonrpc response');
      }
      if (isSubscription) {
        checkError(response.params.error);
        return response.params.result;
      }
      return response.result;
    }
    encodeJson(method, params) {
      const [id, data] = this.encodeObject(method, params);
      return [id, util.stringify(data)];
    }
    encodeObject(method, params) {
      const id = ++this.#id;
      return [id, {
        id,
        jsonrpc: '2.0',
        method,
        params
      }];
    }
  }

  const HTTP_URL = 'http://127.0.0.1:9933';
  const WS_URL = 'ws://127.0.0.1:9944';
  const defaults = {
    HTTP_URL,
    WS_URL
  };

  const DEFAULT_CAPACITY = 128;
  class LRUNode {
    constructor(key) {
      this.key = key;
      this.next = this.prev = this;
    }
  }
  var _data = _classPrivateFieldKey("data");
  var _refs = _classPrivateFieldKey("refs");
  var _length = _classPrivateFieldKey("length");
  var _head = _classPrivateFieldKey("head");
  var _tail = _classPrivateFieldKey("tail");
  var _toHead = _classPrivateFieldKey("toHead");
  class LRUCache {
    constructor(capacity = DEFAULT_CAPACITY) {
      Object.defineProperty(this, _toHead, {
        value: _toHead2
      });
      this.capacity = void 0;
      Object.defineProperty(this, _data, {
        writable: true,
        value: new Map()
      });
      Object.defineProperty(this, _refs, {
        writable: true,
        value: new Map()
      });
      Object.defineProperty(this, _length, {
        writable: true,
        value: 0
      });
      Object.defineProperty(this, _head, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _tail, {
        writable: true,
        value: void 0
      });
      this.capacity = capacity;
      _classPrivateFieldBase(this, _head)[_head] = _classPrivateFieldBase(this, _tail)[_tail] = new LRUNode('<empty>');
    }
    get length() {
      return _classPrivateFieldBase(this, _length)[_length];
    }
    get lengthData() {
      return _classPrivateFieldBase(this, _data)[_data].size;
    }
    get lengthRefs() {
      return _classPrivateFieldBase(this, _refs)[_refs].size;
    }
    entries() {
      const keys = this.keys();
      const entries = new Array(keys.length);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        entries[i] = [key, _classPrivateFieldBase(this, _data)[_data].get(key)];
      }
      return entries;
    }
    keys() {
      const keys = [];
      if (_classPrivateFieldBase(this, _length)[_length]) {
        let curr = _classPrivateFieldBase(this, _head)[_head];
        while (curr !== _classPrivateFieldBase(this, _tail)[_tail]) {
          keys.push(curr.key);
          curr = curr.next;
        }
        keys.push(curr.key);
      }
      return keys;
    }
    get(key) {
      const data = _classPrivateFieldBase(this, _data)[_data].get(key);
      if (data) {
        _classPrivateFieldBase(this, _toHead)[_toHead](key);
        return data;
      }
      return null;
    }
    set(key, value) {
      if (_classPrivateFieldBase(this, _data)[_data].has(key)) {
        _classPrivateFieldBase(this, _toHead)[_toHead](key);
      } else {
        const node = new LRUNode(key);
        _classPrivateFieldBase(this, _refs)[_refs].set(node.key, node);
        if (this.length === 0) {
          _classPrivateFieldBase(this, _head)[_head] = _classPrivateFieldBase(this, _tail)[_tail] = node;
        } else {
          _classPrivateFieldBase(this, _head)[_head].prev = node;
          node.next = _classPrivateFieldBase(this, _head)[_head];
          _classPrivateFieldBase(this, _head)[_head] = node;
        }
        if (_classPrivateFieldBase(this, _length)[_length] === this.capacity) {
          _classPrivateFieldBase(this, _data)[_data].delete(_classPrivateFieldBase(this, _tail)[_tail].key);
          _classPrivateFieldBase(this, _refs)[_refs].delete(_classPrivateFieldBase(this, _tail)[_tail].key);
          _classPrivateFieldBase(this, _tail)[_tail] = _classPrivateFieldBase(this, _tail)[_tail].prev;
          _classPrivateFieldBase(this, _tail)[_tail].next = _classPrivateFieldBase(this, _head)[_head];
        } else {
          _classPrivateFieldBase(this, _length)[_length] += 1;
        }
      }
      _classPrivateFieldBase(this, _data)[_data].set(key, value);
    }
  }
  function _toHead2(key) {
    const ref = _classPrivateFieldBase(this, _refs)[_refs].get(key);
    if (ref && ref !== _classPrivateFieldBase(this, _head)[_head]) {
      ref.prev.next = ref.next;
      ref.next.prev = ref.prev;
      ref.next = _classPrivateFieldBase(this, _head)[_head];
      _classPrivateFieldBase(this, _head)[_head].prev = ref;
      _classPrivateFieldBase(this, _head)[_head] = ref;
    }
  }

  const ERROR_SUBSCRIBE = 'HTTP Provider does not have subscriptions, use WebSockets instead';
  const l$7 = util.logger('api-http');
  var _callCache$1 = _classPrivateFieldKey("callCache");
  var _coder$1 = _classPrivateFieldKey("coder");
  var _endpoint = _classPrivateFieldKey("endpoint");
  var _headers$1 = _classPrivateFieldKey("headers");
  var _stats$1 = _classPrivateFieldKey("stats");
  var _send$1 = _classPrivateFieldKey("send");
  class HttpProvider {
    constructor(endpoint = defaults.HTTP_URL, headers = {}) {
      Object.defineProperty(this, _send$1, {
        value: _send2$1
      });
      Object.defineProperty(this, _callCache$1, {
        writable: true,
        value: new LRUCache()
      });
      Object.defineProperty(this, _coder$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _endpoint, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _headers$1, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _stats$1, {
        writable: true,
        value: void 0
      });
      if (!/^(https|http):\/\//.test(endpoint)) {
        throw new Error(`Endpoint should start with 'http://' or 'https://', received '${endpoint}'`);
      }
      _classPrivateFieldBase(this, _coder$1)[_coder$1] = new RpcCoder();
      _classPrivateFieldBase(this, _endpoint)[_endpoint] = endpoint;
      _classPrivateFieldBase(this, _headers$1)[_headers$1] = headers;
      _classPrivateFieldBase(this, _stats$1)[_stats$1] = {
        active: {
          requests: 0,
          subscriptions: 0
        },
        total: {
          bytesRecv: 0,
          bytesSent: 0,
          cached: 0,
          errors: 0,
          requests: 0,
          subscriptions: 0,
          timeout: 0
        }
      };
    }
    get hasSubscriptions() {
      return false;
    }
    clone() {
      return new HttpProvider(_classPrivateFieldBase(this, _endpoint)[_endpoint], _classPrivateFieldBase(this, _headers$1)[_headers$1]);
    }
    async connect() {
    }
    async disconnect() {
    }
    get stats() {
      return _classPrivateFieldBase(this, _stats$1)[_stats$1];
    }
    get isConnected() {
      return true;
    }
    on(type, sub) {
      l$7.error('HTTP Provider does not have \'on\' emitters, use WebSockets instead');
      return () => {
      };
    }
    async send(method, params, isCacheable) {
      _classPrivateFieldBase(this, _stats$1)[_stats$1].total.requests++;
      const [, body] = _classPrivateFieldBase(this, _coder$1)[_coder$1].encodeJson(method, params);
      let resultPromise = isCacheable ? _classPrivateFieldBase(this, _callCache$1)[_callCache$1].get(body) : null;
      if (!resultPromise) {
        resultPromise = _classPrivateFieldBase(this, _send$1)[_send$1](body);
        if (isCacheable) {
          _classPrivateFieldBase(this, _callCache$1)[_callCache$1].set(body, resultPromise);
        }
      } else {
        _classPrivateFieldBase(this, _stats$1)[_stats$1].total.cached++;
      }
      return resultPromise;
    }
    async subscribe(types, method, params, cb) {
      l$7.error(ERROR_SUBSCRIBE);
      throw new Error(ERROR_SUBSCRIBE);
    }
    async unsubscribe(type, method, id) {
      l$7.error(ERROR_SUBSCRIBE);
      throw new Error(ERROR_SUBSCRIBE);
    }
  }
  async function _send2$1(body) {
    _classPrivateFieldBase(this, _stats$1)[_stats$1].active.requests++;
    _classPrivateFieldBase(this, _stats$1)[_stats$1].total.bytesSent += body.length;
    try {
      const response = await fetch(_classPrivateFieldBase(this, _endpoint)[_endpoint], {
        body,
        headers: {
          Accept: 'application/json',
          'Content-Length': `${body.length}`,
          'Content-Type': 'application/json',
          ..._classPrivateFieldBase(this, _headers$1)[_headers$1]
        },
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`[${response.status}]: ${response.statusText}`);
      }
      const result = await response.text();
      _classPrivateFieldBase(this, _stats$1)[_stats$1].total.bytesRecv += result.length;
      const decoded = _classPrivateFieldBase(this, _coder$1)[_coder$1].decodeResponse(JSON.parse(result));
      _classPrivateFieldBase(this, _stats$1)[_stats$1].active.requests--;
      return decoded;
    } catch (e) {
      _classPrivateFieldBase(this, _stats$1)[_stats$1].active.requests--;
      _classPrivateFieldBase(this, _stats$1)[_stats$1].total.errors++;
      throw e;
    }
  }

  var eventemitter3 = {exports: {}};

  (function (module) {
  	var has = Object.prototype.hasOwnProperty
  	  , prefix = '~';
  	function Events() {}
  	if (Object.create) {
  	  Events.prototype = Object.create(null);
  	  if (!new Events().__proto__) prefix = false;
  	}
  	function EE(fn, context, once) {
  	  this.fn = fn;
  	  this.context = context;
  	  this.once = once || false;
  	}
  	function addListener(emitter, event, fn, context, once) {
  	  if (typeof fn !== 'function') {
  	    throw new TypeError('The listener must be a function');
  	  }
  	  var listener = new EE(fn, context || emitter, once)
  	    , evt = prefix ? prefix + event : event;
  	  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  	  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  	  else emitter._events[evt] = [emitter._events[evt], listener];
  	  return emitter;
  	}
  	function clearEvent(emitter, evt) {
  	  if (--emitter._eventsCount === 0) emitter._events = new Events();
  	  else delete emitter._events[evt];
  	}
  	function EventEmitter() {
  	  this._events = new Events();
  	  this._eventsCount = 0;
  	}
  	EventEmitter.prototype.eventNames = function eventNames() {
  	  var names = []
  	    , events
  	    , name;
  	  if (this._eventsCount === 0) return names;
  	  for (name in (events = this._events)) {
  	    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  	  }
  	  if (Object.getOwnPropertySymbols) {
  	    return names.concat(Object.getOwnPropertySymbols(events));
  	  }
  	  return names;
  	};
  	EventEmitter.prototype.listeners = function listeners(event) {
  	  var evt = prefix ? prefix + event : event
  	    , handlers = this._events[evt];
  	  if (!handlers) return [];
  	  if (handlers.fn) return [handlers.fn];
  	  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
  	    ee[i] = handlers[i].fn;
  	  }
  	  return ee;
  	};
  	EventEmitter.prototype.listenerCount = function listenerCount(event) {
  	  var evt = prefix ? prefix + event : event
  	    , listeners = this._events[evt];
  	  if (!listeners) return 0;
  	  if (listeners.fn) return 1;
  	  return listeners.length;
  	};
  	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  	  var evt = prefix ? prefix + event : event;
  	  if (!this._events[evt]) return false;
  	  var listeners = this._events[evt]
  	    , len = arguments.length
  	    , args
  	    , i;
  	  if (listeners.fn) {
  	    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);
  	    switch (len) {
  	      case 1: return listeners.fn.call(listeners.context), true;
  	      case 2: return listeners.fn.call(listeners.context, a1), true;
  	      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
  	      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
  	      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
  	      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
  	    }
  	    for (i = 1, args = new Array(len -1); i < len; i++) {
  	      args[i - 1] = arguments[i];
  	    }
  	    listeners.fn.apply(listeners.context, args);
  	  } else {
  	    var length = listeners.length
  	      , j;
  	    for (i = 0; i < length; i++) {
  	      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);
  	      switch (len) {
  	        case 1: listeners[i].fn.call(listeners[i].context); break;
  	        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
  	        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
  	        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
  	        default:
  	          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
  	            args[j - 1] = arguments[j];
  	          }
  	          listeners[i].fn.apply(listeners[i].context, args);
  	      }
  	    }
  	  }
  	  return true;
  	};
  	EventEmitter.prototype.on = function on(event, fn, context) {
  	  return addListener(this, event, fn, context, false);
  	};
  	EventEmitter.prototype.once = function once(event, fn, context) {
  	  return addListener(this, event, fn, context, true);
  	};
  	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  	  var evt = prefix ? prefix + event : event;
  	  if (!this._events[evt]) return this;
  	  if (!fn) {
  	    clearEvent(this, evt);
  	    return this;
  	  }
  	  var listeners = this._events[evt];
  	  if (listeners.fn) {
  	    if (
  	      listeners.fn === fn &&
  	      (!once || listeners.once) &&
  	      (!context || listeners.context === context)
  	    ) {
  	      clearEvent(this, evt);
  	    }
  	  } else {
  	    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
  	      if (
  	        listeners[i].fn !== fn ||
  	        (once && !listeners[i].once) ||
  	        (context && listeners[i].context !== context)
  	      ) {
  	        events.push(listeners[i]);
  	      }
  	    }
  	    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
  	    else clearEvent(this, evt);
  	  }
  	  return this;
  	};
  	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  	  var evt;
  	  if (event) {
  	    evt = prefix ? prefix + event : event;
  	    if (this._events[evt]) clearEvent(this, evt);
  	  } else {
  	    this._events = new Events();
  	    this._eventsCount = 0;
  	  }
  	  return this;
  	};
  	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  	EventEmitter.prototype.addListener = EventEmitter.prototype.on;
  	EventEmitter.prefixed = prefix;
  	EventEmitter.EventEmitter = EventEmitter;
  	{
  	  module.exports = EventEmitter;
  	}
  } (eventemitter3));
  const EventEmitter = eventemitter3.exports;

  ({
    name: '@polkadot/x-ws',
    path: (({ url: (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href)) }) && (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))) ? new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.substring(0, new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.lastIndexOf('/') + 1) : 'auto',
    type: 'esm',
    version: '9.7.1'
  });

  const WebSocket = xglobal.WebSocket;

  const known = {
    1000: 'Normal Closure',
    1001: 'Going Away',
    1002: 'Protocol Error',
    1003: 'Unsupported Data',
    1004: '(For future)',
    1005: 'No Status Received',
    1006: 'Abnormal Closure',
    1007: 'Invalid frame payload data',
    1008: 'Policy Violation',
    1009: 'Message too big',
    1010: 'Missing Extension',
    1011: 'Internal Error',
    1012: 'Service Restart',
    1013: 'Try Again Later',
    1014: 'Bad Gateway',
    1015: 'TLS Handshake'
  };
  function getUnmapped(code) {
    if (code <= 1999) {
      return '(For WebSocket standard)';
    } else if (code <= 2999) {
      return '(For WebSocket extensions)';
    } else if (code <= 3999) {
      return '(For libraries and frameworks)';
    } else if (code <= 4999) {
      return '(For applications)';
    }
  }
  function getWSErrorString(code) {
    if (code >= 0 && code <= 999) {
      return '(Unused)';
    }
    return known[code] || getUnmapped(code) || '(Unknown)';
  }

  const ALIASES = {
    chain_finalisedHead: 'chain_finalizedHead',
    chain_subscribeFinalisedHeads: 'chain_subscribeFinalizedHeads',
    chain_unsubscribeFinalisedHeads: 'chain_unsubscribeFinalizedHeads'
  };
  const RETRY_DELAY = 2500;
  const DEFAULT_TIMEOUT_MS = 60 * 1000;
  const TIMEOUT_INTERVAL = 5000;
  const MEGABYTE = 1024 * 1024;
  const l$6 = util.logger('api-ws');
  function eraseRecord(record, cb) {
    Object.keys(record).forEach(key => {
      if (cb) {
        cb(record[key]);
      }
      delete record[key];
    });
  }
  var _callCache = _classPrivateFieldKey("callCache");
  var _coder = _classPrivateFieldKey("coder");
  var _endpoints = _classPrivateFieldKey("endpoints");
  var _headers = _classPrivateFieldKey("headers");
  var _eventemitter = _classPrivateFieldKey("eventemitter");
  var _handlers = _classPrivateFieldKey("handlers");
  var _isReadyPromise = _classPrivateFieldKey("isReadyPromise");
  var _stats = _classPrivateFieldKey("stats");
  var _waitingForId = _classPrivateFieldKey("waitingForId");
  var _autoConnectMs = _classPrivateFieldKey("autoConnectMs");
  var _endpointIndex = _classPrivateFieldKey("endpointIndex");
  var _isConnected = _classPrivateFieldKey("isConnected");
  var _subscriptions = _classPrivateFieldKey("subscriptions");
  var _timeoutId = _classPrivateFieldKey("timeoutId");
  var _websocket = _classPrivateFieldKey("websocket");
  var _timeout = _classPrivateFieldKey("timeout");
  var _send = _classPrivateFieldKey("send");
  var _emit = _classPrivateFieldKey("emit");
  var _onSocketClose = _classPrivateFieldKey("onSocketClose");
  var _onSocketError = _classPrivateFieldKey("onSocketError");
  var _onSocketMessage = _classPrivateFieldKey("onSocketMessage");
  var _onSocketMessageResult = _classPrivateFieldKey("onSocketMessageResult");
  var _onSocketMessageSubscribe = _classPrivateFieldKey("onSocketMessageSubscribe");
  var _onSocketOpen = _classPrivateFieldKey("onSocketOpen");
  var _resubscribe = _classPrivateFieldKey("resubscribe");
  var _timeoutHandlers = _classPrivateFieldKey("timeoutHandlers");
  class WsProvider {
    constructor(endpoint = defaults.WS_URL, autoConnectMs = RETRY_DELAY, headers = {}, timeout) {
      Object.defineProperty(this, _send, {
        value: _send2
      });
      Object.defineProperty(this, _callCache, {
        writable: true,
        value: new LRUCache()
      });
      Object.defineProperty(this, _coder, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _endpoints, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _headers, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _eventemitter, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _handlers, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _isReadyPromise, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _stats, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _waitingForId, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _autoConnectMs, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _endpointIndex, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _isConnected, {
        writable: true,
        value: false
      });
      Object.defineProperty(this, _subscriptions, {
        writable: true,
        value: {}
      });
      Object.defineProperty(this, _timeoutId, {
        writable: true,
        value: null
      });
      Object.defineProperty(this, _websocket, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _timeout, {
        writable: true,
        value: void 0
      });
      Object.defineProperty(this, _emit, {
        writable: true,
        value: (type, ...args) => {
          _classPrivateFieldBase(this, _eventemitter)[_eventemitter].emit(type, ...args);
        }
      });
      Object.defineProperty(this, _onSocketClose, {
        writable: true,
        value: event => {
          const error = new Error(`disconnected from ${_classPrivateFieldBase(this, _endpoints)[_endpoints][_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex]]}: ${event.code}:: ${event.reason || getWSErrorString(event.code)}`);
          if (_classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] > 0) {
            l$6.error(error.message);
          }
          _classPrivateFieldBase(this, _isConnected)[_isConnected] = false;
          if (_classPrivateFieldBase(this, _websocket)[_websocket]) {
            _classPrivateFieldBase(this, _websocket)[_websocket].onclose = null;
            _classPrivateFieldBase(this, _websocket)[_websocket].onerror = null;
            _classPrivateFieldBase(this, _websocket)[_websocket].onmessage = null;
            _classPrivateFieldBase(this, _websocket)[_websocket].onopen = null;
            _classPrivateFieldBase(this, _websocket)[_websocket] = null;
          }
          if (_classPrivateFieldBase(this, _timeoutId)[_timeoutId]) {
            clearInterval(_classPrivateFieldBase(this, _timeoutId)[_timeoutId]);
            _classPrivateFieldBase(this, _timeoutId)[_timeoutId] = null;
          }
          _classPrivateFieldBase(this, _emit)[_emit]('disconnected');
          eraseRecord(_classPrivateFieldBase(this, _handlers)[_handlers], h => {
            try {
              h.callback(error, undefined);
            } catch (err) {
              l$6.error(err);
            }
          });
          eraseRecord(_classPrivateFieldBase(this, _waitingForId)[_waitingForId]);
          if (_classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] > 0) {
            setTimeout(() => {
              this.connectWithRetry().catch(() => {
              });
            }, _classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs]);
          }
        }
      });
      Object.defineProperty(this, _onSocketError, {
        writable: true,
        value: error => {
          l$6.debug(() => ['socket error', error]);
          _classPrivateFieldBase(this, _emit)[_emit]('error', error);
        }
      });
      Object.defineProperty(this, _onSocketMessage, {
        writable: true,
        value: message => {
          l$6.debug(() => ['received', message.data]);
          _classPrivateFieldBase(this, _stats)[_stats].total.bytesRecv += message.data.length;
          const response = JSON.parse(message.data);
          return util.isUndefined(response.method) ? _classPrivateFieldBase(this, _onSocketMessageResult)[_onSocketMessageResult](response) : _classPrivateFieldBase(this, _onSocketMessageSubscribe)[_onSocketMessageSubscribe](response);
        }
      });
      Object.defineProperty(this, _onSocketMessageResult, {
        writable: true,
        value: response => {
          const handler = _classPrivateFieldBase(this, _handlers)[_handlers][response.id];
          if (!handler) {
            l$6.debug(() => `Unable to find handler for id=${response.id}`);
            return;
          }
          try {
            const {
              method,
              params,
              subscription
            } = handler;
            const result = _classPrivateFieldBase(this, _coder)[_coder].decodeResponse(response);
            handler.callback(null, result);
            if (subscription) {
              const subId = `${subscription.type}::${result}`;
              _classPrivateFieldBase(this, _subscriptions)[_subscriptions][subId] = util.objectSpread({}, subscription, {
                method,
                params
              });
              if (_classPrivateFieldBase(this, _waitingForId)[_waitingForId][subId]) {
                _classPrivateFieldBase(this, _onSocketMessageSubscribe)[_onSocketMessageSubscribe](_classPrivateFieldBase(this, _waitingForId)[_waitingForId][subId]);
              }
            }
          } catch (error) {
            _classPrivateFieldBase(this, _stats)[_stats].total.errors++;
            handler.callback(error, undefined);
          }
          delete _classPrivateFieldBase(this, _handlers)[_handlers][response.id];
        }
      });
      Object.defineProperty(this, _onSocketMessageSubscribe, {
        writable: true,
        value: response => {
          const method = ALIASES[response.method] || response.method || 'invalid';
          const subId = `${method}::${response.params.subscription}`;
          const handler = _classPrivateFieldBase(this, _subscriptions)[_subscriptions][subId];
          if (!handler) {
            _classPrivateFieldBase(this, _waitingForId)[_waitingForId][subId] = response;
            l$6.debug(() => `Unable to find handler for subscription=${subId}`);
            return;
          }
          delete _classPrivateFieldBase(this, _waitingForId)[_waitingForId][subId];
          try {
            const result = _classPrivateFieldBase(this, _coder)[_coder].decodeResponse(response);
            handler.callback(null, result);
          } catch (error) {
            _classPrivateFieldBase(this, _stats)[_stats].total.errors++;
            handler.callback(error, undefined);
          }
        }
      });
      Object.defineProperty(this, _onSocketOpen, {
        writable: true,
        value: () => {
          if (_classPrivateFieldBase(this, _websocket)[_websocket] === null) {
            throw new Error('WebSocket cannot be null in onOpen');
          }
          l$6.debug(() => ['connected to', _classPrivateFieldBase(this, _endpoints)[_endpoints][_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex]]]);
          _classPrivateFieldBase(this, _isConnected)[_isConnected] = true;
          _classPrivateFieldBase(this, _emit)[_emit]('connected');
          _classPrivateFieldBase(this, _resubscribe)[_resubscribe]();
          return true;
        }
      });
      Object.defineProperty(this, _resubscribe, {
        writable: true,
        value: () => {
          const subscriptions = _classPrivateFieldBase(this, _subscriptions)[_subscriptions];
          _classPrivateFieldBase(this, _subscriptions)[_subscriptions] = {};
          Promise.all(Object.keys(subscriptions).map(async id => {
            const {
              callback,
              method,
              params,
              type
            } = subscriptions[id];
            if (type.startsWith('author_')) {
              return;
            }
            try {
              await this.subscribe(type, method, params, callback);
            } catch (error) {
              l$6.error(error);
            }
          })).catch(l$6.error);
        }
      });
      Object.defineProperty(this, _timeoutHandlers, {
        writable: true,
        value: () => {
          const now = Date.now();
          const ids = Object.keys(_classPrivateFieldBase(this, _handlers)[_handlers]);
          for (let i = 0; i < ids.length; i++) {
            const handler = _classPrivateFieldBase(this, _handlers)[_handlers][ids[i]];
            if (now - handler.start > _classPrivateFieldBase(this, _timeout)[_timeout]) {
              try {
                handler.callback(new Error(`No response received from RPC endpoint in ${_classPrivateFieldBase(this, _timeout)[_timeout] / 1000}s`), undefined);
              } catch {
              }
              _classPrivateFieldBase(this, _stats)[_stats].total.timeout++;
              delete _classPrivateFieldBase(this, _handlers)[_handlers][ids[i]];
            }
          }
        }
      });
      const endpoints = Array.isArray(endpoint) ? endpoint : [endpoint];
      if (endpoints.length === 0) {
        throw new Error('WsProvider requires at least one Endpoint');
      }
      endpoints.forEach(endpoint => {
        if (!/^(wss|ws):\/\//.test(endpoint)) {
          throw new Error(`Endpoint should start with 'ws://', received '${endpoint}'`);
        }
      });
      _classPrivateFieldBase(this, _eventemitter)[_eventemitter] = new EventEmitter();
      _classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] = autoConnectMs || 0;
      _classPrivateFieldBase(this, _coder)[_coder] = new RpcCoder();
      _classPrivateFieldBase(this, _endpointIndex)[_endpointIndex] = -1;
      _classPrivateFieldBase(this, _endpoints)[_endpoints] = endpoints;
      _classPrivateFieldBase(this, _headers)[_headers] = headers;
      _classPrivateFieldBase(this, _websocket)[_websocket] = null;
      _classPrivateFieldBase(this, _stats)[_stats] = {
        active: {
          requests: 0,
          subscriptions: 0
        },
        total: {
          bytesRecv: 0,
          bytesSent: 0,
          cached: 0,
          errors: 0,
          requests: 0,
          subscriptions: 0,
          timeout: 0
        }
      };
      _classPrivateFieldBase(this, _timeout)[_timeout] = timeout || DEFAULT_TIMEOUT_MS;
      if (autoConnectMs > 0) {
        this.connectWithRetry().catch(() => {
        });
      }
      _classPrivateFieldBase(this, _isReadyPromise)[_isReadyPromise] = new Promise(resolve => {
        _classPrivateFieldBase(this, _eventemitter)[_eventemitter].once('connected', () => {
          resolve(this);
        });
      });
    }
    get hasSubscriptions() {
      return true;
    }
    get isConnected() {
      return _classPrivateFieldBase(this, _isConnected)[_isConnected];
    }
    get isReady() {
      return _classPrivateFieldBase(this, _isReadyPromise)[_isReadyPromise];
    }
    clone() {
      return new WsProvider(_classPrivateFieldBase(this, _endpoints)[_endpoints]);
    }
    async connect() {
      try {
        _classPrivateFieldBase(this, _endpointIndex)[_endpointIndex] = (_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex] + 1) % _classPrivateFieldBase(this, _endpoints)[_endpoints].length;
        _classPrivateFieldBase(this, _websocket)[_websocket] = typeof xglobal.WebSocket !== 'undefined' && util.isChildClass(xglobal.WebSocket, WebSocket) ? new WebSocket(_classPrivateFieldBase(this, _endpoints)[_endpoints][_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex]])
        : new WebSocket(_classPrivateFieldBase(this, _endpoints)[_endpoints][_classPrivateFieldBase(this, _endpointIndex)[_endpointIndex]], undefined, undefined, _classPrivateFieldBase(this, _headers)[_headers], undefined, {
          fragmentOutgoingMessages: true,
          fragmentationThreshold: 1 * MEGABYTE,
          maxReceivedFrameSize: 24 * MEGABYTE,
          maxReceivedMessageSize: 24 * MEGABYTE
        });
        _classPrivateFieldBase(this, _websocket)[_websocket].onclose = _classPrivateFieldBase(this, _onSocketClose)[_onSocketClose];
        _classPrivateFieldBase(this, _websocket)[_websocket].onerror = _classPrivateFieldBase(this, _onSocketError)[_onSocketError];
        _classPrivateFieldBase(this, _websocket)[_websocket].onmessage = _classPrivateFieldBase(this, _onSocketMessage)[_onSocketMessage];
        _classPrivateFieldBase(this, _websocket)[_websocket].onopen = _classPrivateFieldBase(this, _onSocketOpen)[_onSocketOpen];
        _classPrivateFieldBase(this, _timeoutId)[_timeoutId] = setInterval(() => _classPrivateFieldBase(this, _timeoutHandlers)[_timeoutHandlers](), TIMEOUT_INTERVAL);
      } catch (error) {
        l$6.error(error);
        _classPrivateFieldBase(this, _emit)[_emit]('error', error);
        throw error;
      }
    }
    async connectWithRetry() {
      if (_classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] > 0) {
        try {
          await this.connect();
        } catch (error) {
          setTimeout(() => {
            this.connectWithRetry().catch(() => {
            });
          }, _classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs]);
        }
      }
    }
    async disconnect() {
      _classPrivateFieldBase(this, _autoConnectMs)[_autoConnectMs] = 0;
      try {
        if (_classPrivateFieldBase(this, _websocket)[_websocket]) {
          _classPrivateFieldBase(this, _websocket)[_websocket].close(1000);
        }
      } catch (error) {
        l$6.error(error);
        _classPrivateFieldBase(this, _emit)[_emit]('error', error);
        throw error;
      }
    }
    get stats() {
      return {
        active: {
          requests: Object.keys(_classPrivateFieldBase(this, _handlers)[_handlers]).length,
          subscriptions: Object.keys(_classPrivateFieldBase(this, _subscriptions)[_subscriptions]).length
        },
        total: _classPrivateFieldBase(this, _stats)[_stats].total
      };
    }
    on(type, sub) {
      _classPrivateFieldBase(this, _eventemitter)[_eventemitter].on(type, sub);
      return () => {
        _classPrivateFieldBase(this, _eventemitter)[_eventemitter].removeListener(type, sub);
      };
    }
    send(method, params, isCacheable, subscription) {
      _classPrivateFieldBase(this, _stats)[_stats].total.requests++;
      const [id, body] = _classPrivateFieldBase(this, _coder)[_coder].encodeJson(method, params);
      let resultPromise = isCacheable ? _classPrivateFieldBase(this, _callCache)[_callCache].get(body) : null;
      if (!resultPromise) {
        resultPromise = _classPrivateFieldBase(this, _send)[_send](id, body, method, params, subscription);
        if (isCacheable) {
          _classPrivateFieldBase(this, _callCache)[_callCache].set(body, resultPromise);
        }
      } else {
        _classPrivateFieldBase(this, _stats)[_stats].total.cached++;
      }
      return resultPromise;
    }
    subscribe(type, method, params, callback) {
      _classPrivateFieldBase(this, _stats)[_stats].total.subscriptions++;
      return this.send(method, params, false, {
        callback,
        type
      });
    }
    async unsubscribe(type, method, id) {
      const subscription = `${type}::${id}`;
      if (util.isUndefined(_classPrivateFieldBase(this, _subscriptions)[_subscriptions][subscription])) {
        l$6.debug(() => `Unable to find active subscription=${subscription}`);
        return false;
      }
      delete _classPrivateFieldBase(this, _subscriptions)[_subscriptions][subscription];
      try {
        return this.isConnected && !util.isNull(_classPrivateFieldBase(this, _websocket)[_websocket]) ? this.send(method, [id]) : true;
      } catch (error) {
        return false;
      }
    }
  }
  async function _send2(id, body, method, params, subscription) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isConnected || _classPrivateFieldBase(this, _websocket)[_websocket] === null) {
          throw new Error('WebSocket is not connected');
        }
        const callback = (error, result) => {
          error ? reject(error) : resolve(result);
        };
        l$6.debug(() => ['calling', method, body]);
        _classPrivateFieldBase(this, _handlers)[_handlers][id] = {
          callback,
          method,
          params,
          start: Date.now(),
          subscription
        };
        _classPrivateFieldBase(this, _stats)[_stats].total.bytesSent += body.length;
        _classPrivateFieldBase(this, _websocket)[_websocket].send(body);
      } catch (error) {
        _classPrivateFieldBase(this, _stats)[_stats].total.errors++;
        reject(error);
      }
    });
  }

  const packageInfo = {
    name: '@polkadot/api',
    path: (({ url: (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href)) }) && (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))) ? new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.substring(0, new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.lastIndexOf('/') + 1) : 'auto',
    type: 'esm',
    version: '8.11.1'
  };

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */
  var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
          function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
      return extendStatics(d, b);
  };
  function __extends(d, b) {
      if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }
  function __generator(thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  }
  function __values(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
          next: function () {
              if (o && i >= o.length) o = void 0;
              return { value: o && o[i++], done: !o };
          }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      var i = m.call(o), r, ar = [], e;
      try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      }
      catch (error) { e = { error: error }; }
      finally {
          try {
              if (r && !r.done && (m = i["return"])) m.call(i);
          }
          finally { if (e) throw e.error; }
      }
      return ar;
  }
  function __spreadArray(to, from, pack) {
      if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
              if (!ar) ar = Array.prototype.slice.call(from, 0, i);
              ar[i] = from[i];
          }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
  }
  function __await(v) {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
  }
  function __asyncGenerator(thisArg, _arguments, generator) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
      function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
      function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
      function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
      function fulfill(value) { resume("next", value); }
      function reject(value) { resume("throw", value); }
      function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
  }
  function __asyncValues(o) {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
      function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
      function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
  }

  function isFunction(value) {
      return typeof value === 'function';
  }

  function createErrorClass(createImpl) {
      var _super = function (instance) {
          Error.call(instance);
          instance.stack = new Error().stack;
      };
      var ctorFunc = createImpl(_super);
      ctorFunc.prototype = Object.create(Error.prototype);
      ctorFunc.prototype.constructor = ctorFunc;
      return ctorFunc;
  }

  var UnsubscriptionError = createErrorClass(function (_super) {
      return function UnsubscriptionErrorImpl(errors) {
          _super(this);
          this.message = errors
              ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
              : '';
          this.name = 'UnsubscriptionError';
          this.errors = errors;
      };
  });

  function arrRemove(arr, item) {
      if (arr) {
          var index = arr.indexOf(item);
          0 <= index && arr.splice(index, 1);
      }
  }

  var Subscription = (function () {
      function Subscription(initialTeardown) {
          this.initialTeardown = initialTeardown;
          this.closed = false;
          this._parentage = null;
          this._finalizers = null;
      }
      Subscription.prototype.unsubscribe = function () {
          var e_1, _a, e_2, _b;
          var errors;
          if (!this.closed) {
              this.closed = true;
              var _parentage = this._parentage;
              if (_parentage) {
                  this._parentage = null;
                  if (Array.isArray(_parentage)) {
                      try {
                          for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                              var parent_1 = _parentage_1_1.value;
                              parent_1.remove(this);
                          }
                      }
                      catch (e_1_1) { e_1 = { error: e_1_1 }; }
                      finally {
                          try {
                              if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                          }
                          finally { if (e_1) throw e_1.error; }
                      }
                  }
                  else {
                      _parentage.remove(this);
                  }
              }
              var initialFinalizer = this.initialTeardown;
              if (isFunction(initialFinalizer)) {
                  try {
                      initialFinalizer();
                  }
                  catch (e) {
                      errors = e instanceof UnsubscriptionError ? e.errors : [e];
                  }
              }
              var _finalizers = this._finalizers;
              if (_finalizers) {
                  this._finalizers = null;
                  try {
                      for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                          var finalizer = _finalizers_1_1.value;
                          try {
                              execFinalizer(finalizer);
                          }
                          catch (err) {
                              errors = errors !== null && errors !== void 0 ? errors : [];
                              if (err instanceof UnsubscriptionError) {
                                  errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                              }
                              else {
                                  errors.push(err);
                              }
                          }
                      }
                  }
                  catch (e_2_1) { e_2 = { error: e_2_1 }; }
                  finally {
                      try {
                          if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                      }
                      finally { if (e_2) throw e_2.error; }
                  }
              }
              if (errors) {
                  throw new UnsubscriptionError(errors);
              }
          }
      };
      Subscription.prototype.add = function (teardown) {
          var _a;
          if (teardown && teardown !== this) {
              if (this.closed) {
                  execFinalizer(teardown);
              }
              else {
                  if (teardown instanceof Subscription) {
                      if (teardown.closed || teardown._hasParent(this)) {
                          return;
                      }
                      teardown._addParent(this);
                  }
                  (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
              }
          }
      };
      Subscription.prototype._hasParent = function (parent) {
          var _parentage = this._parentage;
          return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
      };
      Subscription.prototype._addParent = function (parent) {
          var _parentage = this._parentage;
          this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
      };
      Subscription.prototype._removeParent = function (parent) {
          var _parentage = this._parentage;
          if (_parentage === parent) {
              this._parentage = null;
          }
          else if (Array.isArray(_parentage)) {
              arrRemove(_parentage, parent);
          }
      };
      Subscription.prototype.remove = function (teardown) {
          var _finalizers = this._finalizers;
          _finalizers && arrRemove(_finalizers, teardown);
          if (teardown instanceof Subscription) {
              teardown._removeParent(this);
          }
      };
      Subscription.EMPTY = (function () {
          var empty = new Subscription();
          empty.closed = true;
          return empty;
      })();
      return Subscription;
  }());
  var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
  function isSubscription(value) {
      return (value instanceof Subscription ||
          (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe)));
  }
  function execFinalizer(finalizer) {
      if (isFunction(finalizer)) {
          finalizer();
      }
      else {
          finalizer.unsubscribe();
      }
  }

  var config = {
      onUnhandledError: null,
      onStoppedNotification: null,
      Promise: undefined,
      useDeprecatedSynchronousErrorHandling: false,
      useDeprecatedNextContext: false,
  };

  var timeoutProvider = {
      setTimeout: function (handler, timeout) {
          var args = [];
          for (var _i = 2; _i < arguments.length; _i++) {
              args[_i - 2] = arguments[_i];
          }
          return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
      },
      clearTimeout: function (handle) {
          return (clearTimeout)(handle);
      },
      delegate: undefined,
  };

  function reportUnhandledError(err) {
      timeoutProvider.setTimeout(function () {
          {
              throw err;
          }
      });
  }

  function noop() { }

  function errorContext(cb) {
      {
          cb();
      }
  }

  var Subscriber = (function (_super) {
      __extends(Subscriber, _super);
      function Subscriber(destination) {
          var _this = _super.call(this) || this;
          _this.isStopped = false;
          if (destination) {
              _this.destination = destination;
              if (isSubscription(destination)) {
                  destination.add(_this);
              }
          }
          else {
              _this.destination = EMPTY_OBSERVER;
          }
          return _this;
      }
      Subscriber.create = function (next, error, complete) {
          return new SafeSubscriber(next, error, complete);
      };
      Subscriber.prototype.next = function (value) {
          if (this.isStopped) ;
          else {
              this._next(value);
          }
      };
      Subscriber.prototype.error = function (err) {
          if (this.isStopped) ;
          else {
              this.isStopped = true;
              this._error(err);
          }
      };
      Subscriber.prototype.complete = function () {
          if (this.isStopped) ;
          else {
              this.isStopped = true;
              this._complete();
          }
      };
      Subscriber.prototype.unsubscribe = function () {
          if (!this.closed) {
              this.isStopped = true;
              _super.prototype.unsubscribe.call(this);
              this.destination = null;
          }
      };
      Subscriber.prototype._next = function (value) {
          this.destination.next(value);
      };
      Subscriber.prototype._error = function (err) {
          try {
              this.destination.error(err);
          }
          finally {
              this.unsubscribe();
          }
      };
      Subscriber.prototype._complete = function () {
          try {
              this.destination.complete();
          }
          finally {
              this.unsubscribe();
          }
      };
      return Subscriber;
  }(Subscription));
  var _bind = Function.prototype.bind;
  function bind(fn, thisArg) {
      return _bind.call(fn, thisArg);
  }
  var ConsumerObserver = (function () {
      function ConsumerObserver(partialObserver) {
          this.partialObserver = partialObserver;
      }
      ConsumerObserver.prototype.next = function (value) {
          var partialObserver = this.partialObserver;
          if (partialObserver.next) {
              try {
                  partialObserver.next(value);
              }
              catch (error) {
                  handleUnhandledError(error);
              }
          }
      };
      ConsumerObserver.prototype.error = function (err) {
          var partialObserver = this.partialObserver;
          if (partialObserver.error) {
              try {
                  partialObserver.error(err);
              }
              catch (error) {
                  handleUnhandledError(error);
              }
          }
          else {
              handleUnhandledError(err);
          }
      };
      ConsumerObserver.prototype.complete = function () {
          var partialObserver = this.partialObserver;
          if (partialObserver.complete) {
              try {
                  partialObserver.complete();
              }
              catch (error) {
                  handleUnhandledError(error);
              }
          }
      };
      return ConsumerObserver;
  }());
  var SafeSubscriber = (function (_super) {
      __extends(SafeSubscriber, _super);
      function SafeSubscriber(observerOrNext, error, complete) {
          var _this = _super.call(this) || this;
          var partialObserver;
          if (isFunction(observerOrNext) || !observerOrNext) {
              partialObserver = {
                  next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined,
                  error: error !== null && error !== void 0 ? error : undefined,
                  complete: complete !== null && complete !== void 0 ? complete : undefined,
              };
          }
          else {
              var context_1;
              if (_this && config.useDeprecatedNextContext) {
                  context_1 = Object.create(observerOrNext);
                  context_1.unsubscribe = function () { return _this.unsubscribe(); };
                  partialObserver = {
                      next: observerOrNext.next && bind(observerOrNext.next, context_1),
                      error: observerOrNext.error && bind(observerOrNext.error, context_1),
                      complete: observerOrNext.complete && bind(observerOrNext.complete, context_1),
                  };
              }
              else {
                  partialObserver = observerOrNext;
              }
          }
          _this.destination = new ConsumerObserver(partialObserver);
          return _this;
      }
      return SafeSubscriber;
  }(Subscriber));
  function handleUnhandledError(error) {
      {
          reportUnhandledError(error);
      }
  }
  function defaultErrorHandler(err) {
      throw err;
  }
  var EMPTY_OBSERVER = {
      closed: true,
      next: noop,
      error: defaultErrorHandler,
      complete: noop,
  };

  var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

  function identity$2(x) {
      return x;
  }

  function pipeFromArray(fns) {
      if (fns.length === 0) {
          return identity$2;
      }
      if (fns.length === 1) {
          return fns[0];
      }
      return function piped(input) {
          return fns.reduce(function (prev, fn) { return fn(prev); }, input);
      };
  }

  var Observable = (function () {
      function Observable(subscribe) {
          if (subscribe) {
              this._subscribe = subscribe;
          }
      }
      Observable.prototype.lift = function (operator) {
          var observable = new Observable();
          observable.source = this;
          observable.operator = operator;
          return observable;
      };
      Observable.prototype.subscribe = function (observerOrNext, error, complete) {
          var _this = this;
          var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
          errorContext(function () {
              var _a = _this, operator = _a.operator, source = _a.source;
              subscriber.add(operator
                  ?
                      operator.call(subscriber, source)
                  : source
                      ?
                          _this._subscribe(subscriber)
                      :
                          _this._trySubscribe(subscriber));
          });
          return subscriber;
      };
      Observable.prototype._trySubscribe = function (sink) {
          try {
              return this._subscribe(sink);
          }
          catch (err) {
              sink.error(err);
          }
      };
      Observable.prototype.forEach = function (next, promiseCtor) {
          var _this = this;
          promiseCtor = getPromiseCtor(promiseCtor);
          return new promiseCtor(function (resolve, reject) {
              var subscriber = new SafeSubscriber({
                  next: function (value) {
                      try {
                          next(value);
                      }
                      catch (err) {
                          reject(err);
                          subscriber.unsubscribe();
                      }
                  },
                  error: reject,
                  complete: resolve,
              });
              _this.subscribe(subscriber);
          });
      };
      Observable.prototype._subscribe = function (subscriber) {
          var _a;
          return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
      };
      Observable.prototype[observable] = function () {
          return this;
      };
      Observable.prototype.pipe = function () {
          var operations = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              operations[_i] = arguments[_i];
          }
          return pipeFromArray(operations)(this);
      };
      Observable.prototype.toPromise = function (promiseCtor) {
          var _this = this;
          promiseCtor = getPromiseCtor(promiseCtor);
          return new promiseCtor(function (resolve, reject) {
              var value;
              _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
          });
      };
      Observable.create = function (subscribe) {
          return new Observable(subscribe);
      };
      return Observable;
  }());
  function getPromiseCtor(promiseCtor) {
      var _a;
      return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
  }
  function isObserver(value) {
      return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
  }
  function isSubscriber(value) {
      return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
  }

  function hasLift(source) {
      return isFunction(source === null || source === void 0 ? void 0 : source.lift);
  }
  function operate(init) {
      return function (source) {
          if (hasLift(source)) {
              return source.lift(function (liftedSource) {
                  try {
                      return init(liftedSource, this);
                  }
                  catch (err) {
                      this.error(err);
                  }
              });
          }
          throw new TypeError('Unable to lift unknown Observable type');
      };
  }

  function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
      return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
  }
  var OperatorSubscriber = (function (_super) {
      __extends(OperatorSubscriber, _super);
      function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
          var _this = _super.call(this, destination) || this;
          _this.onFinalize = onFinalize;
          _this.shouldUnsubscribe = shouldUnsubscribe;
          _this._next = onNext
              ? function (value) {
                  try {
                      onNext(value);
                  }
                  catch (err) {
                      destination.error(err);
                  }
              }
              : _super.prototype._next;
          _this._error = onError
              ? function (err) {
                  try {
                      onError(err);
                  }
                  catch (err) {
                      destination.error(err);
                  }
                  finally {
                      this.unsubscribe();
                  }
              }
              : _super.prototype._error;
          _this._complete = onComplete
              ? function () {
                  try {
                      onComplete();
                  }
                  catch (err) {
                      destination.error(err);
                  }
                  finally {
                      this.unsubscribe();
                  }
              }
              : _super.prototype._complete;
          return _this;
      }
      OperatorSubscriber.prototype.unsubscribe = function () {
          var _a;
          if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
              var closed_1 = this.closed;
              _super.prototype.unsubscribe.call(this);
              !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
          }
      };
      return OperatorSubscriber;
  }(Subscriber));

  function refCount() {
      return operate(function (source, subscriber) {
          var connection = null;
          source._refCount++;
          var refCounter = createOperatorSubscriber(subscriber, undefined, undefined, undefined, function () {
              if (!source || source._refCount <= 0 || 0 < --source._refCount) {
                  connection = null;
                  return;
              }
              var sharedConnection = source._connection;
              var conn = connection;
              connection = null;
              if (sharedConnection && (!conn || sharedConnection === conn)) {
                  sharedConnection.unsubscribe();
              }
              subscriber.unsubscribe();
          });
          source.subscribe(refCounter);
          if (!refCounter.closed) {
              connection = source.connect();
          }
      });
  }

  var ConnectableObservable = (function (_super) {
      __extends(ConnectableObservable, _super);
      function ConnectableObservable(source, subjectFactory) {
          var _this = _super.call(this) || this;
          _this.source = source;
          _this.subjectFactory = subjectFactory;
          _this._subject = null;
          _this._refCount = 0;
          _this._connection = null;
          if (hasLift(source)) {
              _this.lift = source.lift;
          }
          return _this;
      }
      ConnectableObservable.prototype._subscribe = function (subscriber) {
          return this.getSubject().subscribe(subscriber);
      };
      ConnectableObservable.prototype.getSubject = function () {
          var subject = this._subject;
          if (!subject || subject.isStopped) {
              this._subject = this.subjectFactory();
          }
          return this._subject;
      };
      ConnectableObservable.prototype._teardown = function () {
          this._refCount = 0;
          var _connection = this._connection;
          this._subject = this._connection = null;
          _connection === null || _connection === void 0 ? void 0 : _connection.unsubscribe();
      };
      ConnectableObservable.prototype.connect = function () {
          var _this = this;
          var connection = this._connection;
          if (!connection) {
              connection = this._connection = new Subscription();
              var subject_1 = this.getSubject();
              connection.add(this.source.subscribe(createOperatorSubscriber(subject_1, undefined, function () {
                  _this._teardown();
                  subject_1.complete();
              }, function (err) {
                  _this._teardown();
                  subject_1.error(err);
              }, function () { return _this._teardown(); })));
              if (connection.closed) {
                  this._connection = null;
                  connection = Subscription.EMPTY;
              }
          }
          return connection;
      };
      ConnectableObservable.prototype.refCount = function () {
          return refCount()(this);
      };
      return ConnectableObservable;
  }(Observable));

  var performanceTimestampProvider = {
      now: function () {
          return (performanceTimestampProvider.delegate || performance).now();
      },
      delegate: undefined,
  };

  var animationFrameProvider = {
      schedule: function (callback) {
          var request = requestAnimationFrame;
          var cancel = cancelAnimationFrame;
          var handle = request(function (timestamp) {
              cancel = undefined;
              callback(timestamp);
          });
          return new Subscription(function () { return cancel === null || cancel === void 0 ? void 0 : cancel(handle); });
      },
      requestAnimationFrame: function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          var delegate = animationFrameProvider.delegate;
          return ((delegate === null || delegate === void 0 ? void 0 : delegate.requestAnimationFrame) || requestAnimationFrame).apply(void 0, __spreadArray([], __read(args)));
      },
      cancelAnimationFrame: function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          return (cancelAnimationFrame).apply(void 0, __spreadArray([], __read(args)));
      },
      delegate: undefined,
  };

  function animationFramesFactory(timestampProvider) {
      var schedule = animationFrameProvider.schedule;
      return new Observable(function (subscriber) {
          var subscription = new Subscription();
          var provider = timestampProvider || performanceTimestampProvider;
          var start = provider.now();
          var run = function (timestamp) {
              var now = provider.now();
              subscriber.next({
                  timestamp: timestampProvider ? now : timestamp,
                  elapsed: now - start,
              });
              if (!subscriber.closed) {
                  subscription.add(schedule(run));
              }
          };
          subscription.add(schedule(run));
          return subscription;
      });
  }
  animationFramesFactory();

  var ObjectUnsubscribedError = createErrorClass(function (_super) {
      return function ObjectUnsubscribedErrorImpl() {
          _super(this);
          this.name = 'ObjectUnsubscribedError';
          this.message = 'object unsubscribed';
      };
  });

  var Subject = (function (_super) {
      __extends(Subject, _super);
      function Subject() {
          var _this = _super.call(this) || this;
          _this.closed = false;
          _this.currentObservers = null;
          _this.observers = [];
          _this.isStopped = false;
          _this.hasError = false;
          _this.thrownError = null;
          return _this;
      }
      Subject.prototype.lift = function (operator) {
          var subject = new AnonymousSubject(this, this);
          subject.operator = operator;
          return subject;
      };
      Subject.prototype._throwIfClosed = function () {
          if (this.closed) {
              throw new ObjectUnsubscribedError();
          }
      };
      Subject.prototype.next = function (value) {
          var _this = this;
          errorContext(function () {
              var e_1, _a;
              _this._throwIfClosed();
              if (!_this.isStopped) {
                  if (!_this.currentObservers) {
                      _this.currentObservers = Array.from(_this.observers);
                  }
                  try {
                      for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
                          var observer = _c.value;
                          observer.next(value);
                      }
                  }
                  catch (e_1_1) { e_1 = { error: e_1_1 }; }
                  finally {
                      try {
                          if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                      }
                      finally { if (e_1) throw e_1.error; }
                  }
              }
          });
      };
      Subject.prototype.error = function (err) {
          var _this = this;
          errorContext(function () {
              _this._throwIfClosed();
              if (!_this.isStopped) {
                  _this.hasError = _this.isStopped = true;
                  _this.thrownError = err;
                  var observers = _this.observers;
                  while (observers.length) {
                      observers.shift().error(err);
                  }
              }
          });
      };
      Subject.prototype.complete = function () {
          var _this = this;
          errorContext(function () {
              _this._throwIfClosed();
              if (!_this.isStopped) {
                  _this.isStopped = true;
                  var observers = _this.observers;
                  while (observers.length) {
                      observers.shift().complete();
                  }
              }
          });
      };
      Subject.prototype.unsubscribe = function () {
          this.isStopped = this.closed = true;
          this.observers = this.currentObservers = null;
      };
      Object.defineProperty(Subject.prototype, "observed", {
          get: function () {
              var _a;
              return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
          },
          enumerable: false,
          configurable: true
      });
      Subject.prototype._trySubscribe = function (subscriber) {
          this._throwIfClosed();
          return _super.prototype._trySubscribe.call(this, subscriber);
      };
      Subject.prototype._subscribe = function (subscriber) {
          this._throwIfClosed();
          this._checkFinalizedStatuses(subscriber);
          return this._innerSubscribe(subscriber);
      };
      Subject.prototype._innerSubscribe = function (subscriber) {
          var _this = this;
          var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
          if (hasError || isStopped) {
              return EMPTY_SUBSCRIPTION;
          }
          this.currentObservers = null;
          observers.push(subscriber);
          return new Subscription(function () {
              _this.currentObservers = null;
              arrRemove(observers, subscriber);
          });
      };
      Subject.prototype._checkFinalizedStatuses = function (subscriber) {
          var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
          if (hasError) {
              subscriber.error(thrownError);
          }
          else if (isStopped) {
              subscriber.complete();
          }
      };
      Subject.prototype.asObservable = function () {
          var observable = new Observable();
          observable.source = this;
          return observable;
      };
      Subject.create = function (destination, source) {
          return new AnonymousSubject(destination, source);
      };
      return Subject;
  }(Observable));
  var AnonymousSubject = (function (_super) {
      __extends(AnonymousSubject, _super);
      function AnonymousSubject(destination, source) {
          var _this = _super.call(this) || this;
          _this.destination = destination;
          _this.source = source;
          return _this;
      }
      AnonymousSubject.prototype.next = function (value) {
          var _a, _b;
          (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
      };
      AnonymousSubject.prototype.error = function (err) {
          var _a, _b;
          (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
      };
      AnonymousSubject.prototype.complete = function () {
          var _a, _b;
          (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
      };
      AnonymousSubject.prototype._subscribe = function (subscriber) {
          var _a, _b;
          return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
      };
      return AnonymousSubject;
  }(Subject));

  var BehaviorSubject = (function (_super) {
      __extends(BehaviorSubject, _super);
      function BehaviorSubject(_value) {
          var _this = _super.call(this) || this;
          _this._value = _value;
          return _this;
      }
      Object.defineProperty(BehaviorSubject.prototype, "value", {
          get: function () {
              return this.getValue();
          },
          enumerable: false,
          configurable: true
      });
      BehaviorSubject.prototype._subscribe = function (subscriber) {
          var subscription = _super.prototype._subscribe.call(this, subscriber);
          !subscription.closed && subscriber.next(this._value);
          return subscription;
      };
      BehaviorSubject.prototype.getValue = function () {
          var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
          if (hasError) {
              throw thrownError;
          }
          this._throwIfClosed();
          return _value;
      };
      BehaviorSubject.prototype.next = function (value) {
          _super.prototype.next.call(this, (this._value = value));
      };
      return BehaviorSubject;
  }(Subject));

  var dateTimestampProvider = {
      now: function () {
          return (dateTimestampProvider.delegate || Date).now();
      },
      delegate: undefined,
  };

  var ReplaySubject = (function (_super) {
      __extends(ReplaySubject, _super);
      function ReplaySubject(_bufferSize, _windowTime, _timestampProvider) {
          if (_bufferSize === void 0) { _bufferSize = Infinity; }
          if (_windowTime === void 0) { _windowTime = Infinity; }
          if (_timestampProvider === void 0) { _timestampProvider = dateTimestampProvider; }
          var _this = _super.call(this) || this;
          _this._bufferSize = _bufferSize;
          _this._windowTime = _windowTime;
          _this._timestampProvider = _timestampProvider;
          _this._buffer = [];
          _this._infiniteTimeWindow = true;
          _this._infiniteTimeWindow = _windowTime === Infinity;
          _this._bufferSize = Math.max(1, _bufferSize);
          _this._windowTime = Math.max(1, _windowTime);
          return _this;
      }
      ReplaySubject.prototype.next = function (value) {
          var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
          if (!isStopped) {
              _buffer.push(value);
              !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
          }
          this._trimBuffer();
          _super.prototype.next.call(this, value);
      };
      ReplaySubject.prototype._subscribe = function (subscriber) {
          this._throwIfClosed();
          this._trimBuffer();
          var subscription = this._innerSubscribe(subscriber);
          var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow, _buffer = _a._buffer;
          var copy = _buffer.slice();
          for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
              subscriber.next(copy[i]);
          }
          this._checkFinalizedStatuses(subscriber);
          return subscription;
      };
      ReplaySubject.prototype._trimBuffer = function () {
          var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
          var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
          _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
          if (!_infiniteTimeWindow) {
              var now = _timestampProvider.now();
              var last = 0;
              for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
                  last = i;
              }
              last && _buffer.splice(0, last + 1);
          }
      };
      return ReplaySubject;
  }(Subject));

  ((function (_super) {
      __extends(AsyncSubject, _super);
      function AsyncSubject() {
          var _this = _super !== null && _super.apply(this, arguments) || this;
          _this._value = null;
          _this._hasValue = false;
          _this._isComplete = false;
          return _this;
      }
      AsyncSubject.prototype._checkFinalizedStatuses = function (subscriber) {
          var _a = this, hasError = _a.hasError, _hasValue = _a._hasValue, _value = _a._value, thrownError = _a.thrownError, isStopped = _a.isStopped, _isComplete = _a._isComplete;
          if (hasError) {
              subscriber.error(thrownError);
          }
          else if (isStopped || _isComplete) {
              _hasValue && subscriber.next(_value);
              subscriber.complete();
          }
      };
      AsyncSubject.prototype.next = function (value) {
          if (!this.isStopped) {
              this._value = value;
              this._hasValue = true;
          }
      };
      AsyncSubject.prototype.complete = function () {
          var _a = this, _hasValue = _a._hasValue, _value = _a._value, _isComplete = _a._isComplete;
          if (!_isComplete) {
              this._isComplete = true;
              _hasValue && _super.prototype.next.call(this, _value);
              _super.prototype.complete.call(this);
          }
      };
      return AsyncSubject;
  })(Subject));

  var Action = (function (_super) {
      __extends(Action, _super);
      function Action(scheduler, work) {
          return _super.call(this) || this;
      }
      Action.prototype.schedule = function (state, delay) {
          return this;
      };
      return Action;
  }(Subscription));

  var intervalProvider = {
      setInterval: function (handler, timeout) {
          var args = [];
          for (var _i = 2; _i < arguments.length; _i++) {
              args[_i - 2] = arguments[_i];
          }
          return setInterval.apply(void 0, __spreadArray([handler, timeout], __read(args)));
      },
      clearInterval: function (handle) {
          return (clearInterval)(handle);
      },
      delegate: undefined,
  };

  var AsyncAction = (function (_super) {
      __extends(AsyncAction, _super);
      function AsyncAction(scheduler, work) {
          var _this = _super.call(this, scheduler, work) || this;
          _this.scheduler = scheduler;
          _this.work = work;
          _this.pending = false;
          return _this;
      }
      AsyncAction.prototype.schedule = function (state, delay) {
          if (delay === void 0) { delay = 0; }
          if (this.closed) {
              return this;
          }
          this.state = state;
          var id = this.id;
          var scheduler = this.scheduler;
          if (id != null) {
              this.id = this.recycleAsyncId(scheduler, id, delay);
          }
          this.pending = true;
          this.delay = delay;
          this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
          return this;
      };
      AsyncAction.prototype.requestAsyncId = function (scheduler, _id, delay) {
          if (delay === void 0) { delay = 0; }
          return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
      };
      AsyncAction.prototype.recycleAsyncId = function (_scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          if (delay != null && this.delay === delay && this.pending === false) {
              return id;
          }
          intervalProvider.clearInterval(id);
          return undefined;
      };
      AsyncAction.prototype.execute = function (state, delay) {
          if (this.closed) {
              return new Error('executing a cancelled action');
          }
          this.pending = false;
          var error = this._execute(state, delay);
          if (error) {
              return error;
          }
          else if (this.pending === false && this.id != null) {
              this.id = this.recycleAsyncId(this.scheduler, this.id, null);
          }
      };
      AsyncAction.prototype._execute = function (state, _delay) {
          var errored = false;
          var errorValue;
          try {
              this.work(state);
          }
          catch (e) {
              errored = true;
              errorValue = e ? e : new Error('Scheduled action threw falsy error');
          }
          if (errored) {
              this.unsubscribe();
              return errorValue;
          }
      };
      AsyncAction.prototype.unsubscribe = function () {
          if (!this.closed) {
              var _a = this, id = _a.id, scheduler = _a.scheduler;
              var actions = scheduler.actions;
              this.work = this.state = this.scheduler = null;
              this.pending = false;
              arrRemove(actions, this);
              if (id != null) {
                  this.id = this.recycleAsyncId(scheduler, id, null);
              }
              this.delay = null;
              _super.prototype.unsubscribe.call(this);
          }
      };
      return AsyncAction;
  }(Action));

  var nextHandle = 1;
  var resolved;
  var activeHandles = {};
  function findAndClearHandle(handle) {
      if (handle in activeHandles) {
          delete activeHandles[handle];
          return true;
      }
      return false;
  }
  var Immediate = {
      setImmediate: function (cb) {
          var handle = nextHandle++;
          activeHandles[handle] = true;
          if (!resolved) {
              resolved = Promise.resolve();
          }
          resolved.then(function () { return findAndClearHandle(handle) && cb(); });
          return handle;
      },
      clearImmediate: function (handle) {
          findAndClearHandle(handle);
      },
  };

  var setImmediate = Immediate.setImmediate, clearImmediate = Immediate.clearImmediate;
  var immediateProvider = {
      setImmediate: function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          var delegate = immediateProvider.delegate;
          return ((delegate === null || delegate === void 0 ? void 0 : delegate.setImmediate) || setImmediate).apply(void 0, __spreadArray([], __read(args)));
      },
      clearImmediate: function (handle) {
          return (clearImmediate)(handle);
      },
      delegate: undefined,
  };

  var AsapAction = (function (_super) {
      __extends(AsapAction, _super);
      function AsapAction(scheduler, work) {
          var _this = _super.call(this, scheduler, work) || this;
          _this.scheduler = scheduler;
          _this.work = work;
          return _this;
      }
      AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          if (delay !== null && delay > 0) {
              return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
          }
          scheduler.actions.push(this);
          return scheduler._scheduled || (scheduler._scheduled = immediateProvider.setImmediate(scheduler.flush.bind(scheduler, undefined)));
      };
      AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
              return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
          }
          if (!scheduler.actions.some(function (action) { return action.id === id; })) {
              immediateProvider.clearImmediate(id);
              scheduler._scheduled = undefined;
          }
          return undefined;
      };
      return AsapAction;
  }(AsyncAction));

  var Scheduler = (function () {
      function Scheduler(schedulerActionCtor, now) {
          if (now === void 0) { now = Scheduler.now; }
          this.schedulerActionCtor = schedulerActionCtor;
          this.now = now;
      }
      Scheduler.prototype.schedule = function (work, delay, state) {
          if (delay === void 0) { delay = 0; }
          return new this.schedulerActionCtor(this, work).schedule(state, delay);
      };
      Scheduler.now = dateTimestampProvider.now;
      return Scheduler;
  }());

  var AsyncScheduler = (function (_super) {
      __extends(AsyncScheduler, _super);
      function AsyncScheduler(SchedulerAction, now) {
          if (now === void 0) { now = Scheduler.now; }
          var _this = _super.call(this, SchedulerAction, now) || this;
          _this.actions = [];
          _this._active = false;
          _this._scheduled = undefined;
          return _this;
      }
      AsyncScheduler.prototype.flush = function (action) {
          var actions = this.actions;
          if (this._active) {
              actions.push(action);
              return;
          }
          var error;
          this._active = true;
          do {
              if ((error = action.execute(action.state, action.delay))) {
                  break;
              }
          } while ((action = actions.shift()));
          this._active = false;
          if (error) {
              while ((action = actions.shift())) {
                  action.unsubscribe();
              }
              throw error;
          }
      };
      return AsyncScheduler;
  }(Scheduler));

  var AsapScheduler = (function (_super) {
      __extends(AsapScheduler, _super);
      function AsapScheduler() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      AsapScheduler.prototype.flush = function (action) {
          this._active = true;
          var flushId = this._scheduled;
          this._scheduled = undefined;
          var actions = this.actions;
          var error;
          action = action || actions.shift();
          do {
              if ((error = action.execute(action.state, action.delay))) {
                  break;
              }
          } while ((action = actions[0]) && action.id === flushId && actions.shift());
          this._active = false;
          if (error) {
              while ((action = actions[0]) && action.id === flushId && actions.shift()) {
                  action.unsubscribe();
              }
              throw error;
          }
      };
      return AsapScheduler;
  }(AsyncScheduler));

  var asapScheduler = new AsapScheduler(AsapAction);

  new AsyncScheduler(AsyncAction);

  var QueueAction = (function (_super) {
      __extends(QueueAction, _super);
      function QueueAction(scheduler, work) {
          var _this = _super.call(this, scheduler, work) || this;
          _this.scheduler = scheduler;
          _this.work = work;
          return _this;
      }
      QueueAction.prototype.schedule = function (state, delay) {
          if (delay === void 0) { delay = 0; }
          if (delay > 0) {
              return _super.prototype.schedule.call(this, state, delay);
          }
          this.delay = delay;
          this.state = state;
          this.scheduler.flush(this);
          return this;
      };
      QueueAction.prototype.execute = function (state, delay) {
          return (delay > 0 || this.closed) ?
              _super.prototype.execute.call(this, state, delay) :
              this._execute(state, delay);
      };
      QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
              return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
          }
          return scheduler.flush(this);
      };
      return QueueAction;
  }(AsyncAction));

  var QueueScheduler = (function (_super) {
      __extends(QueueScheduler, _super);
      function QueueScheduler() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      return QueueScheduler;
  }(AsyncScheduler));

  new QueueScheduler(QueueAction);

  var AnimationFrameAction = (function (_super) {
      __extends(AnimationFrameAction, _super);
      function AnimationFrameAction(scheduler, work) {
          var _this = _super.call(this, scheduler, work) || this;
          _this.scheduler = scheduler;
          _this.work = work;
          return _this;
      }
      AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          if (delay !== null && delay > 0) {
              return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
          }
          scheduler.actions.push(this);
          return scheduler._scheduled || (scheduler._scheduled = animationFrameProvider.requestAnimationFrame(function () { return scheduler.flush(undefined); }));
      };
      AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
              return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
          }
          if (!scheduler.actions.some(function (action) { return action.id === id; })) {
              animationFrameProvider.cancelAnimationFrame(id);
              scheduler._scheduled = undefined;
          }
          return undefined;
      };
      return AnimationFrameAction;
  }(AsyncAction));

  var AnimationFrameScheduler = (function (_super) {
      __extends(AnimationFrameScheduler, _super);
      function AnimationFrameScheduler() {
          return _super !== null && _super.apply(this, arguments) || this;
      }
      AnimationFrameScheduler.prototype.flush = function (action) {
          this._active = true;
          var flushId = this._scheduled;
          this._scheduled = undefined;
          var actions = this.actions;
          var error;
          action = action || actions.shift();
          do {
              if ((error = action.execute(action.state, action.delay))) {
                  break;
              }
          } while ((action = actions[0]) && action.id === flushId && actions.shift());
          this._active = false;
          if (error) {
              while ((action = actions[0]) && action.id === flushId && actions.shift()) {
                  action.unsubscribe();
              }
              throw error;
          }
      };
      return AnimationFrameScheduler;
  }(AsyncScheduler));

  new AnimationFrameScheduler(AnimationFrameAction);

  ((function (_super) {
      __extends(VirtualTimeScheduler, _super);
      function VirtualTimeScheduler(schedulerActionCtor, maxFrames) {
          if (schedulerActionCtor === void 0) { schedulerActionCtor = VirtualAction; }
          if (maxFrames === void 0) { maxFrames = Infinity; }
          var _this = _super.call(this, schedulerActionCtor, function () { return _this.frame; }) || this;
          _this.maxFrames = maxFrames;
          _this.frame = 0;
          _this.index = -1;
          return _this;
      }
      VirtualTimeScheduler.prototype.flush = function () {
          var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
          var error;
          var action;
          while ((action = actions[0]) && action.delay <= maxFrames) {
              actions.shift();
              this.frame = action.delay;
              if ((error = action.execute(action.state, action.delay))) {
                  break;
              }
          }
          if (error) {
              while ((action = actions.shift())) {
                  action.unsubscribe();
              }
              throw error;
          }
      };
      VirtualTimeScheduler.frameTimeFactor = 10;
      return VirtualTimeScheduler;
  })(AsyncScheduler));
  var VirtualAction = (function (_super) {
      __extends(VirtualAction, _super);
      function VirtualAction(scheduler, work, index) {
          if (index === void 0) { index = (scheduler.index += 1); }
          var _this = _super.call(this, scheduler, work) || this;
          _this.scheduler = scheduler;
          _this.work = work;
          _this.index = index;
          _this.active = true;
          _this.index = scheduler.index = index;
          return _this;
      }
      VirtualAction.prototype.schedule = function (state, delay) {
          if (delay === void 0) { delay = 0; }
          if (Number.isFinite(delay)) {
              if (!this.id) {
                  return _super.prototype.schedule.call(this, state, delay);
              }
              this.active = false;
              var action = new VirtualAction(this.scheduler, this.work);
              this.add(action);
              return action.schedule(state, delay);
          }
          else {
              return Subscription.EMPTY;
          }
      };
      VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
          if (delay === void 0) { delay = 0; }
          this.delay = scheduler.frame + delay;
          var actions = scheduler.actions;
          actions.push(this);
          actions.sort(VirtualAction.sortActions);
          return true;
      };
      VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
          return undefined;
      };
      VirtualAction.prototype._execute = function (state, delay) {
          if (this.active === true) {
              return _super.prototype._execute.call(this, state, delay);
          }
      };
      VirtualAction.sortActions = function (a, b) {
          if (a.delay === b.delay) {
              if (a.index === b.index) {
                  return 0;
              }
              else if (a.index > b.index) {
                  return 1;
              }
              else {
                  return -1;
              }
          }
          else if (a.delay > b.delay) {
              return 1;
          }
          else {
              return -1;
          }
      };
      return VirtualAction;
  }(AsyncAction));

  var EMPTY = new Observable(function (subscriber) { return subscriber.complete(); });

  function isScheduler(value) {
      return value && isFunction(value.schedule);
  }

  function last(arr) {
      return arr[arr.length - 1];
  }
  function popResultSelector(args) {
      return isFunction(last(args)) ? args.pop() : undefined;
  }
  function popScheduler(args) {
      return isScheduler(last(args)) ? args.pop() : undefined;
  }

  var isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

  function isPromise(value) {
      return isFunction(value === null || value === void 0 ? void 0 : value.then);
  }

  function isInteropObservable(input) {
      return isFunction(input[observable]);
  }

  function isAsyncIterable(obj) {
      return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
  }

  function createInvalidObservableTypeError(input) {
      return new TypeError("You provided " + (input !== null && typeof input === 'object' ? 'an invalid object' : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
  }

  function getSymbolIterator() {
      if (typeof Symbol !== 'function' || !Symbol.iterator) {
          return '@@iterator';
      }
      return Symbol.iterator;
  }
  var iterator = getSymbolIterator();

  function isIterable(input) {
      return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
  }

  function readableStreamLikeToAsyncGenerator(readableStream) {
      return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
          var reader, _a, value, done;
          return __generator(this, function (_b) {
              switch (_b.label) {
                  case 0:
                      reader = readableStream.getReader();
                      _b.label = 1;
                  case 1:
                      _b.trys.push([1, , 9, 10]);
                      _b.label = 2;
                  case 2:
                      return [4, __await(reader.read())];
                  case 3:
                      _a = _b.sent(), value = _a.value, done = _a.done;
                      if (!done) return [3, 5];
                      return [4, __await(void 0)];
                  case 4: return [2, _b.sent()];
                  case 5: return [4, __await(value)];
                  case 6: return [4, _b.sent()];
                  case 7:
                      _b.sent();
                      return [3, 2];
                  case 8: return [3, 10];
                  case 9:
                      reader.releaseLock();
                      return [7];
                  case 10: return [2];
              }
          });
      });
  }
  function isReadableStreamLike(obj) {
      return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
  }

  function innerFrom(input) {
      if (input instanceof Observable) {
          return input;
      }
      if (input != null) {
          if (isInteropObservable(input)) {
              return fromInteropObservable(input);
          }
          if (isArrayLike(input)) {
              return fromArrayLike(input);
          }
          if (isPromise(input)) {
              return fromPromise(input);
          }
          if (isAsyncIterable(input)) {
              return fromAsyncIterable(input);
          }
          if (isIterable(input)) {
              return fromIterable(input);
          }
          if (isReadableStreamLike(input)) {
              return fromReadableStreamLike(input);
          }
      }
      throw createInvalidObservableTypeError(input);
  }
  function fromInteropObservable(obj) {
      return new Observable(function (subscriber) {
          var obs = obj[observable]();
          if (isFunction(obs.subscribe)) {
              return obs.subscribe(subscriber);
          }
          throw new TypeError('Provided object does not correctly implement Symbol.observable');
      });
  }
  function fromArrayLike(array) {
      return new Observable(function (subscriber) {
          for (var i = 0; i < array.length && !subscriber.closed; i++) {
              subscriber.next(array[i]);
          }
          subscriber.complete();
      });
  }
  function fromPromise(promise) {
      return new Observable(function (subscriber) {
          promise
              .then(function (value) {
              if (!subscriber.closed) {
                  subscriber.next(value);
                  subscriber.complete();
              }
          }, function (err) { return subscriber.error(err); })
              .then(null, reportUnhandledError);
      });
  }
  function fromIterable(iterable) {
      return new Observable(function (subscriber) {
          var e_1, _a;
          try {
              for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                  var value = iterable_1_1.value;
                  subscriber.next(value);
                  if (subscriber.closed) {
                      return;
                  }
              }
          }
          catch (e_1_1) { e_1 = { error: e_1_1 }; }
          finally {
              try {
                  if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
              }
              finally { if (e_1) throw e_1.error; }
          }
          subscriber.complete();
      });
  }
  function fromAsyncIterable(asyncIterable) {
      return new Observable(function (subscriber) {
          process(asyncIterable, subscriber).catch(function (err) { return subscriber.error(err); });
      });
  }
  function fromReadableStreamLike(readableStream) {
      return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
  }
  function process(asyncIterable, subscriber) {
      var asyncIterable_1, asyncIterable_1_1;
      var e_2, _a;
      return __awaiter(this, void 0, void 0, function () {
          var value, e_2_1;
          return __generator(this, function (_b) {
              switch (_b.label) {
                  case 0:
                      _b.trys.push([0, 5, 6, 11]);
                      asyncIterable_1 = __asyncValues(asyncIterable);
                      _b.label = 1;
                  case 1: return [4, asyncIterable_1.next()];
                  case 2:
                      if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
                      value = asyncIterable_1_1.value;
                      subscriber.next(value);
                      if (subscriber.closed) {
                          return [2];
                      }
                      _b.label = 3;
                  case 3: return [3, 1];
                  case 4: return [3, 11];
                  case 5:
                      e_2_1 = _b.sent();
                      e_2 = { error: e_2_1 };
                      return [3, 11];
                  case 6:
                      _b.trys.push([6, , 9, 10]);
                      if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
                      return [4, _a.call(asyncIterable_1)];
                  case 7:
                      _b.sent();
                      _b.label = 8;
                  case 8: return [3, 10];
                  case 9:
                      if (e_2) throw e_2.error;
                      return [7];
                  case 10: return [7];
                  case 11:
                      subscriber.complete();
                      return [2];
              }
          });
      });
  }

  function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
      if (delay === void 0) { delay = 0; }
      if (repeat === void 0) { repeat = false; }
      var scheduleSubscription = scheduler.schedule(function () {
          work();
          if (repeat) {
              parentSubscription.add(this.schedule(null, delay));
          }
          else {
              this.unsubscribe();
          }
      }, delay);
      parentSubscription.add(scheduleSubscription);
      if (!repeat) {
          return scheduleSubscription;
      }
  }

  function observeOn(scheduler, delay) {
      if (delay === void 0) { delay = 0; }
      return operate(function (source, subscriber) {
          source.subscribe(createOperatorSubscriber(subscriber, function (value) { return executeSchedule(subscriber, scheduler, function () { return subscriber.next(value); }, delay); }, function () { return executeSchedule(subscriber, scheduler, function () { return subscriber.complete(); }, delay); }, function (err) { return executeSchedule(subscriber, scheduler, function () { return subscriber.error(err); }, delay); }));
      });
  }

  function subscribeOn(scheduler, delay) {
      if (delay === void 0) { delay = 0; }
      return operate(function (source, subscriber) {
          subscriber.add(scheduler.schedule(function () { return source.subscribe(subscriber); }, delay));
      });
  }

  function scheduleObservable(input, scheduler) {
      return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
  }

  function schedulePromise(input, scheduler) {
      return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
  }

  function scheduleArray(input, scheduler) {
      return new Observable(function (subscriber) {
          var i = 0;
          return scheduler.schedule(function () {
              if (i === input.length) {
                  subscriber.complete();
              }
              else {
                  subscriber.next(input[i++]);
                  if (!subscriber.closed) {
                      this.schedule();
                  }
              }
          });
      });
  }

  function scheduleIterable(input, scheduler) {
      return new Observable(function (subscriber) {
          var iterator$1;
          executeSchedule(subscriber, scheduler, function () {
              iterator$1 = input[iterator]();
              executeSchedule(subscriber, scheduler, function () {
                  var _a;
                  var value;
                  var done;
                  try {
                      (_a = iterator$1.next(), value = _a.value, done = _a.done);
                  }
                  catch (err) {
                      subscriber.error(err);
                      return;
                  }
                  if (done) {
                      subscriber.complete();
                  }
                  else {
                      subscriber.next(value);
                  }
              }, 0, true);
          });
          return function () { return isFunction(iterator$1 === null || iterator$1 === void 0 ? void 0 : iterator$1.return) && iterator$1.return(); };
      });
  }

  function scheduleAsyncIterable(input, scheduler) {
      if (!input) {
          throw new Error('Iterable cannot be null');
      }
      return new Observable(function (subscriber) {
          executeSchedule(subscriber, scheduler, function () {
              var iterator = input[Symbol.asyncIterator]();
              executeSchedule(subscriber, scheduler, function () {
                  iterator.next().then(function (result) {
                      if (result.done) {
                          subscriber.complete();
                      }
                      else {
                          subscriber.next(result.value);
                      }
                  });
              }, 0, true);
          });
      });
  }

  function scheduleReadableStreamLike(input, scheduler) {
      return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
  }

  function scheduled(input, scheduler) {
      if (input != null) {
          if (isInteropObservable(input)) {
              return scheduleObservable(input, scheduler);
          }
          if (isArrayLike(input)) {
              return scheduleArray(input, scheduler);
          }
          if (isPromise(input)) {
              return schedulePromise(input, scheduler);
          }
          if (isAsyncIterable(input)) {
              return scheduleAsyncIterable(input, scheduler);
          }
          if (isIterable(input)) {
              return scheduleIterable(input, scheduler);
          }
          if (isReadableStreamLike(input)) {
              return scheduleReadableStreamLike(input, scheduler);
          }
      }
      throw createInvalidObservableTypeError(input);
  }

  function from(input, scheduler) {
      return scheduler ? scheduled(input, scheduler) : innerFrom(input);
  }

  function of() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      var scheduler = popScheduler(args);
      return from(args, scheduler);
  }

  var NotificationKind;
  (function (NotificationKind) {
      NotificationKind["NEXT"] = "N";
      NotificationKind["ERROR"] = "E";
      NotificationKind["COMPLETE"] = "C";
  })(NotificationKind || (NotificationKind = {}));

  var EmptyError = createErrorClass(function (_super) { return function EmptyErrorImpl() {
      _super(this);
      this.name = 'EmptyError';
      this.message = 'no elements in sequence';
  }; });

  function firstValueFrom(source, config) {
      var hasConfig = typeof config === 'object';
      return new Promise(function (resolve, reject) {
          var subscriber = new SafeSubscriber({
              next: function (value) {
                  resolve(value);
                  subscriber.unsubscribe();
              },
              error: reject,
              complete: function () {
                  if (hasConfig) {
                      resolve(config.defaultValue);
                  }
                  else {
                      reject(new EmptyError());
                  }
              },
          });
          source.subscribe(subscriber);
      });
  }

  createErrorClass(function (_super) {
      return function ArgumentOutOfRangeErrorImpl() {
          _super(this);
          this.name = 'ArgumentOutOfRangeError';
          this.message = 'argument out of range';
      };
  });

  createErrorClass(function (_super) {
      return function NotFoundErrorImpl(message) {
          _super(this);
          this.name = 'NotFoundError';
          this.message = message;
      };
  });

  createErrorClass(function (_super) {
      return function SequenceErrorImpl(message) {
          _super(this);
          this.name = 'SequenceError';
          this.message = message;
      };
  });

  createErrorClass(function (_super) {
      return function TimeoutErrorImpl(info) {
          if (info === void 0) { info = null; }
          _super(this);
          this.message = 'Timeout has occurred';
          this.name = 'TimeoutError';
          this.info = info;
      };
  });

  function map(project, thisArg) {
      return operate(function (source, subscriber) {
          var index = 0;
          source.subscribe(createOperatorSubscriber(subscriber, function (value) {
              subscriber.next(project.call(thisArg, value, index++));
          }));
      });
  }

  var isArray$1 = Array.isArray;
  function callOrApply(fn, args) {
      return isArray$1(args) ? fn.apply(void 0, __spreadArray([], __read(args))) : fn(args);
  }
  function mapOneOrManyArgs(fn) {
      return map(function (args) { return callOrApply(fn, args); });
  }

  var isArray = Array.isArray;
  var getPrototypeOf = Object.getPrototypeOf, objectProto = Object.prototype, getKeys = Object.keys;
  function argsArgArrayOrObject(args) {
      if (args.length === 1) {
          var first_1 = args[0];
          if (isArray(first_1)) {
              return { args: first_1, keys: null };
          }
          if (isPOJO(first_1)) {
              var keys = getKeys(first_1);
              return {
                  args: keys.map(function (key) { return first_1[key]; }),
                  keys: keys,
              };
          }
      }
      return { args: args, keys: null };
  }
  function isPOJO(obj) {
      return obj && typeof obj === 'object' && getPrototypeOf(obj) === objectProto;
  }

  function createObject(keys, values) {
      return keys.reduce(function (result, key, i) { return ((result[key] = values[i]), result); }, {});
  }

  function combineLatest() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      var scheduler = popScheduler(args);
      var resultSelector = popResultSelector(args);
      var _a = argsArgArrayOrObject(args), observables = _a.args, keys = _a.keys;
      if (observables.length === 0) {
          return from([], scheduler);
      }
      var result = new Observable(combineLatestInit(observables, scheduler, keys
          ?
              function (values) { return createObject(keys, values); }
          :
              identity$2));
      return resultSelector ? result.pipe(mapOneOrManyArgs(resultSelector)) : result;
  }
  function combineLatestInit(observables, scheduler, valueTransform) {
      if (valueTransform === void 0) { valueTransform = identity$2; }
      return function (subscriber) {
          maybeSchedule(scheduler, function () {
              var length = observables.length;
              var values = new Array(length);
              var active = length;
              var remainingFirstValues = length;
              var _loop_1 = function (i) {
                  maybeSchedule(scheduler, function () {
                      var source = from(observables[i], scheduler);
                      var hasFirstValue = false;
                      source.subscribe(createOperatorSubscriber(subscriber, function (value) {
                          values[i] = value;
                          if (!hasFirstValue) {
                              hasFirstValue = true;
                              remainingFirstValues--;
                          }
                          if (!remainingFirstValues) {
                              subscriber.next(valueTransform(values.slice()));
                          }
                      }, function () {
                          if (!--active) {
                              subscriber.complete();
                          }
                      }));
                  }, subscriber);
              };
              for (var i = 0; i < length; i++) {
                  _loop_1(i);
              }
          }, subscriber);
      };
  }
  function maybeSchedule(scheduler, execute, subscription) {
      if (scheduler) {
          executeSchedule(subscription, scheduler, execute);
      }
      else {
          execute();
      }
  }

  function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
      var buffer = [];
      var active = 0;
      var index = 0;
      var isComplete = false;
      var checkComplete = function () {
          if (isComplete && !buffer.length && !active) {
              subscriber.complete();
          }
      };
      var outerNext = function (value) { return (active < concurrent ? doInnerSub(value) : buffer.push(value)); };
      var doInnerSub = function (value) {
          expand && subscriber.next(value);
          active++;
          var innerComplete = false;
          innerFrom(project(value, index++)).subscribe(createOperatorSubscriber(subscriber, function (innerValue) {
              onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
              if (expand) {
                  outerNext(innerValue);
              }
              else {
                  subscriber.next(innerValue);
              }
          }, function () {
              innerComplete = true;
          }, undefined, function () {
              if (innerComplete) {
                  try {
                      active--;
                      var _loop_1 = function () {
                          var bufferedValue = buffer.shift();
                          if (innerSubScheduler) {
                              executeSchedule(subscriber, innerSubScheduler, function () { return doInnerSub(bufferedValue); });
                          }
                          else {
                              doInnerSub(bufferedValue);
                          }
                      };
                      while (buffer.length && active < concurrent) {
                          _loop_1();
                      }
                      checkComplete();
                  }
                  catch (err) {
                      subscriber.error(err);
                  }
              }
          }));
      };
      source.subscribe(createOperatorSubscriber(subscriber, outerNext, function () {
          isComplete = true;
          checkComplete();
      }));
      return function () {
          additionalFinalizer === null || additionalFinalizer === void 0 ? void 0 : additionalFinalizer();
      };
  }

  function mergeMap(project, resultSelector, concurrent) {
      if (concurrent === void 0) { concurrent = Infinity; }
      if (isFunction(resultSelector)) {
          return mergeMap(function (a, i) { return map(function (b, ii) { return resultSelector(a, b, i, ii); })(innerFrom(project(a, i))); }, concurrent);
      }
      else if (typeof resultSelector === 'number') {
          concurrent = resultSelector;
      }
      return operate(function (source, subscriber) { return mergeInternals(source, subscriber, project, concurrent); });
  }

  function mergeAll(concurrent) {
      if (concurrent === void 0) { concurrent = Infinity; }
      return mergeMap(identity$2, concurrent);
  }

  function concatAll() {
      return mergeAll(1);
  }

  function concat() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      return concatAll()(from(args, popScheduler(args)));
  }

  new Observable(noop);

  function filter(predicate, thisArg) {
      return operate(function (source, subscriber) {
          var index = 0;
          source.subscribe(createOperatorSubscriber(subscriber, function (value) { return predicate.call(thisArg, value, index++) && subscriber.next(value); }));
      });
  }

  function catchError(selector) {
      return operate(function (source, subscriber) {
          var innerSub = null;
          var syncUnsub = false;
          var handledResult;
          innerSub = source.subscribe(createOperatorSubscriber(subscriber, undefined, undefined, function (err) {
              handledResult = innerFrom(selector(err, catchError(selector)(source)));
              if (innerSub) {
                  innerSub.unsubscribe();
                  innerSub = null;
                  handledResult.subscribe(subscriber);
              }
              else {
                  syncUnsub = true;
              }
          }));
          if (syncUnsub) {
              innerSub.unsubscribe();
              innerSub = null;
              handledResult.subscribe(subscriber);
          }
      });
  }

  function scanInternals(accumulator, seed, hasSeed, emitOnNext, emitBeforeComplete) {
      return function (source, subscriber) {
          var hasState = hasSeed;
          var state = seed;
          var index = 0;
          source.subscribe(createOperatorSubscriber(subscriber, function (value) {
              var i = index++;
              state = hasState
                  ?
                      accumulator(state, value, i)
                  :
                      ((hasState = true), value);
              emitOnNext && subscriber.next(state);
          }, emitBeforeComplete &&
              (function () {
                  hasState && subscriber.next(state);
                  subscriber.complete();
              })));
      };
  }

  function reduce(accumulator, seed) {
      return operate(scanInternals(accumulator, seed, arguments.length >= 2, false, true));
  }

  var arrReducer = function (arr, value) { return (arr.push(value), arr); };
  function toArray() {
      return operate(function (source, subscriber) {
          reduce(arrReducer, [])(source).subscribe(subscriber);
      });
  }

  function fromSubscribable(subscribable) {
      return new Observable(function (subscriber) { return subscribable.subscribe(subscriber); });
  }

  var DEFAULT_CONFIG = {
      connector: function () { return new Subject(); },
  };
  function connect(selector, config) {
      if (config === void 0) { config = DEFAULT_CONFIG; }
      var connector = config.connector;
      return operate(function (source, subscriber) {
          var subject = connector();
          from(selector(fromSubscribable(subject))).subscribe(subscriber);
          subscriber.add(source.subscribe(subject));
      });
  }

  function defaultIfEmpty(defaultValue) {
      return operate(function (source, subscriber) {
          var hasValue = false;
          source.subscribe(createOperatorSubscriber(subscriber, function (value) {
              hasValue = true;
              subscriber.next(value);
          }, function () {
              if (!hasValue) {
                  subscriber.next(defaultValue);
              }
              subscriber.complete();
          }));
      });
  }

  function take(count) {
      return count <= 0
          ?
              function () { return EMPTY; }
          : operate(function (source, subscriber) {
              var seen = 0;
              source.subscribe(createOperatorSubscriber(subscriber, function (value) {
                  if (++seen <= count) {
                      subscriber.next(value);
                      if (count <= seen) {
                          subscriber.complete();
                      }
                  }
              }));
          });
  }

  function mapTo(value) {
      return map(function () { return value; });
  }

  function distinctUntilChanged(comparator, keySelector) {
      if (keySelector === void 0) { keySelector = identity$2; }
      comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
      return operate(function (source, subscriber) {
          var previousKey;
          var first = true;
          source.subscribe(createOperatorSubscriber(subscriber, function (value) {
              var currentKey = keySelector(value);
              if (first || !comparator(previousKey, currentKey)) {
                  first = false;
                  previousKey = currentKey;
                  subscriber.next(value);
              }
          }));
      });
  }
  function defaultCompare(a, b) {
      return a === b;
  }

  function throwIfEmpty(errorFactory) {
      if (errorFactory === void 0) { errorFactory = defaultErrorFactory; }
      return operate(function (source, subscriber) {
          var hasValue = false;
          source.subscribe(createOperatorSubscriber(subscriber, function (value) {
              hasValue = true;
              subscriber.next(value);
          }, function () { return (hasValue ? subscriber.complete() : subscriber.error(errorFactory())); }));
      });
  }
  function defaultErrorFactory() {
      return new EmptyError();
  }

  function first(predicate, defaultValue) {
      var hasDefaultValue = arguments.length >= 2;
      return function (source) {
          return source.pipe(predicate ? filter(function (v, i) { return predicate(v, i, source); }) : identity$2, take(1), hasDefaultValue ? defaultIfEmpty(defaultValue) : throwIfEmpty(function () { return new EmptyError(); }));
      };
  }

  function multicast(subjectOrSubjectFactory, selector) {
      var subjectFactory = isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : function () { return subjectOrSubjectFactory; };
      if (isFunction(selector)) {
          return connect(selector, {
              connector: subjectFactory,
          });
      }
      return function (source) { return new ConnectableObservable(source, subjectFactory); };
  }

  function publishReplay(bufferSize, windowTime, selectorOrScheduler, timestampProvider) {
      if (selectorOrScheduler && !isFunction(selectorOrScheduler)) {
          timestampProvider = selectorOrScheduler;
      }
      var selector = isFunction(selectorOrScheduler) ? selectorOrScheduler : undefined;
      return function (source) { return multicast(new ReplaySubject(bufferSize, windowTime, timestampProvider), selector)(source); };
  }

  function startWith() {
      var values = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          values[_i] = arguments[_i];
      }
      var scheduler = popScheduler(values);
      return operate(function (source, subscriber) {
          (scheduler ? concat(values, source, scheduler) : concat(values, source)).subscribe(subscriber);
      });
  }

  function switchMap(project, resultSelector) {
      return operate(function (source, subscriber) {
          var innerSubscriber = null;
          var index = 0;
          var isComplete = false;
          var checkComplete = function () { return isComplete && !innerSubscriber && subscriber.complete(); };
          source.subscribe(createOperatorSubscriber(subscriber, function (value) {
              innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
              var innerIndex = 0;
              var outerIndex = index++;
              innerFrom(project(value, outerIndex)).subscribe((innerSubscriber = createOperatorSubscriber(subscriber, function (innerValue) { return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue); }, function () {
                  innerSubscriber = null;
                  checkComplete();
              })));
          }, function () {
              isComplete = true;
              checkComplete();
          }));
      });
  }

  function tap(observerOrNext, error, complete) {
      var tapObserver = isFunction(observerOrNext) || error || complete
          ?
              { next: observerOrNext, error: error, complete: complete }
          : observerOrNext;
      return tapObserver
          ? operate(function (source, subscriber) {
              var _a;
              (_a = tapObserver.subscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
              var isUnsub = true;
              source.subscribe(createOperatorSubscriber(subscriber, function (value) {
                  var _a;
                  (_a = tapObserver.next) === null || _a === void 0 ? void 0 : _a.call(tapObserver, value);
                  subscriber.next(value);
              }, function () {
                  var _a;
                  isUnsub = false;
                  (_a = tapObserver.complete) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                  subscriber.complete();
              }, function (err) {
                  var _a;
                  isUnsub = false;
                  (_a = tapObserver.error) === null || _a === void 0 ? void 0 : _a.call(tapObserver, err);
                  subscriber.error(err);
              }, function () {
                  var _a, _b;
                  if (isUnsub) {
                      (_a = tapObserver.unsubscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                  }
                  (_b = tapObserver.finalize) === null || _b === void 0 ? void 0 : _b.call(tapObserver);
              }));
          })
          :
              identity$2;
  }

  function refCountDelay(delay = 1750) {
    return source => {
      let [state, refCount, connection, scheduler] = [0, 0, Subscription.EMPTY, Subscription.EMPTY];
      return new Observable(ob => {
        source.subscribe(ob);
        if (refCount++ === 0) {
          if (state === 1) {
            scheduler.unsubscribe();
          } else {
            connection = source.connect();
          }
          state = 3;
        }
        return () => {
          if (--refCount === 0) {
            if (state === 2) {
              state = 0;
              scheduler.unsubscribe();
            } else {
              state = 1;
              scheduler = asapScheduler.schedule(() => {
                state = 0;
                connection.unsubscribe();
              }, delay);
            }
          }
        };
      });
    };
  }

  const l$5 = util.logger('drr');
  const CMP = (a, b) => util.stringify({
    t: a
  }) === util.stringify({
    t: b
  });
  const ERR = error => {
    l$5.error(error.message);
    throw error;
  };
  const NOOP = () => undefined;
  const drr = ({
    delay,
    skipChange = false,
    skipTimeout = false
  } = {}) => source$ => source$.pipe(catchError(ERR), skipChange ? tap(NOOP) : distinctUntilChanged(CMP), publishReplay(1), skipTimeout ? refCount() : refCountDelay(delay));

  function memo(instanceId, inner) {
    const options = {
      getInstanceId: () => instanceId
    };
    const cached = util.memoize((...params) => new Observable(observer => {
      const subscription = inner(...params).subscribe(observer);
      return () => {
        cached.unmemoize(...params);
        subscription.unsubscribe();
      };
    }).pipe(drr()), options);
    return cached;
  }

  ({
    name: '@polkadot/rpc-core',
    path: (({ url: (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href)) }) && (typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))) ? new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.substring(0, new URL((typeof document === 'undefined' && typeof location === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : typeof document === 'undefined' ? location.href : (document.currentScript && document.currentScript.src || new URL('bundle-polkadot-api.js', document.baseURI).href))).pathname.lastIndexOf('/') + 1) : 'auto',
    type: 'esm',
    version: '8.11.1'
  });

  const l$4 = util.logger('rpc-core');
  const EMPTY_META = {
    fallback: undefined,
    modifier: {
      isOptional: true
    },
    type: {
      asMap: {
        linked: {
          isTrue: false
        }
      },
      isMap: false
    }
  };
  function logErrorMessage(method, {
    noErrorLog,
    params,
    type
  }, error) {
    if (noErrorLog) {
      return;
    }
    const inputs = params.map(({
      isOptional,
      name,
      type
    }) => `${name}${isOptional ? '?' : ''}: ${type}`).join(', ');
    l$4.error(`${method}(${inputs}): ${type}:: ${error.message}`);
  }
  function isTreatAsHex(key) {
    return ['0x3a636f6465'].includes(key.toHex());
  }
  class RpcCore {
    #instanceId;
    #registryDefault;
    #getBlockRegistry;
    #getBlockHash;
    #storageCache = new Map();
    mapping = new Map();
    sections = [];
    constructor(instanceId, registry, provider, userRpc = {}) {
      if (!provider || !util.isFunction(provider.send)) {
        throw new Error('Expected Provider to API create');
      }
      this.#instanceId = instanceId;
      this.#registryDefault = registry;
      this.provider = provider;
      const sectionNames = Object.keys(types.rpcDefinitions);
      this.sections.push(...sectionNames);
      this.addUserInterfaces(userRpc);
    }
    get isConnected() {
      return this.provider.isConnected;
    }
    connect() {
      return this.provider.connect();
    }
    disconnect() {
      return this.provider.disconnect();
    }
    setRegistrySwap(registrySwap) {
      this.#getBlockRegistry = util.memoize(registrySwap, {
        getInstanceId: () => this.#instanceId
      });
    }
    setResolveBlockHash(resolveBlockHash) {
      this.#getBlockHash = util.memoize(resolveBlockHash, {
        getInstanceId: () => this.#instanceId
      });
    }
    addUserInterfaces(userRpc) {
      this.sections.push(...Object.keys(userRpc).filter(k => !this.sections.includes(k)));
      for (let s = 0; s < this.sections.length; s++) {
        const section = this.sections[s];
        const defs = util.objectSpread({}, types.rpcDefinitions[section], userRpc[section]);
        const methods = Object.keys(defs);
        for (let m = 0; m < methods.length; m++) {
          const method = methods[m];
          const def = defs[method];
          const jsonrpc = def.endpoint || `${section}_${method}`;
          if (!this.mapping.has(jsonrpc)) {
            const isSubscription = !!def.pubsub;
            if (!this[section]) {
              this[section] = {};
            }
            this.mapping.set(jsonrpc, util.objectSpread({}, def, {
              isSubscription,
              jsonrpc,
              method,
              section
            }));
            util.lazyMethod(this[section], method, () => isSubscription ? this._createMethodSubscribe(section, method, def) : this._createMethodSend(section, method, def));
          }
        }
      }
    }
    _memomize(creator, def) {
      const memoOpts = {
        getInstanceId: () => this.#instanceId
      };
      const memoized = util.memoize(creator(true), memoOpts);
      memoized.raw = util.memoize(creator(false), memoOpts);
      memoized.meta = def;
      return memoized;
    }
    _formatResult(isScale, registry, blockHash, method, def, params, result) {
      return isScale ? this._formatOutput(registry, blockHash, method, def, params, result) : result;
    }
    _createMethodSend(section, method, def) {
      const rpcName = def.endpoint || `${section}_${method}`;
      const hashIndex = def.params.findIndex(({
        isHistoric
      }) => isHistoric);
      let memoized = null;
      const callWithRegistry = async (isScale, values) => {
        var _this$getBlockHash;
        const blockId = hashIndex === -1 ? null : values[hashIndex];
        const blockHash = blockId && def.params[hashIndex].type === 'BlockNumber' ? await ((_this$getBlockHash = this.#getBlockHash) === null || _this$getBlockHash === void 0 ? void 0 : _this$getBlockHash.call(this, blockId)) : blockId;
        const {
          registry
        } = isScale && blockHash && this.#getBlockRegistry ? await this.#getBlockRegistry(util.u8aToU8a(blockHash)) : {
          registry: this.#registryDefault
        };
        const params = this._formatInputs(registry, null, def, values);
        const result = await this.provider.send(rpcName, params.map(p => p.toJSON()), !!blockHash);
        return this._formatResult(isScale, registry, blockHash, method, def, params, result);
      };
      const creator = isScale => (...values) => {
        const isDelayed = isScale && hashIndex !== -1 && !!values[hashIndex];
        return new Observable(observer => {
          callWithRegistry(isScale, values).then(value => {
            observer.next(value);
            observer.complete();
          }).catch(error => {
            logErrorMessage(method, def, error);
            observer.error(error);
            observer.complete();
          });
          return () => {
            if (isScale) {
              var _memoized;
              (_memoized = memoized) === null || _memoized === void 0 ? void 0 : _memoized.unmemoize(...values);
            } else {
              var _memoized2;
              (_memoized2 = memoized) === null || _memoized2 === void 0 ? void 0 : _memoized2.raw.unmemoize(...values);
            }
          };
        }).pipe(publishReplay(1),
        isDelayed ? refCountDelay()
        : refCount());
      };
      memoized = this._memomize(creator, def);
      return memoized;
    }
    _createSubscriber({
      paramsJson,
      subName,
      subType,
      update
    }, errorHandler) {
      return new Promise((resolve, reject) => {
        this.provider.subscribe(subType, subName, paramsJson, update).then(resolve).catch(error => {
          errorHandler(error);
          reject(error);
        });
      });
    }
    _createMethodSubscribe(section, method, def) {
      const [updateType, subMethod, unsubMethod] = def.pubsub;
      const subName = `${section}_${subMethod}`;
      const unsubName = `${section}_${unsubMethod}`;
      const subType = `${section}_${updateType}`;
      let memoized = null;
      const creator = isScale => (...values) => {
        return new Observable(observer => {
          let subscriptionPromise = Promise.resolve(null);
          const registry = this.#registryDefault;
          const errorHandler = error => {
            logErrorMessage(method, def, error);
            observer.error(error);
          };
          try {
            const params = this._formatInputs(registry, null, def, values);
            const paramsJson = params.map(p => p.toJSON());
            const update = (error, result) => {
              if (error) {
                logErrorMessage(method, def, error);
                return;
              }
              try {
                observer.next(this._formatResult(isScale, registry, null, method, def, params, result));
              } catch (error) {
                observer.error(error);
              }
            };
            subscriptionPromise = this._createSubscriber({
              paramsJson,
              subName,
              subType,
              update
            }, errorHandler);
          } catch (error) {
            errorHandler(error);
          }
          return () => {
            if (isScale) {
              var _memoized3;
              (_memoized3 = memoized) === null || _memoized3 === void 0 ? void 0 : _memoized3.unmemoize(...values);
            } else {
              var _memoized4;
              (_memoized4 = memoized) === null || _memoized4 === void 0 ? void 0 : _memoized4.raw.unmemoize(...values);
            }
            subscriptionPromise.then(subscriptionId => util.isNull(subscriptionId) ? Promise.resolve(false) : this.provider.unsubscribe(subType, unsubName, subscriptionId)).catch(error => logErrorMessage(method, def, error));
          };
        }).pipe(drr());
      };
      memoized = this._memomize(creator, def);
      return memoized;
    }
    _formatInputs(registry, blockHash, def, inputs) {
      const reqArgCount = def.params.filter(({
        isOptional
      }) => !isOptional).length;
      const optText = reqArgCount === def.params.length ? '' : ` (${def.params.length - reqArgCount} optional)`;
      if (inputs.length < reqArgCount || inputs.length > def.params.length) {
        throw new Error(`Expected ${def.params.length} parameters${optText}, ${inputs.length} found instead`);
      }
      return inputs.map((input, index) => registry.createTypeUnsafe(def.params[index].type, [input], {
        blockHash
      }));
    }
    _formatOutput(registry, blockHash, method, rpc, params, result) {
      if (rpc.type === 'StorageData') {
        const key = params[0];
        return this._formatStorageData(registry, blockHash, key, result);
      } else if (rpc.type === 'StorageChangeSet') {
        const keys = params[0];
        return keys ? this._formatStorageSet(registry, result.block, keys, result.changes) : registry.createType('StorageChangeSet', result);
      } else if (rpc.type === 'Vec<StorageChangeSet>') {
        const mapped = result.map(({
          block,
          changes
        }) => [registry.createType('Hash', block), this._formatStorageSet(registry, block, params[0], changes)]);
        return method === 'queryStorageAt' ? mapped[0][1] : mapped;
      }
      return registry.createTypeUnsafe(rpc.type, [result], {
        blockHash
      });
    }
    _formatStorageData(registry, blockHash, key, value) {
      const isEmpty = util.isNull(value);
      const input = isEmpty ? null : isTreatAsHex(key) ? value : util.u8aToU8a(value);
      return this._newType(registry, blockHash, key, input, isEmpty);
    }
    _formatStorageSet(registry, blockHash, keys, changes) {
      const withCache = keys.length !== 1;
      return keys.reduce((results, key, index) => {
        results.push(this._formatStorageSetEntry(registry, blockHash, key, changes, withCache, index));
        return results;
      }, []);
    }
    _formatStorageSetEntry(registry, blockHash, key, changes, withCache, entryIndex) {
      const hexKey = key.toHex();
      const found = changes.find(([key]) => key === hexKey);
      const isNotFound = util.isUndefined(found);
      if (isNotFound && withCache) {
        const cached = this.#storageCache.get(hexKey);
        if (cached) {
          return cached;
        }
      }
      const value = isNotFound ? null : found[1];
      const isEmpty = util.isNull(value);
      const input = isEmpty || isTreatAsHex(key) ? value : util.u8aToU8a(value);
      const codec = this._newType(registry, blockHash, key, input, isEmpty, entryIndex);
      this.#storageCache.set(hexKey, codec);
      return codec;
    }
    _newType(registry, blockHash, key, input, isEmpty, entryIndex = -1) {
      const type = key.outputType || 'Raw';
      const meta = key.meta || EMPTY_META;
      const entryNum = entryIndex === -1 ? '' : ` entry ${entryIndex}:`;
      try {
        return registry.createTypeUnsafe(type, [isEmpty ? meta.fallback
        ? type.includes('Linkage<') ? util.u8aConcat(util.hexToU8a(meta.fallback.toHex()), new Uint8Array(2)) : util.hexToU8a(meta.fallback.toHex()) : undefined : meta.modifier.isOptional ? registry.createTypeUnsafe(type, [input], {
          blockHash,
          isPedantic: true
        }) : input], {
          blockHash,
          isOptional: meta.modifier.isOptional,
          isPedantic: !meta.modifier.isOptional
        });
      } catch (error) {
        throw new Error(`Unable to decode storage ${key.section || 'unknown'}.${key.method || 'unknown'}:${entryNum}: ${error.message}`);
      }
    }
  }

  const deriveNoopCache = {
    del: () => undefined,
    forEach: () => undefined,
    get: () => undefined,
    set: (_, value) => value
  };

  const CHACHE_EXPIRY = 7 * (24 * 60) * (60 * 1000);
  let deriveCache;
  function wrapCache(keyStart, cache) {
    return {
      del: partial => cache.del(`${keyStart}${partial}`),
      forEach: cache.forEach,
      get: partial => {
        const key = `${keyStart}${partial}`;
        const cached = cache.get(key);
        if (cached) {
          cached.x = Date.now();
          cache.set(key, cached);
          return cached.v;
        }
        return undefined;
      },
      set: (partial, v) => {
        cache.set(`${keyStart}${partial}`, {
          v,
          x: Date.now()
        });
      }
    };
  }
  function clearCache(cache) {
    const now = Date.now();
    const all = [];
    cache.forEach((key, {
      x
    }) => {
      now - x > CHACHE_EXPIRY && all.push(key);
    });
    all.forEach(key => cache.del(key));
  }
  function setDeriveCache(prefix = '', cache) {
    deriveCache = cache ? wrapCache(`derive:${prefix}:`, cache) : deriveNoopCache;
    if (cache) {
      clearCache(cache);
    }
  }
  setDeriveCache();

  function firstObservable(obs) {
    return obs.pipe(map(([a]) => a));
  }
  function firstMemo(fn) {
    return (instanceId, api) => memo(instanceId, (...args) => firstObservable(fn(api, ...args)));
  }

  function lazyDeriveSection(result, section, getKeys, creator) {
    util.lazyMethod(result, section, () => util.lazyMethods({}, getKeys(section), method => creator(section, method)));
  }

  function accountId(instanceId, api) {
    return memo(instanceId, address => {
      const decoded = util.isU8a(address) ? address : utilCrypto.decodeAddress((address || '').toString());
      if (decoded.length > 8) {
        return of(api.registry.createType('AccountId', decoded));
      }
      const accountIndex = api.registry.createType('AccountIndex', decoded);
      return api.derive.accounts.indexToId(accountIndex.toString()).pipe(map(a => util.assertReturn(a, 'Unable to retrieve accountId')));
    });
  }

  function parseFlags(address, [electionsMembers, councilMembers, technicalCommitteeMembers, societyMembers, sudoKey]) {
    const addrStr = address && address.toString();
    const isIncluded = id => id.toString() === addrStr;
    return {
      isCouncil: ((electionsMembers === null || electionsMembers === void 0 ? void 0 : electionsMembers.map(r => Array.isArray(r) ? r[0] : r.who)) || councilMembers || []).some(isIncluded),
      isSociety: (societyMembers || []).some(isIncluded),
      isSudo: (sudoKey === null || sudoKey === void 0 ? void 0 : sudoKey.toString()) === addrStr,
      isTechCommittee: (technicalCommitteeMembers || []).some(isIncluded)
    };
  }
  function _flags(instanceId, api) {
    return memo(instanceId, () => {
      var _ref, _api$query$council, _api$query$technicalC, _api$query$society, _api$query$sudo;
      const results = [undefined, [], [], [], undefined];
      const calls = [(_ref = api.query.phragmenElection || api.query.electionsPhragmen || api.query.elections) === null || _ref === void 0 ? void 0 : _ref.members, (_api$query$council = api.query.council) === null || _api$query$council === void 0 ? void 0 : _api$query$council.members, (_api$query$technicalC = api.query.technicalCommittee) === null || _api$query$technicalC === void 0 ? void 0 : _api$query$technicalC.members, (_api$query$society = api.query.society) === null || _api$query$society === void 0 ? void 0 : _api$query$society.members, (_api$query$sudo = api.query.sudo) === null || _api$query$sudo === void 0 ? void 0 : _api$query$sudo.key];
      const filtered = calls.filter(c => c);
      if (!filtered.length) {
        return of(results);
      }
      return api.queryMulti(filtered).pipe(map(values => {
        let resultIndex = -1;
        for (let i = 0; i < calls.length; i++) {
          if (util.isFunction(calls[i])) {
            results[i] = values[++resultIndex];
          }
        }
        return results;
      }));
    });
  }
  function flags(instanceId, api) {
    return memo(instanceId, address => api.derive.accounts._flags().pipe(map(r => parseFlags(address, r))));
  }

  function idAndIndex(instanceId, api) {
    return memo(instanceId, address => {
      try {
        const decoded = util.isU8a(address) ? address : utilCrypto.decodeAddress((address || '').toString());
        if (decoded.length > 8) {
          const accountId = api.registry.createType('AccountId', decoded);
          return api.derive.accounts.idToIndex(accountId).pipe(map(accountIndex => [accountId, accountIndex]));
        }
        const accountIndex = api.registry.createType('AccountIndex', decoded);
        return api.derive.accounts.indexToId(accountIndex.toString()).pipe(map(accountId => [accountId, accountIndex]));
      } catch (error) {
        return of([undefined, undefined]);
      }
    });
  }

  function idToIndex(instanceId, api) {
    return memo(instanceId, accountId => api.derive.accounts.indexes().pipe(map(indexes => (indexes || {})[accountId.toString()])));
  }

  const UNDEF_HEX = {
    toHex: () => undefined
  };
  function dataAsString(data) {
    return data.isRaw ? util.u8aToString(data.asRaw.toU8a(true)) : data.isNone ? undefined : data.toHex();
  }
  function extractOther(additional) {
    return additional.reduce((other, [_key, _value]) => {
      const key = dataAsString(_key);
      const value = dataAsString(_value);
      if (key && value) {
        other[key] = value;
      }
      return other;
    }, {});
  }
  function extractIdentity(identityOfOpt, superOf) {
    if (!(identityOfOpt !== null && identityOfOpt !== void 0 && identityOfOpt.isSome)) {
      return {
        judgements: []
      };
    }
    const {
      info,
      judgements
    } = identityOfOpt.unwrap();
    const topDisplay = dataAsString(info.display);
    return {
      display: superOf && dataAsString(superOf[1]) || topDisplay,
      displayParent: superOf && topDisplay,
      email: dataAsString(info.email),
      image: dataAsString(info.image),
      judgements,
      legal: dataAsString(info.legal),
      other: extractOther(info.additional),
      parent: superOf && superOf[0],
      pgp: info.pgpFingerprint.unwrapOr(UNDEF_HEX).toHex(),
      riot: dataAsString(info.riot),
      twitter: dataAsString(info.twitter),
      web: dataAsString(info.web)
    };
  }
  function getParent(api, identityOfOpt, superOfOpt) {
    if (identityOfOpt !== null && identityOfOpt !== void 0 && identityOfOpt.isSome) {
      return of([identityOfOpt, undefined]);
    } else if (superOfOpt !== null && superOfOpt !== void 0 && superOfOpt.isSome) {
      const superOf = superOfOpt.unwrap();
      return combineLatest([api.derive.accounts._identity(superOf[0]).pipe(map(([info]) => info)), of(superOf)]);
    }
    return of([undefined, undefined]);
  }
  function _identity(instanceId, api) {
    return memo(instanceId, accountId => {
      var _api$query$identity;
      return accountId && (_api$query$identity = api.query.identity) !== null && _api$query$identity !== void 0 && _api$query$identity.identityOf ? combineLatest([api.query.identity.identityOf(accountId), api.query.identity.superOf(accountId)]) : of([undefined, undefined]);
    });
  }
  function identity$1(instanceId, api) {
    return memo(instanceId, accountId => api.derive.accounts._identity(accountId).pipe(switchMap(([identityOfOpt, superOfOpt]) => getParent(api, identityOfOpt, superOfOpt)), map(([identityOfOpt, superOf]) => extractIdentity(identityOfOpt, superOf))));
  }
  const hasIdentity = firstMemo((api, accountId) => api.derive.accounts.hasIdentityMulti([accountId]));
  function hasIdentityMulti(instanceId, api) {
    return memo(instanceId, accountIds => {
      var _api$query$identity2;
      return (_api$query$identity2 = api.query.identity) !== null && _api$query$identity2 !== void 0 && _api$query$identity2.identityOf ? combineLatest([api.query.identity.identityOf.multi(accountIds), api.query.identity.superOf.multi(accountIds)]).pipe(map(([identities, supers]) => identities.map((identityOfOpt, index) => {
        const superOfOpt = supers[index];
        const parentId = superOfOpt && superOfOpt.isSome ? superOfOpt.unwrap()[0].toString() : undefined;
        let display;
        if (identityOfOpt && identityOfOpt.isSome) {
          const value = dataAsString(identityOfOpt.unwrap().info.display);
          if (value && !util.isHex(value)) {
            display = value;
          }
        }
        return {
          display,
          hasIdentity: !!(display || parentId),
          parentId
        };
      }))) : of(accountIds.map(() => ({
        hasIdentity: false
      })));
    });
  }

  function indexToId(instanceId, api) {
    return memo(instanceId, accountIndex => api.query.indices ? api.query.indices.accounts(accountIndex).pipe(map(optResult => optResult.unwrapOr([])[0])) : of(undefined));
  }

  let indicesCache = null;
  function queryAccounts(api) {
    return api.query.indices.accounts.entries().pipe(map(entries => entries.reduce((indexes, [key, idOpt]) => {
      if (idOpt.isSome) {
        indexes[idOpt.unwrap()[0].toString()] = api.registry.createType('AccountIndex', key.args[0]);
      }
      return indexes;
    }, {})));
  }
  function indexes$1(instanceId, api) {
    return memo(instanceId, () => indicesCache ? of(indicesCache) : (api.query.indices ? queryAccounts(api).pipe(startWith({})) : of({})).pipe(map(indices => {
      indicesCache = indices;
      return indices;
    })));
  }

  function retrieveNick(api, accountId) {
    var _api$query$nicks;
    return (accountId && (_api$query$nicks = api.query.nicks) !== null && _api$query$nicks !== void 0 && _api$query$nicks.nameOf ? api.query.nicks.nameOf(accountId) : of(undefined)).pipe(map(nameOf => nameOf !== null && nameOf !== void 0 && nameOf.isSome ? util.u8aToString(nameOf.unwrap()[0]).substring(0, api.consts.nicks.maxLength.toNumber()) : undefined));
  }
  function info$4(instanceId, api) {
    return memo(instanceId, address => api.derive.accounts.idAndIndex(address).pipe(switchMap(([accountId, accountIndex]) => combineLatest([of({
      accountId,
      accountIndex
    }), api.derive.accounts.identity(accountId), retrieveNick(api, accountId)])), map(([{
      accountId,
      accountIndex
    }, identity, nickname]) => ({
      accountId,
      accountIndex,
      identity,
      nickname
    }))));
  }

  const accounts$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    accountId: accountId,
    _flags: _flags,
    flags: flags,
    idAndIndex: idAndIndex,
    idToIndex: idToIndex,
    _identity: _identity,
    identity: identity$1,
    hasIdentity: hasIdentity,
    hasIdentityMulti: hasIdentityMulti,
    indexToId: indexToId,
    indexes: indexes$1,
    info: info$4
  });

  function orderBags(ids, bags) {
    const sorted = ids.map((id, index) => ({
      bag: bags[index].unwrapOr(null),
      id,
      key: id.toString()
    })).sort((a, b) => b.id.cmp(a.id)).map((base, index) => ({ ...base,
      bagLower: util.BN_ZERO,
      bagUpper: base.id,
      index
    }));
    const max = sorted.length - 1;
    return sorted.map((entry, index) => index === max ? entry
    : { ...entry,
      bagLower: sorted[index + 1].bagUpper
    });
  }
  function _getIds(instanceId, api) {
    return memo(instanceId, _ids => {
      const ids = _ids.map(id => util.bnToBn(id));
      return ids.length ? (api.query.voterList || api.query.bagsList).listBags.multi(ids).pipe(map(bags => orderBags(ids, bags))) : of([]);
    });
  }
  function all$1(instanceId, api) {
    return memo(instanceId, () => (api.query.voterList || api.query.bagsList).listBags.keys().pipe(switchMap(keys => api.derive.bagsList._getIds(keys.map(({
      args: [id]
    }) => id))), map(list => list.filter(({
      bag
    }) => bag))));
  }
  function get(instanceId, api) {
    return memo(instanceId, id => api.derive.bagsList._getIds([util.bnToBn(id)]).pipe(map(bags => bags[0])));
  }

  function expand(instanceId, api) {
    return memo(instanceId, bag => api.derive.bagsList.listNodes(bag.bag).pipe(map(nodes => ({ ...bag,
      nodes
    }))));
  }
  function getExpanded(instanceId, api) {
    return memo(instanceId, id => api.derive.bagsList.get(id).pipe(switchMap(bag => api.derive.bagsList.expand(bag))));
  }

  function traverseLinks(api, head) {
    const subject = new BehaviorSubject(head);
    return subject.pipe(switchMap(account => (api.query.voterList || api.query.bagsList).listNodes(account)), tap(node => {
      util.nextTick(() => {
        node.isSome && node.value.next.isSome ? subject.next(node.unwrap().next.unwrap()) : subject.complete();
      });
    }), toArray(),
    map(all => all.map(o => o.unwrap())));
  }
  function listNodes(instanceId, api) {
    return memo(instanceId, bag => bag && bag.head.isSome ? traverseLinks(api, bag.head.unwrap()) : of([]));
  }

  const bagsList = /*#__PURE__*/Object.freeze({
    __proto__: null,
    _getIds: _getIds,
    all: all$1,
    get: get,
    expand: expand,
    getExpanded: getExpanded,
    listNodes: listNodes
  });

  const VESTING_ID = '0x76657374696e6720';
  function calcLocked(api, bestNumber, locks) {
    let lockedBalance = api.registry.createType('Balance');
    let lockedBreakdown = [];
    let vestingLocked = api.registry.createType('Balance');
    let allLocked = false;
    if (Array.isArray(locks)) {
      lockedBreakdown = locks.filter(({
        until
      }) => !until || bestNumber && until.gt(bestNumber));
      allLocked = lockedBreakdown.some(({
        amount
      }) => amount && amount.isMax());
      vestingLocked = api.registry.createType('Balance', lockedBreakdown.filter(({
        id
      }) => id.eq(VESTING_ID)).reduce((result, {
        amount
      }) => result.iadd(amount), new util.BN(0)));
      const notAll = lockedBreakdown.filter(({
        amount
      }) => amount && !amount.isMax());
      if (notAll.length) {
        lockedBalance = api.registry.createType('Balance', util.bnMax(...notAll.map(({
          amount
        }) => amount)));
      }
    }
    return {
      allLocked,
      lockedBalance,
      lockedBreakdown,
      vestingLocked
    };
  }
  function calcShared(api, bestNumber, data, locks) {
    const {
      allLocked,
      lockedBalance,
      lockedBreakdown,
      vestingLocked
    } = calcLocked(api, bestNumber, locks);
    return { ...data,
      availableBalance: api.registry.createType('Balance', allLocked ? 0 : util.bnMax(new util.BN(0), data.freeBalance.sub(lockedBalance))),
      lockedBalance,
      lockedBreakdown,
      vestingLocked
    };
  }
  function calcVesting(bestNumber, shared, _vesting) {
    const vesting = _vesting || [];
    const isVesting = !shared.vestingLocked.isZero();
    const vestedBalances = vesting.map(({
      locked,
      perBlock,
      startingBlock
    }) => bestNumber.gt(startingBlock) ? util.bnMin(locked, perBlock.mul(bestNumber.sub(startingBlock))) : util.BN_ZERO);
    const vestedBalance = vestedBalances.reduce((all, value) => all.iadd(value), new util.BN(0));
    const vestingTotal = vesting.reduce((all, {
      locked
    }) => all.iadd(locked), new util.BN(0));
    return {
      isVesting,
      vestedBalance,
      vestedClaimable: isVesting ? shared.vestingLocked.sub(vestingTotal.sub(vestedBalance)) : util.BN_ZERO,
      vesting: vesting.map(({
        locked,
        perBlock,
        startingBlock
      }, index) => ({
        endBlock: locked.div(perBlock).iadd(startingBlock),
        locked,
        perBlock,
        startingBlock,
        vested: vestedBalances[index]
      })).filter(({
        locked
      }) => !locked.isZero()),
      vestingTotal
    };
  }
  function calcBalances$1(api, [data, [vesting, allLocks, namedReserves], bestNumber]) {
    const shared = calcShared(api, bestNumber, data, allLocks[0]);
    return { ...shared,
      ...calcVesting(bestNumber, shared, vesting),
      accountId: data.accountId,
      accountNonce: data.accountNonce,
      additional: allLocks.filter((_, index) => index !== 0).map((l, index) => calcShared(api, bestNumber, data.additional[index], l)),
      namedReserves
    };
  }
  function queryOld(api, accountId) {
    return combineLatest([api.query.balances.locks(accountId), api.query.balances.vesting(accountId)]).pipe(map(([locks, optVesting]) => {
      let vestingNew = null;
      if (optVesting.isSome) {
        const {
          offset: locked,
          perBlock,
          startingBlock
        } = optVesting.unwrap();
        vestingNew = api.registry.createType('VestingInfo', {
          locked,
          perBlock,
          startingBlock
        });
      }
      return [vestingNew ? [vestingNew] : null, [locks], []];
    }));
  }
  const isNonNullable = nullable => !!nullable;
  function createCalls(calls) {
    return [calls.map(c => !c), calls.filter(isNonNullable)];
  }
  function queryCurrent(api, accountId, balanceInstances = ['balances']) {
    var _api$query$vesting;
    const [lockEmpty, lockQueries] = createCalls(balanceInstances.map(m => {
      var _m, _api$query;
      return ((_m = api.derive[m]) === null || _m === void 0 ? void 0 : _m.customLocks) || ((_api$query = api.query[m]) === null || _api$query === void 0 ? void 0 : _api$query.locks);
    }));
    const [reserveEmpty, reserveQueries] = createCalls(balanceInstances.map(m => {
      var _api$query2;
      return (_api$query2 = api.query[m]) === null || _api$query2 === void 0 ? void 0 : _api$query2.reserves;
    }));
    return combineLatest([(_api$query$vesting = api.query.vesting) !== null && _api$query$vesting !== void 0 && _api$query$vesting.vesting ? api.query.vesting.vesting(accountId) : of(api.registry.createType('Option<VestingInfo>')), lockQueries.length ? combineLatest(lockQueries.map(c => c(accountId))) : of([]), reserveQueries.length ? combineLatest(reserveQueries.map(c => c(accountId))) : of([])]).pipe(map(([opt, locks, reserves]) => {
      let offsetLock = -1;
      let offsetReserve = -1;
      const vesting = opt.unwrapOr(null);
      return [vesting ? Array.isArray(vesting) ? vesting : [vesting] : null, lockEmpty.map(e => e ? api.registry.createType('Vec<BalanceLock>') : locks[++offsetLock]), reserveEmpty.map(e => e ? api.registry.createType('Vec<PalletBalancesReserveData>') : reserves[++offsetReserve])];
    }));
  }
  function all(instanceId, api) {
    const balanceInstances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'balances');
    return memo(instanceId, address => {
      var _api$query$system, _api$query$balances;
      return combineLatest([api.derive.balances.account(address), util.isFunction((_api$query$system = api.query.system) === null || _api$query$system === void 0 ? void 0 : _api$query$system.account) || util.isFunction((_api$query$balances = api.query.balances) === null || _api$query$balances === void 0 ? void 0 : _api$query$balances.account) ? queryCurrent(api, address, balanceInstances) : queryOld(api, address)]).pipe(switchMap(([account, locks]) => combineLatest([of(account), of(locks), api.derive.chain.bestNumber()])), map(result => calcBalances$1(api, result)));
    });
  }

  function zeroBalance(api) {
    return api.registry.createType('Balance');
  }
  function getBalance(api, [freeBalance, reservedBalance, frozenFee, frozenMisc]) {
    const votingBalance = api.registry.createType('Balance', freeBalance.toBn());
    return {
      freeBalance,
      frozenFee,
      frozenMisc,
      reservedBalance,
      votingBalance
    };
  }
  function calcBalances(api, [accountId, [accountNonce, [primary, ...additional]]]) {
    return {
      accountId,
      accountNonce,
      additional: additional.map(b => getBalance(api, b)),
      ...getBalance(api, primary)
    };
  }
  function queryBalancesFree(api, accountId) {
    return combineLatest([api.query.balances.freeBalance(accountId), api.query.balances.reservedBalance(accountId), api.query.system.accountNonce(accountId)]).pipe(map(([freeBalance, reservedBalance, accountNonce]) => [accountNonce, [[freeBalance, reservedBalance, zeroBalance(api), zeroBalance(api)]]]));
  }
  function queryNonceOnly(api, accountId) {
    const fill = nonce => [nonce, [[zeroBalance(api), zeroBalance(api), zeroBalance(api), zeroBalance(api)]]];
    return util.isFunction(api.query.system.account) ? api.query.system.account(accountId).pipe(map(({
      nonce
    }) => fill(nonce))) : util.isFunction(api.query.system.accountNonce) ? api.query.system.accountNonce(accountId).pipe(map(nonce => fill(nonce))) : of(fill(api.registry.createType('Index')));
  }
  function queryBalancesAccount(api, accountId, modules = ['balances']) {
    const balances = modules.map(m => {
      var _m, _api$query$m;
      return ((_m = api.derive[m]) === null || _m === void 0 ? void 0 : _m.customAccount) || ((_api$query$m = api.query[m]) === null || _api$query$m === void 0 ? void 0 : _api$query$m.account);
    }).filter(q => util.isFunction(q));
    const extract = (nonce, data) => [nonce, data.map(({
      feeFrozen,
      free,
      miscFrozen,
      reserved
    }) => [free, reserved, feeFrozen, miscFrozen])];
    return balances.length ? util.isFunction(api.query.system.account) ? combineLatest([api.query.system.account(accountId), ...balances.map(c => c(accountId))]).pipe(map(([{
      nonce
    }, ...balances]) => extract(nonce, balances))) : combineLatest([api.query.system.accountNonce(accountId), ...balances.map(c => c(accountId))]).pipe(map(([nonce, ...balances]) => extract(nonce, balances))) : queryNonceOnly(api, accountId);
  }
  function querySystemAccount(api, accountId) {
    return api.query.system.account(accountId).pipe(map(infoOrTuple => {
      const data = infoOrTuple.nonce ? infoOrTuple.data : infoOrTuple[1];
      const nonce = infoOrTuple.nonce || infoOrTuple[0];
      if (!data || data.isEmpty) {
        return [nonce, [[zeroBalance(api), zeroBalance(api), zeroBalance(api), zeroBalance(api)]]];
      }
      const {
        feeFrozen,
        free,
        miscFrozen,
        reserved
      } = data;
      return [nonce, [[free, reserved, feeFrozen, miscFrozen]]];
    }));
  }
  function account$1(instanceId, api) {
    const balanceInstances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'balances');
    return memo(instanceId, address => api.derive.accounts.accountId(address).pipe(switchMap(accountId => {
      var _api$query$system, _api$query$balances, _api$query$balances2;
      return accountId ? combineLatest([of(accountId), balanceInstances ? queryBalancesAccount(api, accountId, balanceInstances) : util.isFunction((_api$query$system = api.query.system) === null || _api$query$system === void 0 ? void 0 : _api$query$system.account) ? querySystemAccount(api, accountId) : util.isFunction((_api$query$balances = api.query.balances) === null || _api$query$balances === void 0 ? void 0 : _api$query$balances.account) ? queryBalancesAccount(api, accountId) : util.isFunction((_api$query$balances2 = api.query.balances) === null || _api$query$balances2 === void 0 ? void 0 : _api$query$balances2.freeBalance) ? queryBalancesFree(api, accountId) : queryNonceOnly(api, accountId)]) : of([api.registry.createType('AccountId'), [api.registry.createType('Index'), [[zeroBalance(api), zeroBalance(api), zeroBalance(api), zeroBalance(api)]]]]);
    }), map(result => calcBalances(api, result))));
  }

  function votingBalances(instanceId, api) {
    return memo(instanceId, addresses => !addresses || !addresses.length ? of([]) : combineLatest(addresses.map(accountId => api.derive.balances.account(accountId))));
  }

  const votingBalance = all;

  const balances = /*#__PURE__*/Object.freeze({
    __proto__: null,
    all: all,
    votingBalance: votingBalance,
    account: account$1,
    votingBalances: votingBalances
  });

  function filterBountiesProposals(api, allProposals) {
    const bountyTxBase = api.tx.bounties ? api.tx.bounties : api.tx.treasury;
    const bountyProposalCalls = [bountyTxBase.approveBounty, bountyTxBase.closeBounty, bountyTxBase.proposeCurator, bountyTxBase.unassignCurator];
    return allProposals.filter(proposal => bountyProposalCalls.find(bountyCall => proposal.proposal && bountyCall.is(proposal.proposal)));
  }

  function parseResult$2([maybeBounties, maybeDescriptions, ids, bountyProposals]) {
    const bounties = [];
    maybeBounties.forEach((bounty, index) => {
      if (bounty.isSome) {
        bounties.push({
          bounty: bounty.unwrap(),
          description: maybeDescriptions[index].unwrapOrDefault().toUtf8(),
          index: ids[index],
          proposals: bountyProposals.filter(bountyProposal => bountyProposal.proposal && ids[index].eq(bountyProposal.proposal.args[0]))
        });
      }
    });
    return bounties;
  }
  function bounties$1(instanceId, api) {
    const bountyBase = api.query.bounties || api.query.treasury;
    return memo(instanceId, () => bountyBase.bounties ? combineLatest([bountyBase.bountyCount(), api.query.council ? api.query.council.proposalCount() : of(0)]).pipe(switchMap(() => combineLatest([bountyBase.bounties.keys(), api.derive.council ? api.derive.council.proposals() : of([])])), switchMap(([keys, proposals]) => {
      const ids = keys.map(({
        args: [id]
      }) => id);
      return combineLatest([bountyBase.bounties.multi(ids), bountyBase.bountyDescriptions.multi(ids), of(ids), of(filterBountiesProposals(api, proposals))]);
    }), map(parseResult$2)) : of(parseResult$2([[], [], [], []])));
  }

  const bounties = /*#__PURE__*/Object.freeze({
    __proto__: null,
    bounties: bounties$1
  });

  function unwrapBlockNumber(fn) {
    return (instanceId, api) => memo(instanceId, () => fn(api).pipe(map(r => r.number.unwrap())));
  }

  const bestNumber = unwrapBlockNumber(api => api.derive.chain.subscribeNewHeads());

  const bestNumberFinalized = unwrapBlockNumber(api => api.rpc.chain.subscribeFinalizedHeads());

  function bestNumberLag(instanceId, api) {
    return memo(instanceId, () => combineLatest([api.derive.chain.bestNumber(), api.derive.chain.bestNumberFinalized()]).pipe(map(([bestNumber, bestNumberFinalized]) => api.registry.createType('BlockNumber', bestNumber.sub(bestNumberFinalized)))));
  }

  function extractAuthor(digest, sessionValidators = []) {
    const [citem] = digest.logs.filter(e => e.isConsensus);
    const [pitem] = digest.logs.filter(e => e.isPreRuntime);
    const [sitem] = digest.logs.filter(e => e.isSeal);
    let accountId;
    try {
      if (pitem) {
        const [engine, data] = pitem.asPreRuntime;
        accountId = engine.extractAuthor(data, sessionValidators);
      }
      if (!accountId && citem) {
        const [engine, data] = citem.asConsensus;
        accountId = engine.extractAuthor(data, sessionValidators);
      }
      if (!accountId && sitem) {
        const [engine, data] = sitem.asSeal;
        accountId = engine.extractAuthor(data, sessionValidators);
      }
    } catch {
    }
    return accountId;
  }

  function createHeaderExtended(registry, header, validators) {
    const HeaderBase = registry.createClass('Header');
    class Implementation extends HeaderBase {
      #author;
      #validators;
      constructor(registry, header, validators) {
        super(registry, header);
        this.#author = extractAuthor(this.digest, validators);
        this.#validators = validators;
        this.createdAtHash = header === null || header === void 0 ? void 0 : header.createdAtHash;
      }
      get author() {
        return this.#author;
      }
      get validators() {
        return this.#validators;
      }
    }
    return new Implementation(registry, header, validators);
  }

  function mapExtrinsics(extrinsics, records) {
    return extrinsics.map((extrinsic, index) => {
      let dispatchError;
      let dispatchInfo;
      const events = records.filter(({
        phase
      }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index)).map(({
        event
      }) => {
        if (event.section === 'system') {
          if (event.method === 'ExtrinsicSuccess') {
            dispatchInfo = event.data[0];
          } else if (event.method === 'ExtrinsicFailed') {
            dispatchError = event.data[0];
            dispatchInfo = event.data[1];
          }
        }
        return event;
      });
      return {
        dispatchError,
        dispatchInfo,
        events,
        extrinsic
      };
    });
  }
  function createSignedBlockExtended(registry, block, events, validators) {
    const SignedBlockBase = registry.createClass('SignedBlock');
    class Implementation extends SignedBlockBase {
      #author;
      #events;
      #extrinsics;
      constructor(registry, block, events, validators) {
        super(registry, block);
        this.#author = extractAuthor(this.block.header.digest, validators);
        this.#events = events || [];
        this.#extrinsics = mapExtrinsics(this.block.extrinsics, this.#events);
        this.createdAtHash = block === null || block === void 0 ? void 0 : block.createdAtHash;
      }
      get author() {
        return this.#author;
      }
      get events() {
        return this.#events;
      }
      get extrinsics() {
        return this.#extrinsics;
      }
    }
    return new Implementation(registry, block, events, validators);
  }

  function getHeader(instanceId, api) {
    return memo(instanceId, blockHash => combineLatest([api.rpc.chain.getHeader(blockHash), api.queryAt(blockHash).pipe(switchMap(queryAt => queryAt.session ? queryAt.session.validators() : of([])))]).pipe(map(([header, validators]) => createHeaderExtended(header.registry, header, validators)), catchError(() =>
    of())));
  }

  function getBlock(instanceId, api) {
    return memo(instanceId, blockHash => combineLatest([api.rpc.chain.getBlock(blockHash), api.queryAt(blockHash).pipe(switchMap(queryAt => combineLatest([queryAt.system.events(), queryAt.session ? queryAt.session.validators() : of([])])))]).pipe(map(([signedBlock, [events, validators]]) => createSignedBlockExtended(api.registry, signedBlock, events, validators)), catchError(() =>
    of())));
  }

  function getBlockByNumber(instanceId, api) {
    return memo(instanceId, blockNumber => api.rpc.chain.getBlockHash(blockNumber).pipe(switchMap(h => api.derive.chain.getBlock(h))));
  }

  function subscribeNewBlocks(instanceId, api) {
    return memo(instanceId, () => api.derive.chain.subscribeNewHeads().pipe(switchMap(header => {
      const blockHash = header.createdAtHash || header.hash;
      return combineLatest([of(header), api.rpc.chain.getBlock(blockHash), api.queryAt(blockHash).pipe(switchMap(queryAt => queryAt.system.events()))]);
    }), map(([header, block, events]) => createSignedBlockExtended(block.registry, block, events, header.validators))));
  }

  function subscribeNewHeads(instanceId, api) {
    return memo(instanceId, () => combineLatest([api.rpc.chain.subscribeNewHeads(), api.query.session ? api.query.session.validators() : of(undefined)]).pipe(map(([header, validators]) => {
      header.createdAtHash = header.hash;
      return createHeaderExtended(header.registry, header, validators);
    })));
  }

  const chain = /*#__PURE__*/Object.freeze({
    __proto__: null,
    bestNumber: bestNumber,
    bestNumberFinalized: bestNumberFinalized,
    bestNumberLag: bestNumberLag,
    getHeader: getHeader,
    getBlock: getBlock,
    getBlockByNumber: getBlockByNumber,
    subscribeNewBlocks: subscribeNewBlocks,
    subscribeNewHeads: subscribeNewHeads
  });

  function queryConstants(api) {
    return of([
    api.consts.contracts.callBaseFee || api.registry.createType('Balance'), api.consts.contracts.contractFee || api.registry.createType('Balance'), api.consts.contracts.creationFee || api.registry.createType('Balance'), api.consts.contracts.transactionBaseFee || api.registry.createType('Balance'), api.consts.contracts.transactionByteFee || api.registry.createType('Balance'), api.consts.contracts.transferFee || api.registry.createType('Balance'),
    api.consts.contracts.rentByteFee, api.consts.contracts.rentDepositOffset, api.consts.contracts.surchargeReward, api.consts.contracts.tombstoneDeposit]);
  }
  function fees(instanceId, api) {
    return memo(instanceId, () => {
      return queryConstants(api).pipe(map(([callBaseFee, contractFee, creationFee, transactionBaseFee, transactionByteFee, transferFee, rentByteFee, rentDepositOffset, surchargeReward, tombstoneDeposit]) => ({
        callBaseFee,
        contractFee,
        creationFee,
        rentByteFee,
        rentDepositOffset,
        surchargeReward,
        tombstoneDeposit,
        transactionBaseFee,
        transactionByteFee,
        transferFee
      })));
    });
  }

  const contracts = /*#__PURE__*/Object.freeze({
    __proto__: null,
    fees: fees
  });

  function getInstance(api, section) {
    const instances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), section);
    const name = instances && instances.length ? instances[0] : section;
    return api.query[name];
  }
  function withSection(section, fn) {
    return (instanceId, api) => memo(instanceId, fn(getInstance(api, section), api, instanceId));
  }
  function callMethod(method, empty) {
    return section => withSection(section, query => () => util.isFunction(query === null || query === void 0 ? void 0 : query[method]) ? query[method]() : of(empty));
  }

  const members$4 = callMethod('members', []);

  function prime$3(section) {
    return withSection(section, query => () => util.isFunction(query === null || query === void 0 ? void 0 : query.prime) ? query.prime().pipe(map(o => o.unwrapOr(null))) : of(null));
  }

  function parse$4(api, [hashes, proposals, votes]) {
    return proposals.map((o, index) => ({
      hash: api.registry.createType('Hash', hashes[index]),
      proposal: o && o.isSome ? o.unwrap() : null,
      votes: votes[index].unwrapOr(null)
    }));
  }
  function _proposalsFrom(api, query, hashes) {
    return (util.isFunction(query === null || query === void 0 ? void 0 : query.proposals) && hashes.length ? combineLatest([of(hashes),
    query.proposalOf.multi(hashes).pipe(catchError(() => of(hashes.map(() => null)))), query.voting.multi(hashes)]) : of([[], [], []])).pipe(map(r => parse$4(api, r)));
  }
  function hasProposals$3(section) {
    return withSection(section, query => () => of(util.isFunction(query === null || query === void 0 ? void 0 : query.proposals)));
  }
  function proposals$5(section) {
    return withSection(section, (query, api) => () => api.derive[section].proposalHashes().pipe(switchMap(all => _proposalsFrom(api, query, all))));
  }
  function proposal$3(section) {
    return withSection(section, (query, api) => hash => util.isFunction(query === null || query === void 0 ? void 0 : query.proposals) ? firstObservable(_proposalsFrom(api, query, [hash])) : of(null));
  }
  const proposalCount$3 = callMethod('proposalCount', null);
  const proposalHashes$3 = callMethod('proposals', []);

  function isVoter(value) {
    return !Array.isArray(value);
  }
  function retrieveStakeOf(elections) {
    return elections.stakeOf.entries().pipe(map(entries => entries.map(([{
      args: [accountId]
    }, stake]) => [accountId, stake])));
  }
  function retrieveVoteOf(elections) {
    return elections.votesOf.entries().pipe(map(entries => entries.map(([{
      args: [accountId]
    }, votes]) => [accountId, votes])));
  }
  function retrievePrev(api, elections) {
    return combineLatest([retrieveStakeOf(elections), retrieveVoteOf(elections)]).pipe(map(([stakes, votes]) => {
      const result = [];
      votes.forEach(([voter, votes]) => {
        result.push([voter, {
          stake: api.registry.createType('Balance'),
          votes
        }]);
      });
      stakes.forEach(([staker, stake]) => {
        const entry = result.find(([voter]) => voter.eq(staker));
        if (entry) {
          entry[1].stake = stake;
        } else {
          result.push([staker, {
            stake,
            votes: []
          }]);
        }
      });
      return result;
    }));
  }
  function retrieveCurrent(elections) {
    return elections.voting.entries().pipe(map(entries => entries.map(([{
      args: [accountId]
    }, value]) => [accountId, isVoter(value) ? {
      stake: value.stake,
      votes: value.votes
    } : {
      stake: value[0],
      votes: value[1]
    }])));
  }
  function votes(instanceId, api) {
    const elections = api.query.phragmenElection || api.query.electionsPhragmen || api.query.elections;
    return memo(instanceId, () => elections ? elections.stakeOf ? retrievePrev(api, elections) : retrieveCurrent(elections) : of([]));
  }

  function votesOf(instanceId, api) {
    return memo(instanceId, accountId => api.derive.council.votes().pipe(map(votes => (votes.find(([from]) => from.eq(accountId)) || [null, {
      stake: api.registry.createType('Balance'),
      votes: []
    }])[1])));
  }

  const members$3 = members$4('council');
  const hasProposals$2 = hasProposals$3('council');
  const proposal$2 = proposal$3('council');
  const proposalCount$2 = proposalCount$3('council');
  const proposalHashes$2 = proposalHashes$3('council');
  const proposals$4 = proposals$5('council');
  const prime$2 = prime$3('council');

  const council = /*#__PURE__*/Object.freeze({
    __proto__: null,
    members: members$3,
    hasProposals: hasProposals$2,
    proposal: proposal$2,
    proposalCount: proposalCount$2,
    proposalHashes: proposalHashes$2,
    proposals: proposals$4,
    prime: prime$2,
    votes: votes,
    votesOf: votesOf
  });

  function createChildKey(info) {
    return util.u8aToHex(util.u8aConcat(':child_storage:default:', utilCrypto.blake2AsU8a(util.u8aConcat('crowdloan', (info.fundIndex || info.trieIndex).toU8a()))));
  }
  function childKey(instanceId, api) {
    return memo(instanceId, paraId => api.query.crowdloan.funds(paraId).pipe(map(optInfo => optInfo.isSome ? createChildKey(optInfo.unwrap()) : null)));
  }

  function extractContributed(paraId, events) {
    var _events$createdAtHash;
    const added = [];
    const removed = [];
    return events.filter(({
      event: {
        data: [, eventParaId],
        method,
        section
      }
    }) => section === 'crowdloan' && ['Contributed', 'Withdrew'].includes(method) && eventParaId.eq(paraId)).reduce((result, {
      event: {
        data: [accountId],
        method
      }
    }) => {
      if (method === 'Contributed') {
        result.added.push(accountId.toHex());
      } else {
        result.removed.push(accountId.toHex());
      }
      return result;
    }, {
      added,
      blockHash: ((_events$createdAtHash = events.createdAtHash) === null || _events$createdAtHash === void 0 ? void 0 : _events$createdAtHash.toHex()) || '-',
      removed
    });
  }

  const PAGE_SIZE_K$1 = 1000;
  function _getUpdates(api, paraId) {
    let added = [];
    let removed = [];
    return api.query.system.events().pipe(switchMap(events => {
      const changes = extractContributed(paraId, events);
      if (changes.added.length || changes.removed.length) {
        var _events$createdAtHash;
        added = added.concat(...changes.added);
        removed = removed.concat(...changes.removed);
        return of({
          added,
          addedDelta: changes.added,
          blockHash: ((_events$createdAtHash = events.createdAtHash) === null || _events$createdAtHash === void 0 ? void 0 : _events$createdAtHash.toHex()) || '-',
          removed,
          removedDelta: changes.removed
        });
      }
      return EMPTY;
    }), startWith({
      added,
      addedDelta: [],
      blockHash: '-',
      removed,
      removedDelta: []
    }));
  }
  function _eventTriggerAll(api, paraId) {
    return api.query.system.events().pipe(switchMap(events => {
      var _events$createdAtHash2;
      const items = events.filter(({
        event: {
          data: [eventParaId],
          method,
          section
        }
      }) => section === 'crowdloan' && ['AllRefunded', 'Dissolved', 'PartiallyRefunded'].includes(method) && eventParaId.eq(paraId));
      return items.length ? of(((_events$createdAtHash2 = events.createdAtHash) === null || _events$createdAtHash2 === void 0 ? void 0 : _events$createdAtHash2.toHex()) || '-') : EMPTY;
    }), startWith('-'));
  }
  function _getKeysPaged(api, childKey) {
    const subject = new BehaviorSubject(undefined);
    return subject.pipe(switchMap(startKey => api.rpc.childstate.getKeysPaged(childKey, '0x', PAGE_SIZE_K$1, startKey)), tap(keys => {
      util.nextTick(() => {
        keys.length === PAGE_SIZE_K$1 ? subject.next(keys[PAGE_SIZE_K$1 - 1].toHex()) : subject.complete();
      });
    }), toArray(),
    map(keyArr => util.arrayFlatten(keyArr)));
  }
  function _getAll(api, paraId, childKey) {
    return _eventTriggerAll(api, paraId).pipe(switchMap(() => util.isFunction(api.rpc.childstate.getKeysPaged) ? _getKeysPaged(api, childKey) : api.rpc.childstate.getKeys(childKey, '0x')), map(keys => keys.map(k => k.toHex())));
  }
  function _contributions$1(api, paraId, childKey) {
    return combineLatest([_getAll(api, paraId, childKey), _getUpdates(api, paraId)]).pipe(map(([keys, {
      added,
      blockHash,
      removed
    }]) => {
      const contributorsMap = {};
      keys.forEach(k => {
        contributorsMap[k] = true;
      });
      added.forEach(k => {
        contributorsMap[k] = true;
      });
      removed.forEach(k => {
        delete contributorsMap[k];
      });
      return {
        blockHash,
        contributorsHex: Object.keys(contributorsMap)
      };
    }));
  }
  function contributions(instanceId, api) {
    return memo(instanceId, paraId => api.derive.crowdloan.childKey(paraId).pipe(switchMap(childKey => childKey ? _contributions$1(api, paraId, childKey) : of({
      blockHash: '-',
      contributorsHex: []
    }))));
  }

  function _getValues(api, childKey, keys) {
    return combineLatest(keys.map(k => api.rpc.childstate.getStorage(childKey, k))).pipe(map(values => values.map(v => api.registry.createType('Option<StorageData>', v)).map(o => o.isSome ? api.registry.createType('Balance', o.unwrap()) : api.registry.createType('Balance')).reduce((all, b, index) => ({ ...all,
      [keys[index]]: b
    }), {})));
  }
  function _watchOwnChanges(api, paraId, childkey, keys) {
    return api.query.system.events().pipe(switchMap(events => {
      const changes = extractContributed(paraId, events);
      const filtered = keys.filter(k => changes.added.includes(k) || changes.removed.includes(k));
      return filtered.length ? _getValues(api, childkey, filtered) : EMPTY;
    }), startWith({}));
  }
  function _contributions(api, paraId, childKey, keys) {
    return combineLatest([_getValues(api, childKey, keys), _watchOwnChanges(api, paraId, childKey, keys)]).pipe(map(([all, latest]) => ({ ...all,
      ...latest
    })));
  }
  function ownContributions(instanceId, api) {
    return memo(instanceId, (paraId, keys) => api.derive.crowdloan.childKey(paraId).pipe(switchMap(childKey => childKey && keys.length ? _contributions(api, paraId, childKey, keys) : of({}))));
  }

  const crowdloan = /*#__PURE__*/Object.freeze({
    __proto__: null,
    childKey: childKey,
    contributions: contributions,
    ownContributions: ownContributions
  });

  const DEMOCRACY_ID = util.stringToHex('democrac');
  function isMaybeHashed(call) {
    return call instanceof types.Enum;
  }
  function queryQueue(api) {
    return api.query.democracy.dispatchQueue().pipe(switchMap(dispatches => combineLatest([of(dispatches), api.derive.democracy.preimages(dispatches.map(([, hash]) => hash))])), map(([dispatches, images]) => dispatches.map(([at, imageHash, index], dispatchIndex) => ({
      at,
      image: images[dispatchIndex],
      imageHash,
      index
    }))));
  }
  function schedulerEntries(api) {
    return api.derive.democracy.referendumsFinished().pipe(switchMap(() => api.query.scheduler.agenda.keys()), switchMap(keys => {
      const blockNumbers = keys.map(({
        args: [blockNumber]
      }) => blockNumber);
      return blockNumbers.length ? combineLatest([of(blockNumbers),
      api.query.scheduler.agenda.multi(blockNumbers).pipe(catchError(() => of(blockNumbers.map(() => []))))]) : of([[], []]);
    }));
  }
  function queryScheduler(api) {
    return schedulerEntries(api).pipe(switchMap(([blockNumbers, agendas]) => {
      const result = [];
      blockNumbers.forEach((at, index) => {
        (agendas[index] || []).filter(o => o.isSome).forEach(o => {
          const scheduled = o.unwrap();
          if (scheduled.maybeId.isSome) {
            const id = scheduled.maybeId.unwrap().toHex();
            if (id.startsWith(DEMOCRACY_ID)) {
              const imageHash = isMaybeHashed(scheduled.call) ? scheduled.call.isHash ? scheduled.call.asHash : scheduled.call.asValue.args[0] : scheduled.call.args[0];
              result.push({
                at,
                imageHash,
                index: api.registry.createType('(u64, ReferendumIndex)', id)[1]
              });
            }
          }
        });
      });
      return combineLatest([of(result), result.length ? api.derive.democracy.preimages(result.map(({
        imageHash
      }) => imageHash)) : of([])]);
    }), map(([infos, images]) => infos.map((info, index) => ({ ...info,
      image: images[index]
    }))));
  }
  function dispatchQueue(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$scheduler;
      return util.isFunction((_api$query$scheduler = api.query.scheduler) === null || _api$query$scheduler === void 0 ? void 0 : _api$query$scheduler.agenda) ? queryScheduler(api) : api.query.democracy.dispatchQueue ? queryQueue(api) : of([]);
    });
  }

  const LOCKUPS = [0, 1, 2, 4, 8, 16, 32];
  function parseEnd(api, vote, {
    approved,
    end
  }) {
    return [end, approved.isTrue && vote.isAye || approved.isFalse && vote.isNay ? end.add((api.consts.democracy.voteLockingPeriod || api.consts.democracy.enactmentPeriod).muln(LOCKUPS[vote.conviction.index])) : util.BN_ZERO];
  }
  function parseLock(api, [referendumId, accountVote], referendum) {
    const {
      balance,
      vote
    } = accountVote.asStandard;
    const [referendumEnd, unlockAt] = referendum.isFinished ? parseEnd(api, vote, referendum.asFinished) : [util.BN_ZERO, util.BN_ZERO];
    return {
      balance,
      isDelegated: false,
      isFinished: referendum.isFinished,
      referendumEnd,
      referendumId,
      unlockAt,
      vote
    };
  }
  function delegateLocks(api, {
    balance,
    conviction,
    target
  }) {
    return api.derive.democracy.locks(target).pipe(map(available => available.map(({
      isFinished,
      referendumEnd,
      referendumId,
      unlockAt,
      vote
    }) => ({
      balance,
      isDelegated: true,
      isFinished,
      referendumEnd,
      referendumId,
      unlockAt: unlockAt.isZero() ? unlockAt : referendumEnd.add((api.consts.democracy.voteLockingPeriod || api.consts.democracy.enactmentPeriod).muln(LOCKUPS[conviction.index])),
      vote: api.registry.createType('Vote', {
        aye: vote.isAye,
        conviction
      })
    }))));
  }
  function directLocks(api, {
    votes
  }) {
    if (!votes.length) {
      return of([]);
    }
    return api.query.democracy.referendumInfoOf.multi(votes.map(([referendumId]) => referendumId)).pipe(map(referendums => votes.map((vote, index) => [vote, referendums[index].unwrapOr(null)]).filter(item => !!item[1] && util.isUndefined(item[1].end) && item[0][1].isStandard).map(([directVote, referendum]) => parseLock(api, directVote, referendum))));
  }
  function locks(instanceId, api) {
    return memo(instanceId, accountId => api.query.democracy.votingOf ? api.query.democracy.votingOf(accountId).pipe(switchMap(voting => voting.isDirect ? directLocks(api, voting.asDirect) : voting.isDelegating ? delegateLocks(api, voting.asDelegating) : of([]))) : of([]));
  }

  function withImage(api, nextOpt) {
    if (nextOpt.isNone) {
      return of(null);
    }
    const [imageHash, threshold] = nextOpt.unwrap();
    return api.derive.democracy.preimage(imageHash).pipe(map(image => ({
      image,
      imageHash,
      threshold
    })));
  }
  function nextExternal(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$democracy;
      return (_api$query$democracy = api.query.democracy) !== null && _api$query$democracy !== void 0 && _api$query$democracy.nextExternal ? api.query.democracy.nextExternal().pipe(switchMap(nextOpt => withImage(api, nextOpt))) : of(null);
    });
  }

  function isDemocracyPreimage(api, imageOpt) {
    return !!imageOpt && !api.query.democracy.dispatchQueue;
  }
  function constructProposal(api, [bytes, proposer, balance, at]) {
    let proposal;
    try {
      proposal = api.registry.createType('Proposal', bytes.toU8a(true));
    } catch (error) {
      console.error(error);
    }
    return {
      at,
      balance,
      proposal,
      proposer
    };
  }
  function parseDemocracy(api, imageOpt) {
    if (imageOpt.isNone) {
      return;
    }
    if (isDemocracyPreimage(api, imageOpt)) {
      const status = imageOpt.unwrap();
      if (status.isMissing) {
        return;
      }
      const {
        data,
        deposit,
        provider,
        since
      } = status.asAvailable;
      return constructProposal(api, [data, provider, deposit, since]);
    }
    return constructProposal(api, imageOpt.unwrap());
  }
  function getDemocracyImages(api, hashes) {
    return api.query.democracy.preimages.multi(hashes).pipe(map(images => images.map(imageOpt => parseDemocracy(api, imageOpt))));
  }
  function preimages(instanceId, api) {
    return memo(instanceId, hashes => hashes.length ? util.isFunction(api.query.democracy.preimages) ? getDemocracyImages(api, hashes) : of([]) : of([]));
  }
  const preimage = firstMemo((api, hash) => api.derive.democracy.preimages([hash]));

  function isNewDepositors(depositors) {
    return util.isFunction(depositors[1].mul);
  }
  function parse$3([proposals, images, optDepositors]) {
    return proposals.filter(([,, proposer], index) => {
      var _optDepositors$index;
      return !!((_optDepositors$index = optDepositors[index]) !== null && _optDepositors$index !== void 0 && _optDepositors$index.isSome) && !proposer.isEmpty;
    }).map(([index, imageHash, proposer], proposalIndex) => {
      const depositors = optDepositors[proposalIndex].unwrap();
      return { ...(isNewDepositors(depositors) ? {
          balance: depositors[1],
          seconds: depositors[0]
        } : {
          balance: depositors[0],
          seconds: depositors[1]
        }),
        image: images[proposalIndex],
        imageHash,
        index,
        proposer
      };
    });
  }
  function proposals$3(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$democracy, _api$query$democracy2;
      return util.isFunction((_api$query$democracy = api.query.democracy) === null || _api$query$democracy === void 0 ? void 0 : _api$query$democracy.publicProps) && util.isFunction((_api$query$democracy2 = api.query.democracy) === null || _api$query$democracy2 === void 0 ? void 0 : _api$query$democracy2.preimages) ? api.query.democracy.publicProps().pipe(switchMap(proposals => proposals.length ? combineLatest([of(proposals), api.derive.democracy.preimages(proposals.map(([, hash]) => hash)), api.query.democracy.depositOf.multi(proposals.map(([index]) => index))]) : of([[], [], []])), map(parse$3)) : of([]);
    });
  }

  function referendumIds(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$democracy;
      return (_api$query$democracy = api.query.democracy) !== null && _api$query$democracy !== void 0 && _api$query$democracy.lowestUnbaked ? api.queryMulti([api.query.democracy.lowestUnbaked, api.query.democracy.referendumCount]).pipe(map(([first, total]) => total.gt(first)
      ? [...Array(total.sub(first).toNumber())].map((_, i) => first.addn(i)) : [])) : of([]);
    });
  }

  function referendums(instanceId, api) {
    return memo(instanceId, () => api.derive.democracy.referendumsActive().pipe(switchMap(referendums => referendums.length ? combineLatest([of(referendums), api.derive.democracy._referendumsVotes(referendums)]) : of([[], []])), map(([referendums, votes]) => referendums.map((referendum, index) => ({ ...referendum,
      ...votes[index]
    })))));
  }

  function referendumsActive(instanceId, api) {
    return memo(instanceId, () => api.derive.democracy.referendumIds().pipe(switchMap(ids => ids.length ? api.derive.democracy.referendumsInfo(ids) : of([]))));
  }

  function referendumsFinished(instanceId, api) {
    return memo(instanceId, () => api.derive.democracy.referendumIds().pipe(switchMap(ids => api.query.democracy.referendumInfoOf.multi(ids)), map(infos => infos.map(o => o.unwrapOr(null)).filter(info => !!info && info.isFinished).map(info => info.asFinished))));
  }

  function isOldInfo(info) {
    return !!info.proposalHash;
  }
  function isCurrentStatus(status) {
    return !!status.tally;
  }
  function compareRationals(n1, d1, n2, d2) {
    while (true) {
      const q1 = n1.div(d1);
      const q2 = n2.div(d2);
      if (q1.lt(q2)) {
        return true;
      } else if (q2.lt(q1)) {
        return false;
      }
      const r1 = n1.mod(d1);
      const r2 = n2.mod(d2);
      if (r2.isZero()) {
        return false;
      } else if (r1.isZero()) {
        return true;
      }
      n1 = d2;
      n2 = d1;
      d1 = r2;
      d2 = r1;
    }
  }
  function calcPassingOther(threshold, sqrtElectorate, {
    votedAye,
    votedNay,
    votedTotal
  }) {
    const sqrtVoters = util.bnSqrt(votedTotal);
    return sqrtVoters.isZero() ? false : threshold.isSuperMajorityApprove ? compareRationals(votedNay, sqrtVoters, votedAye, sqrtElectorate) : compareRationals(votedNay, sqrtElectorate, votedAye, sqrtVoters);
  }
  function calcPassing(threshold, sqrtElectorate, state) {
    return threshold.isSimpleMajority ? state.votedAye.gt(state.votedNay) : calcPassingOther(threshold, sqrtElectorate, state);
  }
  function calcVotesPrev(votesFor) {
    return votesFor.reduce((state, derived) => {
      const {
        balance,
        vote
      } = derived;
      const isDefault = vote.conviction.index === 0;
      const counted = balance.muln(isDefault ? 1 : vote.conviction.index).divn(isDefault ? 10 : 1);
      if (vote.isAye) {
        state.allAye.push(derived);
        state.voteCountAye++;
        state.votedAye.iadd(counted);
      } else {
        state.allNay.push(derived);
        state.voteCountNay++;
        state.votedNay.iadd(counted);
      }
      state.voteCount++;
      state.votedTotal.iadd(counted);
      return state;
    }, {
      allAye: [],
      allNay: [],
      voteCount: 0,
      voteCountAye: 0,
      voteCountNay: 0,
      votedAye: new util.BN(0),
      votedNay: new util.BN(0),
      votedTotal: new util.BN(0)
    });
  }
  function calcVotesCurrent(tally, votes) {
    const allAye = [];
    const allNay = [];
    votes.forEach(derived => {
      if (derived.vote.isAye) {
        allAye.push(derived);
      } else {
        allNay.push(derived);
      }
    });
    return {
      allAye,
      allNay,
      voteCount: allAye.length + allNay.length,
      voteCountAye: allAye.length,
      voteCountNay: allNay.length,
      votedAye: tally.ayes,
      votedNay: tally.nays,
      votedTotal: tally.turnout
    };
  }
  function calcVotes(sqrtElectorate, referendum, votes) {
    const state = isCurrentStatus(referendum.status) ? calcVotesCurrent(referendum.status.tally, votes) : calcVotesPrev(votes);
    return { ...state,
      isPassing: calcPassing(referendum.status.threshold, sqrtElectorate, state),
      votes
    };
  }
  function getStatus(info) {
    if (info.isNone) {
      return null;
    }
    const unwrapped = info.unwrap();
    return isOldInfo(unwrapped) ? unwrapped : unwrapped.isOngoing ? unwrapped.asOngoing
    : null;
  }

  function votesPrev(api, referendumId) {
    return api.query.democracy.votersFor(referendumId).pipe(switchMap(votersFor => combineLatest([of(votersFor), votersFor.length ? api.query.democracy.voteOf.multi(votersFor.map(accountId => [referendumId, accountId])) : of([]), api.derive.balances.votingBalances(votersFor)])), map(([votersFor, votes, balances]) => votersFor.map((accountId, index) => ({
      accountId,
      balance: balances[index].votingBalance || api.registry.createType('Balance'),
      isDelegating: false,
      vote: votes[index] || api.registry.createType('Vote')
    }))));
  }
  function extractVotes(mapped, referendumId) {
    return mapped.filter(([, voting]) => voting.isDirect).map(([accountId, voting]) => [accountId, voting.asDirect.votes.filter(([idx]) => idx.eq(referendumId))]).filter(([, directVotes]) => !!directVotes.length).reduce((result, [accountId, votes]) =>
    votes.reduce((result, [, vote]) => {
      if (vote.isStandard) {
        result.push({
          accountId,
          isDelegating: false,
          ...vote.asStandard
        });
      }
      return result;
    }, result), []);
  }
  function votesCurr(api, referendumId) {
    return api.query.democracy.votingOf.entries().pipe(map(allVoting => {
      const mapped = allVoting.map(([{
        args: [accountId]
      }, voting]) => [accountId, voting]);
      const votes = extractVotes(mapped, referendumId);
      const delegations = mapped.filter(([, voting]) => voting.isDelegating).map(([accountId, voting]) => [accountId, voting.asDelegating]);
      delegations.forEach(([accountId, {
        balance,
        conviction,
        target
      }]) => {
        const toDelegator = delegations.find(([accountId]) => accountId.eq(target));
        const to = votes.find(({
          accountId
        }) => accountId.eq(toDelegator ? toDelegator[0] : target));
        if (to) {
          votes.push({
            accountId,
            balance,
            isDelegating: true,
            vote: api.registry.createType('Vote', {
              aye: to.vote.isAye,
              conviction
            })
          });
        }
      });
      return votes;
    }));
  }
  function _referendumVotes(instanceId, api) {
    return memo(instanceId, referendum => combineLatest([api.derive.democracy.sqrtElectorate(), util.isFunction(api.query.democracy.votingOf) ? votesCurr(api, referendum.index) : votesPrev(api, referendum.index)]).pipe(map(([sqrtElectorate, votes]) => calcVotes(sqrtElectorate, referendum, votes))));
  }
  function _referendumsVotes(instanceId, api) {
    return memo(instanceId, referendums => referendums.length ? combineLatest(referendums.map(referendum => api.derive.democracy._referendumVotes(referendum))) : of([]));
  }
  function _referendumInfo(instanceId, api) {
    return memo(instanceId, (index, info) => {
      const status = getStatus(info);
      return status ? api.derive.democracy.preimage(status.proposalHash).pipe(map(image => ({
        image,
        imageHash: status.proposalHash,
        index: api.registry.createType('ReferendumIndex', index),
        status
      }))) : of(null);
    });
  }
  function referendumsInfo(instanceId, api) {
    return memo(instanceId, ids => ids.length ? api.query.democracy.referendumInfoOf.multi(ids).pipe(switchMap(infos => combineLatest(ids.map((id, index) => api.derive.democracy._referendumInfo(id, infos[index])))), map(infos => infos.filter(referendum => !!referendum))) : of([]));
  }

  function sqrtElectorate(instanceId, api) {
    return memo(instanceId, () => api.query.balances.totalIssuance().pipe(map(util.bnSqrt)));
  }

  const democracy = /*#__PURE__*/Object.freeze({
    __proto__: null,
    dispatchQueue: dispatchQueue,
    locks: locks,
    nextExternal: nextExternal,
    preimages: preimages,
    preimage: preimage,
    proposals: proposals$3,
    referendumIds: referendumIds,
    referendums: referendums,
    referendumsActive: referendumsActive,
    referendumsFinished: referendumsFinished,
    _referendumVotes: _referendumVotes,
    _referendumsVotes: _referendumsVotes,
    _referendumInfo: _referendumInfo,
    referendumsInfo: referendumsInfo,
    sqrtElectorate: sqrtElectorate
  });

  function isSeatHolder(value) {
    return !Array.isArray(value);
  }
  function isCandidateTuple(value) {
    return Array.isArray(value);
  }
  function getAccountTuple(value) {
    return isSeatHolder(value) ? [value.who, value.stake] : value;
  }
  function getCandidate(value) {
    return isCandidateTuple(value) ? value[0] : value;
  }
  function sortAccounts([, balanceA], [, balanceB]) {
    return balanceB.cmp(balanceA);
  }
  function getConstants(api, elections) {
    return elections ? {
      candidacyBond: api.consts[elections].candidacyBond,
      desiredRunnersUp: api.consts[elections].desiredRunnersUp,
      desiredSeats: api.consts[elections].desiredMembers,
      termDuration: api.consts[elections].termDuration,
      votingBond: api.consts[elections].votingBond
    } : {};
  }
  function getModules(api) {
    const [council] = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'council') || ['council'];
    const elections = api.query.phragmenElection ? 'phragmenElection' : api.query.electionsPhragmen ? 'electionsPhragmen' : api.query.elections ? 'elections' : null;
    return [council, elections];
  }
  function queryAll(api, council, elections) {
    return api.queryMulti([api.query[council].members, api.query[elections].candidates, api.query[elections].members, api.query[elections].runnersUp]);
  }
  function queryCouncil(api, council) {
    return combineLatest([api.query[council].members(), of([]), of([]), of([])]);
  }
  function info$3(instanceId, api) {
    return memo(instanceId, () => {
      const [council, elections] = getModules(api);
      return (elections ? queryAll(api, council, elections) : queryCouncil(api, council)).pipe(map(([councilMembers, candidates, members, runnersUp]) => ({ ...getConstants(api, elections),
        candidateCount: api.registry.createType('u32', candidates.length),
        candidates: candidates.map(getCandidate),
        members: members.length ? members.map(getAccountTuple).sort(sortAccounts) : councilMembers.map(a => [a, api.registry.createType('Balance')]),
        runnersUp: runnersUp.map(getAccountTuple).sort(sortAccounts)
      })));
    });
  }

  const elections = /*#__PURE__*/Object.freeze({
    __proto__: null,
    info: info$3
  });

  function mapResult([result, validators, heartbeats, numBlocks]) {
    validators.forEach((validator, index) => {
      const validatorId = validator.toString();
      const blockCount = numBlocks[index];
      const hasMessage = !heartbeats[index].isEmpty;
      const prev = result[validatorId];
      if (!prev || prev.hasMessage !== hasMessage || !prev.blockCount.eq(blockCount)) {
        result[validatorId] = {
          blockCount,
          hasMessage,
          isOnline: hasMessage || blockCount.gt(util.BN_ZERO)
        };
      }
    });
    return result;
  }
  function receivedHeartbeats(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$imOnline;
      return (_api$query$imOnline = api.query.imOnline) !== null && _api$query$imOnline !== void 0 && _api$query$imOnline.receivedHeartbeats ? api.derive.staking.overview().pipe(switchMap(({
        currentIndex,
        validators
      }) => combineLatest([of({}), of(validators), api.query.imOnline.receivedHeartbeats.multi(validators.map((_address, index) => [currentIndex, index])), api.query.imOnline.authoredBlocks.multi(validators.map(address => [currentIndex, address]))])), map(mapResult)) : of({});
    });
  }

  const imOnline = /*#__PURE__*/Object.freeze({
    __proto__: null,
    receivedHeartbeats: receivedHeartbeats
  });

  const members$2 = members$4('membership');
  const hasProposals$1 = hasProposals$3('membership');
  const proposal$1 = proposal$3('membership');
  const proposalCount$1 = proposalCount$3('membership');
  const proposalHashes$1 = proposalHashes$3('membership');
  const proposals$2 = proposals$5('membership');
  const prime$1 = prime$3('membership');

  const membership = /*#__PURE__*/Object.freeze({
    __proto__: null,
    members: members$2,
    hasProposals: hasProposals$1,
    proposal: proposal$1,
    proposalCount: proposalCount$1,
    proposalHashes: proposalHashes$1,
    proposals: proposals$2,
    prime: prime$1
  });

  function didUpdateToBool(didUpdate, id) {
    return didUpdate.isSome ? didUpdate.unwrap().some(paraId => paraId.eq(id)) : false;
  }

  function parseActive(id, active) {
    const found = active.find(([paraId]) => paraId === id);
    if (found && found[1].isSome) {
      const [collatorId, retriable] = found[1].unwrap();
      return {
        collatorId,
        ...(retriable.isWithRetries ? {
          isRetriable: true,
          retries: retriable.asWithRetries.toNumber()
        } : {
          isRetriable: false,
          retries: 0
        })
      };
    }
    return null;
  }
  function parseCollators(id, collatorQueue) {
    return collatorQueue.map(queue => {
      const found = queue.find(([paraId]) => paraId === id);
      return found ? found[1] : null;
    });
  }
  function parse$2(id, [active, retryQueue, selectedThreads, didUpdate, info, pendingSwap, heads, relayDispatchQueue]) {
    if (info.isNone) {
      return null;
    }
    return {
      active: parseActive(id, active),
      didUpdate: didUpdateToBool(didUpdate, id),
      heads,
      id,
      info: {
        id,
        ...info.unwrap()
      },
      pendingSwapId: pendingSwap.unwrapOr(null),
      relayDispatchQueue,
      retryCollators: parseCollators(id, retryQueue),
      selectedCollators: parseCollators(id, selectedThreads)
    };
  }
  function info$2(instanceId, api) {
    return memo(instanceId, id => api.query.registrar && api.query.parachains ? api.queryMulti([api.query.registrar.active, api.query.registrar.retryQueue, api.query.registrar.selectedThreads, api.query.parachains.didUpdate, [api.query.registrar.paras, id], [api.query.registrar.pendingSwap, id], [api.query.parachains.heads, id], [api.query.parachains.relayDispatchQueue, id]]).pipe(map(result => parse$2(api.registry.createType('ParaId', id), result))) : of(null));
  }

  function parse$1([ids, didUpdate, infos, pendingSwaps, relayDispatchQueueSizes]) {
    return ids.map((id, index) => ({
      didUpdate: didUpdateToBool(didUpdate, id),
      id,
      info: {
        id,
        ...infos[index].unwrapOr(null)
      },
      pendingSwapId: pendingSwaps[index].unwrapOr(null),
      relayDispatchQueueSize: relayDispatchQueueSizes[index][0].toNumber()
    }));
  }
  function overview$1(instanceId, api) {
    return memo(instanceId, () => {
      var _api$query$registrar;
      return (_api$query$registrar = api.query.registrar) !== null && _api$query$registrar !== void 0 && _api$query$registrar.parachains && api.query.parachains ? api.query.registrar.parachains().pipe(switchMap(paraIds => combineLatest([of(paraIds), api.query.parachains.didUpdate(), api.query.registrar.paras.multi(paraIds), api.query.registrar.pendingSwap.multi(paraIds), api.query.parachains.relayDispatchQueueSize.multi(paraIds)])), map(parse$1)) : of([]);
    });
  }

  const parachains = /*#__PURE__*/Object.freeze({
    __proto__: null,
    info: info$2,
    overview: overview$1
  });

  function parse([currentIndex, activeEra, activeEraStart, currentEra, validatorCount]) {
    return {
      activeEra,
      activeEraStart,
      currentEra,
      currentIndex,
      validatorCount
    };
  }
  function queryStaking(api) {
    return api.queryMulti([api.query.session.currentIndex, api.query.staking.activeEra, api.query.staking.currentEra, api.query.staking.validatorCount]).pipe(map(([currentIndex, activeOpt, currentEra, validatorCount]) => {
      const {
        index,
        start
      } = activeOpt.unwrapOrDefault();
      return parse([currentIndex, index, start, currentEra.unwrapOrDefault(), validatorCount]);
    }));
  }
  function querySession(api) {
    return api.query.session.currentIndex().pipe(map(currentIndex => parse([currentIndex, api.registry.createType('EraIndex'), api.registry.createType('Option<Moment>'), api.registry.createType('EraIndex'), api.registry.createType('u32')])));
  }
  function empty(api) {
    return of(parse([api.registry.createType('SessionIndex', 1), api.registry.createType('EraIndex'), api.registry.createType('Option<Moment>'), api.registry.createType('EraIndex'), api.registry.createType('u32')]));
  }
  function indexes(instanceId, api) {
    return memo(instanceId, () => api.query.session ? api.query.staking ? queryStaking(api) : querySession(api) : empty(api));
  }

  function info$1(instanceId, api) {
    return memo(instanceId, () => api.derive.session.indexes().pipe(map(indexes => {
      var _api$consts, _api$consts$babe, _api$consts2, _api$consts2$staking;
      const sessionLength = ((_api$consts = api.consts) === null || _api$consts === void 0 ? void 0 : (_api$consts$babe = _api$consts.babe) === null || _api$consts$babe === void 0 ? void 0 : _api$consts$babe.epochDuration) || api.registry.createType('u64', 1);
      const sessionsPerEra = ((_api$consts2 = api.consts) === null || _api$consts2 === void 0 ? void 0 : (_api$consts2$staking = _api$consts2.staking) === null || _api$consts2$staking === void 0 ? void 0 : _api$consts2$staking.sessionsPerEra) || api.registry.createType('SessionIndex', 1);
      return { ...indexes,
        eraLength: api.registry.createType('BlockNumber', sessionsPerEra.mul(sessionLength)),
        isEpoch: !!api.query.babe,
        sessionLength,
        sessionsPerEra
      };
    })));
  }

  function withProgressField(field) {
    return (instanceId, api) => memo(instanceId, () => api.derive.session.progress().pipe(map(info => info[field])));
  }
  function createDerive(api, info, [currentSlot, epochIndex, epochOrGenesisStartSlot, activeEraStartSessionIndex]) {
    const epochStartSlot = epochIndex.mul(info.sessionLength).iadd(epochOrGenesisStartSlot);
    const sessionProgress = currentSlot.sub(epochStartSlot);
    const eraProgress = info.currentIndex.sub(activeEraStartSessionIndex).imul(info.sessionLength).iadd(sessionProgress);
    return { ...info,
      eraProgress: api.registry.createType('BlockNumber', eraProgress),
      sessionProgress: api.registry.createType('BlockNumber', sessionProgress)
    };
  }
  function queryAura(api) {
    return api.derive.session.info().pipe(map(info => ({ ...info,
      eraProgress: api.registry.createType('BlockNumber'),
      sessionProgress: api.registry.createType('BlockNumber')
    })));
  }
  function queryBabe(api) {
    return api.derive.session.info().pipe(switchMap(info => {
      var _api$query$staking;
      return combineLatest([of(info),
      (_api$query$staking = api.query.staking) !== null && _api$query$staking !== void 0 && _api$query$staking.erasStartSessionIndex ? api.queryMulti([api.query.babe.currentSlot, api.query.babe.epochIndex, api.query.babe.genesisSlot, [api.query.staking.erasStartSessionIndex, info.activeEra]]) : api.queryMulti([api.query.babe.currentSlot, api.query.babe.epochIndex, api.query.babe.genesisSlot])]);
    }), map(([info, [currentSlot, epochIndex, genesisSlot, optStartIndex]]) => [info, [currentSlot, epochIndex, genesisSlot, optStartIndex && optStartIndex.isSome ? optStartIndex.unwrap() : api.registry.createType('SessionIndex', 1)]]));
  }
  function progress(instanceId, api) {
    return memo(instanceId, () => api.query.babe ? queryBabe(api).pipe(map(([info, slots]) => createDerive(api, info, slots))) : queryAura(api));
  }
  const eraLength = withProgressField('eraLength');
  const eraProgress = withProgressField('eraProgress');
  const sessionProgress = withProgressField('sessionProgress');

  const session = /*#__PURE__*/Object.freeze({
    __proto__: null,
    indexes: indexes,
    info: info$1,
    progress: progress,
    eraLength: eraLength,
    eraProgress: eraProgress,
    sessionProgress: sessionProgress
  });

  function candidates(instanceId, api) {
    return memo(instanceId, () => api.query.society.candidates().pipe(switchMap(candidates => combineLatest([of(candidates), api.query.society.suspendedCandidates.multi(candidates.map(({
      who
    }) => who))])), map(([candidates, suspended]) => candidates.map(({
      kind,
      value,
      who
    }, index) => ({
      accountId: who,
      isSuspended: suspended[index].isSome,
      kind,
      value
    })))));
  }

  function info(instanceId, api) {
    return memo(instanceId, () => api.queryMulti([api.query.society.bids, api.query.society.defender, api.query.society.founder, api.query.society.head, api.query.society.maxMembers, api.query.society.pot]).pipe(map(([bids, defender, founder, head, maxMembers, pot]) => ({
      bids,
      defender: defender.unwrapOr(undefined),
      founder: founder.unwrapOr(undefined),
      hasDefender: defender.isSome && head.isSome && !head.eq(defender) || false,
      head: head.unwrapOr(undefined),
      maxMembers,
      pot
    }))));
  }

  function member(instanceId, api) {
    return memo(instanceId, accountId => api.derive.society._members([accountId]).pipe(map(([result]) => result)));
  }

  function _members(instanceId, api) {
    return memo(instanceId, accountIds => combineLatest([of(accountIds), api.query.society.payouts.multi(accountIds), api.query.society.strikes.multi(accountIds), api.query.society.defenderVotes.multi(accountIds), api.query.society.suspendedMembers.multi(accountIds), api.query.society.vouching.multi(accountIds)]).pipe(map(([accountIds, payouts, strikes, defenderVotes, suspended, vouching]) => accountIds.map((accountId, index) => ({
      accountId,
      isDefenderVoter: defenderVotes[index].isSome,
      isSuspended: suspended[index].isTrue,
      payouts: payouts[index],
      strikes: strikes[index],
      vote: defenderVotes[index].unwrapOr(undefined),
      vouching: vouching[index].unwrapOr(undefined)
    })))));
  }
  function members$1(instanceId, api) {
    return memo(instanceId, () => api.query.society.members().pipe(switchMap(members => api.derive.society._members(members))));
  }

  const society = /*#__PURE__*/Object.freeze({
    __proto__: null,
    candidates: candidates,
    info: info,
    member: member,
    _members: _members,
    members: members$1
  });

  const QUERY_OPTS = {
    withDestination: true,
    withLedger: true,
    withNominations: true,
    withPrefs: true
  };
  function groupByEra(list) {
    return list.reduce((map, {
      era,
      value
    }) => {
      const key = era.toString();
      map[key] = (map[key] || util.BN_ZERO).add(value.unwrap());
      return map;
    }, {});
  }
  function calculateUnlocking(api, stakingLedger, sessionInfo) {
    const results = Object.entries(groupByEra(((stakingLedger === null || stakingLedger === void 0 ? void 0 : stakingLedger.unlocking) || []).filter(({
      era
    }) => era.unwrap().gt(sessionInfo.activeEra)))).map(([eraString, value]) => ({
      remainingEras: new util.BN(eraString).isub(sessionInfo.activeEra),
      value: api.registry.createType('Balance', value)
    }));
    return results.length ? results : undefined;
  }
  function redeemableSum(api, stakingLedger, sessionInfo) {
    return api.registry.createType('Balance', ((stakingLedger === null || stakingLedger === void 0 ? void 0 : stakingLedger.unlocking) || []).reduce((total, {
      era,
      value
    }) => {
      return sessionInfo.activeEra.gte(era.unwrap()) ? total.iadd(value.unwrap()) : total;
    }, new util.BN(0)));
  }
  function parseResult$1(api, sessionInfo, keys, query) {
    return { ...keys,
      ...query,
      redeemable: redeemableSum(api, query.stakingLedger, sessionInfo),
      unlocking: calculateUnlocking(api, query.stakingLedger, sessionInfo)
    };
  }
  function accounts(instanceId, api) {
    return memo(instanceId, accountIds => api.derive.session.info().pipe(switchMap(sessionInfo => combineLatest([api.derive.staking.keysMulti(accountIds), api.derive.staking.queryMulti(accountIds, QUERY_OPTS)]).pipe(map(([keys, queries]) => queries.map((q, index) => parseResult$1(api, sessionInfo, keys[index], q)))))));
  }
  const account = firstMemo((api, accountId) => api.derive.staking.accounts([accountId]));

  function currentPoints(instanceId, api) {
    return memo(instanceId, () => api.derive.session.indexes().pipe(switchMap(({
      activeEra
    }) => api.query.staking.erasRewardPoints(activeEra))));
  }

  function getEraCache(CACHE_KEY, era, withActive) {
    const cacheKey = `${CACHE_KEY}-${era.toString()}`;
    return [cacheKey, withActive ? undefined : deriveCache.get(cacheKey)];
  }
  function getEraMultiCache(CACHE_KEY, eras, withActive) {
    const cached = withActive ? [] : eras.map(e => deriveCache.get(`${CACHE_KEY}-${e.toString()}`)).filter(v => !!v);
    return cached;
  }
  function setEraCache(cacheKey, withActive, value) {
    !withActive && deriveCache.set(cacheKey, value);
    return value;
  }
  function setEraMultiCache(CACHE_KEY, withActive, values) {
    !withActive && values.forEach(v => deriveCache.set(`${CACHE_KEY}-${v.era.toString()}`, v));
    return values;
  }
  function filterCachedEras(eras, cached, query) {
    return eras.map(e => cached.find(({
      era
    }) => e.eq(era)) || query.find(({
      era
    }) => e.eq(era)));
  }

  const ERA_CHUNK_SIZE = 14;
  function chunkEras(eras, fn) {
    const chunked = util.arrayChunk(eras, ERA_CHUNK_SIZE);
    let index = 0;
    const subject = new BehaviorSubject(chunked[index]);
    return subject.pipe(switchMap(fn), tap(() => {
      util.nextTick(() => {
        index++;
        index === chunked.length ? subject.complete() : subject.next(chunked[index]);
      });
    }), toArray(), map(util.arrayFlatten));
  }
  function filterEras(eras, list) {
    return eras.filter(e => !list.some(({
      era
    }) => e.eq(era)));
  }
  function erasHistoricApply(fn) {
    return (instanceId, api) =>
    memo(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(e => api.derive.staking[fn](e, withActive))));
  }
  function erasHistoricApplyAccount(fn) {
    return (instanceId, api) =>
    memo(instanceId, (accountId, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(e => api.derive.staking[fn](accountId, e, withActive))));
  }
  function singleEra(fn) {
    return (instanceId, api) =>
    memo(instanceId, era => api.derive.staking[fn](era, true));
  }
  function combineEras(fn) {
    return (instanceId, api) =>
    memo(instanceId, (eras, withActive) => !eras.length ? of([]) : chunkEras(eras, eras => combineLatest(eras.map(e => api.derive.staking[fn](e, withActive)))));
  }

  const CACHE_KEY$4 = 'eraExposure';
  function mapStakers(era, stakers) {
    const nominators = {};
    const validators = {};
    stakers.forEach(([key, exposure]) => {
      const validatorId = key.args[1].toString();
      validators[validatorId] = exposure;
      exposure.others.forEach(({
        who
      }, validatorIndex) => {
        const nominatorId = who.toString();
        nominators[nominatorId] = nominators[nominatorId] || [];
        nominators[nominatorId].push({
          validatorId,
          validatorIndex
        });
      });
    });
    return {
      era,
      nominators,
      validators
    };
  }
  function _eraExposure(instanceId, api) {
    return memo(instanceId, (era, withActive = false) => {
      const [cacheKey, cached] = getEraCache(CACHE_KEY$4, era, withActive);
      return cached ? of(cached) : api.query.staking.erasStakersClipped.entries(era).pipe(map(r => setEraCache(cacheKey, withActive, mapStakers(era, r))));
    });
  }
  const eraExposure = singleEra('_eraExposure');
  const _erasExposure = combineEras('_eraExposure');
  const erasExposure = erasHistoricApply('_erasExposure');

  function erasHistoric(instanceId, api) {
    return memo(instanceId, withActive => api.queryMulti([api.query.staking.activeEra, api.query.staking.historyDepth]).pipe(map(([activeEraOpt, historyDepth]) => {
      const result = [];
      const max = historyDepth.toNumber();
      const activeEra = activeEraOpt.unwrapOrDefault().index;
      let lastEra = activeEra;
      while (lastEra.gte(util.BN_ZERO) && result.length < max) {
        if (lastEra !== activeEra || withActive === true) {
          result.push(api.registry.createType('EraIndex', lastEra));
        }
        lastEra = lastEra.sub(util.BN_ONE);
      }
      return result.reverse();
    })));
  }

  const CACHE_KEY$3 = 'eraPoints';
  function mapValidators({
    individual
  }) {
    return [...individual.entries()].filter(([, points]) => points.gt(util.BN_ZERO)).reduce((result, [validatorId, points]) => {
      result[validatorId.toString()] = points;
      return result;
    }, {});
  }
  function mapPoints(eras, points) {
    return eras.map((era, index) => ({
      era,
      eraPoints: points[index].total,
      validators: mapValidators(points[index])
    }));
  }
  function _erasPoints(instanceId, api) {
    return memo(instanceId, (eras, withActive) => {
      if (!eras.length) {
        return of([]);
      }
      const cached = getEraMultiCache(CACHE_KEY$3, eras, withActive);
      const remaining = filterEras(eras, cached);
      return !remaining.length ? of(cached) : api.query.staking.erasRewardPoints.multi(remaining).pipe(map(p => filterCachedEras(eras, cached, setEraMultiCache(CACHE_KEY$3, withActive, mapPoints(remaining, p)))));
    });
  }
  const erasPoints = erasHistoricApply('_erasPoints');

  const CACHE_KEY$2 = 'eraPrefs';
  function mapPrefs(era, all) {
    const validators = {};
    all.forEach(([key, prefs]) => {
      validators[key.args[1].toString()] = prefs;
    });
    return {
      era,
      validators
    };
  }
  function _eraPrefs(instanceId, api) {
    return memo(instanceId, (era, withActive) => {
      const [cacheKey, cached] = getEraCache(CACHE_KEY$2, era, withActive);
      return cached ? of(cached) : api.query.staking.erasValidatorPrefs.entries(era).pipe(map(r => setEraCache(cacheKey, withActive, mapPrefs(era, r))));
    });
  }
  const eraPrefs = singleEra('_eraPrefs');
  const _erasPrefs = combineEras('_eraPrefs');
  const erasPrefs = erasHistoricApply('_erasPrefs');

  const CACHE_KEY$1 = 'eraRewards';
  function mapRewards(eras, optRewards) {
    return eras.map((era, index) => ({
      era,
      eraReward: optRewards[index].unwrapOrDefault()
    }));
  }
  function _erasRewards(instanceId, api) {
    return memo(instanceId, (eras, withActive) => {
      if (!eras.length) {
        return of([]);
      }
      const cached = getEraMultiCache(CACHE_KEY$1, eras, withActive);
      const remaining = filterEras(eras, cached);
      if (!remaining.length) {
        return of(cached);
      }
      return api.query.staking.erasValidatorReward.multi(remaining).pipe(map(r => filterCachedEras(eras, cached, setEraMultiCache(CACHE_KEY$1, withActive, mapRewards(remaining, r)))));
    });
  }
  const erasRewards = erasHistoricApply('_erasRewards');

  const CACHE_KEY = 'eraSlashes';
  function mapSlashes(era, noms, vals) {
    const nominators = {};
    const validators = {};
    noms.forEach(([key, optBalance]) => {
      nominators[key.args[1].toString()] = optBalance.unwrap();
    });
    vals.forEach(([key, optRes]) => {
      validators[key.args[1].toString()] = optRes.unwrapOrDefault()[1];
    });
    return {
      era,
      nominators,
      validators
    };
  }
  function _eraSlashes(instanceId, api) {
    return memo(instanceId, (era, withActive) => {
      const [cacheKey, cached] = getEraCache(CACHE_KEY, era, withActive);
      return cached ? of(cached) : combineLatest([api.query.staking.nominatorSlashInEra.entries(era), api.query.staking.validatorSlashInEra.entries(era)]).pipe(map(([n, v]) => setEraCache(cacheKey, withActive, mapSlashes(era, n, v))));
    });
  }
  const eraSlashes = singleEra('_eraSlashes');
  const _erasSlashes = combineEras('_eraSlashes');
  const erasSlashes = erasHistoricApply('_erasSlashes');

  const DEFAULT_FLAGS$1 = {
    withController: true,
    withExposure: true,
    withPrefs: true
  };
  function combineAccounts(nextElected, validators) {
    return util.arrayFlatten([nextElected, validators.filter(v => !nextElected.find(n => n.eq(v)))]);
  }
  function electedInfo(instanceId, api) {
    return memo(instanceId, (flags = DEFAULT_FLAGS$1) => api.derive.staking.validators().pipe(switchMap(({
      nextElected,
      validators
    }) => api.derive.staking.queryMulti(combineAccounts(nextElected, validators), flags).pipe(map(info => ({
      info,
      nextElected,
      validators
    }))))));
  }

  function extractsIds(stashId, queuedKeys, nextKeys) {
    const sessionIds = (queuedKeys.find(([currentId]) => currentId.eq(stashId)) || [undefined, []])[1];
    const nextSessionIds = nextKeys.unwrapOr([]);
    return {
      nextSessionIds: Array.isArray(nextSessionIds) ? nextSessionIds : [...nextSessionIds.values()],
      sessionIds: Array.isArray(sessionIds) ? sessionIds : [...sessionIds.values()]
    };
  }
  const keys = firstMemo((api, stashId) => api.derive.staking.keysMulti([stashId]));
  function keysMulti(instanceId, api) {
    return memo(instanceId, stashIds => stashIds.length ? api.query.session.queuedKeys().pipe(switchMap(queuedKeys => {
      var _api$consts$session;
      return combineLatest([of(queuedKeys), (_api$consts$session = api.consts.session) !== null && _api$consts$session !== void 0 && _api$consts$session.dedupKeyPrefix ? api.query.session.nextKeys.multi(stashIds.map(s => [api.consts.session.dedupKeyPrefix, s])) : combineLatest(stashIds.map(s => api.query.session.nextKeys(s)))]);
    }), map(([queuedKeys, nextKeys]) => stashIds.map((stashId, index) => extractsIds(stashId, queuedKeys, nextKeys[index])))) : of([]));
  }

  function overview(instanceId, api) {
    return memo(instanceId, () => combineLatest([api.derive.session.indexes(), api.derive.staking.validators()]).pipe(map(([indexes, {
      nextElected,
      validators
    }]) => ({ ...indexes,
      nextElected,
      validators
    }))));
  }

  function _ownExposures(instanceId, api) {
    return memo(instanceId, (accountId, eras, _withActive) => eras.length ? combineLatest([combineLatest(eras.map(e => api.query.staking.erasStakersClipped(e, accountId))), combineLatest(eras.map(e => api.query.staking.erasStakers(e, accountId)))]).pipe(map(([clp, exp]) => eras.map((era, index) => ({
      clipped: clp[index],
      era,
      exposure: exp[index]
    })))) : of([]));
  }
  const ownExposure = firstMemo((api, accountId, era) => api.derive.staking._ownExposures(accountId, [era], true));
  const ownExposures = erasHistoricApplyAccount('_ownExposures');

  function _ownSlashes(instanceId, api) {
    return memo(instanceId, (accountId, eras, _withActive) => eras.length ? combineLatest([combineLatest(eras.map(e => api.query.staking.validatorSlashInEra(e, accountId))), combineLatest(eras.map(e => api.query.staking.nominatorSlashInEra(e, accountId)))]).pipe(map(([vals, noms]) => eras.map((era, index) => ({
      era,
      total: vals[index].isSome ? vals[index].unwrap()[1] : noms[index].unwrapOrDefault()
    })))) : of([]));
  }
  const ownSlash = firstMemo((api, accountId, era) => api.derive.staking._ownSlashes(accountId, [era], true));
  const ownSlashes = erasHistoricApplyAccount('_ownSlashes');

  function parseDetails(stashId, controllerIdOpt, nominatorsOpt, rewardDestination, validatorPrefs, exposure, stakingLedgerOpt) {
    return {
      accountId: stashId,
      controllerId: controllerIdOpt && controllerIdOpt.unwrapOr(null),
      exposure,
      nominators: nominatorsOpt.isSome ? nominatorsOpt.unwrap().targets : [],
      rewardDestination,
      stakingLedger: stakingLedgerOpt.unwrapOrDefault(),
      stashId,
      validatorPrefs
    };
  }
  function getLedgers(api, optIds, {
    withLedger = false
  }) {
    const ids = optIds.filter(o => withLedger && !!o && o.isSome).map(o => o.unwrap());
    const emptyLed = api.registry.createType('Option<StakingLedger>');
    return (ids.length ? combineLatest(ids.map(s => api.query.staking.ledger(s))) : of([])).pipe(map(optLedgers => {
      let offset = -1;
      return optIds.map(o => o && o.isSome ? optLedgers[++offset] || emptyLed : emptyLed);
    }));
  }
  function getStashInfo(api, stashIds, activeEra, {
    withController,
    withDestination,
    withExposure,
    withLedger,
    withNominations,
    withPrefs
  }) {
    const emptyNoms = api.registry.createType('Option<Nominations>');
    const emptyRewa = api.registry.createType('RewardDestination');
    const emptyExpo = api.registry.createType('Exposure');
    const emptyPrefs = api.registry.createType('ValidatorPrefs');
    return combineLatest([withController || withLedger ? combineLatest(stashIds.map(s => api.query.staking.bonded(s))) : of(stashIds.map(() => null)), withNominations ? combineLatest(stashIds.map(s => api.query.staking.nominators(s))) : of(stashIds.map(() => emptyNoms)), withDestination ? combineLatest(stashIds.map(s => api.query.staking.payee(s))) : of(stashIds.map(() => emptyRewa)), withPrefs ? combineLatest(stashIds.map(s => api.query.staking.validators(s))) : of(stashIds.map(() => emptyPrefs)), withExposure ? combineLatest(stashIds.map(s => api.query.staking.erasStakers(activeEra, s))) : of(stashIds.map(() => emptyExpo))]);
  }
  function getBatch(api, activeEra, stashIds, flags) {
    return getStashInfo(api, stashIds, activeEra, flags).pipe(switchMap(([controllerIdOpt, nominatorsOpt, rewardDestination, validatorPrefs, exposure]) => getLedgers(api, controllerIdOpt, flags).pipe(map(stakingLedgerOpts => stashIds.map((stashId, index) => parseDetails(stashId, controllerIdOpt[index], nominatorsOpt[index], rewardDestination[index], validatorPrefs[index], exposure[index], stakingLedgerOpts[index]))))));
  }
  const query = firstMemo((api, accountId, flags) => api.derive.staking.queryMulti([accountId], flags));
  function queryMulti(instanceId, api) {
    return memo(instanceId, (accountIds, flags) => accountIds.length ? api.derive.session.indexes().pipe(switchMap(({
      activeEra
    }) => {
      const stashIds = accountIds.map(accountId => api.registry.createType('AccountId', accountId));
      return getBatch(api, activeEra, stashIds, flags);
    })) : of([]));
  }

  function _stakerExposures(instanceId, api) {
    return memo(instanceId, (accountIds, eras, withActive = false) => {
      const stakerIds = accountIds.map(a => api.registry.createType('AccountId', a).toString());
      return api.derive.staking._erasExposure(eras, withActive).pipe(map(exposures => stakerIds.map(stakerId => exposures.map(({
        era,
        nominators: allNominators,
        validators: allValidators
      }) => {
        const isValidator = !!allValidators[stakerId];
        const validators = {};
        const nominating = allNominators[stakerId] || [];
        if (isValidator) {
          validators[stakerId] = allValidators[stakerId];
        } else if (nominating) {
          nominating.forEach(({
            validatorId
          }) => {
            validators[validatorId] = allValidators[validatorId];
          });
        }
        return {
          era,
          isEmpty: !Object.keys(validators).length,
          isValidator,
          nominating,
          validators
        };
      }))));
    });
  }
  function stakerExposures(instanceId, api) {
    return memo(instanceId, (accountIds, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._stakerExposures(accountIds, eras, withActive))));
  }
  const stakerExposure = firstMemo((api, accountId, withActive) => api.derive.staking.stakerExposures([accountId], withActive));

  function _stakerPoints(instanceId, api) {
    return memo(instanceId, (accountId, eras, withActive) => {
      const stakerId = api.registry.createType('AccountId', accountId).toString();
      return api.derive.staking._erasPoints(eras, withActive).pipe(map(points => points.map(({
        era,
        eraPoints,
        validators
      }) => ({
        era,
        eraPoints,
        points: validators[stakerId] || api.registry.createType('RewardPoint')
      }))));
    });
  }
  const stakerPoints = erasHistoricApplyAccount('_stakerPoints');

  function _stakerPrefs(instanceId, api) {
    return memo(instanceId, (accountId, eras, _withActive) => api.query.staking.erasValidatorPrefs.multi(eras.map(e => [e, accountId])).pipe(map(all => all.map((validatorPrefs, index) => ({
      era: eras[index],
      validatorPrefs
    })))));
  }
  const stakerPrefs = erasHistoricApplyAccount('_stakerPrefs');

  function parseRewards(api, stashId, [erasPoints, erasPrefs, erasRewards], exposures) {
    return exposures.map(({
      era,
      isEmpty,
      isValidator,
      nominating,
      validators: eraValidators
    }) => {
      const {
        eraPoints,
        validators: allValPoints
      } = erasPoints.find(p => p.era.eq(era)) || {
        eraPoints: util.BN_ZERO,
        validators: {}
      };
      const {
        eraReward
      } = erasRewards.find(r => r.era.eq(era)) || {
        eraReward: api.registry.createType('Balance')
      };
      const {
        validators: allValPrefs
      } = erasPrefs.find(p => p.era.eq(era)) || {
        validators: {}
      };
      const validators = {};
      const stakerId = stashId.toString();
      Object.entries(eraValidators).forEach(([validatorId, exposure]) => {
        var _allValPrefs$validato, _exposure$total;
        const valPoints = allValPoints[validatorId] || util.BN_ZERO;
        const valComm = ((_allValPrefs$validato = allValPrefs[validatorId]) === null || _allValPrefs$validato === void 0 ? void 0 : _allValPrefs$validato.commission.unwrap()) || util.BN_ZERO;
        const expTotal = ((_exposure$total = exposure.total) === null || _exposure$total === void 0 ? void 0 : _exposure$total.unwrap()) || util.BN_ZERO;
        let avail = util.BN_ZERO;
        let value;
        if (!(expTotal.isZero() || valPoints.isZero() || eraPoints.isZero())) {
          avail = eraReward.mul(valPoints).div(eraPoints);
          const valCut = valComm.mul(avail).div(util.BN_BILLION);
          let staked;
          if (validatorId === stakerId) {
            staked = exposure.own.unwrap();
          } else {
            const stakerExp = exposure.others.find(({
              who
            }) => who.eq(stakerId));
            staked = stakerExp ? stakerExp.value.unwrap() : util.BN_ZERO;
          }
          value = avail.sub(valCut).imul(staked).div(expTotal).iadd(validatorId === stakerId ? valCut : util.BN_ZERO);
        }
        validators[validatorId] = {
          total: api.registry.createType('Balance', avail),
          value: api.registry.createType('Balance', value)
        };
      });
      return {
        era,
        eraReward,
        isEmpty,
        isValidator,
        nominating,
        validators
      };
    });
  }
  function allUniqValidators(rewards) {
    return rewards.reduce(([all, perStash], rewards) => {
      const uniq = [];
      perStash.push(uniq);
      rewards.forEach(({
        validators
      }) => Object.keys(validators).forEach(validatorId => {
        if (!uniq.includes(validatorId)) {
          uniq.push(validatorId);
          if (!all.includes(validatorId)) {
            all.push(validatorId);
          }
        }
      }));
      return [all, perStash];
    }, [[], []]);
  }
  function removeClaimed(validators, queryValidators, reward) {
    const rm = [];
    Object.keys(reward.validators).forEach(validatorId => {
      const index = validators.indexOf(validatorId);
      if (index !== -1) {
        const valLedger = queryValidators[index].stakingLedger;
        if (valLedger !== null && valLedger !== void 0 && valLedger.claimedRewards.some(e => reward.era.eq(e))) {
          rm.push(validatorId);
        }
      }
    });
    rm.forEach(validatorId => {
      delete reward.validators[validatorId];
    });
  }
  function filterRewards(eras, valInfo, {
    rewards,
    stakingLedger
  }) {
    const filter = eras.filter(e => !stakingLedger.claimedRewards.some(s => s.eq(e)));
    const validators = valInfo.map(([v]) => v);
    const queryValidators = valInfo.map(([, q]) => q);
    return rewards.filter(({
      isEmpty
    }) => !isEmpty).filter(reward => {
      if (!filter.some(e => reward.era.eq(e))) {
        return false;
      }
      removeClaimed(validators, queryValidators, reward);
      return true;
    }).filter(({
      validators
    }) => Object.keys(validators).length !== 0).map(reward => ({ ...reward,
      nominators: reward.nominating.filter(n => reward.validators[n.validatorId])
    }));
  }
  function _stakerRewardsEras(instanceId, api) {
    return memo(instanceId, (eras, withActive = false) => combineLatest([api.derive.staking._erasPoints(eras, withActive), api.derive.staking._erasPrefs(eras, withActive), api.derive.staking._erasRewards(eras, withActive)]));
  }
  function _stakerRewards(instanceId, api) {
    return memo(instanceId, (accountIds, eras, withActive = false) => combineLatest([api.derive.staking.queryMulti(accountIds, {
      withLedger: true
    }), api.derive.staking._stakerExposures(accountIds, eras, withActive), api.derive.staking._stakerRewardsEras(eras, withActive)]).pipe(switchMap(([queries, exposures, erasResult]) => {
      const allRewards = queries.map(({
        stakingLedger,
        stashId
      }, index) => !stashId || !stakingLedger ? [] : parseRewards(api, stashId, erasResult, exposures[index]));
      if (withActive) {
        return of(allRewards);
      }
      const [allValidators, stashValidators] = allUniqValidators(allRewards);
      return api.derive.staking.queryMulti(allValidators, {
        withLedger: true
      }).pipe(map(queriedVals => queries.map(({
        stakingLedger
      }, index) => filterRewards(eras, stashValidators[index].map(validatorId => [validatorId, queriedVals.find(q => q.accountId.eq(validatorId))]), {
        rewards: allRewards[index],
        stakingLedger
      }))));
    })));
  }
  const stakerRewards = firstMemo((api, accountId, withActive) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._stakerRewards([accountId], eras, withActive))));
  function stakerRewardsMultiEras(instanceId, api) {
    return memo(instanceId, (accountIds, eras) => accountIds.length && eras.length ? api.derive.staking._stakerRewards(accountIds, eras, false) : of([]));
  }
  function stakerRewardsMulti(instanceId, api) {
    return memo(instanceId, (accountIds, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking.stakerRewardsMultiEras(accountIds, eras))));
  }

  function _stakerSlashes(instanceId, api) {
    return memo(instanceId, (accountId, eras, withActive) => {
      const stakerId = api.registry.createType('AccountId', accountId).toString();
      return api.derive.staking._erasSlashes(eras, withActive).pipe(map(slashes => slashes.map(({
        era,
        nominators,
        validators
      }) => ({
        era,
        total: nominators[stakerId] || validators[stakerId] || api.registry.createType('Balance')
      }))));
    });
  }
  const stakerSlashes = erasHistoricApplyAccount('_stakerSlashes');

  function onBondedEvent(api) {
    let current = Date.now();
    return api.query.system.events().pipe(map(events => {
      current = events.filter(({
        event,
        phase
      }) => {
        try {
          return phase.isApplyExtrinsic && event.section === 'staking' && event.method === 'Bonded';
        } catch {
          return false;
        }
      }) ? Date.now() : current;
      return current;
    }), startWith(current), drr({
      skipTimeout: true
    }));
  }
  function stashes(instanceId, api) {
    return memo(instanceId, () => onBondedEvent(api).pipe(switchMap(() => api.query.staking.validators.keys()), map(keys => keys.map(({
      args: [v]
    }) => v).filter(a => a))));
  }

  function nextElected(instanceId, api) {
    return memo(instanceId, () => api.query.staking.erasStakers ? api.derive.session.indexes().pipe(
    switchMap(({
      currentEra
    }) => api.query.staking.erasStakers.keys(currentEra)), map(keys => keys.map(({
      args: [, accountId]
    }) => accountId))) : api.query.staking.currentElected());
  }
  function validators(instanceId, api) {
    return memo(instanceId, () =>
    combineLatest([api.query.session ? api.query.session.validators() : of([]), api.query.staking ? api.derive.staking.nextElected() : of([])]).pipe(map(([validators, nextElected]) => ({
      nextElected: nextElected.length ? nextElected : validators,
      validators
    }))));
  }

  const DEFAULT_FLAGS = {
    withController: true,
    withPrefs: true
  };
  function waitingInfo(instanceId, api) {
    return memo(instanceId, (flags = DEFAULT_FLAGS) => combineLatest([api.derive.staking.validators(), api.derive.staking.stashes()]).pipe(switchMap(([{
      nextElected
    }, stashes]) => {
      const elected = nextElected.map(a => a.toString());
      const waiting = stashes.filter(v => !elected.includes(v.toString()));
      return api.derive.staking.queryMulti(waiting, flags).pipe(map(info => ({
        info,
        waiting
      })));
    })));
  }

  const staking = /*#__PURE__*/Object.freeze({
    __proto__: null,
    accounts: accounts,
    account: account,
    currentPoints: currentPoints,
    _eraExposure: _eraExposure,
    eraExposure: eraExposure,
    _erasExposure: _erasExposure,
    erasExposure: erasExposure,
    erasHistoric: erasHistoric,
    _erasPoints: _erasPoints,
    erasPoints: erasPoints,
    _eraPrefs: _eraPrefs,
    eraPrefs: eraPrefs,
    _erasPrefs: _erasPrefs,
    erasPrefs: erasPrefs,
    _erasRewards: _erasRewards,
    erasRewards: erasRewards,
    _eraSlashes: _eraSlashes,
    eraSlashes: eraSlashes,
    _erasSlashes: _erasSlashes,
    erasSlashes: erasSlashes,
    electedInfo: electedInfo,
    keys: keys,
    keysMulti: keysMulti,
    overview: overview,
    _ownExposures: _ownExposures,
    ownExposure: ownExposure,
    ownExposures: ownExposures,
    _ownSlashes: _ownSlashes,
    ownSlash: ownSlash,
    ownSlashes: ownSlashes,
    query: query,
    queryMulti: queryMulti,
    _stakerExposures: _stakerExposures,
    stakerExposures: stakerExposures,
    stakerExposure: stakerExposure,
    _stakerPoints: _stakerPoints,
    stakerPoints: stakerPoints,
    _stakerPrefs: _stakerPrefs,
    stakerPrefs: stakerPrefs,
    _stakerRewardsEras: _stakerRewardsEras,
    _stakerRewards: _stakerRewards,
    stakerRewards: stakerRewards,
    stakerRewardsMultiEras: stakerRewardsMultiEras,
    stakerRewardsMulti: stakerRewardsMulti,
    _stakerSlashes: _stakerSlashes,
    stakerSlashes: stakerSlashes,
    stashes: stashes,
    nextElected: nextElected,
    validators: validators,
    waitingInfo: waitingInfo
  });

  const members = members$4('technicalCommittee');
  const hasProposals = hasProposals$3('technicalCommittee');
  const proposal = proposal$3('technicalCommittee');
  const proposalCount = proposalCount$3('technicalCommittee');
  const proposalHashes = proposalHashes$3('technicalCommittee');
  const proposals$1 = proposals$5('technicalCommittee');
  const prime = prime$3('technicalCommittee');

  const technicalCommittee = /*#__PURE__*/Object.freeze({
    __proto__: null,
    members: members,
    hasProposals: hasProposals,
    proposal: proposal,
    proposalCount: proposalCount,
    proposalHashes: proposalHashes,
    proposals: proposals$1,
    prime: prime
  });

  function parseResult(api, {
    allIds,
    allProposals,
    approvalIds,
    councilProposals,
    proposalCount
  }) {
    const approvals = [];
    const proposals = [];
    const councilTreasury = councilProposals.filter(({
      proposal
    }) => proposal && (api.tx.treasury.approveProposal.is(proposal) || api.tx.treasury.rejectProposal.is(proposal)));
    allIds.forEach((id, index) => {
      if (allProposals[index].isSome) {
        const council = councilTreasury.filter(({
          proposal
        }) => proposal && id.eq(proposal.args[0])).sort((a, b) => a.proposal && b.proposal ? a.proposal.method.localeCompare(b.proposal.method) : a.proposal ? -1 : 1);
        const isApproval = approvalIds.some(approvalId => approvalId.eq(id));
        const derived = {
          council,
          id,
          proposal: allProposals[index].unwrap()
        };
        if (isApproval) {
          approvals.push(derived);
        } else {
          proposals.push(derived);
        }
      }
    });
    return {
      approvals,
      proposalCount,
      proposals
    };
  }
  function retrieveProposals(api, proposalCount, approvalIds) {
    const proposalIds = [];
    const count = proposalCount.toNumber();
    for (let index = 0; index < count; index++) {
      if (!approvalIds.some(id => id.eqn(index))) {
        proposalIds.push(api.registry.createType('ProposalIndex', index));
      }
    }
    const allIds = [...proposalIds, ...approvalIds];
    return combineLatest([api.query.treasury.proposals.multi(allIds), api.derive.council ? api.derive.council.proposals() : of([])]).pipe(map(([allProposals, councilProposals]) => parseResult(api, {
      allIds,
      allProposals,
      approvalIds,
      councilProposals,
      proposalCount
    })));
  }
  function proposals(instanceId, api) {
    return memo(instanceId, () => api.query.treasury ? combineLatest([api.query.treasury.proposalCount(), api.query.treasury.approvals()]).pipe(switchMap(([proposalCount, approvalIds]) => retrieveProposals(api, proposalCount, approvalIds))) : of({
      approvals: [],
      proposalCount: api.registry.createType('ProposalIndex'),
      proposals: []
    }));
  }

  const treasury = /*#__PURE__*/Object.freeze({
    __proto__: null,
    proposals: proposals
  });

  function events(instanceId, api) {
    return memo(instanceId, blockHash => combineLatest([api.rpc.chain.getBlock(blockHash), api.queryAt(blockHash).pipe(switchMap(queryAt => queryAt.system.events()))]).pipe(map(([block, events]) => ({
      block,
      events
    }))));
  }

  const FALLBACK_MAX_HASH_COUNT = 250;
  const FALLBACK_PERIOD = new util.BN(6 * 1000);
  const MAX_FINALITY_LAG = new util.BN(5);
  const MORTAL_PERIOD = new util.BN(5 * 60 * 1000);

  function latestNonce(api, address) {
    return api.derive.balances.account(address).pipe(map(({
      accountNonce
    }) => accountNonce));
  }
  function nextNonce(api, address) {
    var _api$rpc$system;
    return (_api$rpc$system = api.rpc.system) !== null && _api$rpc$system !== void 0 && _api$rpc$system.accountNextIndex ? api.rpc.system.accountNextIndex(address) : latestNonce(api, address);
  }
  function signingHeader(api) {
    return combineLatest([api.rpc.chain.getHeader().pipe(switchMap(header =>
    header.parentHash.isEmpty ? of(header)
    : api.rpc.chain.getHeader(header.parentHash))), api.rpc.chain.getFinalizedHead().pipe(switchMap(hash => api.rpc.chain.getHeader(hash)))]).pipe(map(([current, finalized]) =>
    current.number.unwrap().sub(finalized.number.unwrap()).gt(MAX_FINALITY_LAG) ? current : finalized));
  }
  function signingInfo(_instanceId, api) {
    return (address, nonce, era) => combineLatest([
    util.isUndefined(nonce) ? latestNonce(api, address) : nonce === -1 ? nextNonce(api, address) : of(api.registry.createType('Index', nonce)),
    util.isUndefined(era) || util.isNumber(era) && era > 0 ? signingHeader(api) : of(null)]).pipe(map(([nonce, header]) => {
      var _api$consts$system, _api$consts$system$bl, _api$consts$babe, _api$consts$timestamp;
      return {
        header,
        mortalLength: Math.min(((_api$consts$system = api.consts.system) === null || _api$consts$system === void 0 ? void 0 : (_api$consts$system$bl = _api$consts$system.blockHashCount) === null || _api$consts$system$bl === void 0 ? void 0 : _api$consts$system$bl.toNumber()) || FALLBACK_MAX_HASH_COUNT, MORTAL_PERIOD.div(((_api$consts$babe = api.consts.babe) === null || _api$consts$babe === void 0 ? void 0 : _api$consts$babe.expectedBlockTime) || ((_api$consts$timestamp = api.consts.timestamp) === null || _api$consts$timestamp === void 0 ? void 0 : _api$consts$timestamp.minimumPeriod.muln(2)) || FALLBACK_PERIOD).iadd(MAX_FINALITY_LAG).toNumber()),
        nonce
      };
    }));
  }

  const tx = /*#__PURE__*/Object.freeze({
    __proto__: null,
    events: events,
    signingInfo: signingInfo
  });

  const derive = {
    accounts: accounts$1,
    bagsList,
    balances,
    bounties,
    chain,
    contracts,
    council,
    crowdloan,
    democracy,
    elections,
    imOnline,
    membership,
    parachains,
    session,
    society,
    staking,
    technicalCommittee,
    treasury,
    tx
  };

  const checks = {
    bagsList: {
      instances: ['voterList', 'bagsList'],
      methods: [],
      withDetect: true
    },
    contracts: {
      instances: ['contracts'],
      methods: []
    },
    council: {
      instances: ['council'],
      methods: [],
      withDetect: true
    },
    crowdloan: {
      instances: ['crowdloan'],
      methods: []
    },
    democracy: {
      instances: ['democracy'],
      methods: []
    },
    elections: {
      instances: ['phragmenElection', 'electionsPhragmen', 'elections', 'council'],
      methods: [],
      withDetect: true
    },
    imOnline: {
      instances: ['imOnline'],
      methods: []
    },
    membership: {
      instances: ['membership'],
      methods: []
    },
    parachains: {
      instances: ['parachains', 'registrar'],
      methods: []
    },
    session: {
      instances: ['session'],
      methods: []
    },
    society: {
      instances: ['society'],
      methods: []
    },
    staking: {
      instances: ['staking'],
      methods: ['erasRewardPoints']
    },
    technicalCommittee: {
      instances: ['technicalCommittee'],
      methods: [],
      withDetect: true
    },
    treasury: {
      instances: ['treasury'],
      methods: []
    }
  };
  function getModuleInstances(api, specName, moduleName) {
    return api.registry.getModuleInstances(specName, moduleName) || [];
  }
  function injectFunctions(instanceId, api, derives) {
    const result = {};
    const names = Object.keys(derives);
    const keys = Object.keys(api.query);
    const specName = api.runtimeVersion.specName.toString();
    const filterKeys = q => keys.includes(q);
    const filterInstances = q => getModuleInstances(api, specName, q).some(filterKeys);
    const filterMethods = all => m => all.some(q => keys.includes(q) && api.query[q][m]);
    const getKeys = s => Object.keys(derives[s]);
    const creator = (s, m) => derives[s][m](instanceId, api);
    const isIncluded = c => !checks[c] || checks[c].instances.some(filterKeys) && (!checks[c].methods.length || checks[c].methods.every(filterMethods(checks[c].instances))) || checks[c].withDetect && checks[c].instances.some(filterInstances);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      isIncluded(name) && lazyDeriveSection(result, name, getKeys, creator);
    }
    return result;
  }
  function getAvailableDerives(instanceId, api, custom = {}) {
    return { ...injectFunctions(instanceId, api, derive),
      ...injectFunctions(instanceId, api, custom)
    };
  }

  function decorateDeriveSections(decorateMethod, derives) {
    const getKeys = s => Object.keys(derives[s]);
    const creator = (s, m) => decorateMethod(derives[s][m]);
    const result = {};
    const names = Object.keys(derives);
    for (let i = 0; i < names.length; i++) {
      lazyDeriveSection(result, names[i], getKeys, creator);
    }
    return result;
  }

  const l$3 = util.logger('api/util');

  function filterEvents(txHash, {
    block: {
      extrinsics,
      header
    }
  }, allEvents, status) {
    for (const [txIndex, x] of extrinsics.entries()) {
      if (x.hash.eq(txHash)) {
        return {
          events: allEvents.filter(({
            phase
          }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eqn(txIndex)),
          txIndex
        };
      }
    }
    if (status.isInBlock) {
      const allHashes = extrinsics.map(x => x.hash.toHex());
      l$3.warn(`block ${header.hash.toHex()}: Unable to find extrinsic ${txHash.toHex()} inside ${allHashes.join(', ')}`);
    }
    return {};
  }

  function isKeyringPair(account) {
    return util.isFunction(account.sign);
  }

  const recordIdentity = record => record;
  function filterAndApply(events, section, methods, onFound) {
    return events.filter(({
      event
    }) => section === event.section && methods.includes(event.method)).map(record => onFound(record));
  }
  function getDispatchError({
    event: {
      data: [dispatchError]
    }
  }) {
    return dispatchError;
  }
  function getDispatchInfo({
    event: {
      data,
      method
    }
  }) {
    return method === 'ExtrinsicSuccess' ? data[0] : data[1];
  }
  function extractError(events = []) {
    return filterAndApply(events, 'system', ['ExtrinsicFailed'], getDispatchError)[0];
  }
  function extractInfo(events = []) {
    return filterAndApply(events, 'system', ['ExtrinsicFailed', 'ExtrinsicSuccess'], getDispatchInfo)[0];
  }
  class SubmittableResult {
    constructor({
      dispatchError,
      dispatchInfo,
      events,
      internalError,
      status,
      txHash,
      txIndex
    }) {
      this.dispatchError = dispatchError || extractError(events);
      this.dispatchInfo = dispatchInfo || extractInfo(events);
      this.events = events || [];
      this.internalError = internalError;
      this.status = status;
      this.txHash = txHash;
      this.txIndex = txIndex;
    }
    get isCompleted() {
      return this.isError || this.status.isInBlock || this.status.isFinalized;
    }
    get isError() {
      return this.status.isDropped || this.status.isFinalityTimeout || this.status.isInvalid || this.status.isUsurped;
    }
    get isFinalized() {
      return this.status.isFinalized;
    }
    get isInBlock() {
      return this.status.isInBlock;
    }
    get isWarning() {
      return this.status.isRetracted;
    }
    filterRecords(section, method) {
      return filterAndApply(this.events, section, Array.isArray(method) ? method : [method], recordIdentity);
    }
    findRecord(section, method) {
      return this.filterRecords(section, method)[0];
    }
    toHuman(isExtended) {
      var _this$dispatchError, _this$dispatchInfo, _this$internalError;
      return {
        dispatchError: (_this$dispatchError = this.dispatchError) === null || _this$dispatchError === void 0 ? void 0 : _this$dispatchError.toHuman(),
        dispatchInfo: (_this$dispatchInfo = this.dispatchInfo) === null || _this$dispatchInfo === void 0 ? void 0 : _this$dispatchInfo.toHuman(),
        events: this.events.map(e => e.toHuman(isExtended)),
        internalError: (_this$internalError = this.internalError) === null || _this$internalError === void 0 ? void 0 : _this$internalError.message.toString(),
        status: this.status.toHuman(isExtended)
      };
    }
  }

  const identity = input => input;
  function makeEraOptions(api, registry, partialOptions, {
    header,
    mortalLength,
    nonce
  }) {
    if (!header) {
      util.assert(partialOptions.era === 0 || !util.isUndefined(partialOptions.blockHash), 'Expected blockHash to be passed alongside non-immortal era options');
      if (util.isNumber(partialOptions.era)) {
        delete partialOptions.era;
        delete partialOptions.blockHash;
      }
      return makeSignOptions(api, partialOptions, {
        nonce
      });
    }
    return makeSignOptions(api, partialOptions, {
      blockHash: header.hash,
      era: registry.createTypeUnsafe('ExtrinsicEra', [{
        current: header.number,
        period: partialOptions.era || mortalLength
      }]),
      nonce
    });
  }
  function makeSignAndSendOptions(partialOptions, statusCb) {
    let options = {};
    if (util.isFunction(partialOptions)) {
      statusCb = partialOptions;
    } else {
      options = util.objectSpread({}, partialOptions);
    }
    return [options, statusCb];
  }
  function makeSignOptions(api, partialOptions, extras) {
    return util.objectSpread({
      blockHash: api.genesisHash,
      genesisHash: api.genesisHash
    }, partialOptions, extras, {
      runtimeVersion: api.runtimeVersion,
      signedExtensions: api.registry.signedExtensions,
      version: api.extrinsicType
    });
  }
  function optionsOrNonce(partialOptions = {}) {
    return util.isBn(partialOptions) || util.isNumber(partialOptions) ? {
      nonce: partialOptions
    } : partialOptions;
  }
  function createClass({
    api,
    apiType,
    blockHash,
    decorateMethod
  }) {
    const ExtrinsicBase = api.registry.createClass('Extrinsic');
    class Submittable extends ExtrinsicBase {
      #ignoreStatusCb;
      #transformResult = identity;
      constructor(registry, extrinsic) {
        super(registry, extrinsic, {
          version: api.extrinsicType
        });
        this.#ignoreStatusCb = apiType === 'rxjs';
      }
      dryRun(account, optionsOrHash) {
        if (blockHash || util.isString(optionsOrHash) || util.isU8a(optionsOrHash)) {
          return decorateMethod(() => api.rpc.system.dryRun(this.toHex(), blockHash || optionsOrHash));
        }
        return decorateMethod(() => this.#observeSign(account, optionsOrHash).pipe(switchMap(() => api.rpc.system.dryRun(this.toHex()))))();
      }
      paymentInfo(account, optionsOrHash) {
        if (blockHash || util.isString(optionsOrHash) || util.isU8a(optionsOrHash)) {
          return decorateMethod(() => api.rpc.payment.queryInfo(this.toHex(), blockHash || optionsOrHash));
        }
        const [allOptions] = makeSignAndSendOptions(optionsOrHash);
        const address = isKeyringPair(account) ? account.address : account.toString();
        return decorateMethod(() => api.derive.tx.signingInfo(address, allOptions.nonce, allOptions.era).pipe(first(), switchMap(signingInfo => {
          const eraOptions = makeEraOptions(api, this.registry, allOptions, signingInfo);
          const signOptions = makeSignOptions(api, eraOptions, {});
          return api.rpc.payment.queryInfo(this.isSigned ? api.tx(this).signFake(address, signOptions).toHex() : this.signFake(address, signOptions).toHex());
        })))();
      }
      send(statusCb) {
        const isSubscription = api.hasSubscriptions && (this.#ignoreStatusCb || !!statusCb);
        return decorateMethod(isSubscription ? this.#observeSubscribe : this.#observeSend)(statusCb);
      }
      sign(account, partialOptions) {
        super.sign(account, makeSignOptions(api, optionsOrNonce(partialOptions), {}));
        return this;
      }
      signAsync(account, partialOptions) {
        return decorateMethod(() => this.#observeSign(account, partialOptions).pipe(mapTo(this)))();
      }
      signAndSend(account, partialOptions, optionalStatusCb) {
        const [options, statusCb] = makeSignAndSendOptions(partialOptions, optionalStatusCb);
        const isSubscription = api.hasSubscriptions && (this.#ignoreStatusCb || !!statusCb);
        return decorateMethod(() => this.#observeSign(account, options).pipe(switchMap(info => isSubscription ? this.#observeSubscribe(info) : this.#observeSend(info)))
        )(statusCb);
      }
      withResultTransform(transform) {
        this.#transformResult = transform;
        return this;
      }
      #observeSign = (account, partialOptions) => {
        const address = isKeyringPair(account) ? account.address : account.toString();
        const options = optionsOrNonce(partialOptions);
        return api.derive.tx.signingInfo(address, options.nonce, options.era).pipe(first(), mergeMap(async signingInfo => {
          const eraOptions = makeEraOptions(api, this.registry, options, signingInfo);
          let updateId = -1;
          if (isKeyringPair(account)) {
            this.sign(account, eraOptions);
          } else {
            updateId = await this.#signViaSigner(address, eraOptions, signingInfo.header);
          }
          return {
            options: eraOptions,
            updateId
          };
        }));
      };
      #observeStatus = (txHash, status) => {
        if (!status.isFinalized && !status.isInBlock) {
          return of(this.#transformResult(new SubmittableResult({
            status,
            txHash
          })));
        }
        const blockHash = status.isInBlock ? status.asInBlock : status.asFinalized;
        return api.derive.tx.events(blockHash).pipe(map(({
          block,
          events
        }) => this.#transformResult(new SubmittableResult({ ...filterEvents(txHash, block, events, status),
          status,
          txHash
        }))), catchError(internalError => of(this.#transformResult(new SubmittableResult({
          internalError,
          status,
          txHash
        })))));
      };
      #observeSend = info => {
        return api.rpc.author.submitExtrinsic(this).pipe(tap(hash => {
          this.#updateSigner(hash, info);
        }));
      };
      #observeSubscribe = info => {
        const txHash = this.hash;
        return api.rpc.author.submitAndWatchExtrinsic(this).pipe(switchMap(status => this.#observeStatus(txHash, status)), tap(status => {
          this.#updateSigner(status, info);
        }));
      };
      #signViaSigner = async (address, options, header) => {
        const signer = options.signer || api.signer;
        util.assert(signer, 'No signer specified, either via api.setSigner or via sign options. You possibly need to pass through an explicit keypair for the origin so it can be used for signing.');
        const payload = this.registry.createTypeUnsafe('SignerPayload', [util.objectSpread({}, options, {
          address,
          blockNumber: header ? header.number : 0,
          method: this.method
        })]);
        let result;
        if (util.isFunction(signer.signPayload)) {
          result = await signer.signPayload(payload.toPayload());
        } else if (util.isFunction(signer.signRaw)) {
          result = await signer.signRaw(payload.toRaw());
        } else {
          throw new Error('Invalid signer interface, it should implement either signPayload or signRaw (or both)');
        }
        super.addSignature(address, result.signature, payload.toPayload());
        return result.id;
      };
      #updateSigner = (status, info) => {
        if (info && info.updateId !== -1) {
          const {
            options,
            updateId
          } = info;
          const signer = options.signer || api.signer;
          if (signer && util.isFunction(signer.update)) {
            signer.update(updateId, status);
          }
        }
      };
    }
    return Submittable;
  }

  function createSubmittable(apiType, api, decorateMethod, registry, blockHash) {
    const Submittable = createClass({
      api,
      apiType,
      blockHash,
      decorateMethod
    });
    return extrinsic => new Submittable(registry || api.registry, extrinsic);
  }

  function findCall(registry, callIndex) {
    return registry.findMetaCall(util.u8aToU8a(callIndex));
  }
  function findError(registry, errorIndex) {
    return registry.findMetaError(util.u8aToU8a(errorIndex));
  }

  const XCM_MAPPINGS = ['AssetInstance', 'Fungibility', 'Junction', 'Junctions', 'MultiAsset', 'MultiAssetFilter', 'MultiLocation', 'Response', 'WildFungibility', 'WildMultiAsset', 'Xcm', 'XcmError', 'XcmOrder'];
  function mapXcmTypes(version) {
    return XCM_MAPPINGS.reduce((all, key) => util.objectSpread(all, {
      [key]: `${key}${version}`
    }), {});
  }

  const typesChain = {};

  const sharedTypes$5 = {
    AnchorData: {
      anchoredBlock: 'u64',
      docRoot: 'H256',
      id: 'H256'
    },
    DispatchErrorModule: 'DispatchErrorModuleU8',
    PreCommitData: {
      expirationBlock: 'u64',
      identity: 'H256',
      signingRoot: 'H256'
    },
    Fee: {
      key: 'Hash',
      price: 'Balance'
    },
    MultiAccountData: {
      deposit: 'Balance',
      depositor: 'AccountId',
      signatories: 'Vec<AccountId>',
      threshold: 'u16'
    },
    ChainId: 'u8',
    DepositNonce: 'u64',
    ResourceId: '[u8; 32]',
    'chainbridge::ChainId': 'u8',
    RegistryId: 'H160',
    TokenId: 'U256',
    AssetId: {
      registryId: 'RegistryId',
      tokenId: 'TokenId'
    },
    AssetInfo: {
      metadata: 'Bytes'
    },
    MintInfo: {
      anchorId: 'Hash',
      proofs: 'Vec<ProofMint>',
      staticHashes: '[Hash; 3]'
    },
    Proof: {
      leafHash: 'H256',
      sortedHashes: 'H256'
    },
    ProofMint: {
      hashes: 'Vec<Hash>',
      property: 'Bytes',
      salt: '[u8; 32]',
      value: 'Bytes'
    },
    RegistryInfo: {
      fields: 'Vec<Bytes>',
      ownerCanBurn: 'bool'
    },
    ProxyType: {
      _enum: ['Any', 'NonTransfer', 'Governance', 'Staking', 'NonProxy']
    }
  };
  const standaloneTypes = util.objectSpread({}, sharedTypes$5, {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'LookupSource',
    LookupSource: 'IndicesLookupSource',
    Multiplier: 'Fixed64',
    RefCount: 'RefCountTo259'
  });
  const versioned$8 = [{
    minmax: [240, 243],
    types: util.objectSpread({}, standaloneTypes, {
      ProxyType: {
        _enum: ['Any', 'NonTransfer', 'Governance', 'Staking', 'Vesting']
      }
    })
  }, {
    minmax: [244, 999],
    types: util.objectSpread({}, standaloneTypes)
  }, {
    minmax: [1000, undefined],
    types: util.objectSpread({}, sharedTypes$5)
  }];

  const sharedTypes$4 = {
    CompactAssignments: 'CompactAssignmentsWith24',
    DispatchErrorModule: 'DispatchErrorModuleU8',
    RawSolution: 'RawSolutionWith24',
    Keys: 'SessionKeys6',
    ProxyType: {
      _enum: ['Any', 'NonTransfer', 'Governance', 'Staking', 'IdentityJudgement', 'CancelProxy', 'Auction']
    }
  };
  const addrIndicesTypes = {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'LookupSource',
    CompactAssignments: 'CompactAssignmentsWith16',
    RawSolution: 'RawSolutionWith16',
    Keys: 'SessionKeys5',
    LookupSource: 'IndicesLookupSource',
    ValidatorPrefs: 'ValidatorPrefsWithCommission'
  };
  const addrAccountIdTypes$2 = {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'AccountId',
    CompactAssignments: 'CompactAssignmentsWith16',
    RawSolution: 'RawSolutionWith16',
    Keys: 'SessionKeys5',
    LookupSource: 'AccountId',
    ValidatorPrefs: 'ValidatorPrefsWithCommission'
  };
  const versioned$7 = [{
    minmax: [1019, 1031],
    types: util.objectSpread({}, addrIndicesTypes, {
      BalanceLock: 'BalanceLockTo212',
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchError: 'DispatchErrorTo198',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      IdentityInfo: 'IdentityInfoTo198',
      Keys: 'SessionKeys5',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      ReferendumInfo: 'ReferendumInfoTo239',
      SlashingSpans: 'SlashingSpansTo204',
      StakingLedger: 'StakingLedgerTo223',
      Votes: 'VotesTo230',
      Weight: 'u32'
    })
  }, {
    minmax: [1032, 1042],
    types: util.objectSpread({}, addrIndicesTypes, {
      BalanceLock: 'BalanceLockTo212',
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Keys: 'SessionKeys5',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      ReferendumInfo: 'ReferendumInfoTo239',
      SlashingSpans: 'SlashingSpansTo204',
      StakingLedger: 'StakingLedgerTo223',
      Votes: 'VotesTo230',
      Weight: 'u32'
    })
  }, {
    minmax: [1043, 1045],
    types: util.objectSpread({}, addrIndicesTypes, {
      BalanceLock: 'BalanceLockTo212',
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Keys: 'SessionKeys5',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      ReferendumInfo: 'ReferendumInfoTo239',
      StakingLedger: 'StakingLedgerTo223',
      Votes: 'VotesTo230',
      Weight: 'u32'
    })
  }, {
    minmax: [1046, 1050],
    types: util.objectSpread({}, sharedTypes$4, addrAccountIdTypes$2, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      ReferendumInfo: 'ReferendumInfoTo239',
      StakingLedger: 'StakingLedgerTo223',
      Weight: 'u32'
    })
  }, {
    minmax: [1051, 1054],
    types: util.objectSpread({}, sharedTypes$4, addrAccountIdTypes$2, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      ReferendumInfo: 'ReferendumInfoTo239',
      StakingLedger: 'StakingLedgerTo240',
      Weight: 'u32'
    })
  }, {
    minmax: [1055, 1056],
    types: util.objectSpread({}, sharedTypes$4, addrAccountIdTypes$2, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      StakingLedger: 'StakingLedgerTo240',
      Weight: 'u32'
    })
  }, {
    minmax: [1057, 1061],
    types: util.objectSpread({}, sharedTypes$4, addrAccountIdTypes$2, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [1062, 2012],
    types: util.objectSpread({}, sharedTypes$4, addrAccountIdTypes$2, {
      CompactAssignments: 'CompactAssignmentsTo257',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [2013, 2022],
    types: util.objectSpread({}, sharedTypes$4, addrAccountIdTypes$2, {
      CompactAssignments: 'CompactAssignmentsTo257',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [2023, 2024],
    types: util.objectSpread({}, sharedTypes$4, addrAccountIdTypes$2, {
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [2025, 2027],
    types: util.objectSpread({}, sharedTypes$4, addrAccountIdTypes$2)
  }, {
    minmax: [2028, 2029],
    types: util.objectSpread({}, sharedTypes$4, {
      AccountInfo: 'AccountInfoWithDualRefCount',
      CompactAssignments: 'CompactAssignmentsWith16',
      RawSolution: 'RawSolutionWith16'
    })
  }, {
    minmax: [2030, 9000],
    types: util.objectSpread({}, sharedTypes$4, {
      CompactAssignments: 'CompactAssignmentsWith16',
      RawSolution: 'RawSolutionWith16'
    })
  }, {
    minmax: [9010, 9099],
    types: util.objectSpread({}, sharedTypes$4, mapXcmTypes('V0'))
  }, {
    minmax: [9100, 9105],
    types: util.objectSpread({}, sharedTypes$4, mapXcmTypes('V1'))
  }, {
    minmax: [9106, undefined],
    types: {}
  }];

  const versioned$6 = [{
    minmax: [0, undefined],
    types: {
    }
  }];

  const versioned$5 = [{
    minmax: [0, undefined],
    types: {
    }
  }];

  const sharedTypes$3 = {
    CompactAssignments: 'CompactAssignmentsWith16',
    DispatchErrorModule: 'DispatchErrorModuleU8',
    RawSolution: 'RawSolutionWith16',
    Keys: 'SessionKeys6',
    ProxyType: {
      _enum: {
        Any: 0,
        NonTransfer: 1,
        Governance: 2,
        Staking: 3,
        UnusedSudoBalances: 4,
        IdentityJudgement: 5,
        CancelProxy: 6,
        Auction: 7
      }
    }
  };
  const addrAccountIdTypes$1 = {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'AccountId',
    Keys: 'SessionKeys5',
    LookupSource: 'AccountId',
    ValidatorPrefs: 'ValidatorPrefsWithCommission'
  };
  const versioned$4 = [{
    minmax: [0, 12],
    types: util.objectSpread({}, sharedTypes$3, addrAccountIdTypes$1, {
      CompactAssignments: 'CompactAssignmentsTo257',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [13, 22],
    types: util.objectSpread({}, sharedTypes$3, addrAccountIdTypes$1, {
      CompactAssignments: 'CompactAssignmentsTo257',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [23, 24],
    types: util.objectSpread({}, sharedTypes$3, addrAccountIdTypes$1, {
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [25, 27],
    types: util.objectSpread({}, sharedTypes$3, addrAccountIdTypes$1)
  }, {
    minmax: [28, 29],
    types: util.objectSpread({}, sharedTypes$3, {
      AccountInfo: 'AccountInfoWithDualRefCount'
    })
  }, {
    minmax: [30, 9109],
    types: util.objectSpread({}, sharedTypes$3)
  }, {
    minmax: [9110, undefined],
    types: {}
  }];

  const sharedTypes$2 = {
    DispatchErrorModule: 'DispatchErrorModuleU8',
    FullIdentification: '()',
    Keys: 'SessionKeys7B'
  };
  const versioned$3 = [{
    minmax: [0, 200],
    types: util.objectSpread({}, sharedTypes$2, {
      AccountInfo: 'AccountInfoWithDualRefCount',
      Address: 'AccountId',
      LookupSource: 'AccountId'
    })
  }, {
    minmax: [201, 214],
    types: util.objectSpread({}, sharedTypes$2, {
      AccountInfo: 'AccountInfoWithDualRefCount'
    })
  }, {
    minmax: [215, 228],
    types: util.objectSpread({}, sharedTypes$2, {
      Keys: 'SessionKeys6'
    })
  }, {
    minmax: [229, 9099],
    types: util.objectSpread({}, sharedTypes$2, mapXcmTypes('V0'))
  }, {
    minmax: [9100, 9105],
    types: util.objectSpread({}, sharedTypes$2, mapXcmTypes('V1'))
  }, {
    minmax: [9106, undefined],
    types: {}
  }];

  const versioned$2 = [{
    minmax: [0, undefined],
    types: {
    }
  }];

  const sharedTypes$1 = {
    DispatchErrorModule: 'DispatchErrorModuleU8',
    TAssetBalance: 'u128',
    ProxyType: {
      _enum: ['Any', 'NonTransfer', 'CancelProxy', 'Assets', 'AssetOwner', 'AssetManager', 'Staking']
    }
  };
  const versioned$1 = [{
    minmax: [0, 3],
    types: util.objectSpread({}, sharedTypes$1, mapXcmTypes('V0'))
  }, {
    minmax: [4, 5],
    types: util.objectSpread({}, sharedTypes$1, mapXcmTypes('V1'))
  }, {
    minmax: [500, undefined],
    types: {}
  }];

  const sharedTypes = {
    CompactAssignments: 'CompactAssignmentsWith16',
    DispatchErrorModule: 'DispatchErrorModuleU8',
    RawSolution: 'RawSolutionWith16',
    Keys: 'SessionKeys6',
    ProxyType: {
      _enum: ['Any', 'NonTransfer', 'Staking', 'SudoBalances', 'IdentityJudgement', 'CancelProxy']
    }
  };
  const addrAccountIdTypes = {
    AccountInfo: 'AccountInfoWithRefCount',
    Address: 'AccountId',
    CompactAssignments: 'CompactAssignmentsWith16',
    LookupSource: 'AccountId',
    Keys: 'SessionKeys5',
    RawSolution: 'RawSolutionWith16',
    ValidatorPrefs: 'ValidatorPrefsWithCommission'
  };
  const versioned = [{
    minmax: [1, 2],
    types: util.objectSpread({}, sharedTypes, addrAccountIdTypes, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      Multiplier: 'Fixed64',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259',
      Weight: 'u32'
    })
  }, {
    minmax: [3, 22],
    types: util.objectSpread({}, sharedTypes, addrAccountIdTypes, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      OpenTip: 'OpenTipTo225',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [23, 42],
    types: util.objectSpread({}, sharedTypes, addrAccountIdTypes, {
      CompactAssignments: 'CompactAssignmentsTo257',
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [43, 44],
    types: util.objectSpread({}, sharedTypes, addrAccountIdTypes, {
      DispatchInfo: 'DispatchInfoTo244',
      Heartbeat: 'HeartbeatTo244',
      RefCount: 'RefCountTo259'
    })
  }, {
    minmax: [45, 47],
    types: util.objectSpread({}, sharedTypes, addrAccountIdTypes)
  }, {
    minmax: [48, 49],
    types: util.objectSpread({}, sharedTypes, {
      AccountInfo: 'AccountInfoWithDualRefCount'
    })
  }, {
    minmax: [50, 9099],
    types: util.objectSpread({}, sharedTypes, mapXcmTypes('V0'))
  }, {
    minmax: [9100, 9105],
    types: util.objectSpread({}, sharedTypes, mapXcmTypes('V1'))
  }, {
    minmax: [9106, undefined],
    types: {}
  }];

  const typesSpec = {
    'centrifuge-chain': versioned$8,
    kusama: versioned$7,
    node: versioned$6,
    'node-template': versioned$5,
    polkadot: versioned$4,
    rococo: versioned$3,
    shell: versioned$2,
    statemine: versioned$1,
    statemint: versioned$1,
    westend: versioned,
    westmint: versioned$1
  };

  const upgrades$4 = [[0, 1020], [26669, 1021], [38245, 1022], [54248, 1023], [59659, 1024], [67651, 1025], [82191, 1027], [83238, 1028], [101503, 1029], [203466, 1030], [295787, 1031], [461692, 1032], [504329, 1033], [569327, 1038], [587687, 1039], [653183, 1040], [693488, 1042], [901442, 1045], [1375086, 1050], [1445458, 1051], [1472960, 1052], [1475648, 1053], [1491596, 1054], [1574408, 1055], [2064961, 1058], [2201991, 1062], [2671528, 2005], [2704202, 2007], [2728002, 2008], [2832534, 2011], [2962294, 2012], [3240000, 2013], [3274408, 2015], [3323565, 2019], [3534175, 2022], [3860281, 2023], [4143129, 2024], [4401242, 2025], [4841367, 2026], [5961600, 2027], [6137912, 2028], [6561855, 2029], [7100891, 2030], [7468792, 9010], [7668600, 9030], [7812476, 9040], [8010981, 9050], [8073833, 9070], [8555825, 9080], [8945245, 9090], [9611377, 9100], [9625129, 9111], [9866422, 9122], [10403784, 9130], [10960765, 9150], [11006614, 9151], [11404482, 9160], [11601803, 9170], [12008022, 9180], [12405451, 9190], [12665416, 9200], [12909508, 9220], [13109752, 9230]];

  const upgrades$3 = [[0, 0], [29231, 1], [188836, 5], [199405, 6], [214264, 7], [244358, 8], [303079, 9], [314201, 10], [342400, 11], [443963, 12], [528470, 13], [687751, 14], [746085, 15], [787923, 16], [799302, 17], [1205128, 18], [1603423, 23], [1733218, 24], [2005673, 25], [2436698, 26], [3613564, 27], [3899547, 28], [4345767, 29], [4876134, 30], [5661442, 9050], [6321619, 9080], [6713249, 9090], [7217907, 9100], [7229126, 9110], [7560558, 9122], [8115869, 9140], [8638103, 9151], [9280179, 9170], [9738717, 9180], [10156856, 9190], [10458576, 9200], [10655116, 9220]];

  const upgrades$2 = [[214356, 4], [392764, 7], [409740, 8], [809976, 20], [877581, 24], [879238, 25], [889472, 26], [902937, 27], [932751, 28], [991142, 29], [1030162, 31], [1119657, 32], [1199282, 33], [1342534, 34], [1392263, 35], [1431703, 36], [1433369, 37], [1490972, 41], [2087397, 43], [2316688, 44], [2549864, 45], [3925782, 46], [3925843, 47], [4207800, 48], [4627944, 49], [5124076, 50], [5478664, 900], [5482450, 9000], [5584305, 9010], [5784566, 9030], [5879822, 9031], [5896856, 9032], [5897316, 9033], [6117927, 9050], [6210274, 9070], [6379314, 9080], [6979141, 9090], [7568453, 9100], [7766394, 9111], [7911691, 9120], [7968866, 9121], [7982889, 9122], [8514322, 9130], [9091726, 9140], [9091774, 9150], [9406726, 9160], [9921066, 9170], [10007115, 9180], [10480973, 9190], [10578091, 9200], [10678509, 9210], [10811001, 9220], [11096116, 9230], [11409279, 9250]];

  const allKnown = {
    kusama: upgrades$4,
    polkadot: upgrades$3,
    westend: upgrades$2
  };
  const NET_EXTRA = {
    westend: {
      genesisHash: ['0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e']
    }
  };
  function checkOrder(network, versions) {
    const ooo = versions.filter((curr, index) => {
      const prev = versions[index - 1];
      return index === 0 ? false : curr[0] <= prev[0] || curr[1] <= prev[1];
    });
    if (ooo.length) {
      throw new Error(`${network}: Mismatched upgrade ordering: ${util.stringify(ooo)}`);
    }
    return versions;
  }
  function mapRaw([network, versions]) {
    const chain = utilCrypto.selectableNetworks.find(n => n.network === network) || NET_EXTRA[network];
    if (!chain) {
      throw new Error(`Unable to find info for chain ${network}`);
    }
    return {
      genesisHash: util.hexToU8a(chain.genesisHash[0]),
      network,
      versions: checkOrder(network, versions).map(([blockNumber, specVersion]) => ({
        blockNumber: new util.BN(blockNumber),
        specVersion: new util.BN(specVersion)
      }))
    };
  }
  const upgrades = Object.entries(allKnown).map(mapRaw);
  const upgrades$1 = upgrades;

  function withNames(chainName, specName, fn) {
    return fn(chainName.toString(), specName.toString());
  }
  function filterVersions(versions = [], specVersion) {
    return versions.filter(({
      minmax: [min, max]
    }) => (min === undefined || min === null || specVersion >= min) && (max === undefined || max === null || specVersion <= max)).reduce((result, {
      types
    }) => util.objectSpread(result, types), {});
  }
  function getSpecExtensions({
    knownTypes
  }, chainName, specName) {
    return withNames(chainName, specName, (c, s) => {
      var _knownTypes$typesBund, _knownTypes$typesBund2, _knownTypes$typesBund3, _knownTypes$typesBund4, _knownTypes$typesBund5, _knownTypes$typesBund6;
      return util.objectSpread({}, (_knownTypes$typesBund = knownTypes.typesBundle) === null || _knownTypes$typesBund === void 0 ? void 0 : (_knownTypes$typesBund2 = _knownTypes$typesBund.spec) === null || _knownTypes$typesBund2 === void 0 ? void 0 : (_knownTypes$typesBund3 = _knownTypes$typesBund2[s]) === null || _knownTypes$typesBund3 === void 0 ? void 0 : _knownTypes$typesBund3.signedExtensions, (_knownTypes$typesBund4 = knownTypes.typesBundle) === null || _knownTypes$typesBund4 === void 0 ? void 0 : (_knownTypes$typesBund5 = _knownTypes$typesBund4.chain) === null || _knownTypes$typesBund5 === void 0 ? void 0 : (_knownTypes$typesBund6 = _knownTypes$typesBund5[c]) === null || _knownTypes$typesBund6 === void 0 ? void 0 : _knownTypes$typesBund6.signedExtensions);
    });
  }
  function getSpecTypes({
    knownTypes
  }, chainName, specName, specVersion) {
    const _specVersion = util.bnToBn(specVersion).toNumber();
    return withNames(chainName, specName, (c, s) => {
      var _knownTypes$typesBund7, _knownTypes$typesBund8, _knownTypes$typesBund9, _knownTypes$typesBund10, _knownTypes$typesBund11, _knownTypes$typesBund12, _knownTypes$typesSpec, _knownTypes$typesChai;
      return (
        util.objectSpread({}, filterVersions(typesSpec[s], _specVersion), filterVersions(typesChain[c], _specVersion), filterVersions((_knownTypes$typesBund7 = knownTypes.typesBundle) === null || _knownTypes$typesBund7 === void 0 ? void 0 : (_knownTypes$typesBund8 = _knownTypes$typesBund7.spec) === null || _knownTypes$typesBund8 === void 0 ? void 0 : (_knownTypes$typesBund9 = _knownTypes$typesBund8[s]) === null || _knownTypes$typesBund9 === void 0 ? void 0 : _knownTypes$typesBund9.types, _specVersion), filterVersions((_knownTypes$typesBund10 = knownTypes.typesBundle) === null || _knownTypes$typesBund10 === void 0 ? void 0 : (_knownTypes$typesBund11 = _knownTypes$typesBund10.chain) === null || _knownTypes$typesBund11 === void 0 ? void 0 : (_knownTypes$typesBund12 = _knownTypes$typesBund11[c]) === null || _knownTypes$typesBund12 === void 0 ? void 0 : _knownTypes$typesBund12.types, _specVersion), (_knownTypes$typesSpec = knownTypes.typesSpec) === null || _knownTypes$typesSpec === void 0 ? void 0 : _knownTypes$typesSpec[s], (_knownTypes$typesChai = knownTypes.typesChain) === null || _knownTypes$typesChai === void 0 ? void 0 : _knownTypes$typesChai[c], knownTypes.types)
      );
    });
  }
  function getSpecHasher({
    knownTypes
  }, chainName, specName) {
    return withNames(chainName, specName, (c, s) => {
      var _knownTypes$typesBund13, _knownTypes$typesBund14, _knownTypes$typesBund15, _knownTypes$typesBund16, _knownTypes$typesBund17, _knownTypes$typesBund18;
      return knownTypes.hasher || ((_knownTypes$typesBund13 = knownTypes.typesBundle) === null || _knownTypes$typesBund13 === void 0 ? void 0 : (_knownTypes$typesBund14 = _knownTypes$typesBund13.chain) === null || _knownTypes$typesBund14 === void 0 ? void 0 : (_knownTypes$typesBund15 = _knownTypes$typesBund14[c]) === null || _knownTypes$typesBund15 === void 0 ? void 0 : _knownTypes$typesBund15.hasher) || ((_knownTypes$typesBund16 = knownTypes.typesBundle) === null || _knownTypes$typesBund16 === void 0 ? void 0 : (_knownTypes$typesBund17 = _knownTypes$typesBund16.spec) === null || _knownTypes$typesBund17 === void 0 ? void 0 : (_knownTypes$typesBund18 = _knownTypes$typesBund17[s]) === null || _knownTypes$typesBund18 === void 0 ? void 0 : _knownTypes$typesBund18.hasher) || null;
    });
  }
  function getSpecRpc({
    knownTypes
  }, chainName, specName) {
    return withNames(chainName, specName, (c, s) => {
      var _knownTypes$typesBund19, _knownTypes$typesBund20, _knownTypes$typesBund21, _knownTypes$typesBund22, _knownTypes$typesBund23, _knownTypes$typesBund24;
      return util.objectSpread({}, (_knownTypes$typesBund19 = knownTypes.typesBundle) === null || _knownTypes$typesBund19 === void 0 ? void 0 : (_knownTypes$typesBund20 = _knownTypes$typesBund19.spec) === null || _knownTypes$typesBund20 === void 0 ? void 0 : (_knownTypes$typesBund21 = _knownTypes$typesBund20[s]) === null || _knownTypes$typesBund21 === void 0 ? void 0 : _knownTypes$typesBund21.rpc, (_knownTypes$typesBund22 = knownTypes.typesBundle) === null || _knownTypes$typesBund22 === void 0 ? void 0 : (_knownTypes$typesBund23 = _knownTypes$typesBund22.chain) === null || _knownTypes$typesBund23 === void 0 ? void 0 : (_knownTypes$typesBund24 = _knownTypes$typesBund23[c]) === null || _knownTypes$typesBund24 === void 0 ? void 0 : _knownTypes$typesBund24.rpc);
    });
  }
  function getSpecRuntime({
    knownTypes
  }, chainName, specName) {
    return withNames(chainName, specName, (c, s) => {
      var _knownTypes$typesBund25, _knownTypes$typesBund26, _knownTypes$typesBund27, _knownTypes$typesBund28, _knownTypes$typesBund29, _knownTypes$typesBund30;
      return util.objectSpread({}, (_knownTypes$typesBund25 = knownTypes.typesBundle) === null || _knownTypes$typesBund25 === void 0 ? void 0 : (_knownTypes$typesBund26 = _knownTypes$typesBund25.spec) === null || _knownTypes$typesBund26 === void 0 ? void 0 : (_knownTypes$typesBund27 = _knownTypes$typesBund26[s]) === null || _knownTypes$typesBund27 === void 0 ? void 0 : _knownTypes$typesBund27.runtime, (_knownTypes$typesBund28 = knownTypes.typesBundle) === null || _knownTypes$typesBund28 === void 0 ? void 0 : (_knownTypes$typesBund29 = _knownTypes$typesBund28.chain) === null || _knownTypes$typesBund29 === void 0 ? void 0 : (_knownTypes$typesBund30 = _knownTypes$typesBund29[c]) === null || _knownTypes$typesBund30 === void 0 ? void 0 : _knownTypes$typesBund30.runtime);
    });
  }
  function getSpecAlias({
    knownTypes
  }, chainName, specName) {
    return withNames(chainName, specName, (c, s) => {
      var _knownTypes$typesBund31, _knownTypes$typesBund32, _knownTypes$typesBund33, _knownTypes$typesBund34, _knownTypes$typesBund35, _knownTypes$typesBund36;
      return (
        util.objectSpread({}, (_knownTypes$typesBund31 = knownTypes.typesBundle) === null || _knownTypes$typesBund31 === void 0 ? void 0 : (_knownTypes$typesBund32 = _knownTypes$typesBund31.spec) === null || _knownTypes$typesBund32 === void 0 ? void 0 : (_knownTypes$typesBund33 = _knownTypes$typesBund32[s]) === null || _knownTypes$typesBund33 === void 0 ? void 0 : _knownTypes$typesBund33.alias, (_knownTypes$typesBund34 = knownTypes.typesBundle) === null || _knownTypes$typesBund34 === void 0 ? void 0 : (_knownTypes$typesBund35 = _knownTypes$typesBund34.chain) === null || _knownTypes$typesBund35 === void 0 ? void 0 : (_knownTypes$typesBund36 = _knownTypes$typesBund35[c]) === null || _knownTypes$typesBund36 === void 0 ? void 0 : _knownTypes$typesBund36.alias, knownTypes.typesAlias)
      );
    });
  }
  function getUpgradeVersion(genesisHash, blockNumber) {
    const known = upgrades$1.find(u => genesisHash.eq(u.genesisHash));
    return known ? [known.versions.reduce((last, version) => {
      return blockNumber.gt(version.blockNumber) ? version : last;
    }, undefined), known.versions.find(version => blockNumber.lte(version.blockNumber))] : [undefined, undefined];
  }

  const l$2 = util.logger('api/augment');
  function logLength(type, values, and = []) {
    return values.length ? ` ${values.length} ${type}${and.length ? ' and' : ''}` : '';
  }
  function logValues(type, values) {
    return values.length ? `\n\t${type.padStart(7)}: ${values.sort().join(', ')}` : '';
  }
  function warn(prefix, type, [added, removed]) {
    if (added.length || removed.length) {
      l$2.warn(`api.${prefix}: Found${logLength('added', added, removed)}${logLength('removed', removed)} ${type}:${logValues('added', added)}${logValues('removed', removed)}`);
    }
  }
  function findSectionExcludes(a, b) {
    return a.filter(s => !b.includes(s));
  }
  function findSectionIncludes(a, b) {
    return a.filter(s => b.includes(s));
  }
  function extractSections(src, dst) {
    const srcSections = Object.keys(src);
    const dstSections = Object.keys(dst);
    return [findSectionExcludes(srcSections, dstSections), findSectionExcludes(dstSections, srcSections)];
  }
  function findMethodExcludes(src, dst) {
    const srcSections = Object.keys(src);
    const dstSections = findSectionIncludes(Object.keys(dst), srcSections);
    const excludes = [];
    for (let s = 0; s < dstSections.length; s++) {
      const section = dstSections[s];
      const srcMethods = Object.keys(src[section]);
      const dstMethods = Object.keys(dst[section]);
      excludes.push(...dstMethods.filter(m => !srcMethods.includes(m)).map(m => `${section}.${m}`));
    }
    return excludes;
  }
  function extractMethods(src, dst) {
    return [findMethodExcludes(dst, src), findMethodExcludes(src, dst)];
  }
  function lazySection(src, dst) {
    const creator = m => src[m];
    const methods = Object.keys(src);
    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      if (!Object.prototype.hasOwnProperty.call(dst, method)) {
        util.lazyMethod(dst, method, creator);
      }
    }
  }
  function augmentObject(prefix, src, dst, fromEmpty = false) {
    fromEmpty && util.objectClear(dst);
    if (prefix && Object.keys(dst).length) {
      warn(prefix, 'modules', extractSections(src, dst));
      warn(prefix, 'calls', extractMethods(src, dst));
    }
    const sections = Object.keys(src);
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!dst[section]) {
        dst[section] = {};
      }
      lazySection(src[section], dst[section]);
    }
    return dst;
  }

  function sig({
    lookup
  }, {
    method,
    section
  }, args) {
    return `${section}.${method}(${args.map(a => lookup.getTypeDef(a).type).join(', ')})`;
  }
  function extractStorageArgs(registry, creator, _args) {
    const args = _args.filter(a => !util.isUndefined(a));
    if (creator.meta.type.isPlain) {
      util.assert(args.length === 0, () => `${sig(registry, creator, [])} does not take any arguments, ${args.length} found`);
    } else {
      const {
        hashers,
        key
      } = creator.meta.type.asMap;
      const keys = hashers.length === 1 ? [key] : registry.lookup.getSiType(key).def.asTuple.map(t => t);
      util.assert(args.length === keys.length, () => `${sig(registry, creator, keys)} is a map, requiring ${keys.length} arguments, ${args.length} found`);
    }
    return [creator, args];
  }

  class Events {
    #eventemitter = new EventEmitter();
    emit(type, ...args) {
      return this.#eventemitter.emit(type, ...args);
    }
    on(type, handler) {
      this.#eventemitter.on(type, handler);
      return this;
    }
    off(type, handler) {
      this.#eventemitter.removeListener(type, handler);
      return this;
    }
    once(type, handler) {
      this.#eventemitter.once(type, handler);
      return this;
    }
  }

  const PAGE_SIZE_K = 1000;
  const PAGE_SIZE_V = 250;
  const PAGE_SIZE_Q = 50;
  const l$1 = util.logger('api/init');
  let instanceCounter = 0;
  function getAtQueryFn(api, {
    method,
    section
  }) {
    return util.assertReturn(api.rx.query[section] && api.rx.query[section][method], () => `query.${section}.${method} is not available in this version of the metadata`);
  }
  class Decorate extends Events {
    #instanceId;
    #registry;
    #storageGetQ = [];
    #storageSubQ = [];
    __phantom = new util.BN(0);
    _call = {};
    _consts = {};
    _errors = {};
    _events = {};
    _extrinsicType = 4;
    _isReady = false;
    _query = {};
    _runtimeMap = {};
    _rx = {
      consts: {},
      query: {},
      tx: {}
    };
    constructor(options, type, decorateMethod) {
      var _options$source;
      super();
      this.#instanceId = `${++instanceCounter}`;
      this.#registry = ((_options$source = options.source) === null || _options$source === void 0 ? void 0 : _options$source.registry) || options.registry || new types.TypeRegistry();
      this._rx.queryAt = (blockHash, knownVersion) => from(this.at(blockHash, knownVersion)).pipe(map(a => a.rx.query));
      this._rx.registry = this.#registry;
      const thisProvider = options.source ? options.source._rpcCore.provider.clone() : options.provider || new WsProvider();
      this._decorateMethod = decorateMethod;
      this._options = options;
      this._type = type;
      this._rpcCore = new RpcCore(this.#instanceId, this.#registry, thisProvider, this._options.rpc);
      this._isConnected = new BehaviorSubject(this._rpcCore.provider.isConnected);
      this._rx.hasSubscriptions = this._rpcCore.provider.hasSubscriptions;
    }
    get registry() {
      return this.#registry;
    }
    createType(type, ...params) {
      return this.#registry.createType(type, ...params);
    }
    registerTypes(types) {
      types && this.#registry.register(types);
    }
    get hasSubscriptions() {
      return this._rpcCore.provider.hasSubscriptions;
    }
    get supportMulti() {
      return this._rpcCore.provider.hasSubscriptions || !!this._rpcCore.state.queryStorageAt;
    }
    _emptyDecorated(registry, blockHash) {
      return {
        call: {},
        consts: {},
        errors: {},
        events: {},
        query: {},
        registry,
        rx: {
          query: {}
        },
        tx: createSubmittable(this._type, this._rx, this._decorateMethod, registry, blockHash)
      };
    }
    _createDecorated(registry, fromEmpty, decoratedApi, blockHash) {
      if (!decoratedApi) {
        decoratedApi = this._emptyDecorated(registry.registry, blockHash);
      }
      if (fromEmpty || !registry.decoratedMeta) {
        registry.decoratedMeta = types.expandMetadata(registry.registry, registry.metadata);
      }
      const runtime = this._decorateCalls(registry, this._decorateMethod, blockHash);
      const storage = this._decorateStorage(registry.decoratedMeta, this._decorateMethod, blockHash);
      const storageRx = this._decorateStorage(registry.decoratedMeta, this._rxDecorateMethod, blockHash);
      augmentObject('consts', registry.decoratedMeta.consts, decoratedApi.consts, fromEmpty);
      augmentObject('errors', registry.decoratedMeta.errors, decoratedApi.errors, fromEmpty);
      augmentObject('events', registry.decoratedMeta.events, decoratedApi.events, fromEmpty);
      augmentObject('query', storage, decoratedApi.query, fromEmpty);
      augmentObject('query', storageRx, decoratedApi.rx.query, fromEmpty);
      augmentObject('call', runtime, decoratedApi.call, fromEmpty);
      decoratedApi.findCall = callIndex => findCall(registry.registry, callIndex);
      decoratedApi.findError = errorIndex => findError(registry.registry, errorIndex);
      decoratedApi.queryMulti = blockHash ? this._decorateMultiAt(decoratedApi, this._decorateMethod, blockHash) : this._decorateMulti(this._decorateMethod);
      decoratedApi.runtimeVersion = registry.runtimeVersion;
      return {
        decoratedApi,
        decoratedMeta: registry.decoratedMeta
      };
    }
    _injectMetadata(registry, fromEmpty = false) {
      if (fromEmpty || !registry.decoratedApi) {
        registry.decoratedApi = this._emptyDecorated(registry.registry);
      }
      const {
        decoratedApi,
        decoratedMeta
      } = this._createDecorated(registry, fromEmpty, registry.decoratedApi);
      this._call = decoratedApi.call;
      this._consts = decoratedApi.consts;
      this._errors = decoratedApi.errors;
      this._events = decoratedApi.events;
      this._query = decoratedApi.query;
      this._rx.query = decoratedApi.rx.query;
      const tx = this._decorateExtrinsics(decoratedMeta, this._decorateMethod);
      const rxtx = this._decorateExtrinsics(decoratedMeta, this._rxDecorateMethod);
      if (fromEmpty || !this._extrinsics) {
        this._extrinsics = tx;
        this._rx.tx = rxtx;
      } else {
        augmentObject('tx', tx, this._extrinsics, false);
        augmentObject(null, rxtx, this._rx.tx, false);
      }
      augmentObject(null, decoratedMeta.consts, this._rx.consts, fromEmpty);
      this.emit('decorated');
    }
    injectMetadata(metadata, fromEmpty, registry) {
      this._injectMetadata({
        metadata,
        registry: registry || this.#registry,
        runtimeVersion: this.#registry.createType('RuntimeVersionPartial')
      }, fromEmpty);
    }
    _decorateFunctionMeta(input, output) {
      output.meta = input.meta;
      output.method = input.method;
      output.section = input.section;
      output.toJSON = input.toJSON;
      if (input.callIndex) {
        output.callIndex = input.callIndex;
      }
      return output;
    }
    _filterRpc(methods, additional) {
      if (Object.keys(additional).length !== 0) {
        this._rpcCore.addUserInterfaces(additional);
        this._decorateRpc(this._rpcCore, this._decorateMethod, this._rpc);
        this._decorateRpc(this._rpcCore, this._rxDecorateMethod, this._rx.rpc);
      }
      const sectionMap = {};
      for (let i = 0; i < methods.length; i++) {
        const [section] = methods[i].split('_');
        sectionMap[section] = true;
      }
      const sections = Object.keys(sectionMap);
      for (let i = 0; i < sections.length; i++) {
        const nameA = util.stringUpperFirst(sections[i]);
        const nameB = `${nameA}Api`;
        this._runtimeMap[utilCrypto.blake2AsHex(nameA, 64)] = nameA;
        this._runtimeMap[utilCrypto.blake2AsHex(nameB, 64)] = nameB;
      }
      this._filterRpcMethods(methods);
    }
    _filterRpcMethods(exposed) {
      const hasResults = exposed.length !== 0;
      const allKnown = [...this._rpcCore.mapping.entries()];
      const allKeys = [];
      for (let i = 0; i < allKnown.length; i++) {
        const [, {
          alias,
          endpoint,
          method,
          pubsub,
          section
        }] = allKnown[i];
        allKeys.push(`${section}_${method}`);
        if (pubsub) {
          allKeys.push(`${section}_${pubsub[1]}`);
          allKeys.push(`${section}_${pubsub[2]}`);
        }
        if (alias) {
          allKeys.push(...alias);
        }
        if (endpoint) {
          allKeys.push(endpoint);
        }
      }
      const filterKey = k => !allKeys.includes(k);
      const unknown = exposed.filter(filterKey);
      if (unknown.length) {
        l$1.warn(`RPC methods not decorated: ${unknown.join(', ')}`);
      }
      for (let i = 0; i < allKnown.length; i++) {
        const [k, {
          method,
          section
        }] = allKnown[i];
        if (hasResults && !exposed.includes(k) && k !== 'rpc_methods') {
          if (this._rpc[section]) {
            delete this._rpc[section][method];
            delete this._rx.rpc[section][method];
          }
        }
      }
    }
    _decorateRpc(rpc, decorateMethod, input = {}) {
      const out = input;
      const decorateFn = (section, method) => {
        const source = rpc[section][method];
        const fn = decorateMethod(source, {
          methodName: method
        });
        fn.meta = source.meta;
        fn.raw = decorateMethod(source.raw, {
          methodName: method
        });
        return fn;
      };
      for (let s = 0; s < rpc.sections.length; s++) {
        const section = rpc.sections[s];
        if (!Object.prototype.hasOwnProperty.call(out, section)) {
          const methods = Object.keys(rpc[section]);
          const decorateInternal = method => decorateFn(section, method);
          for (let m = 0; m < methods.length; m++) {
            const method = methods[m];
            if (this.hasSubscriptions || !(method.startsWith('subscribe') || method.startsWith('unsubscribe'))) {
              if (!Object.prototype.hasOwnProperty.call(out, section)) {
                out[section] = {};
              }
              util.lazyMethod(out[section], method, decorateInternal);
            }
          }
        }
      }
      return out;
    }
    _addRuntimeDef(result, additional) {
      if (!additional) {
        return;
      }
      const entries = Object.entries(additional);
      for (let j = 0; j < entries.length; j++) {
        const [key, defs] = entries[j];
        if (result[key]) {
          for (let k = 0; k < defs.length; k++) {
            const def = defs[k];
            const prev = result[key].find(({
              version
            }) => def.version === version);
            if (prev) {
              util.objectSpread(prev.methods, def.methods);
            } else {
              result[key].push(def);
            }
          }
        } else {
          result[key] = defs;
        }
      }
    }
    _getRuntimeDefs(registry, specName, chain = '') {
      const result = {};
      const defValues = Object.values(types.typeDefinitions);
      for (let i = 0; i < defValues.length; i++) {
        this._addRuntimeDef(result, defValues[i].runtime);
      }
      this._addRuntimeDef(result, getSpecRuntime(registry, chain, specName));
      this._addRuntimeDef(result, this._options.runtime);
      return Object.entries(result);
    }
    _decorateCalls({
      registry,
      runtimeVersion: {
        apis,
        specName
      }
    }, decorateMethod, blockHash) {
      const result = {};
      const named = {};
      const hashes = {};
      const sections = this._getRuntimeDefs(registry, specName, this._runtimeChain);
      const older = [];
      for (let i = 0; i < sections.length; i++) {
        const [_section, secs] = sections[i];
        const sectionHash = utilCrypto.blake2AsHex(_section, 64);
        const rtApi = apis.find(([a]) => a.eq(sectionHash));
        hashes[sectionHash] = true;
        if (rtApi) {
          const all = secs.map(({
            version
          }) => version).sort();
          const sec = secs.find(({
            version
          }) => rtApi[1].eq(version));
          if (sec) {
            const section = util.stringCamelCase(_section);
            const methods = Object.entries(sec.methods);
            if (methods.length) {
              if (!named[section]) {
                named[section] = {};
              }
              for (let m = 0; m < methods.length; m++) {
                const [_method, def] = methods[m];
                const method = util.stringCamelCase(_method);
                named[section][method] = util.objectSpread({
                  method,
                  name: `${_section}_${_method}`,
                  section,
                  sectionHash
                }, def);
              }
            }
          } else {
            older.push(`${_section}/${rtApi[1].toString()} (${all.join('/')} known)`);
          }
        }
      }
      const notFound = apis.map(([a, v]) => [a.toHex(), v.toString()]).filter(([a]) => !hashes[a]).map(([a, v]) => `${this._runtimeMap[a] || a}/${v}`);
      if (older.length) {
        l$1.warn(`Not decorating runtime apis without matching versions: ${older.join(', ')}`);
      }
      if (notFound.length) {
        l$1.warn(`Not decorating unknown runtime apis: ${notFound.join(', ')}`);
      }
      const stateCall = blockHash ? (name, bytes) => this._rpcCore.state.call(name, bytes, blockHash) : (name, bytes) => this._rpcCore.state.call(name, bytes);
      const lazySection = section => util.lazyMethods({}, Object.keys(named[section]), method => this._decorateCall(registry, named[section][method], stateCall, decorateMethod));
      const modules = Object.keys(named);
      for (let i = 0; i < modules.length; i++) {
        util.lazyMethod(result, modules[i], lazySection);
      }
      return result;
    }
    _decorateCall(registry, def, stateCall, decorateMethod) {
      const decorated = decorateMethod((...args) => {
        if (args.length !== def.params.length) {
          throw new Error(`${def.name}:: Expected ${def.params.length} arguments, found ${args.length}`);
        }
        const bytes = registry.createType('Raw', util.u8aConcatStrict(args.map((a, i) => registry.createTypeUnsafe(def.params[i].type, [a]).toU8a())));
        return stateCall(def.name, bytes).pipe(map(r => registry.createTypeUnsafe(def.type, [r])));
      });
      decorated.meta = def;
      return decorated;
    }
    _decorateMulti(decorateMethod) {
      return decorateMethod(keys => (this.hasSubscriptions ? this._rpcCore.state.subscribeStorage : this._rpcCore.state.queryStorageAt)(keys.map(args => Array.isArray(args) ? args[0].creator.meta.type.isPlain ? [args[0].creator] : args[0].creator.meta.type.asMap.hashers.length === 1 ? [args[0].creator, args.slice(1)] : [args[0].creator, ...args.slice(1)] : [args.creator])));
    }
    _decorateMultiAt(atApi, decorateMethod, blockHash) {
      return decorateMethod(calls => this._rpcCore.state.queryStorageAt(calls.map(args => {
        if (Array.isArray(args)) {
          const {
            creator
          } = getAtQueryFn(atApi, args[0].creator);
          return creator.meta.type.isPlain ? [creator] : creator.meta.type.asMap.hashers.length === 1 ? [creator, args.slice(1)] : [creator, ...args.slice(1)];
        }
        return [getAtQueryFn(atApi, args.creator).creator];
      }), blockHash));
    }
    _decorateExtrinsics({
      tx
    }, decorateMethod) {
      const result = createSubmittable(this._type, this._rx, decorateMethod);
      const lazySection = section => util.lazyMethods({}, Object.keys(tx[section]), method => this._decorateExtrinsicEntry(tx[section][method], result));
      const sections = Object.keys(tx);
      for (let i = 0; i < sections.length; i++) {
        util.lazyMethod(result, sections[i], lazySection);
      }
      return result;
    }
    _decorateExtrinsicEntry(method, creator) {
      const decorated = (...params) => creator(method(...params));
      decorated.is = other => method.is(other);
      return this._decorateFunctionMeta(method, decorated);
    }
    _decorateStorage({
      query,
      registry
    }, decorateMethod, blockHash) {
      const result = {};
      const lazySection = section => util.lazyMethods({}, Object.keys(query[section]), method => blockHash ? this._decorateStorageEntryAt(registry, query[section][method], decorateMethod, blockHash) : this._decorateStorageEntry(query[section][method], decorateMethod));
      const sections = Object.keys(query);
      for (let i = 0; i < sections.length; i++) {
        util.lazyMethod(result, sections[i], lazySection);
      }
      return result;
    }
    _decorateStorageEntry(creator, decorateMethod) {
      const getArgs = (args, registry) => extractStorageArgs(registry || this.#registry, creator, args);
      const getQueryAt = blockHash => from(this.at(blockHash)).pipe(map(api => getAtQueryFn(api, creator)));
      const decorated = this._decorateStorageCall(creator, decorateMethod);
      decorated.creator = creator;
      decorated.at = decorateMethod((blockHash, ...args) => getQueryAt(blockHash).pipe(switchMap(q => q(...args))));
      decorated.hash = decorateMethod((...args) => this._rpcCore.state.getStorageHash(getArgs(args)));
      decorated.is = key => key.section === creator.section && key.method === creator.method;
      decorated.key = (...args) => util.u8aToHex(util.compactStripLength(creator(...args))[1]);
      decorated.keyPrefix = (...args) => util.u8aToHex(creator.keyPrefix(...args));
      decorated.range = decorateMethod((range, ...args) => this._decorateStorageRange(decorated, args, range));
      decorated.size = decorateMethod((...args) => this._rpcCore.state.getStorageSize(getArgs(args)));
      decorated.sizeAt = decorateMethod((blockHash, ...args) => getQueryAt(blockHash).pipe(switchMap(q => this._rpcCore.state.getStorageSize(getArgs(args, q.creator.meta.registry), blockHash))));
      if (creator.iterKey && creator.meta.type.isMap) {
        decorated.entries = decorateMethod(memo(this.#instanceId, (...args) => this._retrieveMapEntries(creator, null, args)));
        decorated.entriesAt = decorateMethod(memo(this.#instanceId, (blockHash, ...args) => getQueryAt(blockHash).pipe(switchMap(q => this._retrieveMapEntries(q.creator, blockHash, args)))));
        decorated.entriesPaged = decorateMethod(memo(this.#instanceId, opts => this._retrieveMapEntriesPaged(creator, undefined, opts)));
        decorated.keys = decorateMethod(memo(this.#instanceId, (...args) => this._retrieveMapKeys(creator, null, args)));
        decorated.keysAt = decorateMethod(memo(this.#instanceId, (blockHash, ...args) => getQueryAt(blockHash).pipe(switchMap(q => this._retrieveMapKeys(q.creator, blockHash, args)))));
        decorated.keysPaged = decorateMethod(memo(this.#instanceId, opts => this._retrieveMapKeysPaged(creator, undefined, opts)));
      }
      if (this.supportMulti && creator.meta.type.isMap) {
        decorated.multi = decorateMethod(args => creator.meta.type.asMap.hashers.length === 1 ? this._retrieveMulti(args.map(a => [creator, [a]])) : this._retrieveMulti(args.map(a => [creator, a])));
      }
      return this._decorateFunctionMeta(creator, decorated);
    }
    _decorateStorageEntryAt(registry, creator, decorateMethod, blockHash) {
      const getArgs = args => extractStorageArgs(registry, creator, args);
      const decorated = decorateMethod((...args) => this._rpcCore.state.getStorage(getArgs(args), blockHash));
      decorated.creator = creator;
      decorated.hash = decorateMethod((...args) => this._rpcCore.state.getStorageHash(getArgs(args), blockHash));
      decorated.is = key => key.section === creator.section && key.method === creator.method;
      decorated.key = (...args) => util.u8aToHex(util.compactStripLength(creator(creator.meta.type.isPlain ? undefined : args))[1]);
      decorated.keyPrefix = (...keys) => util.u8aToHex(creator.keyPrefix(...keys));
      decorated.size = decorateMethod((...args) => this._rpcCore.state.getStorageSize(getArgs(args), blockHash));
      if (creator.iterKey && creator.meta.type.isMap) {
        decorated.entries = decorateMethod(memo(this.#instanceId, (...args) => this._retrieveMapEntries(creator, blockHash, args)));
        decorated.entriesPaged = decorateMethod(memo(this.#instanceId, opts => this._retrieveMapEntriesPaged(creator, blockHash, opts)));
        decorated.keys = decorateMethod(memo(this.#instanceId, (...args) => this._retrieveMapKeys(creator, blockHash, args)));
        decorated.keysPaged = decorateMethod(memo(this.#instanceId, opts => this._retrieveMapKeysPaged(creator, blockHash, opts)));
      }
      if (this.supportMulti && creator.meta.type.isMap) {
        decorated.multi = decorateMethod(args => creator.meta.type.asMap.hashers.length === 1 ? this._retrieveMulti(args.map(a => [creator, [a]]), blockHash) : this._retrieveMulti(args.map(a => [creator, a]), blockHash));
      }
      return this._decorateFunctionMeta(creator, decorated);
    }
    _queueStorage(call, queue) {
      const query = queue === this.#storageSubQ ? this._rpcCore.state.subscribeStorage : this._rpcCore.state.queryStorageAt;
      let queueIdx = queue.length - 1;
      let valueIdx = 0;
      let valueObs;
      if (queueIdx === -1 || !queue[queueIdx] || queue[queueIdx][1].length === PAGE_SIZE_Q) {
        queueIdx++;
        valueObs = from(
        Promise.resolve().then(() => {
          const calls = queue[queueIdx][1];
          delete queue[queueIdx];
          return calls;
        })).pipe(switchMap(calls => query(calls)));
        queue.push([valueObs, [call]]);
      } else {
        valueObs = queue[queueIdx][0];
        valueIdx = queue[queueIdx][1].length;
        queue[queueIdx][1].push(call);
      }
      return valueObs.pipe(map(values => values[valueIdx]));
    }
    _decorateStorageCall(creator, decorateMethod) {
      return decorateMethod((...args) => {
        const call = extractStorageArgs(this.#registry, creator, args);
        if (!this.hasSubscriptions) {
          return this._rpcCore.state.getStorage(call);
        }
        return this._queueStorage(call, this.#storageSubQ);
      }, {
        methodName: creator.method,
        overrideNoSub: (...args) => this._queueStorage(extractStorageArgs(this.#registry, creator, args), this.#storageGetQ)
      });
    }
    _decorateStorageRange(decorated, args, range) {
      const outputType = types.unwrapStorageType(this.#registry, decorated.creator.meta.type, decorated.creator.meta.modifier.isOptional);
      return this._rpcCore.state.queryStorage([decorated.key(...args)], ...range).pipe(map(result => result.map(([blockHash, [value]]) => [blockHash, this.createType(outputType, value.isSome ? value.unwrap().toHex() : undefined)])));
    }
    _retrieveMulti(keys, blockHash) {
      if (!keys.length) {
        return of([]);
      }
      const query = this.hasSubscriptions && !blockHash ? this._rpcCore.state.subscribeStorage : this._rpcCore.state.queryStorageAt;
      if (keys.length <= PAGE_SIZE_V) {
        return blockHash ? query(keys, blockHash) : query(keys);
      }
      return combineLatest(util.arrayChunk(keys, PAGE_SIZE_V).map(k => blockHash ? query(k, blockHash) : query(k))).pipe(map(util.arrayFlatten));
    }
    _retrieveMapKeys({
      iterKey,
      meta,
      method,
      section
    }, at, args) {
      util.assert(iterKey && meta.type.isMap, 'keys can only be retrieved on maps');
      const headKey = iterKey(...args).toHex();
      const startSubject = new BehaviorSubject(headKey);
      const query = at ? startKey => this._rpcCore.state.getKeysPaged(headKey, PAGE_SIZE_K, startKey, at) : startKey => this._rpcCore.state.getKeysPaged(headKey, PAGE_SIZE_K, startKey);
      const setMeta = key => key.setMeta(meta, section, method);
      return startSubject.pipe(switchMap(query), map(keys => keys.map(setMeta)), tap(keys => util.nextTick(() => {
        keys.length === PAGE_SIZE_K ? startSubject.next(keys[PAGE_SIZE_K - 1].toHex()) : startSubject.complete();
      })), toArray(),
      map(util.arrayFlatten));
    }
    _retrieveMapKeysPaged({
      iterKey,
      meta,
      method,
      section
    }, at, opts) {
      util.assert(iterKey && meta.type.isMap, 'keys can only be retrieved on maps');
      const setMeta = key => key.setMeta(meta, section, method);
      const query = at ? headKey => this._rpcCore.state.getKeysPaged(headKey, opts.pageSize, opts.startKey || headKey, at) : headKey => this._rpcCore.state.getKeysPaged(headKey, opts.pageSize, opts.startKey || headKey);
      return query(iterKey(...opts.args).toHex()).pipe(map(keys => keys.map(setMeta)));
    }
    _retrieveMapEntries(entry, at, args) {
      const query = at ? keys => this._rpcCore.state.queryStorageAt(keys, at) : keys => this._rpcCore.state.queryStorageAt(keys);
      return this._retrieveMapKeys(entry, at, args).pipe(switchMap(keys => keys.length ? combineLatest(util.arrayChunk(keys, PAGE_SIZE_V).map(query)).pipe(map(valsArr => util.arrayFlatten(valsArr).map((value, index) => [keys[index], value]))) : of([])));
    }
    _retrieveMapEntriesPaged(entry, at, opts) {
      const query = at ? keys => this._rpcCore.state.queryStorageAt(keys, at) : keys => this._rpcCore.state.queryStorageAt(keys);
      return this._retrieveMapKeysPaged(entry, at, opts).pipe(switchMap(keys => keys.length ? query(keys).pipe(map(valsArr => valsArr.map((value, index) => [keys[index], value]))) : of([])));
    }
    _decorateDeriveRx(decorateMethod) {
      var _this$_runtimeVersion, _this$_options$typesB, _this$_options$typesB2, _this$_options$typesB3;
      const specName = (_this$_runtimeVersion = this._runtimeVersion) === null || _this$_runtimeVersion === void 0 ? void 0 : _this$_runtimeVersion.specName.toString();
      const available = getAvailableDerives(this.#instanceId, this._rx, util.objectSpread({}, this._options.derives, (_this$_options$typesB = this._options.typesBundle) === null || _this$_options$typesB === void 0 ? void 0 : (_this$_options$typesB2 = _this$_options$typesB.spec) === null || _this$_options$typesB2 === void 0 ? void 0 : (_this$_options$typesB3 = _this$_options$typesB2[specName || '']) === null || _this$_options$typesB3 === void 0 ? void 0 : _this$_options$typesB3.derives));
      return decorateDeriveSections(decorateMethod, available);
    }
    _decorateDerive(decorateMethod) {
      return decorateDeriveSections(decorateMethod, this._rx.derive);
    }
    _rxDecorateMethod = method => {
      return method;
    };
  }

  const KEEPALIVE_INTERVAL = 10000;
  const l = util.logger('api/init');
  function textToString(t) {
    return t.toString();
  }
  var _healthTimer = _classPrivateFieldKey("healthTimer");
  var _registries = _classPrivateFieldKey("registries");
  var _updateSub = _classPrivateFieldKey("updateSub");
  var _waitingRegistries = _classPrivateFieldKey("waitingRegistries");
  var _onProviderConnect = _classPrivateFieldKey("onProviderConnect");
  var _onProviderDisconnect = _classPrivateFieldKey("onProviderDisconnect");
  var _onProviderError = _classPrivateFieldKey("onProviderError");
  class Init extends Decorate {
    constructor(options, type, decorateMethod) {
      super(options, type, decorateMethod);
      Object.defineProperty(this, _onProviderError, {
        value: _onProviderError2
      });
      Object.defineProperty(this, _onProviderDisconnect, {
        value: _onProviderDisconnect2
      });
      Object.defineProperty(this, _onProviderConnect, {
        value: _onProviderConnect2
      });
      Object.defineProperty(this, _healthTimer, {
        writable: true,
        value: null
      });
      Object.defineProperty(this, _registries, {
        writable: true,
        value: []
      });
      Object.defineProperty(this, _updateSub, {
        writable: true,
        value: null
      });
      Object.defineProperty(this, _waitingRegistries, {
        writable: true,
        value: {}
      });
      this.registry.setKnownTypes(options);
      if (!options.source) {
        this.registerTypes(options.types);
      } else {
        _classPrivateFieldBase(this, _registries)[_registries] = _classPrivateFieldBase(options.source, _registries)[_registries];
      }
      this._rpc = this._decorateRpc(this._rpcCore, this._decorateMethod);
      this._rx.rpc = this._decorateRpc(this._rpcCore, this._rxDecorateMethod);
      if (this.supportMulti) {
        this._queryMulti = this._decorateMulti(this._decorateMethod);
        this._rx.queryMulti = this._decorateMulti(this._rxDecorateMethod);
      }
      this._rx.signer = options.signer;
      this._rpcCore.setRegistrySwap(blockHash => this.getBlockRegistry(blockHash));
      this._rpcCore.setResolveBlockHash(blockNumber => firstValueFrom(this._rpcCore.chain.getBlockHash(blockNumber)));
      if (this.hasSubscriptions) {
        this._rpcCore.provider.on('disconnected', () => _classPrivateFieldBase(this, _onProviderDisconnect)[_onProviderDisconnect]());
        this._rpcCore.provider.on('error', e => _classPrivateFieldBase(this, _onProviderError)[_onProviderError](e));
        this._rpcCore.provider.on('connected', () => _classPrivateFieldBase(this, _onProviderConnect)[_onProviderConnect]());
      } else {
        l.warn('Api will be available in a limited mode since the provider does not support subscriptions');
      }
      if (this._rpcCore.provider.isConnected) {
        _classPrivateFieldBase(this, _onProviderConnect)[_onProviderConnect]();
      }
    }
    _initRegistry(registry, chain, version, metadata, chainProps) {
      registry.clearCache();
      registry.setChainProperties(chainProps || this.registry.getChainProperties());
      registry.setKnownTypes(this._options);
      registry.register(getSpecTypes(registry, chain, version.specName, version.specVersion));
      registry.setHasher(getSpecHasher(registry, chain, version.specName));
      if (registry.knownTypes.typesBundle) {
        registry.knownTypes.typesAlias = getSpecAlias(registry, chain, version.specName);
      }
      registry.setMetadata(metadata, undefined, util.objectSpread({}, getSpecExtensions(registry, chain, version.specName), this._options.signedExtensions));
    }
    _getDefaultRegistry() {
      return util.assertReturn(_classPrivateFieldBase(this, _registries)[_registries].find(({
        isDefault
      }) => isDefault), 'Initialization error, cannot find the default registry');
    }
    async at(blockHash, knownVersion) {
      const u8aHash = util.u8aToU8a(blockHash);
      const registry = await this.getBlockRegistry(u8aHash, knownVersion);
      return this._createDecorated(registry, true, null, u8aHash).decoratedApi;
    }
    async _createBlockRegistry(blockHash, header, version) {
      const registry = new types.TypeRegistry(blockHash);
      const metadata = new types.Metadata(registry, await firstValueFrom(this._rpcCore.state.getMetadata.raw(header.parentHash)));
      this._initRegistry(registry, this._runtimeChain, version, metadata);
      const result = {
        lastBlockHash: blockHash,
        metadata,
        registry,
        runtimeVersion: version
      };
      _classPrivateFieldBase(this, _registries)[_registries].push(result);
      return result;
    }
    _cacheBlockRegistryProgress(key, creator) {
      let waiting = _classPrivateFieldBase(this, _waitingRegistries)[_waitingRegistries][key];
      if (util.isUndefined(waiting)) {
        waiting = _classPrivateFieldBase(this, _waitingRegistries)[_waitingRegistries][key] = new Promise((resolve, reject) => {
          creator().then(registry => {
            delete _classPrivateFieldBase(this, _waitingRegistries)[_waitingRegistries][key];
            resolve(registry);
          }).catch(error => {
            delete _classPrivateFieldBase(this, _waitingRegistries)[_waitingRegistries][key];
            reject(error);
          });
        });
      }
      return waiting;
    }
    _getBlockRegistryViaVersion(blockHash, version) {
      if (version) {
        const existingViaVersion = _classPrivateFieldBase(this, _registries)[_registries].find(({
          runtimeVersion: {
            specName,
            specVersion
          }
        }) => specName.eq(version.specName) && specVersion.eq(version.specVersion));
        if (existingViaVersion) {
          existingViaVersion.lastBlockHash = blockHash;
          return existingViaVersion;
        }
      }
      return null;
    }
    async _getBlockRegistryViaHash(blockHash) {
      util.assert(this._genesisHash && this._runtimeVersion, 'Cannot retrieve data on an uninitialized chain');
      const header = this.registry.createType('HeaderPartial', this._genesisHash.eq(blockHash) ? {
        number: util.BN_ZERO,
        parentHash: this._genesisHash
      } : await firstValueFrom(this._rpcCore.chain.getHeader.raw(blockHash)));
      util.assert(!header.parentHash.isEmpty, 'Unable to retrieve header and parent from supplied hash');
      const [firstVersion, lastVersion] = getUpgradeVersion(this._genesisHash, header.number);
      const version = this.registry.createType('RuntimeVersionPartial', firstVersion && (lastVersion || firstVersion.specVersion.eq(this._runtimeVersion.specVersion)) ? {
        specName: this._runtimeVersion.specName,
        specVersion: firstVersion.specVersion
      } : await firstValueFrom(this._rpcCore.state.getRuntimeVersion.raw(header.parentHash)));
      return (
        this._getBlockRegistryViaVersion(blockHash, version) || (
        await this._cacheBlockRegistryProgress(version.toHex(), () => this._createBlockRegistry(blockHash, header, version)))
      );
    }
    async getBlockRegistry(blockHash, knownVersion) {
      return (
        _classPrivateFieldBase(this, _registries)[_registries].find(({
          lastBlockHash
        }) => lastBlockHash && util.u8aEq(lastBlockHash, blockHash)) ||
        this._getBlockRegistryViaVersion(blockHash, knownVersion) || (
        await this._cacheBlockRegistryProgress(util.u8aToHex(blockHash), () => this._getBlockRegistryViaHash(blockHash)))
      );
    }
    async _loadMeta() {
      var _this$_options$source;
      if (this._isReady) {
        return true;
      }
      this._unsubscribeUpdates();
      [this._genesisHash, this._runtimeMetadata] = (_this$_options$source = this._options.source) !== null && _this$_options$source !== void 0 && _this$_options$source._isReady ? await this._metaFromSource(this._options.source) : await this._metaFromChain(this._options.metadata);
      return this._initFromMeta(this._runtimeMetadata);
    }
    async _metaFromSource(source) {
      this._extrinsicType = source.extrinsicVersion;
      this._runtimeChain = source.runtimeChain;
      this._runtimeVersion = source.runtimeVersion;
      const sections = Object.keys(source.rpc);
      const rpcs = [];
      for (let s = 0; s < sections.length; s++) {
        const section = sections[s];
        const methods = Object.keys(source.rpc[section]);
        for (let m = 0; m < methods.length; m++) {
          rpcs.push(`${section}_${methods[m]}`);
        }
      }
      this._filterRpc(rpcs, getSpecRpc(this.registry, source.runtimeChain, source.runtimeVersion.specName));
      return [source.genesisHash, source.runtimeMetadata];
    }
    _subscribeUpdates() {
      if (_classPrivateFieldBase(this, _updateSub)[_updateSub] || !this.hasSubscriptions) {
        return;
      }
      _classPrivateFieldBase(this, _updateSub)[_updateSub] = this._rpcCore.state.subscribeRuntimeVersion().pipe(switchMap(version => {
        var _this$_runtimeVersion;
        return (
          (_this$_runtimeVersion = this._runtimeVersion) !== null && _this$_runtimeVersion !== void 0 && _this$_runtimeVersion.specVersion.eq(version.specVersion) ? of(false) : this._rpcCore.state.getMetadata().pipe(map(metadata => {
            l.log(`Runtime version updated to spec=${version.specVersion.toString()}, tx=${version.transactionVersion.toString()}`);
            this._runtimeMetadata = metadata;
            this._runtimeVersion = version;
            this._rx.runtimeVersion = version;
            const thisRegistry = this._getDefaultRegistry();
            thisRegistry.metadata = metadata;
            thisRegistry.runtimeVersion = version;
            this._initRegistry(this.registry, this._runtimeChain, version, metadata);
            this._injectMetadata(thisRegistry, true);
            return true;
          }))
        );
      })).subscribe();
    }
    async _metaFromChain(optMetadata) {
      const [genesisHash, runtimeVersion, chain, chainProps, rpcMethods, chainMetadata] = await Promise.all([firstValueFrom(this._rpcCore.chain.getBlockHash(0)), firstValueFrom(this._rpcCore.state.getRuntimeVersion()), firstValueFrom(this._rpcCore.system.chain()), firstValueFrom(this._rpcCore.system.properties()), firstValueFrom(this._rpcCore.rpc.methods()), optMetadata ? Promise.resolve(null) : firstValueFrom(this._rpcCore.state.getMetadata())]);
      this._runtimeChain = chain;
      this._runtimeVersion = runtimeVersion;
      this._rx.runtimeVersion = runtimeVersion;
      const metadataKey = `${genesisHash.toHex() || '0x'}-${runtimeVersion.specVersion.toString()}`;
      const metadata = chainMetadata || (optMetadata && optMetadata[metadataKey] ? new types.Metadata(this.registry, optMetadata[metadataKey]) : await firstValueFrom(this._rpcCore.state.getMetadata()));
      this._initRegistry(this.registry, chain, runtimeVersion, metadata, chainProps);
      this._filterRpc(rpcMethods.methods.map(textToString), getSpecRpc(this.registry, chain, runtimeVersion.specName));
      this._subscribeUpdates();
      if (!_classPrivateFieldBase(this, _registries)[_registries].length) {
        _classPrivateFieldBase(this, _registries)[_registries].push({
          isDefault: true,
          metadata,
          registry: this.registry,
          runtimeVersion
        });
      }
      metadata.getUniqTypes(this._options.throwOnUnknown || false);
      return [genesisHash, metadata];
    }
    _initFromMeta(metadata) {
      this._extrinsicType = metadata.asLatest.extrinsic.version.toNumber();
      this._rx.extrinsicType = this._extrinsicType;
      this._rx.genesisHash = this._genesisHash;
      this._rx.runtimeVersion = this._runtimeVersion;
      this._injectMetadata(this._getDefaultRegistry(), true);
      this._rx.derive = this._decorateDeriveRx(this._rxDecorateMethod);
      this._derive = this._decorateDerive(this._decorateMethod);
      return true;
    }
    _subscribeHealth() {
      _classPrivateFieldBase(this, _healthTimer)[_healthTimer] = this.hasSubscriptions ? setInterval(() => {
        firstValueFrom(this._rpcCore.system.health.raw()).catch(() => undefined);
      }, KEEPALIVE_INTERVAL) : null;
    }
    _unsubscribeHealth() {
      if (_classPrivateFieldBase(this, _healthTimer)[_healthTimer]) {
        clearInterval(_classPrivateFieldBase(this, _healthTimer)[_healthTimer]);
        _classPrivateFieldBase(this, _healthTimer)[_healthTimer] = null;
      }
    }
    _unsubscribeUpdates() {
      if (_classPrivateFieldBase(this, _updateSub)[_updateSub]) {
        _classPrivateFieldBase(this, _updateSub)[_updateSub].unsubscribe();
        _classPrivateFieldBase(this, _updateSub)[_updateSub] = null;
      }
    }
    _unsubscribe() {
      this._unsubscribeHealth();
      this._unsubscribeUpdates();
    }
  }
  async function _onProviderConnect2() {
    this._isConnected.next(true);
    this.emit('connected');
    try {
      const cryptoReady = this._options.initWasm === false ? true : await utilCrypto.cryptoWaitReady();
      const hasMeta = await this._loadMeta();
      this._subscribeHealth();
      if (hasMeta && !this._isReady && cryptoReady) {
        this._isReady = true;
        this.emit('ready', this);
      }
    } catch (_error) {
      const error = new Error(`FATAL: Unable to initialize the API: ${_error.message}`);
      l.error(error);
      this.emit('error', error);
    }
  }
  function _onProviderDisconnect2() {
    this._isConnected.next(false);
    this._unsubscribeHealth();
    this.emit('disconnected');
  }
  function _onProviderError2(error) {
    this.emit('error', error);
  }

  function assertResult(value) {
    if (value === undefined) {
      throw new Error("Api interfaces needs to be initialized before using, wait for 'isReady'");
    }
    return value;
  }
  class Getters extends Init {
    get call() {
      return assertResult(this._call);
    }
    get consts() {
      return assertResult(this._consts);
    }
    get derive() {
      return assertResult(this._derive);
    }
    get errors() {
      return assertResult(this._errors);
    }
    get events() {
      return assertResult(this._events);
    }
    get extrinsicVersion() {
      return this._extrinsicType;
    }
    get genesisHash() {
      return assertResult(this._genesisHash);
    }
    get isConnected() {
      return this._isConnected.getValue();
    }
    get libraryInfo() {
      return `${packageInfo.name} v${packageInfo.version}`;
    }
    get query() {
      return assertResult(this._query);
    }
    get queryMulti() {
      return assertResult(this._queryMulti);
    }
    get rpc() {
      return assertResult(this._rpc);
    }
    get runtimeChain() {
      return assertResult(this._runtimeChain);
    }
    get runtimeMetadata() {
      return assertResult(this._runtimeMetadata);
    }
    get runtimeVersion() {
      return assertResult(this._runtimeVersion);
    }
    get rx() {
      return assertResult(this._rx);
    }
    get stats() {
      return this._rpcCore.provider.stats;
    }
    get type() {
      return this._type;
    }
    get tx() {
      return assertResult(this._extrinsics);
    }
    findCall(callIndex) {
      return findCall(this.registry, callIndex);
    }
    findError(errorIndex) {
      return findError(this.registry, errorIndex);
    }
  }

  class ApiBase extends Getters {
    constructor(options = {}, type, decorateMethod) {
      super(options, type, decorateMethod);
    }
    connect() {
      return this._rpcCore.connect();
    }
    disconnect() {
      this._unsubscribe();
      return this._rpcCore.disconnect();
    }
    setSigner(signer) {
      this._rx.signer = signer;
    }
    async sign(address, data, {
      signer
    } = {}) {
      if (util.isString(address)) {
        const _signer = signer || this._rx.signer;
        util.assert(_signer === null || _signer === void 0 ? void 0 : _signer.signRaw, 'No signer exists with a signRaw interface. You possibly need to pass through an explicit keypair for the origin so it can be used for signing.');
        return (await _signer.signRaw(util.objectSpread({
          type: 'bytes'
        }, data, {
          address
        }))).signature;
      }
      return util.u8aToHex(address.sign(util.u8aToU8a(data.data)));
    }
  }

  class Combinator {
    #allHasFired = false;
    #callback;
    #fired = [];
    #fns = [];
    #isActive = true;
    #results = [];
    #subscriptions = [];
    constructor(fns, callback) {
      this.#callback = callback;
      this.#subscriptions = fns.map(async (input, index) => {
        const [fn, ...args] = Array.isArray(input) ? input : [input];
        this.#fired.push(false);
        this.#fns.push(fn);
        return fn(...args, this._createCallback(index));
      });
    }
    _allHasFired() {
      this.#allHasFired || (this.#allHasFired = this.#fired.filter(hasFired => !hasFired).length === 0);
      return this.#allHasFired;
    }
    _createCallback(index) {
      return value => {
        this.#fired[index] = true;
        this.#results[index] = value;
        this._triggerUpdate();
      };
    }
    _triggerUpdate() {
      if (!this.#isActive || !util.isFunction(this.#callback) || !this._allHasFired()) {
        return;
      }
      try {
        this.#callback(this.#results);
      } catch (error) {
      }
    }
    unsubscribe() {
      if (!this.#isActive) {
        return;
      }
      this.#isActive = false;
      this.#subscriptions.forEach(async subscription => {
        try {
          const unsubscribe = await subscription;
          if (util.isFunction(unsubscribe)) {
            unsubscribe();
          }
        } catch (error) {
        }
      });
    }
  }

  function promiseTracker(resolve, reject) {
    let isCompleted = false;
    return {
      reject: error => {
        if (!isCompleted) {
          isCompleted = true;
          reject(error);
        }
        return EMPTY;
      },
      resolve: value => {
        if (!isCompleted) {
          isCompleted = true;
          resolve(value);
        }
      }
    };
  }
  function extractArgs(args, needsCallback) {
    const actualArgs = args.slice();
    const callback = args.length && util.isFunction(args[args.length - 1]) ? actualArgs.pop() : undefined;
    util.assert(!needsCallback || util.isFunction(callback), 'Expected a callback to be passed with subscriptions');
    return [actualArgs, callback];
  }
  function decorateCall(method, args) {
    return new Promise((resolve, reject) => {
      const tracker = promiseTracker(resolve, reject);
      const subscription = method(...args).pipe(catchError(error => tracker.reject(error))).subscribe(result => {
        tracker.resolve(result);
        util.nextTick(() => subscription.unsubscribe());
      });
    });
  }
  function decorateSubscribe(method, args, resultCb) {
    return new Promise((resolve, reject) => {
      const tracker = promiseTracker(resolve, reject);
      const subscription = method(...args).pipe(catchError(error => tracker.reject(error)), tap(() => tracker.resolve(() => subscription.unsubscribe()))).subscribe(result => {
        util.nextTick(() => resultCb(result));
      });
    });
  }
  function toPromiseMethod(method, options) {
    const needsCallback = !!(options && options.methodName && options.methodName.includes('subscribe'));
    return function (...args) {
      const [actualArgs, resultCb] = extractArgs(args, needsCallback);
      return resultCb ? decorateSubscribe(method, actualArgs, resultCb) : decorateCall((options === null || options === void 0 ? void 0 : options.overrideNoSub) || method, actualArgs);
    };
  }

  class ApiPromise extends ApiBase {
    #isReadyPromise;
    #isReadyOrErrorPromise;
    constructor(options) {
      super(options, 'promise', toPromiseMethod);
      this.#isReadyPromise = new Promise(resolve => {
        super.once('ready', () => resolve(this));
      });
      this.#isReadyOrErrorPromise = new Promise((resolve, reject) => {
        const tracker = promiseTracker(resolve, reject);
        super.once('ready', () => tracker.resolve(this));
        super.once('error', error => tracker.reject(error));
      });
    }
    static create(options) {
      const instance = new ApiPromise(options);
      if (options && options.throwOnConnect) {
        return instance.isReadyOrError;
      }
      instance.isReadyOrError.catch(() => {
      });
      return instance.isReady;
    }
    get isReady() {
      return this.#isReadyPromise;
    }
    get isReadyOrError() {
      return this.#isReadyOrErrorPromise;
    }
    clone() {
      return new ApiPromise(util.objectSpread({}, this._options, {
        source: this
      }));
    }
    async combineLatest(fns, callback) {
      const combinator = new Combinator(fns, callback);
      return () => {
        combinator.unsubscribe();
      };
    }
  }

  function toRxMethod(method) {
    return method;
  }

  class ApiRx extends ApiBase {
    #isReadyRx;
    constructor(options) {
      super(options, 'rxjs', toRxMethod);
      this.#isReadyRx = from(
      new Promise(resolve => {
        super.on('ready', () => resolve(this));
      }));
    }
    static create(options) {
      return new ApiRx(options).isReady;
    }
    get isReady() {
      return this.#isReadyRx;
    }
    clone() {
      return new ApiRx(util.objectSpread({}, this._options, {
        source: this
      }));
    }
  }

  Object.defineProperty(exports, 'Keyring', {
    enumerable: true,
    get: function () { return keyring.Keyring; }
  });
  exports.ApiPromise = ApiPromise;
  exports.ApiRx = ApiRx;
  exports.HttpProvider = HttpProvider;
  exports.SubmittableResult = SubmittableResult;
  exports.WsProvider = WsProvider;
  exports.packageInfo = packageInfo;
  exports.toPromiseMethod = toPromiseMethod;
  exports.toRxMethod = toRxMethod;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
