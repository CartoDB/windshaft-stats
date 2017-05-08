var assert = require('assert');
var MapnikLayerStats = require('../../lib/stats/mapnik-layer-stats');
var TestClient = require('../support/test-client');

describe('mapnik-layer-stats', function() {

    beforeEach(function () {
        this.rendererCacheMock = {};
    });

    var testMapConfigOneLayer = {
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
    }

    var testMapConfigTwoLayers = {
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

    var testMapConfigOneLayerTwoTables = {
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

    var testMapConfigTwoLayerTwoTables = {
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
    }

    it('should return 1 feature for one layer', function(done) {
        let testClient = new TestClient(testMapConfigOneLayer);
        let mapConfig = testClient.getMapConfig();
        let layerId = 0;
        let layer = mapConfig.getLayer(layerId);
        let tables = layer.options.affected_tables || ['test_table'];
        let dbConnectionMock = testClient.getDbConnectionMock(tables);
        let testSubject = new MapnikLayerStats();
        testSubject.getStats(mapConfig, layer, layerId, dbConnectionMock, this.rendererCacheMock, function (err, result) {
            assert.ifError(err);
            assert.equal(result.stats[0].features, 1);
            assert.equal(result.stats[0].name, 'test_table');
            done();
        });
    });

    it('should return 1 feature for two layers', function(done) {
        let testClient = new TestClient(testMapConfigTwoLayers);
        let mapConfig = testClient.getMapConfig();
        let layer0 = mapConfig.getLayer(0);
        let layer1 = mapConfig.getLayer(1);
        let tables = layer0.options.affected_tables || ['test_table'];
        let dbConnectionMock = testClient.getDbConnectionMock(tables);
        let testSubject = new MapnikLayerStats();
        testSubject.getStats(mapConfig, layer0, 0, dbConnectionMock, this.rendererCacheMock, (err, result) => {
            assert.ifError(err);
            assert.equal(result.stats[0].features, 1);
            assert.equal(result.stats[0].name, 'test_table');
            tables = layer1.options.affected_tables || ['test_table'];
            dbConnectionMock = testClient.getDbConnectionMock(tables);
            testSubject.getStats(mapConfig, layer1, 1, dbConnectionMock, this.rendererCacheMock, (err, result) => {
                assert.ifError(err);
                assert.equal(result.stats[0].features, 1);
                assert.equal(result.stats[0].name, 'test_table');
                done();
            });
        });
    });

    it('should return 1 feature for one layers with two tables', function(done) {
        let testClient = new TestClient(testMapConfigOneLayerTwoTables);
        let mapConfig = testClient.getMapConfig();
        let layer = mapConfig.getLayer(0);
        let tables = layer.options.affected_tables || ['test_table'];
        let dbConnectionMock = testClient.getDbConnectionMock(tables);
        let testSubject = new MapnikLayerStats();
        testSubject.getStats(mapConfig, layer, 0, dbConnectionMock, this.rendererCacheMock, function (err, result) {
            assert.ifError(err);
            assert.equal(result.stats[0].features, 1);
            assert.equal(result.stats[0].name, 'test_table_1');
            assert.equal(result.stats[1].features, 2);
            assert.equal(result.stats[1].name, 'test_table_2');
            done();
        });
    });

    it('should return 1 feature for two layers and two tables', function(done) {
        let testClient = new TestClient(testMapConfigTwoLayerTwoTables);
        let mapConfig = testClient.getMapConfig();
        let layer0 = mapConfig.getLayer(0);
        let layer1 = mapConfig.getLayer(1);
        let tables = layer0.options.affected_tables || ['test_table'];
        let dbConnectionMock = testClient.getDbConnectionMock(tables);
        let testSubject = new MapnikLayerStats();
        testSubject.getStats(mapConfig, layer0, 0, dbConnectionMock, this.rendererCacheMock, (err, result) => {
            assert.ifError(err);
            assert.equal(result.stats[0].features, 1);
            assert.equal(result.stats[0].name, 'test_table_1');
            assert.equal(result.stats[1].features, 2);
            assert.equal(result.stats[1].name, 'test_table_2');
            tables = layer1.options.affected_tables || ['test_table'];
            dbConnectionMock = testClient.getDbConnectionMock(tables);
            testSubject.getStats(mapConfig, layer1, 1, dbConnectionMock, this.rendererCacheMock, (err, result) => {
                assert.ifError(err);
                assert.equal(result.stats[0].features, 3);
                assert.equal(result.stats[0].name, 'test_table_3');
                assert.equal(result.stats[1].features, 4);
                assert.equal(result.stats[1].name, 'test_table_4');
                done();
            });
        });
    });

});
