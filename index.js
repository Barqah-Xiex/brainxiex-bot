/**
 * Initialize WhatsApp bot with configuration
 * @param {Object} config - Configuration object for the WhatsApp bot
 * @param {boolean} [config.useQR] - Whether to use QR code authentication
 * @param {string} [config.botNumber] - Bot's WhatsApp number
 * @param {boolean} [config.printQRInTerminal] - Whether to print QR code in terminal
 * @param {boolean} [config.mobile] - Whether to use mobile configuration
 * @param {Object} [config.auth] - Authentication configuration
 * @returns {Promise<Object>} WhatsApp connection instance
 */
const whatsapp = require(`./src/whatsapp/index.js`);

/**
 * Main function wrapper for WhatsApp functionality
 * @param {...*} a - Arguments to pass to WhatsApp module
 * @returns {*} Result from WhatsApp module
 */
function utama (...a) {
    return whatsapp(...a);
}

/**
 * Use specific platform module
 * @param {string} type - Platform type ('whatsapp', 'discord', 'telegram')
 * @returns {Function|undefined} Platform specific module
 */
utama.use = (type = "whatsapp") => {
  if(type.toLocaleLowerCase() == 'whatsapp') return whatsapp;

//   comming soon
//   if(type.toLocaleLowerCase() == 'discord') return discord;
//   if(type.toLocaleLowerCase() == 'telegram') return telegram;
};

module.exports = utama;