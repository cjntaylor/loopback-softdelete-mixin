'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model, _ref) {
  var _ref$deletedAt = _ref.deletedAt,
      deletedAt = _ref$deletedAt === undefined ? 'deletedAt' : _ref$deletedAt,
      _ref$scrub = _ref.scrub,
      scrub = _ref$scrub === undefined ? false : _ref$scrub;

  debug('SoftDelete mixin for Model %s', Model.modelName);

  debug('options', { deletedAt: deletedAt, scrub: scrub });

  var properties = Model.definition.properties;
  var idName = Model.dataSource.idName(Model.modelName);

  var scrubbed = {};
  if (scrub !== false) {
    var propertiesToScrub = scrub;
    if (!Array.isArray(propertiesToScrub)) {
      propertiesToScrub = (0, _keys2.default)(properties).filter(function (prop) {
        return !properties[prop][idName] && prop !== deletedAt;
      });
    }
    scrubbed = propertiesToScrub.reduce(function (obj, prop) {
      return (0, _extends7.default)({}, obj, (0, _defineProperty3.default)({}, prop, null));
    }, {});
  }

  Model.defineProperty(deletedAt, { type: Date, required: false, default: null });

  Model.destroyAll = function softDestroyAll(where, cb) {
    return Model.updateAll(where, (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.remove = Model.destroyAll;
  Model.deleteAll = Model.destroyAll;

  Model.destroyById = function softDestroyById(id, cb) {
    return Model.updateAll((0, _defineProperty3.default)({}, idName, id), (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.removeById = Model.destroyById;
  Model.deleteById = Model.destroyById;

  Model.prototype.destroy = function softDestroy(options, cb) {
    var callback = cb === undefined && typeof options === 'function' ? options : cb;

    return this.updateAttributes((0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? callback(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? callback(error) : _promise2.default.reject(error);
    });
  };

  Model.prototype.remove = Model.prototype.destroy;
  Model.prototype.delete = Model.prototype.destroy;

  // Emulate default scope but with more flexibility.
  var queryNonDeleted = (0, _defineProperty3.default)({}, deletedAt, null);

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return _findOrCreate.call.apply(_findOrCreate, [Model, query].concat(rest));
  };

  var _find = Model.find;
  Model.find = function findDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _find.call.apply(_find, [Model, query].concat(rest));
  };

  var _findOne = Model.findOne;
  Model.findOne = function findOneDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _findOne.call.apply(_findOne, [Model, query].concat(rest));
  };

  var _count = Model.count;
  Model.count = function countDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because count only receives a 'where', use a special reserved keyword to ask for the
    // deleted entities.
    var deleted = where.$deleted;
    delete where.$deleted;
    var whereNotDeleted = where;
    if (!deleted) {
      if (!where || (0, _keys2.default)(where).length === 0) {
        whereNotDeleted = queryNonDeleted;
      } else {
        whereNotDeleted = { and: [where, queryNonDeleted] };
      }
    }

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because update/updateAll only receives a 'where', use a special reserved keyword to ask
    // for the deleted entities.
    var deleted = where.$deleted;
    delete where.$deleted;
    var whereNotDeleted = where;
    if (!deleted) {
      if (!where || (0, _keys2.default)(where).length === 0) {
        whereNotDeleted = queryNonDeleted;
      } else {
        whereNotDeleted = { and: [where, queryNonDeleted] };
      }
    }

    for (var _len5 = arguments.length, rest = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      rest[_key5 - 1] = arguments[_key5];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };

  var _upsertWithWhere = Model.upsertWithWhere;
  Model.upsertWithWhere = function upsertWithWhereDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because upsertWithWhere only receives a 'where', use a special reserved keyword to ask
    // for the deleted entities.
    var deleted = where.$deleted;
    delete where.$deleted;
    var whereNotDeleted = where;
    if (!deleted) {
      if (!where || (0, _keys2.default)(where).length === 0) {
        whereNotDeleted = queryNonDeleted;
      } else {
        whereNotDeleted = { and: [where, queryNonDeleted] };
      }
    }

    for (var _len6 = arguments.length, rest = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
      rest[_key6 - 1] = arguments[_key6];
    }

    return _upsertWithWhere.call.apply(_upsertWithWhere, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvZnQtZGVsZXRlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiTW9kZWwiLCJkZWxldGVkQXQiLCJzY3J1YiIsIm1vZGVsTmFtZSIsInByb3BlcnRpZXMiLCJkZWZpbml0aW9uIiwiaWROYW1lIiwiZGF0YVNvdXJjZSIsInNjcnViYmVkIiwicHJvcGVydGllc1RvU2NydWIiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJwcm9wIiwicmVkdWNlIiwib2JqIiwiZGVmaW5lUHJvcGVydHkiLCJ0eXBlIiwiRGF0ZSIsInJlcXVpcmVkIiwiZGVmYXVsdCIsImRlc3Ryb3lBbGwiLCJzb2Z0RGVzdHJveUFsbCIsIndoZXJlIiwiY2IiLCJ1cGRhdGVBbGwiLCJ0aGVuIiwicmVzdWx0IiwiY2F0Y2giLCJlcnJvciIsInJlamVjdCIsInJlbW92ZSIsImRlbGV0ZUFsbCIsImRlc3Ryb3lCeUlkIiwic29mdERlc3Ryb3lCeUlkIiwiaWQiLCJyZW1vdmVCeUlkIiwiZGVsZXRlQnlJZCIsInByb3RvdHlwZSIsImRlc3Ryb3kiLCJzb2Z0RGVzdHJveSIsIm9wdGlvbnMiLCJjYWxsYmFjayIsInVuZGVmaW5lZCIsInVwZGF0ZUF0dHJpYnV0ZXMiLCJkZWxldGUiLCJxdWVyeU5vbkRlbGV0ZWQiLCJfZmluZE9yQ3JlYXRlIiwiZmluZE9yQ3JlYXRlIiwiZmluZE9yQ3JlYXRlRGVsZXRlZCIsInF1ZXJ5IiwiZGVsZXRlZCIsImxlbmd0aCIsImFuZCIsInJlc3QiLCJjYWxsIiwiX2ZpbmQiLCJmaW5kIiwiZmluZERlbGV0ZWQiLCJfZmluZE9uZSIsImZpbmRPbmUiLCJmaW5kT25lRGVsZXRlZCIsIl9jb3VudCIsImNvdW50IiwiY291bnREZWxldGVkIiwiJGRlbGV0ZWQiLCJ3aGVyZU5vdERlbGV0ZWQiLCJfdXBkYXRlIiwidXBkYXRlIiwidXBkYXRlRGVsZXRlZCIsIl91cHNlcnRXaXRoV2hlcmUiLCJ1cHNlcnRXaXRoV2hlcmUiLCJ1cHNlcnRXaXRoV2hlcmVEZWxldGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7OztBQUNBLElBQU1BLFFBQVEsc0JBQWQ7O2tCQUVlLFVBQUNDLEtBQUQsUUFBdUQ7QUFBQSw0QkFBN0NDLFNBQTZDO0FBQUEsTUFBN0NBLFNBQTZDLGtDQUFqQyxXQUFpQztBQUFBLHdCQUFwQkMsS0FBb0I7QUFBQSxNQUFwQkEsS0FBb0IsOEJBQVosS0FBWTs7QUFDcEVILFFBQU0sK0JBQU4sRUFBdUNDLE1BQU1HLFNBQTdDOztBQUVBSixRQUFNLFNBQU4sRUFBaUIsRUFBRUUsb0JBQUYsRUFBYUMsWUFBYixFQUFqQjs7QUFFQSxNQUFNRSxhQUFhSixNQUFNSyxVQUFOLENBQWlCRCxVQUFwQztBQUNBLE1BQU1FLFNBQVNOLE1BQU1PLFVBQU4sQ0FBaUJELE1BQWpCLENBQXdCTixNQUFNRyxTQUE5QixDQUFmOztBQUVBLE1BQUlLLFdBQVcsRUFBZjtBQUNBLE1BQUlOLFVBQVUsS0FBZCxFQUFxQjtBQUNuQixRQUFJTyxvQkFBb0JQLEtBQXhCO0FBQ0EsUUFBSSxDQUFDUSxNQUFNQyxPQUFOLENBQWNGLGlCQUFkLENBQUwsRUFBdUM7QUFDckNBLDBCQUFvQixvQkFBWUwsVUFBWixFQUNqQlEsTUFEaUIsQ0FDVjtBQUFBLGVBQVEsQ0FBQ1IsV0FBV1MsSUFBWCxFQUFpQlAsTUFBakIsQ0FBRCxJQUE2Qk8sU0FBU1osU0FBOUM7QUFBQSxPQURVLENBQXBCO0FBRUQ7QUFDRE8sZUFBV0Msa0JBQWtCSyxNQUFsQixDQUF5QixVQUFDQyxHQUFELEVBQU1GLElBQU47QUFBQSx3Q0FBcUJFLEdBQXJCLG9DQUEyQkYsSUFBM0IsRUFBa0MsSUFBbEM7QUFBQSxLQUF6QixFQUFvRSxFQUFwRSxDQUFYO0FBQ0Q7O0FBRURiLFFBQU1nQixjQUFOLENBQXFCZixTQUFyQixFQUFnQyxFQUFDZ0IsTUFBTUMsSUFBUCxFQUFhQyxVQUFVLEtBQXZCLEVBQThCQyxTQUFTLElBQXZDLEVBQWhDOztBQUVBcEIsUUFBTXFCLFVBQU4sR0FBbUIsU0FBU0MsY0FBVCxDQUF3QkMsS0FBeEIsRUFBK0JDLEVBQS9CLEVBQW1DO0FBQ3BELFdBQU94QixNQUFNeUIsU0FBTixDQUFnQkYsS0FBaEIsNkJBQTRCZixRQUE1QixvQ0FBdUNQLFNBQXZDLEVBQW1ELElBQUlpQixJQUFKLEVBQW5ELElBQ0pRLElBREksQ0FDQztBQUFBLGFBQVcsT0FBT0YsRUFBUCxLQUFjLFVBQWYsR0FBNkJBLEdBQUcsSUFBSCxFQUFTRyxNQUFULENBQTdCLEdBQWdEQSxNQUExRDtBQUFBLEtBREQsRUFFSkMsS0FGSSxDQUVFO0FBQUEsYUFBVSxPQUFPSixFQUFQLEtBQWMsVUFBZixHQUE2QkEsR0FBR0ssS0FBSCxDQUE3QixHQUF5QyxrQkFBUUMsTUFBUixDQUFlRCxLQUFmLENBQWxEO0FBQUEsS0FGRixDQUFQO0FBR0QsR0FKRDs7QUFNQTdCLFFBQU0rQixNQUFOLEdBQWUvQixNQUFNcUIsVUFBckI7QUFDQXJCLFFBQU1nQyxTQUFOLEdBQWtCaEMsTUFBTXFCLFVBQXhCOztBQUVBckIsUUFBTWlDLFdBQU4sR0FBb0IsU0FBU0MsZUFBVCxDQUF5QkMsRUFBekIsRUFBNkJYLEVBQTdCLEVBQWlDO0FBQ25ELFdBQU94QixNQUFNeUIsU0FBTixtQ0FBbUJuQixNQUFuQixFQUE0QjZCLEVBQTVCLDhCQUF1QzNCLFFBQXZDLG9DQUFrRFAsU0FBbEQsRUFBOEQsSUFBSWlCLElBQUosRUFBOUQsSUFDSlEsSUFESSxDQUNDO0FBQUEsYUFBVyxPQUFPRixFQUFQLEtBQWMsVUFBZixHQUE2QkEsR0FBRyxJQUFILEVBQVNHLE1BQVQsQ0FBN0IsR0FBZ0RBLE1BQTFEO0FBQUEsS0FERCxFQUVKQyxLQUZJLENBRUU7QUFBQSxhQUFVLE9BQU9KLEVBQVAsS0FBYyxVQUFmLEdBQTZCQSxHQUFHSyxLQUFILENBQTdCLEdBQXlDLGtCQUFRQyxNQUFSLENBQWVELEtBQWYsQ0FBbEQ7QUFBQSxLQUZGLENBQVA7QUFHRCxHQUpEOztBQU1BN0IsUUFBTW9DLFVBQU4sR0FBbUJwQyxNQUFNaUMsV0FBekI7QUFDQWpDLFFBQU1xQyxVQUFOLEdBQW1CckMsTUFBTWlDLFdBQXpCOztBQUVBakMsUUFBTXNDLFNBQU4sQ0FBZ0JDLE9BQWhCLEdBQTBCLFNBQVNDLFdBQVQsQ0FBcUJDLE9BQXJCLEVBQThCakIsRUFBOUIsRUFBa0M7QUFDMUQsUUFBTWtCLFdBQVlsQixPQUFPbUIsU0FBUCxJQUFvQixPQUFPRixPQUFQLEtBQW1CLFVBQXhDLEdBQXNEQSxPQUF0RCxHQUFnRWpCLEVBQWpGOztBQUVBLFdBQU8sS0FBS29CLGdCQUFMLDRCQUEyQnBDLFFBQTNCLG9DQUFzQ1AsU0FBdEMsRUFBa0QsSUFBSWlCLElBQUosRUFBbEQsSUFDSlEsSUFESSxDQUNDO0FBQUEsYUFBVyxPQUFPRixFQUFQLEtBQWMsVUFBZixHQUE2QmtCLFNBQVMsSUFBVCxFQUFlZixNQUFmLENBQTdCLEdBQXNEQSxNQUFoRTtBQUFBLEtBREQsRUFFSkMsS0FGSSxDQUVFO0FBQUEsYUFBVSxPQUFPSixFQUFQLEtBQWMsVUFBZixHQUE2QmtCLFNBQVNiLEtBQVQsQ0FBN0IsR0FBK0Msa0JBQVFDLE1BQVIsQ0FBZUQsS0FBZixDQUF4RDtBQUFBLEtBRkYsQ0FBUDtBQUdELEdBTkQ7O0FBUUE3QixRQUFNc0MsU0FBTixDQUFnQlAsTUFBaEIsR0FBeUIvQixNQUFNc0MsU0FBTixDQUFnQkMsT0FBekM7QUFDQXZDLFFBQU1zQyxTQUFOLENBQWdCTyxNQUFoQixHQUF5QjdDLE1BQU1zQyxTQUFOLENBQWdCQyxPQUF6Qzs7QUFFQTtBQUNBLE1BQU1PLG9EQUFvQjdDLFNBQXBCLEVBQWdDLElBQWhDLENBQU47O0FBRUEsTUFBTThDLGdCQUFnQi9DLE1BQU1nRCxZQUE1QjtBQUNBaEQsUUFBTWdELFlBQU4sR0FBcUIsU0FBU0MsbUJBQVQsR0FBa0Q7QUFBQSxRQUFyQkMsS0FBcUIsdUVBQWIsRUFBYTs7QUFDckUsUUFBSSxDQUFDQSxNQUFNQyxPQUFYLEVBQW9CO0FBQ2xCLFVBQUksQ0FBQ0QsTUFBTTNCLEtBQVAsSUFBZ0Isb0JBQVkyQixNQUFNM0IsS0FBbEIsRUFBeUI2QixNQUF6QixLQUFvQyxDQUF4RCxFQUEyRDtBQUN6REYsY0FBTTNCLEtBQU4sR0FBY3VCLGVBQWQ7QUFDRCxPQUZELE1BRU87QUFDTEksY0FBTTNCLEtBQU4sR0FBYyxFQUFFOEIsS0FBSyxDQUFFSCxNQUFNM0IsS0FBUixFQUFldUIsZUFBZixDQUFQLEVBQWQ7QUFDRDtBQUNGOztBQVBvRSxzQ0FBTlEsSUFBTTtBQUFOQSxVQUFNO0FBQUE7O0FBU3JFLFdBQU9QLGNBQWNRLElBQWQsdUJBQW1CdkQsS0FBbkIsRUFBMEJrRCxLQUExQixTQUFvQ0ksSUFBcEMsRUFBUDtBQUNELEdBVkQ7O0FBWUEsTUFBTUUsUUFBUXhELE1BQU15RCxJQUFwQjtBQUNBekQsUUFBTXlELElBQU4sR0FBYSxTQUFTQyxXQUFULEdBQTBDO0FBQUEsUUFBckJSLEtBQXFCLHVFQUFiLEVBQWE7O0FBQ3JELFFBQUksQ0FBQ0EsTUFBTUMsT0FBWCxFQUFvQjtBQUNsQixVQUFJLENBQUNELE1BQU0zQixLQUFQLElBQWdCLG9CQUFZMkIsTUFBTTNCLEtBQWxCLEVBQXlCNkIsTUFBekIsS0FBb0MsQ0FBeEQsRUFBMkQ7QUFDekRGLGNBQU0zQixLQUFOLEdBQWN1QixlQUFkO0FBQ0QsT0FGRCxNQUVPO0FBQ0xJLGNBQU0zQixLQUFOLEdBQWMsRUFBRThCLEtBQUssQ0FBRUgsTUFBTTNCLEtBQVIsRUFBZXVCLGVBQWYsQ0FBUCxFQUFkO0FBQ0Q7QUFDRjs7QUFQb0QsdUNBQU5RLElBQU07QUFBTkEsVUFBTTtBQUFBOztBQVNyRCxXQUFPRSxNQUFNRCxJQUFOLGVBQVd2RCxLQUFYLEVBQWtCa0QsS0FBbEIsU0FBNEJJLElBQTVCLEVBQVA7QUFDRCxHQVZEOztBQVlBLE1BQU1LLFdBQVczRCxNQUFNNEQsT0FBdkI7QUFDQTVELFFBQU00RCxPQUFOLEdBQWdCLFNBQVNDLGNBQVQsR0FBNkM7QUFBQSxRQUFyQlgsS0FBcUIsdUVBQWIsRUFBYTs7QUFDM0QsUUFBSSxDQUFDQSxNQUFNQyxPQUFYLEVBQW9CO0FBQ2xCLFVBQUksQ0FBQ0QsTUFBTTNCLEtBQVAsSUFBZ0Isb0JBQVkyQixNQUFNM0IsS0FBbEIsRUFBeUI2QixNQUF6QixLQUFvQyxDQUF4RCxFQUEyRDtBQUN6REYsY0FBTTNCLEtBQU4sR0FBY3VCLGVBQWQ7QUFDRCxPQUZELE1BRU87QUFDTEksY0FBTTNCLEtBQU4sR0FBYyxFQUFFOEIsS0FBSyxDQUFFSCxNQUFNM0IsS0FBUixFQUFldUIsZUFBZixDQUFQLEVBQWQ7QUFDRDtBQUNGOztBQVAwRCx1Q0FBTlEsSUFBTTtBQUFOQSxVQUFNO0FBQUE7O0FBUzNELFdBQU9LLFNBQVNKLElBQVQsa0JBQWN2RCxLQUFkLEVBQXFCa0QsS0FBckIsU0FBK0JJLElBQS9CLEVBQVA7QUFDRCxHQVZEOztBQVlBLE1BQU1RLFNBQVM5RCxNQUFNK0QsS0FBckI7QUFDQS9ELFFBQU0rRCxLQUFOLEdBQWMsU0FBU0MsWUFBVCxHQUEyQztBQUFBLFFBQXJCekMsS0FBcUIsdUVBQWIsRUFBYTs7QUFDdkQ7QUFDQTtBQUNBLFFBQU00QixVQUFVNUIsTUFBTTBDLFFBQXRCO0FBQ0EsV0FBTzFDLE1BQU0wQyxRQUFiO0FBQ0EsUUFBSUMsa0JBQWtCM0MsS0FBdEI7QUFDQSxRQUFJLENBQUM0QixPQUFMLEVBQWM7QUFDWixVQUFJLENBQUM1QixLQUFELElBQVUsb0JBQVlBLEtBQVosRUFBbUI2QixNQUFuQixLQUE4QixDQUE1QyxFQUErQztBQUM3Q2MsMEJBQWtCcEIsZUFBbEI7QUFDRCxPQUZELE1BRU87QUFDTG9CLDBCQUFrQixFQUFFYixLQUFLLENBQUU5QixLQUFGLEVBQVN1QixlQUFULENBQVAsRUFBbEI7QUFDRDtBQUNGOztBQVpzRCx1Q0FBTlEsSUFBTTtBQUFOQSxVQUFNO0FBQUE7O0FBYXZELFdBQU9RLE9BQU9QLElBQVAsZ0JBQVl2RCxLQUFaLEVBQW1Ca0UsZUFBbkIsU0FBdUNaLElBQXZDLEVBQVA7QUFDRCxHQWREOztBQWdCQSxNQUFNYSxVQUFVbkUsTUFBTW9FLE1BQXRCO0FBQ0FwRSxRQUFNb0UsTUFBTixHQUFlcEUsTUFBTXlCLFNBQU4sR0FBa0IsU0FBUzRDLGFBQVQsR0FBNEM7QUFBQSxRQUFyQjlDLEtBQXFCLHVFQUFiLEVBQWE7O0FBQzNFO0FBQ0E7QUFDQSxRQUFNNEIsVUFBVTVCLE1BQU0wQyxRQUF0QjtBQUNBLFdBQU8xQyxNQUFNMEMsUUFBYjtBQUNBLFFBQUlDLGtCQUFrQjNDLEtBQXRCO0FBQ0EsUUFBSSxDQUFDNEIsT0FBTCxFQUFjO0FBQ1osVUFBSSxDQUFDNUIsS0FBRCxJQUFVLG9CQUFZQSxLQUFaLEVBQW1CNkIsTUFBbkIsS0FBOEIsQ0FBNUMsRUFBK0M7QUFDN0NjLDBCQUFrQnBCLGVBQWxCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xvQiwwQkFBa0IsRUFBRWIsS0FBSyxDQUFFOUIsS0FBRixFQUFTdUIsZUFBVCxDQUFQLEVBQWxCO0FBQ0Q7QUFDRjs7QUFaMEUsdUNBQU5RLElBQU07QUFBTkEsVUFBTTtBQUFBOztBQWEzRSxXQUFPYSxRQUFRWixJQUFSLGlCQUFhdkQsS0FBYixFQUFvQmtFLGVBQXBCLFNBQXdDWixJQUF4QyxFQUFQO0FBQ0QsR0FkRDs7QUFnQkEsTUFBTWdCLG1CQUFtQnRFLE1BQU11RSxlQUEvQjtBQUNBdkUsUUFBTXVFLGVBQU4sR0FBd0IsU0FBU0Msc0JBQVQsR0FBcUQ7QUFBQSxRQUFyQmpELEtBQXFCLHVFQUFiLEVBQWE7O0FBQzNFO0FBQ0E7QUFDQSxRQUFNNEIsVUFBVTVCLE1BQU0wQyxRQUF0QjtBQUNBLFdBQU8xQyxNQUFNMEMsUUFBYjtBQUNBLFFBQUlDLGtCQUFrQjNDLEtBQXRCO0FBQ0EsUUFBSSxDQUFDNEIsT0FBTCxFQUFjO0FBQ1osVUFBSSxDQUFDNUIsS0FBRCxJQUFVLG9CQUFZQSxLQUFaLEVBQW1CNkIsTUFBbkIsS0FBOEIsQ0FBNUMsRUFBK0M7QUFDN0NjLDBCQUFrQnBCLGVBQWxCO0FBQ0QsT0FGRCxNQUVPO0FBQ0xvQiwwQkFBa0IsRUFBRWIsS0FBSyxDQUFFOUIsS0FBRixFQUFTdUIsZUFBVCxDQUFQLEVBQWxCO0FBQ0Q7QUFDRjs7QUFaMEUsdUNBQU5RLElBQU07QUFBTkEsVUFBTTtBQUFBOztBQWEzRSxXQUFPZ0IsaUJBQWlCZixJQUFqQiwwQkFBc0J2RCxLQUF0QixFQUE2QmtFLGVBQTdCLFNBQWlEWixJQUFqRCxFQUFQO0FBQ0QsR0FkRDtBQWVELEMiLCJmaWxlIjoic29mdC1kZWxldGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgX2RlYnVnIGZyb20gJy4vZGVidWcnO1xuY29uc3QgZGVidWcgPSBfZGVidWcoKTtcblxuZXhwb3J0IGRlZmF1bHQgKE1vZGVsLCB7IGRlbGV0ZWRBdCA9ICdkZWxldGVkQXQnLCBzY3J1YiA9IGZhbHNlIH0pID0+IHtcbiAgZGVidWcoJ1NvZnREZWxldGUgbWl4aW4gZm9yIE1vZGVsICVzJywgTW9kZWwubW9kZWxOYW1lKTtcblxuICBkZWJ1Zygnb3B0aW9ucycsIHsgZGVsZXRlZEF0LCBzY3J1YiB9KTtcblxuICBjb25zdCBwcm9wZXJ0aWVzID0gTW9kZWwuZGVmaW5pdGlvbi5wcm9wZXJ0aWVzO1xuICBjb25zdCBpZE5hbWUgPSBNb2RlbC5kYXRhU291cmNlLmlkTmFtZShNb2RlbC5tb2RlbE5hbWUpO1xuXG4gIGxldCBzY3J1YmJlZCA9IHt9O1xuICBpZiAoc2NydWIgIT09IGZhbHNlKSB7XG4gICAgbGV0IHByb3BlcnRpZXNUb1NjcnViID0gc2NydWI7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb3BlcnRpZXNUb1NjcnViKSkge1xuICAgICAgcHJvcGVydGllc1RvU2NydWIgPSBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKVxuICAgICAgICAuZmlsdGVyKHByb3AgPT4gIXByb3BlcnRpZXNbcHJvcF1baWROYW1lXSAmJiBwcm9wICE9PSBkZWxldGVkQXQpO1xuICAgIH1cbiAgICBzY3J1YmJlZCA9IHByb3BlcnRpZXNUb1NjcnViLnJlZHVjZSgob2JqLCBwcm9wKSA9PiAoeyAuLi5vYmosIFtwcm9wXTogbnVsbCB9KSwge30pO1xuICB9XG5cbiAgTW9kZWwuZGVmaW5lUHJvcGVydHkoZGVsZXRlZEF0LCB7dHlwZTogRGF0ZSwgcmVxdWlyZWQ6IGZhbHNlLCBkZWZhdWx0OiBudWxsfSk7XG5cbiAgTW9kZWwuZGVzdHJveUFsbCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QWxsKHdoZXJlLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwod2hlcmUsIHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpIH0pXG4gICAgICAudGhlbihyZXN1bHQgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihudWxsLCByZXN1bHQpIDogcmVzdWx0KVxuICAgICAgLmNhdGNoKGVycm9yID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IoZXJyb3IpIDogUHJvbWlzZS5yZWplY3QoZXJyb3IpKTtcbiAgfTtcblxuICBNb2RlbC5yZW1vdmUgPSBNb2RlbC5kZXN0cm95QWxsO1xuICBNb2RlbC5kZWxldGVBbGwgPSBNb2RlbC5kZXN0cm95QWxsO1xuXG4gIE1vZGVsLmRlc3Ryb3lCeUlkID0gZnVuY3Rpb24gc29mdERlc3Ryb3lCeUlkKGlkLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwoeyBbaWROYW1lXTogaWQgfSwgeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCl9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlQnlJZCA9IE1vZGVsLmRlc3Ryb3lCeUlkO1xuICBNb2RlbC5kZWxldGVCeUlkID0gTW9kZWwuZGVzdHJveUJ5SWQ7XG5cbiAgTW9kZWwucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBzb2Z0RGVzdHJveShvcHRpb25zLCBjYikge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKGNiID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpID8gb3B0aW9ucyA6IGNiO1xuXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlQXR0cmlidXRlcyh7IC4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2FsbGJhY2sobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucHJvdG90eXBlLnJlbW92ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuICBNb2RlbC5wcm90b3R5cGUuZGVsZXRlID0gTW9kZWwucHJvdG90eXBlLmRlc3Ryb3k7XG5cbiAgLy8gRW11bGF0ZSBkZWZhdWx0IHNjb3BlIGJ1dCB3aXRoIG1vcmUgZmxleGliaWxpdHkuXG4gIGNvbnN0IHF1ZXJ5Tm9uRGVsZXRlZCA9IHtbZGVsZXRlZEF0XTogbnVsbH07XG5cbiAgY29uc3QgX2ZpbmRPckNyZWF0ZSA9IE1vZGVsLmZpbmRPckNyZWF0ZTtcbiAgTW9kZWwuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gZmluZE9yQ3JlYXRlRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZE9yQ3JlYXRlLmNhbGwoTW9kZWwsIHF1ZXJ5LCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfZmluZCA9IE1vZGVsLmZpbmQ7XG4gIE1vZGVsLmZpbmQgPSBmdW5jdGlvbiBmaW5kRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZC5jYWxsKE1vZGVsLCBxdWVyeSwgLi4ucmVzdCk7XG4gIH07XG5cbiAgY29uc3QgX2ZpbmRPbmUgPSBNb2RlbC5maW5kT25lO1xuICBNb2RlbC5maW5kT25lID0gZnVuY3Rpb24gZmluZE9uZURlbGV0ZWQocXVlcnkgPSB7fSwgLi4ucmVzdCkge1xuICAgIGlmICghcXVlcnkuZGVsZXRlZCkge1xuICAgICAgaWYgKCFxdWVyeS53aGVyZSB8fCBPYmplY3Qua2V5cyhxdWVyeS53aGVyZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHF1ZXJ5LndoZXJlID0gcXVlcnlOb25EZWxldGVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSB7IGFuZDogWyBxdWVyeS53aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2ZpbmRPbmUuY2FsbChNb2RlbCwgcXVlcnksIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF9jb3VudCA9IE1vZGVsLmNvdW50O1xuICBNb2RlbC5jb3VudCA9IGZ1bmN0aW9uIGNvdW50RGVsZXRlZCh3aGVyZSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgLy8gQmVjYXVzZSBjb3VudCBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdXNlIGEgc3BlY2lhbCByZXNlcnZlZCBrZXl3b3JkIHRvIGFzayBmb3IgdGhlXG4gICAgLy8gZGVsZXRlZCBlbnRpdGllcy5cbiAgICBjb25zdCBkZWxldGVkID0gd2hlcmUuJGRlbGV0ZWQ7XG4gICAgZGVsZXRlIHdoZXJlLiRkZWxldGVkO1xuICAgIGxldCB3aGVyZU5vdERlbGV0ZWQgPSB3aGVyZTtcbiAgICBpZiAoIWRlbGV0ZWQpIHtcbiAgICAgIGlmICghd2hlcmUgfHwgT2JqZWN0LmtleXMod2hlcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB3aGVyZU5vdERlbGV0ZWQgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9jb3VudC5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF91cGRhdGUgPSBNb2RlbC51cGRhdGU7XG4gIE1vZGVsLnVwZGF0ZSA9IE1vZGVsLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uIHVwZGF0ZURlbGV0ZWQod2hlcmUgPSB7fSwgLi4ucmVzdCkge1xuICAgIC8vIEJlY2F1c2UgdXBkYXRlL3VwZGF0ZUFsbCBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdXNlIGEgc3BlY2lhbCByZXNlcnZlZCBrZXl3b3JkIHRvIGFza1xuICAgIC8vIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBjb25zdCBkZWxldGVkID0gd2hlcmUuJGRlbGV0ZWQ7XG4gICAgZGVsZXRlIHdoZXJlLiRkZWxldGVkO1xuICAgIGxldCB3aGVyZU5vdERlbGV0ZWQgPSB3aGVyZTtcbiAgICBpZiAoIWRlbGV0ZWQpIHtcbiAgICAgIGlmICghd2hlcmUgfHwgT2JqZWN0LmtleXMod2hlcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB3aGVyZU5vdERlbGV0ZWQgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF91cGRhdGUuY2FsbChNb2RlbCwgd2hlcmVOb3REZWxldGVkLCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfdXBzZXJ0V2l0aFdoZXJlID0gTW9kZWwudXBzZXJ0V2l0aFdoZXJlO1xuICBNb2RlbC51cHNlcnRXaXRoV2hlcmUgPSBmdW5jdGlvbiB1cHNlcnRXaXRoV2hlcmVEZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIHVwc2VydFdpdGhXaGVyZSBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdXNlIGEgc3BlY2lhbCByZXNlcnZlZCBrZXl3b3JkIHRvIGFza1xuICAgIC8vIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBjb25zdCBkZWxldGVkID0gd2hlcmUuJGRlbGV0ZWQ7XG4gICAgZGVsZXRlIHdoZXJlLiRkZWxldGVkO1xuICAgIGxldCB3aGVyZU5vdERlbGV0ZWQgPSB3aGVyZTtcbiAgICBpZiAoIWRlbGV0ZWQpIHtcbiAgICAgIGlmICghd2hlcmUgfHwgT2JqZWN0LmtleXMod2hlcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB3aGVyZU5vdERlbGV0ZWQgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF91cHNlcnRXaXRoV2hlcmUuY2FsbChNb2RlbCwgd2hlcmVOb3REZWxldGVkLCAuLi5yZXN0KTtcbiAgfTtcbn07XG4iXX0=
