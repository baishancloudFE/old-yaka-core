'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _tool = require('./../../tool/');

var _igrootFetch = require('igroot-fetch');

var _igrootFetch2 = _interopRequireDefault(_igrootFetch);

var _mountFunctions2 = require('./mountFunctions');

var _mountFunctions3 = _interopRequireDefault(_mountFunctions2);

var _stream = require('./stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var modelFactory = function modelFactory(model, yakaApis) {
	var type = model.type,
	    params = model.params,
	    url = model.url,
	    streams = model.streams,
	    _model$headers = model.headers,
	    headers = _model$headers === undefined ? {} : _model$headers,
	    mountFunctions = model.mountFunctions;
	var getState = yakaApis.getState,
	    getProps = yakaApis.getProps,
	    formValueGettingFunction = yakaApis.formValueGettingFunction,
	    getInitData = yakaApis.getInitData;

	Object.keys(headers).forEach(function (key) {
		var val = headers[key] ? headers[key].toString() : '';
		if ((0, _tool.isReadState)(val)) {
			headers[key] = (0, _tool.readState)(val, getState());
		}
		if (val.indexOf('@') !== -1) {
			var name = val.slice(1, val.length);
			if (getProps()[name]) {
				headers[key] = getProps()[name];
			}
		}
	});

	return function () {
		var auto = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

		if (params) {
			Object.keys(params).forEach(function (key) {
				var value = params[key] ? params[key].toString() : null;
				if ((0, _tool.isReadState)(value)) {
					var val = (0, _tool.readState)(value, getState());
					params[key] = val;
					return;
				}
				if (value && value.indexOf('#') !== -1) {
					var _val = '';
					if (auto) {
						_val = getInitData()[value.slice(1, value.length)];
					} else {
						_val = formValueGettingFunction(value.slice(1, value.length));
					}
					if ((typeof _val === 'undefined' ? 'undefined' : _typeof(_val)) === 'object' && _val.key && _val.label) {
						_val = _val.key;
					}
					params[key] = _val;
					return;
				}
				params[key] = value;
			});
		}
		if (type === 'get' || type === 'restful') {
			(0, _igrootFetch2.default)(url, { headers: headers, handleHttpErrors: function handleHttpErrors() {}, mode: 'cors' }).get().then(function (res) {
				var code = res.code.toString();
				if (code && code !== '0') {
					return;
				}
				mountFunctions && (0, _mountFunctions3.default)(mountFunctions, res, yakaApis);
				streams && (0, _stream2.default)(streams, res, yakaApis);
			});
		}
		if (type === 'post') {
			(0, _igrootFetch2.default)(url, { headers: headers, handleHttpErrors: function handleHttpErrors() {}, mode: 'cors' }).post(params).then(function (res) {
				var code = res.code.toString();
				if (code && code !== '0') {
					return;
				}
				mountFunctions && (0, _mountFunctions3.default)(mountFunctions, res, yakaApis);
				streams && (0, _stream2.default)(streams, res, yakaApis);
			});
		}
	};
};
var models = function models(_models2, yakaApis) {
	var _models = {};
	Object.keys(_models2 || {}).forEach(function (key) {
		var model = _models2[key];
		_models[key] = modelFactory(model, yakaApis);
		if (model.action === 'auto') {
			_models[key](true);
		}
	});
	return _models;
};
exports.default = models;