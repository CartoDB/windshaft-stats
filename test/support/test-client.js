var windshaft = require('windshaft');
var MapConfigProviderMock = require('./mock/mapconfig-provider-mock');
var RendererCacheMock = require('./mock/renderer-cache-mock');
var TorqueRendererMock = require('./mock/torque-renderer-mock');

module.exports = TestClient;

function TestClient() {
};

TestClient.prototype.getDbConnectionMock = function(tables) {
    return {
        query: function(sql, callback) {
            if (sql.match(/_postgis_stats\(\'(\w*?)\'::regclass/)) {
                let tableName = sql.match(/_postgis_stats\(\'(\w*?)\'::regclass/)[1];
                return callback(null, {
                    rows: [{
                        features: +tableName.split('_').pop() || 1,
                        vertexes: +tableName.split('_').pop() * 10 || 10
                    }]
                });
            } else {
                let rows = [];
                for (let i = 0; i < tables.length; i++) {
                    rows.push({tablenames: tables});
                }
                return callback(null, {rows: rows});
            }
        }
    };
};

TestClient.prototype.getTorqueRendererMock = function(metadata) {
    return new TorqueRendererMock(metadata);
};

TestClient.prototype.getRendererCacheMock = function(rendererMock) {
    return new RendererCacheMock(rendererMock);
};

TestClient.prototype.getMapConfigProviderMock = function(mapConfig, params) {
    return new MapConfigProviderMock(mapConfig, params);
};
