function EmptyLayerStats(types) {
    this._types = types || {};
}

EmptyLayerStats.prototype.is = function (type) {
    return this._types[type] ? this._types[type] : false;
};

EmptyLayerStats.prototype.getStats = function (mapConfig, layer, layerId, params, rendererCache, callback) {
    process.nextTick(function() {
        callback(null, {
            stats: []
        });
    });
};

module.exports = EmptyLayerStats;
