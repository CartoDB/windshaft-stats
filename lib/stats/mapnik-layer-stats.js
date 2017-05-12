var queryUtils = require('../utils/query_utils');

function MapnikLayerStats () {
    this._types = {
        mapnik: true,
        cartodb: true
    };
}

MapnikLayerStats.prototype.is = function (type) {
    return this._types[type] ? this._types[type] : false;
};

MapnikLayerStats.prototype.getStats =
function (layer, layerId, params, dbConnection, callback) {
    var self = this;
    var stats = {};
    self._getFeatureStats(layer, dbConnection, function (err, features) {
        if (err) {
            return callback(err);
        }
        stats.estimatedFeatureCount = features;
        return callback(null, stats);
    });
};

MapnikLayerStats.prototype._getFeatureStats = function(layer, dbConnection, callback) {
    var queryRowCountSql = queryUtils.getQueryRowCount(layer.options.sql);
    // This query would gather stats for postgresql table if not exists
    dbConnection.query(queryRowCountSql, function (err, res) {
        if (err) {
            return callback(null, -1);
        } else {
            // We decided that the relation is 1 row == 1 feature
            return callback(null, res.rows[0].rows);
        }
    });
};

module.exports = MapnikLayerStats;
