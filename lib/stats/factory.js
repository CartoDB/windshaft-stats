const LayerStats = require('./layer-stats');
const EmptyLayerStats = require('./empty-layer-stats');
const MapnikLayerStats = require('./mapnik-layer-stats');
const TorqueLayerStats = require('./torque-layer-stats');

module.exports = function LayerStatsFactory(type) {
    let layerStatsIterator = [];
    let selectedType = type || 'ALL';

    if (selectedType === 'ALL') {
        layerStatsIterator.push(new EmptyLayerStats({ http: true, plain: true }));
        layerStatsIterator.push(new MapnikLayerStats());
        layerStatsIterator.push(new TorqueLayerStats());
    } else if (selectedType === 'mapnik') {
        layerStatsIterator.push(new EmptyLayerStats({ http: true, plain: true, torque: true }));
        layerStatsIterator.push(new MapnikLayerStats());
    } else if (selectedType === 'torque') {
        layerStatsIterator.push(new EmptyLayerStats({ http: true, plain: true, mapnik: true }));
        layerStatsIterator.push(new TorqueLayerStats());
    }

    return new LayerStats(layerStatsIterator);
};
