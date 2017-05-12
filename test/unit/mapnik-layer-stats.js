const assert = require('assert');
const MapnikLayerStats = require('../../lib/stats/mapnik-layer-stats');
const TestClient = require('../support/test-client');

describe('mapnik-layer-stats', function() {

    beforeEach(function () {
        this.testClient = new TestClient();
        this.rendererCacheMock = {};
        this.params = {};
    });

    const testMapConfigOneLayer = {
        version: '1.5.0',
        layers: [
            {
                type: 'mapnik',
                options: {
                    sql: 'select * from test_table limit 2',
                    cartocss: '#layer { marker-fill:red; marker-width:32; marker-allow-overlap:true; }',
                    cartocss_version: '2.3.0'
                }
            }
        ]
    };

    const testMapConfigTwoLayers = {
        version: '1.5.0',
        layers: [
            {
                type: 'mapnik',
                options: {
                    sql: 'select * from test_table limit 2',
                    cartocss: '#layer { marker-fill:red; marker-width:32; marker-allow-overlap:true; }',
                    cartocss_version: '2.3.0'
                }
            },
            {
                type: 'mapnik',
                options: {
                    sql: 'select * from test_table limit 2',
                    cartocss: '#layer { marker-fill:red; marker-width:32; marker-allow-overlap:true; }',
                    cartocss_version: '2.3.0'
                }
            },
        ]
    };

    const testMapConfigOneLayerTwoTables = {
        version: '1.5.0',
        layers: [
            {
                type: 'mapnik',
                options: {
                    sql: 'select * from test_table limit 2',
                    cartocss: '#layer { marker-fill:red; marker-width:32; marker-allow-overlap:true; }',
                    cartocss_version: '2.3.0',
                    affected_tables: ['test_table_1', 'test_table_2']
                }
            },
        ]
    };

    const testMapConfigTwoLayerTwoTables = {
        version: '1.5.0',
        layers: [
            {
                type: 'mapnik',
                options: {
                    sql: 'select * from test_table limit 2',
                    cartocss: '#layer { marker-fill:red; marker-width:32; marker-allow-overlap:true; }',
                    cartocss_version: '2.3.0',
                    affected_tables: ['test_table_1', 'test_table_2']
                }
            },
            {
                type: 'mapnik',
                options: {
                    sql: 'select * from test_table limit 2',
                    cartocss: '#layer { marker-fill:red; marker-width:32; marker-allow-overlap:true; }',
                    cartocss_version: '2.3.0',
                    affected_tables: ['test_table_3', 'test_table_4']
                }
            },
        ]
    };

    it('should return 1 feature for one layer', function(done) {
        let mapConfig = this.testClient.createMapConfig(testMapConfigOneLayer);
        let layerId = 0;
        let layer = mapConfig.getLayer(layerId);
        let dbConnectionMock = this.testClient.getDbConnectionMock();
        let testSubject = new MapnikLayerStats();
        testSubject.getStats(layer, layerId, this.params, dbConnectionMock, (err, result) => {
            assert.ifError(err);
            assert.equal(result.estimatedFeatureCount, 1);
            done();
        });
    });

    it('should return 1 feature for two layers', function(done) {
        let mapConfig = this.testClient.createMapConfig(testMapConfigTwoLayers);
        let layer0 = mapConfig.getLayer(0);
        let layer1 = mapConfig.getLayer(1);
        let dbConnectionMock = this.testClient.getDbConnectionMock();
        let testSubject = new MapnikLayerStats();
        testSubject.getStats(layer0, 0, this.params, dbConnectionMock, (err, result) => {
            assert.ifError(err);
            assert.equal(result.estimatedFeatureCount, 1);
            dbConnectionMock = this.testClient.getDbConnectionMock();
            testSubject.getStats(layer1, 1, this.params, dbConnectionMock, (err, result) => {
                assert.ifError(err);
                assert.equal(result.estimatedFeatureCount, 1);
                done();
            });
        });
    });

    it('should return 1 feature for one layers with two tables', function(done) {
        let mapConfig = this.testClient.createMapConfig(testMapConfigOneLayerTwoTables);
        let layer = mapConfig.getLayer(0);
        let dbConnectionMock = this.testClient.getDbConnectionMock();
        let testSubject = new MapnikLayerStats();
        testSubject.getStats(layer, 0, this.params, dbConnectionMock, (err, result) => {
            assert.ifError(err);
            assert.equal(result.estimatedFeatureCount, 1);
            done();
        });
    });

    it('should return 1 feature for two layers and two tables', function(done) {
        let mapConfig = this.testClient.createMapConfig(testMapConfigTwoLayerTwoTables);
        let layer0 = mapConfig.getLayer(0);
        let layer1 = mapConfig.getLayer(1);
        let dbConnectionMock = this.testClient.getDbConnectionMock();
        let testSubject = new MapnikLayerStats();
        testSubject.getStats(layer0, 0, this.params, dbConnectionMock, (err, result) => {
            assert.ifError(err);
            assert.equal(result.estimatedFeatureCount, 1);
            dbConnectionMock = this.testClient.getDbConnectionMock();
            testSubject.getStats(layer1, 1, this.params, dbConnectionMock, (err, result) => {
                assert.ifError(err);
                assert.equal(result.estimatedFeatureCount, 1);
                done();
            });
        });
    });
});
