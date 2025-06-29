const { Client, LocalAuth } = require('whatsapp-web.js');
// const https = require('https');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
// const schedule = require('node-schedule');
var cron = require('node-cron');
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
    cron.schedule('0 0 23 * * *', () => {
        console.log('running a task midnight');
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
            const url = 'https://script.google.com/macros/s/AKfycbwp19OXpAXtjPg-PfbJ7MLl3lBgxvvugQT1rtY4G4jth6cQvrrQQdl8BFBB4I9uPow/exec?action=income&name=' +
                nowDate + '&tgl=' + formattedtgl + '&inadmin=' + adminTotal + '&inworker=' + workerTotal + '&intotal=' + intotal + '&ouc=0&ket=notes&prof=' + profit;

            console.log("Final URL:", url);

            db.query('INSERT INTO income_recap (id, in_admin, in_worker, total_in, outcome, keterangan, profit, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?)', ["", adminTotal, workerTotal, intotal, "0", "-", profit, nowtgl], (error, results) => {
                if (error) {
                    console.error(error);
                } else {
                    console.info("Data inserted into income table");
                }
            });

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
    if (arr[0] === '!recap') {
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
        var nowDate = now.toLocaleDateString('id-ID', options);

        var noteformat = note.replace(/\s+/g, "%20");
        // console.log("runningquerry");


        // console.log("runningquerry2");
        db.query('SELECT COUNT(*) AS count FROM worker_job WHERE admin = ?', [name], (error, results) => {
            if (error) {
                console.error(error);
            } else {
                const count = results[0].count;
                // console.log(`Total rows with name ${name}: ${count}`);
                totjob = count;
                // console.log("totjob: " + totjob);
                db.query('INSERT INTO admin_income (id, admin, jml_order, pendapatan, tanggal) VALUES (?, ?, ?, ?, ?)', ["", name, totjob, incomeformat, nowDate], (error, results) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.info("Data inserted into recap table");
                    }
                });

                const url = 'https://script.google.com/macros/s/AKfycbwp19OXpAXtjPg-PfbJ7MLl3lBgxvvugQT1rtY4G4jth6cQvrrQQdl8BFBB4I9uPow/exec?action=recap&name=' + name + '&date=' + formattedDate + '&totaljob=' + totjob + '&pendapatan=' + incomeformat + '&note=' + noteformat;
                console.log(url);
                // return;
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

    if (arr[0].charAt(0) !== '!') {

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
        const url = 'https://script.google.com/macros/s/AKfycbwp19OXpAXtjPg-PfbJ7MLl3lBgxvvugQT1rtY4G4jth6cQvrrQQdl8BFBB4I9uPow/exec?action=addJob&name=' + worker + '&codeJob=' + codeformat + '&jobTaken=' + jobformated + '&date=' + formattedDate + '&fee=Rp' + feeformat;
        console.log(url);
        // return;
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
        const url = 'https://script.google.com/macros/s/AKfycbwp19OXpAXtjPg-PfbJ7MLl3lBgxvvugQT1rtY4G4jth6cQvrrQQdl8BFBB4I9uPow/exec?action=getrecap'
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
        // client.sendMessage(message.from, );
    }
});

// client.on('message_create', message => {
//     var count;
//     if (message.body === '!income') {
//         // let total = 0;
//         const now = new Date();
//         const options = {
//             year: 'numeric',    // 2025
//             month: 'long',      // March
//             // day: 'numeric'      // 24
//         };
//         const tgl = {
//             year: 'numeric',    // 2025
//             month: 'long',      // March
//             day: 'numeric'      // 24
//         };
//         var formattedtgl = now.toLocaleDateString('id-ID', tgl).replace(/\s+/g, "%20");
//         var formattedDate = now.toLocaleDateString('id-ID', options).replace(/\s+/g, "%20");
//         console.log(formattedDate);
//         let total = 0;
//         db.query('SELECT SUM(pendapatan) AS total FROM admin_income WHERE tanggal = ?', [formattedtgl], (error, results) => {
//             if (error) {
//                 console.error(error);
//             } else {
//                 total = results[0].total || 0; // Use 0 if total is null
//                 console.log("Total pendapatan:", total);
//             }
//         });
//         console.log(total);
//         const url = 'https://script.google.com/macros/s/AKfycbxWE_pgQ71gL-8bwij2sPihgS9nGWvMijTnVP_mdqVaw1-XqZ_6t-YoHPpeJH3GrP3E/exec?action=income&name=' + formattedDate + '&tgl=' + formattedtgl + '&inadmin'

//     }
// });


client.on('message_create', message => {
    // job; // Check if the job is running

    const str = message.body;
    const arr = str.split(/\r?\n/);

    if (arr[0] === '!income' && message.from === "6281334301420@c.us") {

        const str = message.body;
        const arr = str.split(/\r?\n/);

        var outcome = arr[1].split(' ')[1];
        var notes = arr[2];

        function replaceLastChar(str, newChar) {
            return str.slice(0, -1) + newChar;
        }

        var outcomeformat = replaceLastChar(outcome, ".000");

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
        // function constructUrlAndProceed() {
        //     // Use both totals as needed
        //     var intotal = parseInt(adminTotal) + parseInt(workerTotal);
        //     console.log("Total pendapatan:", intotal);  // Use this if you want to sum both totals
        //     var profit = intotal - 0; // Assuming 0 is your fixed cost, replace with actual value if needed
        //     const url = 'https://script.google.com/macros/s/AKfycbxWE_pgQ71gL-8bwij2sPihgS9nGWvMijTnVP_mdqVaw1-XqZ_6t-YoHPpeJH3GrP3E/exec?action=income&name=' +
        //         nowDate + '&tgl=' + formattedtgl + '&inadmin=' + adminTotal + '&inworker=' + workerTotal + '&intotal=' + intotal + '&ouc=0&ket=notes&prof=' + profit;

        //     console.log("Final URL:", url);

        //     axios.get(url)
        //         .then(response => {
        //             console.log("running5");
        //             console.log(response.data);
        //             client.sendMessage(message.from, "Income data added ✅");
        //         })
        //         .catch(error => {
        //             console.error(`Error: ${error.message}`);
        //         });
        //     client.sendMessage(message.from, 'Tanggal: ' + nowtgl + '\n' +
        //         'Income admin:' + adminTotal +
        //         '\nIncome Worker: ' + workerTotal +
        //         '\nIncome total: ' + intotal +
        //         '\nProfit: ' + profit + '\n'
        //     );
        //     // Continue with your code (fetching URL, replying to message, etc.)
        //     // fetch(url)...
        //     // message.reply(`Admin: ${adminTotal}, Other: ${otherTotal}`);
        // }

        function constructUrlAndProceed() {
            // Use both totals as needed
            var intotal = parseInt(adminTotal) + parseInt(workerTotal);
            console.log("Total pendapatan:", intotal);  // Use this if you want to sum both totals
            var profit = intotal - 0; // Assuming 0 is your fixed cost, replace with actual value if needed

            // First check if a record for this date already exists
            db.query('SELECT * FROM income_recap WHERE tanggal = ?', [nowtgl], (error, results) => {
                if (error) {
                    console.error("Error checking for existing record:", error);
                    return;
                }

                // If record exists, don't proceed with insert
                if (results && results.length > 0) {
                    console.log(`Record for date ${nowtgl} already exists. Skipping insert.`);
                    client.sendMessage("6281334301420@c.us", `Income data for date ${nowtgl} already exists. No update performed. ⚠️`);
                    return;
                }

                // If no existing record, proceed with insert
                const url = 'https://script.google.com/macros/s/AKfycbwp19OXpAXtjPg-PfbJ7MLl3lBgxvvugQT1rtY4G4jth6cQvrrQQdl8BFBB4I9uPow/exec?action=income&name=' +
                    nowDate + '&tgl=' + formattedtgl + '&inadmin=' + adminTotal + '&inworker=' + workerTotal + '&intotal=' + intotal + '&ouc=' + outcomeformat + '&ket=' + notes + '&prof=' + profit;

                console.log("Final URL:", url);

                // Notice: There was a mistake in the original query - it had 7 placeholders but only 6 values
                // Fixed by adding all 7 values in the correct order
                db.query('INSERT INTO income_recap (id, in_admin, in_worker, total_in, outcome, keterangan, profit, tanggal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    ["", adminTotal, workerTotal, intotal, "0", "notes", profit, nowtgl], (error, results) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.info("Data inserted into income table");
                        }
                    });

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
            });
        }
    }
});