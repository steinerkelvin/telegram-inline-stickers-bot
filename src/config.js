require('dotenv').config()
const convict = require('convict')

const config = convict({
    tgToken: {
        doc: 'Telegram Bot Token',
        env: 'TG_TOKEN',
        format: '*',
        default: '',
    }
})

module.exports = config
