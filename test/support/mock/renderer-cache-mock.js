module.exports = RendererCacheMock;

function RendererCacheMock(rendererMock) {
    this.rendererMock = rendererMock;
}

RendererCacheMock.prototype.getRenderer = function(mapConfigProvider, callback) {
    return callback(null, this.rendererMock);
};
