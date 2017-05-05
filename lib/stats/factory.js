var LayerStats = require('./layer-stats');
var EmptyLayerStats = require('./empty-layer-stats');
var MapnikLayerStats = require('./mapnik-layer-stats');
var TorqueLayerStats = require('./torque-layer-stats');

module.exports = function LayerStatsFactory() {
    let layerStatsIterator = [];

    layerStatsIterator.push(new EmptyLayerStats({ http: true, plain: true }));
    layerStatsIterator.push(new MapnikLayerStats());
    layerStatsIterator.push(new TorqueLayerStats());

    return new LayerStats(layerStatsIterator);
};
