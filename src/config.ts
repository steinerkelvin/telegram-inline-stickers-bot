import dotenv from "dotenv"
import convict from "convict"

dotenv.config()

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

export default config
