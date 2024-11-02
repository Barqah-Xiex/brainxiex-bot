const brainxiex_bot = require('./').use('whatsapp');
const client = brainxiex_bot({
    printQRInTerminal: true,
    botNumber: 628979059392
});

client.command("test",(event) => {
    event.reply("ok");
});

client.command("test2",(event) => {
    event.reply("ok");
});

client.ev.on('message',(m) => {
    console.log(m.pushName,m.nomor,m.body);
})