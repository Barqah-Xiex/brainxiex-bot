const brainxiex_bot = require(".").use('whatsapp');
const client = brainxiex_bot({
    useQR: false,
    printQRInTerminal: false,
    botNumber: 62897904923293
});

client.ev.on('connection.update', console.log);

client.ev.on('message',(m) => {
    console.log(m.pushName,m.nomor,m.body);
})

client.command("test",(event) => {
    event.reply("ok");
});

client.command('lihatlagi', (m) => {
    if(m.quoted){
        const message = m.quoted.fakeObj;
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
        message.message.viewOnceMessage = {...message.message.viewOnceMessage, ...message.message.viewOnceMessageV2}
        const vtype = Object.keys(message.message.viewOnceMessage?.message || message.message)[0]
        delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
        delete message.message.viewOnceMessage.message[vtype].viewOnce
        message.message = {
        ...message.message.viewOnceMessage.message
        }
        const key = Object.keys(message.message)[0]
        message.message[key].contextInfo = {...message.message[key].contextInfo, ...m.generateQuoted(m,false)}
        m.relayMessage(id,message.message,{messageId: `BarqahXiexGantengINIVirtualBot${(new Date().getTime())}`}).catch(_ => m.reply(`Maybe It's Opened`,console.log(_)));
    }else{
        m.sendMessage(id, {text: `mana ? coba reply tampilah sekalilihatnya !`},{quoted:m})
    }
});

