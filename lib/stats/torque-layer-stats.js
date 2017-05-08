var assert = require('assert');
var step = require('step');

function TorqueLayerStats() {
    this._types = {
        torque: true
    };
}

TorqueLayerStats.prototype.is = function (type) {
    return this._types[type] ? this._types[type] : false;
};

TorqueLayerStats.prototype.getStats = function (mapConfigProvider, layer, layerId, params, rendererCache, dbConnection, callback) {
    var renderer;

    step(
        function getMapconfig() {
            let next = this;
            mapConfigProvider.getMapConfig(next);
        },
        function(err, mapConfig){
            assert.ifError(err);
            let adaptedParams = Object.assign({}, params, {
                token: mapConfig.id(),
                format: 'json.torque',
                layer: layerId
            });
            mapConfigProvider.setParams(adaptedParams);
            rendererCache.getRenderer(mapConfigProvider, this);
        },
        function(err, _renderer) {
            assert.ifError(err);
            renderer = _renderer;
            renderer.getMetadata(this);
        },
        function(err, meta) {
            if ( renderer ) {
                renderer.release();
            }

            callback(err, meta);
        }
    );
};

module.exports = TorqueLayerStats;
