module.exports = {
    entry: './logic/background.js',
    node: { fs: 'empty' },
    output: {
        filename: 'background.js',
        path: __dirname + '/../build'
    }
}