module.exports = {
    entry: './logic/content.js',
    node: { fs: 'empty' },
    output: {
        filename: 'content.js',
        path: __dirname + '/../build'
    }
}