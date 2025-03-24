const { Client, LocalAuth } = require('whatsapp-web.js');
// const https = require('https');
const axios = require('axios');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: 'authentications'
    }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.initialize();

client.on('message_create', message => {
    if (message.body === '!ping') {
        // send back "pong" to the chat the message was sent in
        client.sendMessage(message.from, 'pong');
    }
});

client.on('message_create', async message => {
    if (message.body === 'hallo') {
        const contact = await message.getContact();
        const name = contact.pushname //|| contact.verifiedName;
        client.sendMessage(message.from, 'Hallo juga ' + name + '!');
    }
    // console.log(message.body);
});

client.on('message_create', message => {

    // client.sendMessage(message.body);
    console.log("running");
    console.log(message.body);
    const str = message.body;
    const arr = str.split(/\r?\n/);

    // if (arr[0] === 'add') {
    //     console.log("running add");
    // }

    // console.log(arr[0]);
    // console.log(arr[1].split(' ')[1]);
    // var job = arr[1].split(' ')[1];
    // console.log(job);
    var code = arr[0];
    console.log("running1");
    var job = arr[1];
    var jobformat = job.indexOf(" ");
    var jobformated = job.substring(jobformat + 1).replace(/\s+/g, "%20");
    console.log(jobformated);
    // return;
    // console.log(arr[3]);
    var fee = arr[3].split(' ')[1];
    var worker = arr[5].split(' ')[1];
    console.log("running2");
    console.log(code);
    console.log("running3");
    // console.log(job);
    console.log(fee);
    console.log(worker);

    function replaceLastChar(str, newChar) {
        return str.slice(0, -1) + newChar;
    }

    var feeformat = replaceLastChar(fee, ".000");
    console.log(feeformat);

    let now = new Date();
    console.log("running4");
    const options = {
        year: 'numeric',    // 2025
        month: 'long',      // March
        day: 'numeric'      // 24
    };
    var formattedDate = now.toLocaleDateString('id-ID', options).replace(/\s+/g, "%20");
    console.log("running5");
    console.log(formattedDate);
    // var jobformated = job.replace(/\s+/g, "%20");
    // console.log(jobformated);
    var codeformat = code.replace(/\s+/g, "%20");
    console.log(codeformat);
    // return;
    console.log("running7");
    const url = 'https://script.google.com/macros/s/AKfycbxWE_pgQ71gL-8bwij2sPihgS9nGWvMijTnVP_mdqVaw1-XqZ_6t-YoHPpeJH3GrP3E/exec?action=addJob&name=' + worker + '&codeJob=' + codeformat + '&jobTaken=' + jobformated + '&date=' + formattedDate + '&fee=Rp' + feeformat;
    console.log(url);

    axios.get(url)
        .then(response => {
            console.log("running5");
            console.log(response.data);
            client.sendMessage(message.from, "data added ✅");
        })
        .catch(error => {
            console.error(`Error: ${error.message}`);
        });


});