// eslint-disable-next-line no-undef
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    browsers: [
                        '> 1%',
                        'last 2 versions',
                        'ie >= 11',
                        'safari >= 7'
                    ]
                },
                modules: 'umd'
            }
        ]
    ],
    plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-transform-classes'
    ]
};
