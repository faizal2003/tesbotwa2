const { Client, LocalAuth } = require('whatsapp-web.js');
// const https = require('https');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
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
    schedule.scheduleJob('10 * * * *', function () {
        // Schedule to run every day at midnight
        console.log("running income every 5 minutes");
    });
    console.log('Client is ready!');
    console.log("running income");
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
    };
    const tgl = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    var formattedtgl = now.toLocaleDateString('id-ID', tgl).replace(/\s+/g, "%20");
    var nowtgl = now.toLocaleDateString('id-ID', tgl);
    var nowDate = now.toLocaleDateString('id-ID', options);
    console.log(nowDate);
    console.log('checkpoint 1');

    // Variables to store results from both queries
    let adminTotal = 0;
    let workerTotal = 0;
    let queriesCompleted = 0;

    // First query - admin_income
    db.query('SELECT SUM(pendapatan) AS total FROM admin_income WHERE tanggal = ?', [nowtgl], (error, results) => {
        if (error) {
            console.error("Error in first query:", error);
        } else {
            adminTotal = results[0].total || 0;
            console.log("Admin total pendapatan:", adminTotal);

            // Increment completed queries counter
            queriesCompleted++;

            // Check if both queries are done
            if (queriesCompleted === 2) {
                constructUrlAndProceed();
            }
        }
    });

    // Second query - your other table
    db.query('SELECT SUM(fee) AS total FROM worker_job WHERE tanggal = ?', [nowtgl], (error, results) => {
        if (error) {
            console.error("Error in second query:", error);
        } else {
            workerTotal = results[0].total || 0;
            console.log("Other total pendapatan:", workerTotal);

            // Increment completed queries counter
            queriesCompleted++;

            // Check if both queries are done
            if (queriesCompleted === 2) {
                constructUrlAndProceed();
            }
        }
    });

    // Function to construct URL and proceed after both queries complete
    function constructUrlAndProceed() {
        // Use both totals as needed
        var intotal = parseInt(adminTotal) + parseInt(workerTotal);
        console.log("Total pendapatan:", intotal);  // Use this if you want to sum both totals
        var profit = intotal - 0; // Assuming 0 is your fixed cost, replace with actual value if needed
        const url = 'https://script.google.com/macros/s/AKfycbxWE_pgQ71gL-8bwij2sPihgS9nGWvMijTnVP_mdqVaw1-XqZ_6t-YoHPpeJH3GrP3E/exec?action=income&name=' +
            nowDate + '&tgl=' + formattedtgl + '&inadmin=' + adminTotal + '&inworker=' + workerTotal + '&intotal=' + intotal + '&ouc=0&ket=notes&prof=' + profit;

        console.log("Final URL:", url);

        axios.get(url)
            .then(response => {
                console.log("running5");
                console.log(response.data);
                client.sendMessage("6281334301420@c.us", "Income data added ✅");
            })
            .catch(error => {
                console.error(`Error: ${error.message}`);
            });
        client.sendMessage("6281334301420@c.us", 'Tanggal: ' + nowtgl + '\n' +
            'Income admin:' + adminTotal +
            '\nIncome Worker: ' + workerTotal +
            '\nIncome total: ' + intotal +
            '\nProfit: ' + profit + '\n'
        );
        // Continue with your code (fetching URL, replying to message, etc.)
        // fetch(url)...
        // message.reply(`Admin: ${adminTotal}, Other: ${otherTotal}`);
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.initialize();

