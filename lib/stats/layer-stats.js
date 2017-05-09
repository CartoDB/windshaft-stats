var d3 = require('d3-queue');

function LayerStats(layerStatsIterator) {
    this.layerStatsIterator = layerStatsIterator;
}

LayerStats.prototype.getStats = function (rendererCache, params, dbConnection, mapConfigProvider, callback) {
    var self = this;
    var stats = [];

    mapConfigProvider.getMapConfig((err, mapConfig, params) => {
        if (err) {
            return callback(err);
        }
        if (!mapConfig.getLayers().length) {
            return callback(null, stats);
        }
        var metaQueue = d3.queue(mapConfig.getLayers().length);
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
