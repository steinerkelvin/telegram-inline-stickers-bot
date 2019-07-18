require('dotenv').config()
const convict = require('convict')

const config = convict({
    tgToken: {
        doc: 'Telegram Bot Token',
        env: 'TG_TOKEN',
        format: '*',
        default: '',
    },
    mongoHost: {
        env: 'MONGO_HOST',
        format: '*',
        default: '',
    },
    mongoUser: {
        env: 'MONGO_USER',
        format: '*',
        default: '',
    },
    mongoPass: {
        env: 'MONGO_PASS',
        format: '*',
        default: '',
    },
})

module.exports = config
