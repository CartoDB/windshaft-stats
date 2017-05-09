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

MapnikLayerStats.prototype.getStats = function (mapConfigProvider, layer, layerId, params, rendererCache, dbConnection, callback) {

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

        function getTableStats(err, pg, tablenames) {
            assert.ifError(err);
            var group = this.group();
            tablenames.forEach(function (table) {
                var next = group();
                var query = queryUtils.getTableStats(table, layer.options.geom_column);
                var tableStats = {
                    type: 'table',
                    name: table,
                };

                pg.query(query, function (err, res) {
                    if (err) {
                        tableStats.featureCount = -1;
                        tableStats.vertexCount = -1;
                    } else {
                        tableStats.featureCount = res.rows[0].features;
                        tableStats.vertexCount = res.rows[0].vertexes;
                    }
                    next(null, tableStats);
                });
            });
        },
        function finish(err, result) {
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
