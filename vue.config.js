const configureAPI = require('./server/configure')

module.exports = {
    devServer: {
        port: 3000,
        before: configureAPI
    }
}
