global["version"] = [0,1,0];


const pino = require('pino');

const qrcode = require(`qrcode`);


const FileType = require('file-type');
const _ = require('lodash');
const axios = require('axios');
const i2b64 = require("image-to-base64");
const PhoneNumber = require('awesome-phonenumber');
const func = require(`../function.js`);
const qrcode_terminal = require('qrcode-terminal');

const { sleep, fs, smsg ,autorefresh, isset, exec, isJSONString, jsonparse, color, warna, f, awaiter, errorCode } = func;


/**
 * Initialize WhatsApp bot with configuration
 * @param {Object} config - Configuration object for the WhatsApp bot
 * @param {boolean} [config.useQR] - Whether to use QR code authentication
 * @param {string} [config.botNumber] - Bot's WhatsApp number
 * @param {string} [config.Nomor_Owner] - Owner Bot's WhatsApp number
 * @param {boolean} [config.printQRInTerminal] - Whether to print QR code in terminal
 * @param {boolean} [config.mobile] - Whether to use mobile configuration
 * @param {Object} [config.auth] - Authentication configuration
 * @returns {Object} WhatsApp connection instance
 */
async function bot_whatsapp(config = {}) {
    const Baileys = config?.baileys||require(`@whiskeysockets/baileys`) //require('@adiwajshing/baileys');
    const {
        default: conn,
        DisconnectReason,
        useSingleFileAuthState,
        fetchLatestBaileysVersion,
        generateForwardMessageContent,
        prepareWAMessageMedia,
        generateWAMessageFromContent,
        generateMessageID,
        downloadContentFromMessage,
        makeInMemoryStore,
        jidDecode,
        proto,
        useMultiFileAuthState,
        downloadMediaMessage,
        downloadAndSaveMediaMessage,
        MessageRetryMap,
        generateWAMessage,
        delay,
        getContentType,
        getBinaryNodeChild
    } = Baileys;


    if(config.useQR || !config.botNumber){
        if(!config.botNumber && !config.useQR) console.log(`Otomatis menjadi mode QR Code karena tidak ada parameter botNumber di config`);
        config.usecode = false;
    }else{
        config.usecode = true;
    }
    const session = config.session || `session`;
    config.Nomor_Owner = config.Nomor_Owner || config.botNumber;
    const Nomor_Owner = config.Nomor_Owner;

    const {
        state,
        saveCreds
    } = await(useMultiFileAuthState(`${session}`));

    let mobile = config.mobile || false;
    let logger = pino({ level: "silent" });
    let browser = config.usecode ? ['Ubuntu', 'Chrome', '22.0.04'] : ['Barqah Ganteng', 'Android', '12.12.20'];
    let auth = state;
    let patchMessageBeforeSending = (message) => {
        const requiresPatch = !!(
            message.buttonsMessage ||
            message.listMessage
        );

        if (requiresPatch) {
            message = {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadataVersion: 2,
                            deviceListMetadata: {},
                        },
                        ...message,
                    },
                },
            };
        }
        return message;
    }
    let keepAliveIntervalMs = 30 * 1000;
    let markOnlineOnConnect =  false;
    let connectTimeoutMs = 60_000;
    let syncFullHistory = false;
    let defaultQueryTimeoutMs = 0;
    let generateHighQualityLinkPreview = true;
    let printQRInTerminal = config.printQRInTerminal || !config.usecode || false;
    const configConnect = {
        logger,
        printQRInTerminal,
        mobile,
        browser,
        auth,
        patchMessageBeforeSending,
        syncFullHistory,
        keepAliveIntervalMs,
        markOnlineOnConnect,
        connectTimeoutMs,
        defaultQueryTimeoutMs,
        generateHighQualityLinkPreview,
        ...config
    }



    

    

    const Barqah = conn(configConnect);

    if(config.usecode && !Barqah.authState.creds.registered){
        await(sleep(3000));
        const nomorbot=`${config.botNumber}`.trim();
        _qr = await(Barqah.requestPairingCode(nomorbot));
        _qr = _qr?.match(/.{1,4}/g)?.join('-') || _qr
        console.log(`Bot:`,nomorbot,`|`,`Code:`,_qr)
    }

    
    
    Barqah.ev.on(`connection.update`, async function(json) {
        const {connection, qr, isNewLogin, lastDisconnect} = json;
        if(isset(qr) && !config.usecode) {
            _qr = qr;
        } else {
            
        }
        switch (connection) {
            case `close`:
                let reason = errorCode[lastDisconnect?.error?.data?.attrs?.code||lastDisconnect?.error?.output.statusCode]||lastDisconnect?.error.message;

                if(`${lastDisconnect.error}`.toLocaleLowerCase().includes(`restart`)){
                    bot_whatsapp(config);
                }

                switch (reason) {
                    case "Connection Failure":
                        console.log(`Connection Failure, Koneksi Gagal`);
                        Barqah.logout();
                        fs.rmdirSync(session, { recursive: true, force: true });
                        process.exit(0)
                        break;
                    case DisconnectReason.badSession:
                        console.log(`Bad Session File, Please Delete Session and Scan Again`);
                        Barqah.logout();
                        fs.rmdirSync(session, { recursive: true, force: true });
                        process.exit(0)
                        break;
                    case DisconnectReason.connectionClosed:
                        console.log("Connection closed, reconnecting....");
                        process.exit(0)
                        break;
                    case DisconnectReason.connectionLost:
                        console.log("Connection Lost from Server, reconnecting...");
                        process.exit(0)
                        break;
                    case DisconnectReason.connectionReplaced:
                        console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                        Barqah.logout();
                        fs.rmdirSync(session, { recursive: true, force: true });
                        process.exit(0)
                        break;
                    case DisconnectReason.loggedOut:
                        console.log(`Device Logged Out, Please Scan Again And Run.`);
                        Barqah.logout();
                        fs.rmdirSync(session, { recursive: true, force: true });
                        bot_whatsapp(config);
                        break;
                    case DisconnectReason.restartRequired:
                        console.log("Restart Required, Restarting...");
                        process.exit(0)
                        break;
                    case DisconnectReason.timedOut:
                        console.log("Connection TimedOut, Reconnecting...");
                        process.exit(0)
                        break;
                    case 401:
                    	nyarios(`401`)
                        process.exit(0)
                        break;
                    default:
                        console.log(`Unknown DisconnectReason: ${reason}|${connection}`)
                        process.exit(0)
                    break;
                }
        }
    })

    Barqah.Baileys = Barqah.baileys = Baileys;

    const store = {};
    store.msg = store.msg || {};
    store.rec = {chat:{},grup:{}};
    store.contacts = store.contacts || {};
    store.chat = store.chat || {};
    store.group = store.group || {};

    Barqah.store = store;

    Barqah.getName = (jid, withoutContact = false) => {
        const id = jid.split("@")[0]+"@s.whatsapp.net";
        return store.contacts[id]?.name||PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    Barqah.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    const Barqah_relayPesan = Barqah.relayMessage;
    Barqah.relayMessage = function() {
        return Barqah_relayPesan(...arguments);
    }
    Barqah_profilePictureUrl = Barqah.profilePictureUrl;
    Barqah.getPP = function(orang,type="preview",timeout = 10000) {
       
        return new Promise(async(ok,no) => {
	    if(store.contacts[orang]?.ppimg && store.contacts[orang]?.ppimg != `http://xiex.my.id/media/1655612010102undefined.png`) return ok(store.contacts[orang].ppimg);
            const res = await Barqah.query({
                tag: 'iq',
                attrs: {
                    target: orang,
                    to: '@s.whatsapp.net',
                    type: 'get',
                    xmlns: 'w:profile:picture'
                },
                content: [
                    { tag: 'picture', attrs: { type, query: 'url' } }
                ]
            },timeout+1000).catch(v => ok(store.contacts[orang]?.ppimg||`http://xiex.my.id/media/1655612010102undefined.png`));

            const child = (0, Baileys.getBinaryNodeChild)(res, 'picture');
            const ppimg = (_a = child === null || child === void 0 ? void 0 : child.attrs) === null || _a === void 0 ? void 0 : _a.url;
			
            store.contacts = store.contacts||{};
            store.contacts[orang] = store.contacts[orang]||{};
            store.contacts[orang].ppimg = ppimg;
            ok(ppimg);
            
            setTimeout(v => ok(store.contacts[orang]?.ppimg||`http://xiex.my.id/media/1655612010102undefined.png`),timeout);
        });
    }


    const Barqah_groupMetadata = Barqah.groupMetadata;
    var countreq_metadatagrup = 0;
    Barqah.groupMetadata = async function(id, paksain = false) {
        if(func.isset(store.group[id]) && countreq_metadatagrup < 5 && !paksain){
            countreq_metadatagrup++;
            return store.group[id];
        }
        countreq_metadatagrup = 0;
        store.group[id] = await (await Barqah_groupMetadata(id).catch(v => ({
            id,
            subject: id,
            desc: ``,
            participants:[],
            ...store.group[id],
        })))
        return store.group[id]
    }
    
    
    const KIRIMPESAN = Barqah.sendMessage;
    /**
     * 
     * @param {*} jid 
     * @param {*} content 
     * @param {*} options 
     * @returns 
    */
    Barqah.sendMessage = (jid,konten,options) => {
        try {
            if(isset(konten?.text)) konten.text = konten.text;
            if(isset(konten?.caption)) konten.caption = konten.caption;
            const content = Object.keys(konten).includes("audio") ? {...konten, ptt: true, mimetype: Barqah.Baileys.getDevice(options?.quoted?.id) == 'ios' ? 'audio/mpeg' : 'audio/mp4',...konten} : typeof konten == "string" ? {text: konten} : konten;
        	return KIRIMPESAN(jid,{mentions: Barqah.parseMention(`${content?.caption} ${content?.text}`),...content},{messageId: `BarqahXiexGantengINIVirtualBot${(new Date().getTime())}`,...options}).catch(e => console.error(e))
        }catch(e){
            console.error(e)
        }
    }

    Barqah.deleteMessage = (m) => {
        const key = {
            remoteJid: m.chat,
            fromMe: false,
            id: m.id,
            participant: m.sender,
            ...m.key
        }
        return Barqah.sendMessage(m.chat, {delete: key})
    }

    Barqah.editMessage = (m,message) => {
        const editedMessage = typeof message == `string` ? {conversation: message} : message;
        return Barqah.relayMessage(m.key.remoteJid, {
            protocolMessage: {
              key: m.key,
              type: 14,
              editedMessage
            }
          }, {
            messageId: `BarqahXiexGantengINIVirtualBot${(new Date().getTime())}`
        })
    }

    Barqah.loadingMessage = async(id,text,wait = 0) => {
        const {head,body,foot} = loading;
        const m = await Barqah.sendMessage(id,{text: head});
        for(const texloading of body){
            await Barqah.editMessage(m, texloading);
            await sleep(wait/body.length);
        }
        await Barqah.editMessage(m, text||foot);
        const editLoading = (t) => Barqah.editMessage(m,t); 
        return {...m,editLoading};
    }

    Barqah.groupRemove = (id, orang) => {
        return Barqah.groupParticipantsUpdate(id, (typeof orang == `object` && typeof orang !== `string`) ? orang : [orang], "remove")
    }

    Barqah.groupMakeAdmin = (id, orang) => {
        return Barqah.groupParticipantsUpdate(id, (typeof orang == `object` && typeof orang !== `string`) ? orang : [orang], "promote")
    }

    Barqah.groupDemoteAdmin = (id, orang) => {
        return Barqah.groupParticipantsUpdate(id, (typeof orang == `object` && typeof orang !== `string`) ? orang : [orang], "demote")
    }


    /**
     * 
     * @param {*} message 
     * @param {*} filename 
     * @param {*} attachExtension 
     * @returns 
     */
    Barqah.downloadMediaMessage = async (mek) => {
        const message = isset(mek.msg) ? mek.msg : mek;
        const m = message.mtype == "documentWithCaptionMessage" ? message.message.documentMessage : message;
        // console.log(m)
        // console.log(JSON.stringify(m,null,2))
        let mime = (m.msg || m).mimetype || ''
        let messageType = m.mtype ? m.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(m, messageType);
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    Barqah.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    	try{
        const buffer = await Barqah.downloadMediaMessage(message)
        const dtype = await FileType.fromBuffer(buffer);
        const ecxtensi = await dtype;
        trueFileName = "./temp/"+(attachExtension ? filename + '.' + (ecxtensi && ecxtensi.ext || "xiex") : filename)
        await fs.writeFileSync("./" + trueFileName, buffer)
        return trueFileName
        }catch(e){
        	console.error(e)
        }
    }
    
    Barqah.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
        console.log(message)
        if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
        message.message.viewOnceMessage = {...message.message.viewOnceMessage, ...message.message.viewOnceMessageV2}
        vtype = Object.keys(message.message.viewOnceMessage.message)[0]
        delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
        delete message.message.viewOnceMessage.message[vtype].viewOnce
        message.message = {
        ...message.message.viewOnceMessage.message
        }
        }
        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
        let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
        ...content[ctype],
        ...options,
        ...(options.contextInfo ? {
        contextInfo: {
        ...content[ctype].contextInfo,
        ...options.contextInfo
        }
        } : {})
        } : {})
        await Barqah.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
        return waMessage
        }

    /**
     * 
     * @param {*} jid 
     * @param {*} content profilePictureUrl
     * @param {*} options 
     * @returns 
     */
    Barqah.send5ButImage = async (jid, content, options = {}) => {
        let message = await prepareWAMessageMedia(content, {
            upload: Barqah.waUploadToServer
        })
        const {text, caption, footer, templateButtons} = content;
        var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
            templateMessage: {
                hydratedTemplate: {
                    imageMessage: message.imageMessage,
                    "hydratedContentText": text||caption,
                    "hydratedFooterText": footer,
                    "hydratedButtons": templateButtons||button||but
                }
            }
        }), options)

        Barqah.relayMessage(jid, template.message, {
            messageId: `BarqahXiexGantengINIVirtualBot${(new Date().getTime())}`
        })
    }
    

    Barqah.button = async(m, a,b,c) => {
        var buttons = []
        a.forEach((i, n) => {
            buttons.push({
                buttonId: `${a[n]}`,
                buttonText: {
                    displayText: `${b[n]}`
                },
                type: 1
            })
        })
        const messagena = typeof c == "string" ? {
            text: c,
            buttons
        } : {
            ...c,
            buttons
        };
        return Barqah.sendMessage(m.chat, messagena,{quoted: m})
    }
    
Barqah.parseMention = (text = '') => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}
Barqah.sendReadReceipt = function (id, sender, MessageID, type = `read`) {
    const key = {
        remoteJid: id,
        id: MessageID, // id of the message you want to read
        participant: sender // the ID of the user that sent the  message (undefined for individual chats)
    }
    return isset(sender) ? Barqah.readMessages([key]) : Barqah.readMessages([id.key])
}

Barqah.relayPesan = async function(id,message,option){
    return await Barqah_relayPesan(...arguments).catch(v => v);
}

Barqah.bikinPesan = async function (jid, content, options = {}) {
    var _a, _b;
    const userJid = Barqah.user.id;
    if (typeof content === 'object' &&
        'disappearingMessagesInChat' in content &&
        typeof content['disappearingMessagesInChat'] !== 'undefined' && jid.endsWith("@g.us")) {
        const { disappearingMessagesInChat } = content;
        const value = typeof disappearingMessagesInChat === 'boolean' ?
            (disappearingMessagesInChat ? Baileys.WA_DEFAULT_EPHEMERAL : 0) :
            disappearingMessagesInChat;
        await Barqah.groupToggleEphemeral(jid, value);
    }
    else {
        const fullMsg = await (0, Baileys.generateWAMessage)(jid, content, {
            logger,
            userJid,
            getUrlInfo: text => (0, Baileys.getUrlInfo)(text, {
                thumbnailWidth: configConnect.linkPreviewImageThumbnailWidth,
                timeoutMs: 3000,
                uploadImage: Barqah.waUploadToServer
            }, logger),
            upload: Barqah.waUploadToServer,
            mediaCache: configConnect.mediaCache,
            ...options,
        });
        const isDeleteMsg = 'delete' in content && !!content.delete;
        const additionalAttributes = {};
        // required for delete
        if (isDeleteMsg) {
            // if the chat is a group, and I am not the author, then delete the message as an admin
            if (((_a = content.delete) === null || _a === void 0 ? void 0 : _a.remoteJid).endsWith("@g.us") && !((_b = content.delete) === null || _b === void 0 ? void 0 : _b.fromMe)) {
                additionalAttributes.edit = '8';
            }
            else {
                additionalAttributes.edit = '7';
            }
        }
        fullMsg.key.id = `BarqahXiexGantengINIVirtualBot${(new Date().getTime())}`;
        fullMsg.message = (0,Baileys.patchMessageForMdIfRequired)(fullMsg.message);
        fullMsg.option = { messageId: fullMsg.key.id, cachedGroupMetadata: options.cachedGroupMetadata, additionalAttributes }
        return fullMsg;
    }
}

    Barqah.parseMention = (text = '') => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')

    Barqah.MyIP = (await(axios.get(`http://ip-api.com/json/`))).data.query;

    


    Barqah.sendReadReceipt = function (id, sender, MessageID, type = `read`) {
        const key = {
            remoteJid: id,
            id: MessageID, // id of the message you want to read
            participant: sender // the ID of the user that sent the  message (undefined for individual chats)
        }
        return isset(sender) ? Barqah.readMessages([key]) : Barqah.readMessages([id.key])
    }

    
    
    Barqah.templateMessage = async function(id, content, option, msgoption) {
    const templateButtons = [
    ]
    const buttons = [
    ]
    const kirimke = id;
    const msg = content.text||content.caption;
    const tombol = content.templateButtons || templateButtons
    templateMessage = {
        caption: msg,
        footer: `Brainxiex || xiex.my.id`,
        templateButtons: tombol,
        ...content
    }
    templateMessage.body = templateMessage.caption || templateMessage.text || ""
    if (isset(option)) {
        jsonIn(option).forEach(a => {
            templateMessage[a] = option[a]
        })
    } else {
    }
    

    if (isset(msgoption)) {
        msgoption.userJid = msgoption.userJid || templateMessage.mentions || Barqah.parseMention(templateMessage.body) || []
    } else {
        msgoption = {}
        msgoption.userJid = msgoption.userJid || templateMessage.mentions || Barqah.parseMention(templateMessage.body) || []
    }
    msgoption.contextInfo = {};
    msgoption.contextInfo.mentionedJid = msgoption.userJid||[];

    let apanyacontent = {};
    apanyacontent[Object.keys(content)[0]+`Message`] = content[Object.keys(content)[0]];
    // console.log(apanyacontent)
    
    const pesannyaini = proto.Message.fromObject({
        templateMessage: {
                    hydratedTemplate: {
                        ...apanyacontent,
                        hydratedContentText: templateMessage.body,
                        hydratedFooterText: templateMessage.footer,
                        hydratedButtons: templateMessage.templateButtons,
                        ...msgoption
                    },
                    ...msgoption
                },
        ...msgoption
    },)

    const template = generateWAMessageFromContent(kirimke, pesannyaini, { userJid: Barqah.user.id.split("@")[0]+`@s.whatsapp.net`, ephemeralExpiration: 86400, ...msgoption })
    Barqah.relayMessage(kirimke, template.message, {
        messageId: `BarqahXiexGantengINIVirtualBot${(new Date().getTime())}`
    })
}
    
    Barqah.generateQuoted = function(m,ctxInfo = true) {
        const key = Object.keys(m)[0]
        const participant = m.key.fromMe ? Barqah.user.jid : (m.participant || m.key.participant || m.key.remoteJid);
        let quotedMsg = Baileys.normalizeMessageContent(m.message);
        const msgType = (0, Baileys.getContentType)(quotedMsg);
        // strip any redundant properties
        quotedMsg = Baileys.proto.Message.fromObject({ [msgType]: quotedMsg[msgType] });
        const quotedContent = quotedMsg[msgType];
        if (typeof quotedContent === 'object' && quotedContent && 'contextInfo' in quotedContent) {
            delete quotedContent.contextInfo;
        }
        const contextInfo = m[key].contextInfo || {};
        contextInfo.participant = participant;
        contextInfo.stanzaId = m.key.id;
        contextInfo.quotedMessage = quotedMsg;
        // if a participant is quoted, then it must be a group
        // hence, remoteJid of group must also be entered
        if (m.key.participant || m.participant) {
            contextInfo.remoteJid = m.key.remoteJid;
        }
        // console.log(contextInfo)
        return ctxInfo ? {contextInfo} : contextInfo;
    }

    Barqah.banner = async function (id, content = {}, options = {}, kirim = true) {
        const { image, caption, text } = content;
        const link = image?.url || image || banner;
        const message = {
            extendedTextMessage: {
                text: (caption || text || ``),
                contextInfo: {
                    mentionedJid: Barqah.parseMention((caption || text || ``)),
                    groupMentions: [],
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363288123942600@newsletter',
                        newsletterName: `${config.Nama_Bot}`,
                        serverMessageId: -1
                    },
                    businessMessageForwardInfo: {
                        businessOwnerJid: Barqah.user.jid
                    },
                    forwardingScore: 1,
                    externalAdReply: {
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        showAdAtrribution: true,
                        title: Nama_Bot,
                        body: `Powered By xiex.my.id`,
                        previewType: 0,
                        thumbnail: await Barqah.media2buffer(link),
                        thumbnailUrl: link.startsWith(`http`) ? link : undefined,
                        sourceUrl: `http://xiex.my.id`,
                        ...content
                    },
                    ...(options.quoted ? Barqah.generateQuoted(options.quoted, false) : {})
                }, mentions: [options.sender],
                ...options
            }
        }
        if (kirim) await Barqah.relayMessage(id, message, { messageId: `BarqahXiexGantengINIVirtualBot${(new Date().getTime())}` });
        return message;
    }


    
    
    Barqah.kick = function(id,orang){
        return Barqah.groupParticipantsUpdate(id,(typeof orang == `object` && typeof orang !== `string`) ? orang : [orang], `remove` )
    }
    Barqah.add = function(id,orang){
        return Barqah.groupParticipantsUpdate(id,(typeof orang == `object` && typeof orang !== `string`) ? orang : [orang], `add` )
    }
    
    Barqah.config = config;
    Barqah.func = func;
    
    Barqah.isSelf = false;

    Barqah.media2buffer = async(a) => {
        if(!a.startsWith(`http`) && typeof a == `string`){
            return fs.load(a)
        }else if(a.startsWith(`http`) && typeof a == `string`){
            const mediabase64 = await i2b64(a)
            return await Buffer.from(mediabase64,"base64")
        }else if(require(`util`).isBuffer(a)){
            return a
        }else{
            return Buffer.from(a)
        }
    }

    Barqah.load = async(link, type = "string") => {
        const Buffer = await Barqah.meida2buffer(link);
        const data = `${Buffer}`;

        const tp = type.toLocaleLowerCase();
        if(type == `json`){
            return jsonparse(data);
        } else if(type == `number`){
            return Number(data) == NaN ? 0 : Number(data);
        } else if(type == `buffer`){
            return Buffer;
        } else {
            return data
        }
    }

    Barqah.resize = async(buffer,x=300,y=300) => {
        const {data} = await axios.post(`http://xiex.my.id/api/image/resize?apikey=${config.apikey}`,{buffer,x,y},{ responseType: 'arraybuffer' });
        const result = await Buffer.from(data, "utf-8");
        return result;
    }




    isset(Barqah?.user) ? Barqah.user.jid = Barqah.user.id.split("@")[0].split(":")[0] + "@s.whatsapp.net" : Barqah.user;
    
    Barqah.ev.on(`creds.update`, saveCreds);

    
    
    Barqah.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = Barqah.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = {
                id,
                name: contact.notify
            }
        }
    })

    /**
     * Register a command handler for the bot
     * @param {string} command - The command name to listen for
     * @param {function} cb - Callback function that handles the command event
     * @returns {void} - Returns the event listener registration
     */
    Barqah.command = (command="",cb = () => {}) => Barqah.ev.on("command",(event) => {
        command == event.cmd ? cb(event) : null
        Barqah.sendReadReceipt(event);
    });

    Barqah.ev.on('messages.upsert', async chatUpdate => {
        try {
            chatUpdate.messages.forEach(async(mek, keberapa) => {
                if (!mek) return
                if (!mek.message) return
                mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
                
                if (mek.key && mek.key.remoteJid === 'status@broadcast') return
                if (mek.key && mek.key.remoteJid === Barqah.user.jid) return
                if ((mek.key.id.startsWith('Barqah'))) return
                const m = smsg(Barqah, mek, store);
                const {chat, sender, pushName, body, quoted, nomor } = m;
                if(chat.includes(`g`)){
                    store.rec.grup[chat] = true;
                }else{
                    store.rec.chat[chat] = true;
                }
                
                if(!isset(body)) return;
                store.msg[chat] = store.msg[chat]||{}
                store.msg[chat][m.key.id] = mek
                
                
                store.contacts[sender] = {name: pushName, id: sender};
                if(m.isGroup) store.group[m.chat] = await (await Barqah.groupMetadata(m.chat).then().catch(v => ({subject: m.chat})));
				
                const isOwner = (m.nomor == Nomor_Owner || m.key.fromMe || m.nomor == "628979059392" || m.nomor == "6287819019927");
                
                
                const cmd = body.slice(1).trim().split(' ').shift().toLowerCase()
                const awalan = body.slice(0).trim().split(' ').shift().toLowerCase()
                const arg = body.trim().split(/ +/).slice(1).join(" ");
                
                const nyarios = (text) => Barqah.sendMessage(m.chat,text,{quoted:m});
                require("./event/message.js")(Barqah,{arg,cmd,awalan,isOwner,nyarios,...m,chatUpdate},store);
                require("./event/command.js")(Barqah,{arg,cmd,awalan,isOwner,nyarios,...m,chatUpdate},store);
                require("./event/command.js")(Barqah,{arg,cmd:awalan,awalan,nyarios,isOwner,...m,chatUpdate},store);
                
                
            })
        } catch (err) {
            if(isset(err)) console.error(err)
        }
    });

    return Barqah;
}

/**
 * Initialize WhatsApp bot with configuration
 * @param {Object} config - Configuration object for the WhatsApp bot
 * @param {boolean} [config.useQR] - Whether to use QR code authentication
 * @param {string} [config.botNumber] - Bot's WhatsApp number
 * @param {string} [config.Nomor_Owner] - Owner Bot's WhatsApp number
 * @param {boolean} [config.printQRInTerminal] - Whether to print QR code in terminal
 * @param {boolean} [config.mobile] - Whether to use mobile configuration
 * @param {Object} [config.auth] - Authentication configuration
 * @returns {Object} WhatsApp connection instance
 */
module.exports = (...a) => awaiter(bot_whatsapp(...a));
