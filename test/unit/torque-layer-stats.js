const assert = require('assert');
const TorqueLayerStats = require('../../lib/stats/torque-layer-stats');
const TestClient = require('../support/test-client');

describe('torque-layer-stats', () => {

    beforeEach(function () {
        this.testClient = new TestClient();
        this.params = {};
    });

    const testMapConfigOneLayer = {
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
        let mapConfig = this.testClient.createMapConfig(testMapConfigOneLayer);
        let layerId = 0;
        let layer = mapConfig.getLayer(layerId);
        let testSubject = new TorqueLayerStats();
        testSubject.getStats(layer, layerId, {}, {}, (err, result) => {
            assert.ifError(err);
            assert.deepEqual({}, result);
            done();
        });
    });
});
