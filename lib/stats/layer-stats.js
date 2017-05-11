const d3 = require('d3-queue');

function LayerStats(layerStatsIterator) {
    this.layerStatsIterator = layerStatsIterator;
}

LayerStats.prototype.getStats = function (mapConfig, params, dbConnection, callback) {
    let self = this;
    let stats = [];

    if (!mapConfig.getLayers().length) {
        return callback(null, stats);
    }
    let metaQueue = d3.queue(mapConfig.getLayers().length);
    mapConfig.getLayers().forEach((layer, layerId) => {
        let layerType = mapConfig.layerType(layerId);

        for (let i = 0; i < self.layerStatsIterator.length; i++) {
            if (self.layerStatsIterator[i].is(layerType)) {
                let getStats = self.layerStatsIterator[i].getStats.bind(self.layerStatsIterator[i]);
                metaQueue.defer(getStats, layer, layerId, params, dbConnection);
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
            stats[layerIndex] = results[layerIndex];
        });

        return callback(err, stats);
    });

};

module.exports = LayerStats;
