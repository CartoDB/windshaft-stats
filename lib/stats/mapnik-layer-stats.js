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
        function fetchLayerStats(err) {
            assert.ifError(err);
            let next = this;
            let stats = {};
            this._getFeatureStats(layer, dbConnection, (features) => {
                stats.estimatedFeatureCount = features;
                return next(null, stats);
            });
        },
        function finish(err, result) {
            if (err) {
                return callback(err);
            }

            return callback(null, result);
        }
    );
};

MapnikLayerStats.prototype._getFeatureStats = function(layer, dbConnection, callback) {
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
            // TODO
            //  - Get CDB_EstimateRowCount value for the query
            //  - Get average number of features per row in the affected tables
            //  - Multiply the average number of features by the estimated row count
            //  - In case the table is analysis_* then we have to return the aggregate
            //    of features for the affected tables if we don't have postgis_stats
            //    because that means we analysis hasn't finished yet
            //  - We've to take into account that in a multiple-tables scenario one of them
            //    could not have features
            assert.ifError(err);
            let group = this.group();
            tablenames.forEach((table) => {
                var next = group();
                var queryTableStats = queryUtils.getTableStats(table, layer.options.geom_column);
                var tableStats = {
                };

                pg.query(queryTableStats, (err, res) => {
                    if (err) {
                        // TODO check if the error is because we don't have stats
                        //      and execute analyze for the query tables
                        tableStats.featureRowRatio = -1;
                    } else {
                        tableStats.featureRowRatio = res.rows[0].ratio;
                    }
                    return next(null, pg, tableStats);
                });
            });
        },
        function mergeTableStats(err, pg, tableStats) {
            assert.ifError(err);
            let next = this;
            let ratio = tableStats.reduce((acc, stat) => {
                if (stat.ratio === -1) {
                    return acc;
                }
                return acc + stat.ratio;
            }, 0);
            if (ratio <= 0) {
                return next(null, pg, -1);
            } else {
                return next(null, pg, ratio/tableStats);
            }
        },
        function getQueryRowCount(err, pg, featureRowRatio) {
            assert.ifError(err);
            let next = this;
            if (featureRowRatio === -1) {
                return next(null, -1);
            }
            let queryRowCount = queryUtils.getQueryRowCount(layer.options.sql);
            pg.query(queryRowCount, (err, res) => {
                if (err) {
                    return callback(null, -1);
                } else {
                    let features = res.rows[0].rows * featureRowRatio;
                    return callback(null, features);
                }
            });
        }
    );
};

module.exports = MapnikLayerStats;
