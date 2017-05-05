let queue = require('queue-async');
let PSQL = require('cartodb-psql');
let assert = require('assert');
let step = require('step');
let queryUtils = require('../utils/query_utils');

function MapnikLayerStats () {
    this._types = {
        mapnik: true,
        cartodb: true
    };
}

MapnikLayerStats.prototype.is = function (type) {
    return this._types[type] ? this._types[type] : false;
};

MapnikLayerStats.prototype.getStats = function (mapConfig, layer, layerId, dbConnection, rendererCache, callback) {

    step(
        function fetchLayerTablenames(err) {
            assert.ifError(err);

            let next = this;

            if (layer.options.affected_tables && Array.isArray(layer.options.affected_tables) &&
                !!layer.options.affected_tables.join('')) {
                next(null, dbConnection, layer.options.affected_tables);
                return;
            }

            let query = queryUtils.extractTableNames(layer.options.sql);

            dbConnection.query(query, (err, result) => {
                if (err) {
                    return next(err);
                }

                next(null, dbConnection, result.rows[0].tablenames);
            });
        },

        function getTableStats(err, dbConnection, tablenames) {
            assert.ifError(err);

            let tableQueue = queue(tablenames.length);

            tablenames.forEach((table) => {
                tableQueue.defer(function (dbConnection, table, done) {
                    let tableStats = {
                        type: 'table',
                        name: table,
                    };
                    let query = queryUtils.getTableStats(table, layer.options.geom_column);

                    dbConnection.query(query, function (err, resultTable) {
                        if (err) {
                            tableStats.features = -1;
                        } else {
                            try {
                                tableStats.features = JSON.parse(resultTable.rows[0].result.stats).table_features;
                            } catch (e) {
                                tableStats.features = -1;
                            }
                        }
                        done(null, tableStats);
                    });
                }, dbConnection, table);
            });

            tableQueue.awaitAll(this);
        },
        function finnish(err, result) {
            if (err) {
                return callback(err);
            }

            callback(null, {
                cartocss: layer.options.cartocss,
                stats: result
            });
        }
    );
};

module.exports = MapnikLayerStats;
