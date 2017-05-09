var queue = require('queue-async');

function LayerStats(layerStatsIterator) {
    this.layerStatsIterator = layerStatsIterator;
}

LayerStats.prototype.getStats = function (rendererCache, params, dbConnection, mapConfigProvider, callback) {
    var self = this;
    var stats = [];

    mapConfigProvider.getMapConfig((err, mapConfig, params, context) => {
        if (err) {
            return callback(err);
        }
        var metaQueue = queue(mapConfig.getLayers().length);
        mapConfig.getLayers().forEach((layer, layerId) => {
            var layerType = mapConfig.layerType(layerId);

            for (var i = 0; i < self.layerStatsIterator.length; i++) {
                if (self.layerStatsIterator[i].is(layerType)) {
                    var getStats = self.layerStatsIterator[i].getStats.bind(self.layerStatsIterator[i]);
                    metaQueue.defer(getStats, mapConfigProvider, layer, layerId, params, rendererCache, dbConnection);
                    break;
                }
            }
        });

        metaQueue.awaitAll((err, results) => {
            if (err) {
                return callback(err);
            }

            if (!results) {
                return callback(null, null);
            }

            mapConfig.getLayers().forEach((layer, layerIndex) => {
                var layerType = mapConfig.layerType(layerIndex);

                stats[layerIndex] = {
                    type: layerType,
                    id: mapConfig.getLayerId(layerIndex),
                    meta: results[layerIndex]
                };

                if (layer.options.cartocss) {
                    stats[layerIndex].meta.cartocss = layer.options.cartocss;
                }
            });

            return callback(err, stats);
        });
    });

};

module.exports = LayerStats;
