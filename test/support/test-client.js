const MapConfig = require('windshaft').model.MapConfig;

module.exports = TestClient;

function TestClient() {}

TestClient.prototype.getDbConnectionMock = function() {
    return {
        query: function(sql, callback) {
            return callback(null, {
                rows: [{rows: 1}]
            });
        }
    };
};

TestClient.prototype.createMapConfig = function(mapConfig) {
    return MapConfig.create(mapConfig);
};
