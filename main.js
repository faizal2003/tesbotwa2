const { Client, LocalAuth } = require('whatsapp-web.js');
// const https = require('https');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
var db = require('./dbsql.js');

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

//command stuff

client.on('message_create', message => {


    const str = message.body;
    const arr = str.split(/\r?\n/);
    // console.log(arr[0]);
    if (arr[0] === '!recap' && message.from === "6281334301420@c.us") {
        console.log("runningrecap");

        const str = message.body;
        const arr = str.split(/\r?\n/);

        var name = arr[1];
        var totjob = 0;
        var income = arr[2].split(' ')[1];
        // var outcome = arr[4].split(' ')[1];
        var note = arr[3].slice(5);
        // var noted = arr[5];
        // console.log(note);

        function replaceLastChar(str, newChar) {
            return str.slice(0, -1) + newChar;
        }

        var incomeformat = replaceLastChar(income, ".000");
        // var outcomeformat = replaceLastChar(outcome, ".000");

        let now = new Date();
        console.log("running4");
        const options = {
            year: 'numeric',    // 2025
            month: 'long',      // March
            day: 'numeric'      // 24
        };
        var formattedDate = now.toLocaleDateString('id-ID', options).replace(/\s+/g, "%20");

        var noteformat = note.replace(/\s+/g, "%20");
        console.log("runningquerry");


        console.log("runningquerry2");
        db.query('SELECT COUNT(*) AS count FROM worker_job WHERE admin = ?', [name], (error, results) => {
            if (error) {
                console.error(error);
            } else {
                const count = results[0].count;
                console.log(`Total rows with name ${name}: ${count}`);
                totjob = count;
                console.log("totjob: " + totjob);
                const url = 'https://script.google.com/macros/s/AKfycbxWE_pgQ71gL-8bwij2sPihgS9nGWvMijTnVP_mdqVaw1-XqZ_6t-YoHPpeJH3GrP3E/exec?action=recap&name=' + name + '&date=' + formattedDate + '&totaljob=' + totjob + '&pendapatan=' + incomeformat + '&note=' + noteformat;
                console.log(url);

                axios.get(url)
                    .then(response => {
                        console.log("running5");
                        console.log(response.data);
                        client.sendMessage(message.from, "recap added ✅");
                    })
                    .catch(error => {
                        console.error(`Error: ${error.message}`);
                    });

                // Do something with the count if needed
            }

        });

        // console.log("totjob: " + totjob);
        // console.log("runningquerryend");




        return;
    }
});

client.on('message_create', message => {
    const str = message.body;
    const arr = str.split(/\r?\n/);

    if (message.from === "6281334301420@c.us" && arr[0].charAt(0) !== '!') {

        // client.sendMessage(message.body);
        console.log("running");
        console.log(message.body);
        console.log(message.from);
        const str = message.body;
        const arr = str.split(/\r?\n/);

        var code = arr[0];
        var admin = arr[0].split(' ')[0];
        var codecus = arr[0].split(' ')[1];
        console.log("running1");
        var job = arr[1];
        var jobformat = job.indexOf(" ");
        var jobformated = job.substring(jobformat + 1).replace(/\s+/g, "%20");
        var jb = job.substring(jobformat + 1);
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
        var tgl = now.toLocaleDateString('id-ID', options);
        console.log(tgl);
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

        db.query('INSERT INTO worker_job (id, admin, code, job, tanggal, fee, worker) VALUES (?, ?, ?, ?, ?, ?, ?)', ["", admin, codecus, jb, tgl, feeformat, worker], (error, results) => {

            if (error) {
                console.error(error);
            } else {
                console.info("Data inserted into worker_job table");
            }
        });
    }
});

client.on('message_create', message => {
    if (message.body === '!help') {
        client.sendMessage(message.from, 'Commands:\n!recap\n!addjob\n!ping');
    }
});

client.on('message_create', message => {
    if (message.body === '!getrecap') {
        // client.sendMessage(message.from, 'Format:\n!addjob\nJobName\nFee\nWorkerName');
        const url = 'https://script.google.com/macros/s/AKfycbxWE_pgQ71gL-8bwij2sPihgS9nGWvMijTnVP_mdqVaw1-XqZ_6t-YoHPpeJH3GrP3E/exec?action=getrecap'
        axios.get(url).then(response => {
            console.log(response.data);
            var data = response.data;
            var datalength = response.data.length;
            console.log(datalength);
            var str = JSON.stringify(data);

            const parsedData = data.map(record => {
                // You can perform calculations or transformations here
                const profit = record.pemasukan - record.pengeluaran;

                // Return a new object with the data you want
                return {
                    adminName: record.admin,
                    income: record.pemasukan,
                    expense: record.pengeluaran,
                    profit: profit,
                    profitMargin: ((profit / record.pemasukan) * 100).toFixed(2) + '%'
                };
            });

            // Display the parsed data
            console.log(parsedData[0]);
            console.log(datalength);

            var msg;
            var finalmsg = [];

            for (let i = 0; i < datalength; i++) {
                console.log(parsedData[i]);
                const inc = parsedData[i].income.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }); // "$1,234,567.89"
                const outc = parsedData[i].expense.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }); // "$1,234,567.89"
                const profit = parsedData[i].profit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }); // "$1,234,567.89"
                // const profitmargin = parsedData[i].profitMargin.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }); // "$1,234,567.89"
                console.log(inc);
                console.log(outc);
                console.log(profit);
                // return;
                msg = parsedData[i].adminName + "\r" +
                    "Income: " + inc + "\r" +
                    "Expense: " + outc + "\r" +
                    "Profit: " + profit + "\r" +
                    "Profit Margin: " + parsedData[i].profitMargin + "\r\r";
                client.sendMessage(message.from, msg);
                finalmsg.push(msg);
            }
            // console.log(msg);
            // const adminA2 = parsedData.find(item => item.adminName === "A-2");
            // console.log("A-2's data:", adminA2);

            // console.log(str);
            // var str = JSON.stringify(data, null, 2);
            // console.log(str);
            // client.sendMessage(message.from, msg);
        }
        ).catch(error => {
            console.error(`Error: ${error.message}`);
        });
    }
});
