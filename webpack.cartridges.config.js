const cartridgePath = {
    app_fspandora_richUI : ['./cartridges/app_fspandora_richUI/cartridge/js'],
    app_checkout         : [
        './cartridges/app_checkout/cartridge/js',
        './cartridges/app_fspandora_richUI/cartridge/js'
    ],
    app_gift_finder: [
        './cartridges/app_gift_finder/cartridge/js',
        './cartridges/app_fspandora_richUI/cartridge/js'
    ]
};

const app_checkout = config => {
    if (!config.optimization) {
        config.optimization = {};
    }
    config.optimization.splitChunks = {
        chunks : 'all',
        name   : 'checkout-shared'
    };
    return config;
};

const app_fspandora_richUI = config => {
    if (!config.optimization) {
        config.optimization = {};
    }
    config.optimization.splitChunks = {
        chunks : 'all',
        name   : 'refapp-shared'
    };
    return config;
};

const perCartridgeConfig = {
    app_fspandora_richUI : app_fspandora_richUI,
    app_checkout         : app_checkout
};

const withCartridgeConfig = (cartridge, config) => {
    if (perCartridgeConfig[cartridge]) {
        return perCartridgeConfig[cartridge](config);
    }
    return config;
};

// eslint-disable-next-line no-undef
module.exports = {
    cartridgePathConfig : cartridgePath,
    withCartridgeConfig : withCartridgeConfig
};
