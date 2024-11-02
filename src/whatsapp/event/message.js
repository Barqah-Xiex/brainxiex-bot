module.exports = async function (Barqah,message,store){
    
    for await (const key of Object.keys(message)) {
        Barqah[key] = message[key];
    }

    
    return Barqah.ev.emit("message",Barqah);
}
