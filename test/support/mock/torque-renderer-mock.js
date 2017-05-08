module.exports = TorqueRendererMock;

function TorqueRendererMock(metadata) {
    this.metadata = metadata;
}

TorqueRendererMock.prototype.getMetadata = function(callback) {
    return callback(null, this.metadata);
};

TorqueRendererMock.prototype.release = function() {
    return;
};
