module.exports = {
    configureWebpack: {},
    devServer: {
        host: 'localhost',
        hot: true,
        port: 9999,
        open: 'Chrome',
        proxy: { //https://cli.vuejs.org/guide/html-and-static-assets.html#disable-index-generation
            '/*': { //everything from root
                target: 'http://localhost:3000',
                secure: false,
                ws: false,
            },
            '/ws/': { //web sockets
                target: 'http://localhost:3000',
                secure: false,
                ws: true
            },
            '!/': { //except root, which is served by webpack's devserver, to facilitate instant updates
                target: 'http://localhost:3000/',
                secure: false,
                ws: false
            },
        }
    }
}
