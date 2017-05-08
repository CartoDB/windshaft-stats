let MapConfig = require('windshaft').model.MapConfig;

function MapConfigProviderMock(mapConfig, params) {
    this.params = params || {};
    this.mapConfig = MapConfig.create(mapConfig);
    this.cacheBuster = 0;
}

module.exports = MapConfigProviderMock;

MapConfigProviderMock.prototype.setParams = function(params) {
    this.params = params;
};

MapConfigProviderMock.prototype.getMapConfig = function(callback) {
    return callback(null, this.mapConfig, this.params, {});
};

MapConfigProviderMock.prototype.getKey = function() {
    return 'wadus:wadus';
};

MapConfigProviderMock.prototype.getCacheBuster = function() {
    return this.cacheBuster;
};
