var assert = require('assert');
var TorqueLayerStats = require('../../lib/stats/torque-layer-stats');
var TestClient = require('../support/test-client');

describe('torque-layer-stats', function () {

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
        var mapConfig = this.testClient.createMapConfig(testMapConfigOneLayer);
        var layerId = 0;
        var layer = mapConfig.getLayer(layerId);
        var testSubject = new TorqueLayerStats();
        testSubject.getStats(layer, {}, function (err, result) {
            assert.ifError(err);
            assert.deepEqual({}, result);
            done();
        });
    });
});
