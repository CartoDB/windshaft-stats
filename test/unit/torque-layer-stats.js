var assert = require('assert');
var TorqueLayerStats = require('../../lib/stats/torque-layer-stats');
var TestClient = require('../support/test-client');

describe('torque-layer-stats', () => {

    beforeEach(function () {
        this.testClient = new TestClient();
        this.params = {};
    });

    var testMapConfigOneLayer = {
        version: '1.5.0',
        layers: [
            {
                type: 'torque',
                options: {
                    sql: 'select * from test_table limit 2',
                    cartocss: '#layer { marker-fill:red; marker-width:32; marker-allow-overlap:true; }',
                    cartocss_version: '2.3.0',
                }
            },
        ]
    };

    it('should return torque stats for one layer', function(done) {
        let fixtureResult = {
            start: 1000,
            end: 1000,
            steps: 1,
            data_steps: 100,
            column_type: 'date'
        };
        let rendererMock = this.testClient.getTorqueRendererMock(fixtureResult);
        let rendererCacheMock = this.testClient.getRendererCacheMock(rendererMock);
        let mapConfigProviderMock = this.testClient.getMapConfigProviderMock(testMapConfigOneLayer, {});
        let layerId = 0;
        mapConfigProviderMock.getMapConfig((err, mapConfig) => {
            assert.ifError(err);
            let layer = mapConfig.getLayer(layerId);
            let testSubject = new TorqueLayerStats();
            testSubject.getStats(mapConfigProviderMock, layer, layerId, {}, rendererCacheMock, {}, (err, result) => {
                assert.ifError(err);
                assert.deepEqual(fixtureResult, result);
                done();
            });
        });
    });
});
