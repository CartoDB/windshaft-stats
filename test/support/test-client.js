var windshaft = require('windshaft');

module.exports = TestClient;

function TestClient(mapConfig) {
    this.mapConfig = windshaft.model.MapConfig.create(mapConfig);
};

TestClient.prototype.getMapConfig = function() {
    return this.mapConfig;
};

TestClient.prototype.getDbConnectionMock = function(tables) {
    return {
        query: function(sql, callback) {
            if (sql.match(/_postgis_stats\(\'(\w*?)\'::regclass/)) {
                let tableName = sql.match(/_postgis_stats\(\'(\w*?)\'::regclass/)[1];
                let tableFeatures = +tableName.split('_').pop() || 1;
                let featuresJSON = JSON.stringify({table_features: tableFeatures});
                return callback(null, {rows: [{result: {stats: featuresJSON}}]});
            } else {
                let rows = [];
                for (let i = 0; i < tables.length; i++) {
                    rows.push({tablenames: tables});
                }
                return callback(null, {rows: rows});
            }
        }
    };
}
