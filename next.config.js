require('dotenv').config()
const Dotenv = require('dotenv-webpack')
const path = require('path')

module.exports = {
    webpack: (config, { isServer }) => {
        config.plugins = config.plugins || []

        config.plugins = [
            ...config.plugins,

            // Read the .env file
            new Dotenv({
                path: path.join(__dirname, '.env'),
                systemvars: true
            })
        ]

        if (!isServer) {
            config.resolve.fallback.fs = false;
        }

        return config;
    },
}