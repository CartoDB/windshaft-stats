var assert = require('assert');
var step = require('step');
// TODO get rid of this if possible
var DummyMapConfigProvider = require('../models/providers/dummy_mapconfig_provider');

function TorqueLayerStats() {
    this._types = {
        torque: true
    };
}

TorqueLayerStats.prototype.is = function (type) {
    return this._types[type] ? this._types[type] : false;
};

TorqueLayerStats.prototype.getMetadata = function (mapConfig, layer, layerId, params, rendererCache, callback) {
    params = { ...params,
               token: mapConfig.id(),
               format: 'json.torque',
               layer: layerId
             };

    var renderer;

    step(
        function(){
            rendererCache.getRenderer(new DummyMapConfigProvider(mapConfig, params), this);
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
