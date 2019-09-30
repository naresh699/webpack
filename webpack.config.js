/* eslint no-undef: 0 */
const path = require('path');
const entries = require('webpack-entries');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssFocusWithin = require('postcss-focus-within');
const uglify = require('uglify-es');

const {
    cartridgePathConfig,
    withCartridgeConfig
} = require('./webpack.cartridges.config');
const babelConfig = require('./babel.config.js');

const createConfig = (env, argv) => {
    const srcJSDir = path.resolve(__dirname, `./cartridges/${env.cartridge}/cartridge/js`);
    const srcCSSDir = path.resolve(__dirname, `./cartridges/${env.cartridge}/cartridge/scss`);
    const destDir = path.resolve(__dirname, `./cartridges/${env.cartridge}/cartridge/static/default`);
    const jsBundlesGlob = `./cartridges/${env.cartridge}/cartridge/js/**/*.bundle.js`;
    const cssBundlesGlob = `./cartridges/${env.cartridge}/cartridge/scss/**/!(_)*.scss`;
    const svgBundlesGlob = `./cartridges/${env.cartridge}/cartridge/icons/**/*.svg`;

    const entriesList = Object.assign(
        {},
        entries(jsBundlesGlob, true),
        entries(cssBundlesGlob, true)
    );

    // Add module resolver with cartridge path
    babelConfig.plugins.unshift([
        'module-resolver',
        {
            root: cartridgePathConfig[env.cartridge]
        }
    ]);

    const config = {
        mode    : argv.mode,
        devtool : argv.mode === 'production' ? false : 'inline-source-map',
        entry   : entriesList,
        output  : {
            path          : destDir,
            filename      : './js/[name].js',
            jsonpFunction : 'webpackJsonp' + Date.now()
        },
        module: {
            rules: [
                {
                    test : /\.scss$/,
                    use  : [
                        MiniCssExtractPlugin.loader,
                        {
                            loader  : 'css-loader',
                            options : {
                                sourceMap     : true,
                                url           : false,
                                importLoaders : 1
                            }
                        }, {
                            loader  : 'postcss-loader',
                            options : {
                                sourceMap : true,
                                plugins   : [
                                    autoprefixer({
                                        grid: true
                                    }),
                                    postcssFocusWithin()
                                ]
                            }
                        },
                        {
                            loader  : 'sass-loader',
                            options : {
                                sourceMap: true
                            }
                        }
                    ]
                },
                {
                    test    : /\.(js|jsx)$/,
                    include : [path.resolve(__dirname, './cartridges')],
                    exclude : [/node_modules/],
                    use     : {
                        loader  : 'babel-loader',
                        options : babelConfig
                    }
                }
            ]
        },
        resolve: {
            extensions : ['.js', '.jsx'],
            modules    : [path.resolve(__dirname, './node_modules')]
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: '**/*.min.js', to: './js/', context: srcJSDir },
                {
                    from      : '**/*.lib.js',
                    to        : './js/',
                    context   : srcJSDir,
                    transform : function (fileContent, filePath) {
                        try {
                            return uglify.minify(
                                fileContent.toString()
                            ).code.toString();
                        } catch (e) {
                            console.error('Cannot minify file: ', filePath, e);
                            return fileContent.toString();
                        }
                    }
                },
                { from: '**/*.css', to: './css/', context: srcCSSDir }
            ]),
            new FixStyleOnlyEntriesPlugin(),
            new MiniCssExtractPlugin({
                filename: './css/[name].css'
            }),
            new SVGSpritemapPlugin(svgBundlesGlob)
        ]
    };

    if (process.env.BUNDLE_ANALYZER) {
        config.plugins.push(new BundleAnalyzerPlugin());
    }
    if (argv.mode === 'production') {
        config.plugins.push(new OptimizeCSSAssetsPlugin());
    }

    return withCartridgeConfig(env.cartridge, config);
};

module.exports = createConfig;
