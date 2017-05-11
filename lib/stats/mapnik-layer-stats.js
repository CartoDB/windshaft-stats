const assert = require('assert');
const step = require('step');
const queryUtils = require('../utils/query_utils');

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

    step(
        function fetchLayerTablenames(err) {
            assert.ifError(err);

            let next = this;
            let query = queryUtils.extractTableNames(layer.options.sql);

            dbConnection.query(query, (err, result) => {
                if (err) {
                    return next(err);
                }

                next(null, dbConnection, result.rows[0].tablenames);
            });
        },

        function getTableStats(err, pg, tablenames) {
            assert.ifError(err);
            let group = this.group();
            tablenames.forEach((table) => {
                var next = group();
                var query = queryUtils.getTableStats(table, layer.options.geom_column);
                var tableStats = {
                };

                pg.query(query, (err, res) => {
                    if (err) {
                        // TODO check if the error is because we don't have stats
                        tableStats.featureCount = -1;
                    } else {
                        tableStats.featureCount = res.rows[0].features;
                    }
                    return next(null, tableStats);
                });
            });
        },
        function mergeStats(err, stats) {
            let next = this;
            let featureCount = 0;
            stats.forEach((stat) => {
                if (stat.featureCount === -1) {
                    return next(null, {featureCount: -1});
                }
                featureCount += stat.featureCount;
            });
            return next(null, {featureCount: featureCount});
        },
        function finish(err, result) {
            if (err) {
                return callback(err);
            }

            return callback(null, result);
        }
    );
};

module.exports = MapnikLayerStats;
