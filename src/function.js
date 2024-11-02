const File_System = require('fs');
const { getContentType } = require('@whiskeysockets/baileys');
const { proto } = require('@whiskeysockets/baileys');
const deasync = require('deasync');


/**
 * Function to access stored values using a key
 * @param {string} key - The key to access the stored value
 * @returns {*} The value associated with the key
 */
function func(key) {
    return func[key];
}

/**
 * Check if value is set
 * @param {*} ada - Value to check
 * @returns {boolean} Whether value is set
 */
func["isset"] = (ada) => ada == Error || ada == undefined || ada == null || ada == "" || ada == '""' ? false : true



/**
 * Function to handle promises synchronously using deasync
 * @param {Promise} promis - The promise to await
 * @returns {*} The resolved value or error from the promise
 * @throws {Error} If the promise rejects
 */
func['awaiter'] = function(promis) {
    let isDone = false;
    let result;
    let isError = false;

    promis.then(function(value) {
        result = value;
        isDone = true;
    }).catch(e => {
        result = e;
        isDone = true;
        isError = true;
    });

    while (!isDone) {
        deasync.runLoopOnce();
    }

    return result;
}
func["color"] = {
  // Kode Warna Teks
  reset: "\x1b[0m",
  putih: "\x1b[37m",
  hitam: "\x1b[30m",
  merah: "\x1b[31m",
  hijau: "\x1b[32m",
  kuning: "\x1b[33m",
  biru: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  ungu: "\x1b[35m",
  oranye: "\x1b[33m",
  pink: "\x1b[95m",
  biru_muda: "\x1b[94m",


  // Kode Warna Latar Belakang
  bg_reset: "\x1b[49m",
  bg_putih: "\x1b[47m",
  bg_hitam: "\x1b[40m",
  bg_merah: "\x1b[41m",
  bg_hijau: "\x1b[42m",
  bg_kuning: "\x1b[43m",
  bg_biru: "\x1b[44m",
  bg_magenta: "\x1b[45m",
  bg_cyan: "\x1b[46m",
  bg_biru_muda: "\x1b[104m",

  // Reset Warna Teks
  reset_text: "\x1b[39m",
  
  // Reset Warna Latar Belakang
  reset_bg: "\x1b[49m",
};

/**
 * Function to apply color to text
 * @param {string} color - The color to apply
 * @param {string} text - The text to color
 * @returns {string} Colored text
 */
func["warna"] = (color,text) => `${func.color[color]}${text.split(`\n`).map(v => `${func.color[color]}${v}`).join(`\n`)}${func.color.reset_text}${func.color.reset_bg}`;

/**
 * File system operations
 */
func["fs"] = {
    load: File_System.readFileSync,
    save: File_System.writeFileSync,
    cek: File_System.existsSync,
    dir: File_System.readdirSync,
    del: File_System.unlinkSync,
    delete: File_System.unlinkSync,
    isDir: (path_string) => File_System.lstatSync(path_string).isDirectory(),
    isFile: (path_string) => File_System.lstatSync(path_string).isFile(),
    ...File_System,
}

/**
 * Process WhatsApp message
 * @param {Object} conn - Connection object
 * @param {Object} messagena - Message object
 * @param {Object} store - Message store
 * @returns {Object} Processed message object
 */
func["smsg"] = (conn, messagena, store) => {
    var m = messagena;
    if (!m) return m
    m.Barqah = {};
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.isBotBrainxiex = m.key.id.startsWith('BarqahXiexGanteng')
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = m.saha = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '')
        m.nomor = m.sender.split(`@`)[0]
        if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || ''
        m.delete = () => conn.sendMessage(m.chat,{delete: m.key});
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.type = `${m.mtype}`.replace(`Message`,``)
        m.isDeleted = (m.mtype === 'protocolMessage');
        m.isEdited = (m.mtype === 'editedMessage');
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        m.body = (m.mtype === 'conversation') ? m.message.conversation : 
                    (m.mtype === 'reactionMessage') ? m.message.reactionMessage.text : 
                    m.isDeleted ? `${JSON.stringify({deletedMessage: m.message.protocolMessage},null,2)}` : 
                    m.isEdited ? m.message.editedMessage.message.protocolMessage.editedMessage.conversation : 
                    (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : 
                    (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : 
                    (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                    (m.type == "interactiveResponse") ? (JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)||{id:m.message.interactiveResponseMessage.nativeFlowResponseMessage.name}).id : 
                    (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                    (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
                    (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : 
                    (m.mtype === 'messageContextInfo') ? 
                    (m.message.buttonsResponseMessage?.selectedButtonId || 
                    m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : 
                    m.message.conversation || m.msg ? (m.msg?.caption || m.msg?.text || (m.mtype == 'listResponseMessage') && m.msg?.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg?.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg?.caption) : 
                    m.text || m.text;
        let quoted = m.quoted = !m.msg ? null : m.msg?.contextInfo ? m.msg?.contextInfo.quotedMessage : null
        m.mentionedJid = m.msg ? m.msg?.contextInfo ? m.msg?.contextInfo.mentionedJid : [] : []
        if (m.quoted) {
            let type = getContentType(quoted)
            m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted)
                m.quoted = m.quoted[type]
            }
            if (typeof m.quoted === 'string' || !func.isset(m.quoted)) m.quoted = {
                text: m.quoted
            }
            m.quoted.mtype = `${type}`||`undefinedMessage`
            m.quoted.type = `${m.quoted.mtype}`.replace(`Message`,``)
            m.quoted.id = m.msg?.contextInfo.stanzaId
            m.quoted.chat = m.msg?.contextInfo.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
            m.quoted.sender = conn.decodeJid(m.msg?.contextInfo.participant)
            m.quoted.nomor = conn.decodeJid(m.msg?.contextInfo.participant).split("@")[0]
            m.quoted.fromMe = m.quoted.sender === (conn.user && conn.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
            m.quoted.mentionedJid = m.msg?.contextInfo ? m.msg?.contextInfo.mentionedJid : []
            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false
                let q = await store.loadMessage(m.chat, m.quoted.id, conn)
                return smsg(conn, q, store)
            }
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })

            m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key })
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options)
            m.quoted.download = () => conn.downloadMediaMessage(m.quoted)
        }
    }
    if (m.msg && m.msg?.url) m.download = () => conn.downloadMediaMessage(m.msg)
    m.text = m.msg?.text || m.msg?.caption || m.message.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || ''
    m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, 'file', '', m, { ...options }) : conn.sendMessage(chatId, {text}, {quoted:m, ...options })
    m.copy = () => smsg(conn, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options)

    return m
}

/**
 * Sleep function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after specified time
 */
func["sleep"] = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get random element from array
 * @param {Array} arr - Array to get random element from
 * @returns {*} Random element from array
 */
func["random"] = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Execute shell command
 * @param {string} cmd - Command to execute
 * @param {Function} hasil - Callback function
 * @returns {Promise} Promise with command output
 */
func["exec"] = async(cmd,hasil) => {
    const commandExecutor = require("util")["promisify"](require('child_process').exec);
    const {stdout,stderr} = await commandExecutor(cmd);
    console.log(`executed:`,cmd,`\nOutput: ${func.isset(stdout) ? `yes`:`no`}\nError: ${func.isset(stderr) ? `yes`:`no`}`)
    return await (func.isset(hasil) ? hasil(stderr,stdout,``) : {stdout,stderr})
}

/**
 * Check if string is valid JSON
 * @param {string} json - String to check
 * @returns {boolean} Whether string is valid JSON
 */
func["isJSONString"] = (json) => {
    try{
        JSON.parse(json);
    }catch(e){
        return false;
    }
    return true;
}

/**
 * Parse JSON string safely
 * @param {string} json - JSON string to parse
 * @returns {Object} Parsed JSON object or empty object if invalid
 */
func["jsonparse"] = (json) => func.isJSONString(json) ? JSON.parse(json) : {}

/**
 * Auto refresh module when file changes
 * @param {string} filename - Module filename
 * @returns {string} Resolved filename
 */
func["autorefresh"] = (filename) => {
    let file = require.resolve(filename)
    fs.watchFile(file, () => {
        fs.unwatchFile(file)
        console.info(`Update'${filename}'`)
        delete require.cache[file]
        require(file)
    })
    return file
}

/**
 * Create directory if it doesn't exist
 * @param {string} nama - Directory name
 * @returns {string} Directory name
 */
func["dir"] = function(nama) {
    if (!fs.existsSync(nama)) {
        fs.mkdirSync(nama);
    }
    return nama
}

/**
 * Get database directory path
 * @param {string} a - Database name
 * @returns {string} Database directory path
 */
func.dbdir = (a) => {
    return func.dir("./database/" + a + "/")
}

/**
 * Get database file path
 * @param {string} a - Database name
 * @param {string} b - Filename
 * @returns {string} Database file path
 */
func.dbfile = (a,b) => {
    return func.dbdir(a) + b
}

/**
 * Create directory if it doesn't exist
 * @param {string} nama - Directory name
 * @returns {string} Directory name
 */
func.dir = (nama) => {
    if (!func.fs.existsSync(nama)) {
        func.fs.mkdirSync(nama);
    }
    return nama
}

/**
 * Get file contents or default value
 * @param {string} a - Filepath
 * @param {string} b - Default value
 * @returns {string} File contents or default value
 */
func.FileAda = (a, b) => {
    if (func.fs.existsSync(a)) {
        return `${func.fs.load(a)}`
    } else {
        return b
    }
}

/**
 * Format strings using util.format
 * @type {Function}
 */
func.format = require("util").format;

/**
 * Alias for util.format
 * @type {Function}
 */
func.f = require("util").format;

module.exports = func;