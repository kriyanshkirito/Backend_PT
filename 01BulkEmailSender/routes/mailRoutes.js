/*const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');

const upload = multer({ dest: 'uploads/' });

// mail config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aryanluvrrim@gmail.com',
        pass: 'pbajbbpxyjxxltni'
    }
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.log('Transporter verification failed:', error);
    } else {
        console.log('Transporter is ready to send emails');
    }
});

// GET page
router.get('/', (req, res) => {
    res.render('index');
});

// POST upload
router.post('/upload',
    upload.fields([
        { name: 'file', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
async (req, res) => {

    const { subject, title, message, buttonText, buttonLink } = req.body;

    const csvFile = req.files['file'][0];
    const imageFile = req.files['image'] ? req.files['image'][0] : null;

    const results = [];

    fs.createReadStream(csvFile.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('error', (err) => {
            console.error('Error parsing CSV:', err);
            res.status(500).send('Error parsing CSV file');
        })
        .on('end', async () => {
            console.log('Parsed CSV data:', results);

            const delay = ms => new Promise(r => setTimeout(r, ms));

            let sentCount = 0;
            let failCount = 0;

            for (let user of results) {
                if (!user.email) {
                    console.log('Skipping user without email:', user);
                    failCount++;
                    continue;
                }

                const html = `
                <div style="font-family:Arial; max-width:600px; margin:auto; padding:20px;">
                    
                    <h1 style="align-text:center">${title}</hi>

                    <p>Hello ${user.name || "User"},</p>

                    <p>${message}</p>

                    ${
                        imageFile
                        ? `<img src="cid:myimage" style="width:100%; margin-top:10px; border-radius:10px;" />`
                        : ""
                    }

                    ${
                        buttonText && buttonLink
                        ? `<a href="${buttonLink}" 
                             style="display:inline-block; margin-top:15px; padding:10px 15px; background:blue; color:white; text-decoration:none;">
                             ${buttonText}
                           </a>`
                        : ""
                    }

                </div>
                `;

                try {
                    await transporter.sendMail({
                        from: 'aryanluvrrim@gmail.com',
                        to: user.email,
                        subject: subject,
                        html: html,
                        attachments: imageFile ? [{
                            filename: imageFile.originalname,
                            path: imageFile.path,
                            cid: 'myimage'
                        }] : []
                    });

                    console.log("Sent:", user.email);
                    sentCount++;
                    await delay(2000);

                } catch (err) {
                    console.log("Fail:", user.email, err.message);
                    failCount++;
                }
            }

            res.send(`Emails sent: ${sentCount} successful, ${failCount} failed.`);
        });
});

module.exports = router;
this is when we not introduce email.ejs

*/
//after email.ejs
/* send one time only
const express = require('express'); // loads express web framework
const router = express.Router();// create router object to define routes separetly for app.js
const multer = require('multer'); // multer handles files upload(csv and image)
const csv = require('csv-parser');  // reads csv file line by line
const fs = require('fs'); // node file system module (aloow to create ,read,write  and delete files from directory  provide asynchronus blocking and syncrhronus method for operation like reading,config files,saving user uploaded files ) we used to read csv
const nodemailer = require('nodemailer');// nodemailer is polar secure and zero dependecy library for node.js that enable easy mailing sending from server,it supporrts smtp ,html content,attachemnt and etc (we use becuse it send emails via SMTP)
const ejs = require('ejs'); // render HTML conetent with dynamic data(ejs is module in whcih we can use javascript nicely we have to not work hard to find id of element then change the thing we want ejs directly do)
const path = require('path'); // path module is use to handle and tranform directory path

const upload = multer({ dest: 'uploads/' }); // configures multer to store uploaded files in the folder uploads

// mail config
const transporter = nodemailer.createTransport({// create transport object which engine that handle connection to our email services and deliever message read in readme more about it
    service: 'gmail',
    auth: {
        user: 'aryanluvrrim@gmail.com',
        pass: 'pbajbbpxyjxxltni' // use app password(not your real gmail password it get when you on two factor authentication for your account then genrate passkey)
    }
});

// Verify transporter
transporter.verify((error, success) => { // check if tranporter connect to gmail properly
    if (error) {
        console.log('Transporter verification failed:', error);
    } else {
        console.log('Transporter is ready to send emails');
    }
});

// GET page
router.get('/', (req, res) => { // define get routes at "/" renders index page our uploaded form
    res.render('index');
});

// POST upload
router.post('/upload',   // define Post Route At /upload
    upload.fields([ // accecpt two uploaded file
        { name: 'file', maxCount: 1 },  // csv file (csv file should ve in the note form as we genrated that when you open csv file in notes then it contain gmail,name then save and in type enter for all files)
        { name: 'image', maxCount: 1 } // optinal image upload 
    ]),
async (req, res) => { // we are using async so that wait until this finish

    const { subject, title, message, buttonText, buttonLink } = req.body;

    const csvFile = req.files['file'][0];  // get csv files
    const imageFile = req.files['image'] ? req.files['image'][0] : null; // get image files if provided (means image upload is optional) ,this code tells if image found then image files else return null

    const results = []; // define array name result

    fs.createReadStream(csvFile.path) // this read csv file line by line
        .pipe(csv())  // send file data to csv parser
        .on('data', (data) => results.push(data)) // runs each row after parsing then store in result array the data(gmail and name) then if there are two gmail in csv then array contain two element
        .on('error', (err) => {  // after parsing check error
            console.error('Error parsing CSV:', err);
            res.status(500).send('Error parsing CSV file');
        })
        .on('end', async () => {
            console.log('Parsed CSV data:', results);  //  Runs when entire file is finished reading Now `results` has **all rows**


            const delay = ms => new Promise(r => setTimeout(r, ms));  // define helfer function to pause between email to avoid gmail limit

            let sentCount = 0; // counts for sucessful and fail sends
            let failCount = 0;

            for (let user of results) { // look each row of csv we store in array results
                if (!user.email) {
                    console.log('Skipping user without email:', user); // skipping user without gmail
                    failCount++; 
                    continue;
                }

                // Render EJS template
                const html = await ejs.renderFile( // load and render email.ejs
                    path.join(__dirname, '../views/emailTemplates/email.ejs'), // inject dynamic values(ex titles,name,message,etc)
                    {
                        title, //this is in form 
                        name: user.name || "User", // name which is presnt in csv file if anme not found then use user
                        message,  // this in form that we want to send in gmail
                        image: !!imageFile, // return true if image uploaded 
                        buttonText, // this is button text present in our form what to write in button
                        buttonLink
                    }
                );

                try {
                    await transporter.sendMail({ // uses nodemailer and said wait until email is sent before moving on
                        from: 'aryanluvrrim@gmail.com',
                        to: user.email, // get email from csv
                        subject: subject,
                        html: html,
                        attachments: imageFile ? [{
                            filename: imageFile.originalname,
                            path: imageFile.path,
                            cid: 'myimage'
                        }] : []
                    });

                    console.log("Sent:", user.email);
                    sentCount++;
                    await delay(2000); // wait 2 secnodn to prevent gmail blocking rate

                } catch (err) {
                    console.log("Fail:", user.email, err.message);  // runs if sending fails 
                    failCount++;
                }
            }

            res.send(`Emails sent: ${sentCount} successful, ${failCount} failed.`);
        });
});

module.exports = router;

*/


// email sent 3 times repaeatedly 
require('dotenv').config();
const express = require('express'); // loads express web framework
const router = express.Router();// create router object to define routes separetly for app.js
const multer = require('multer'); // multer handles files upload(csv and image)

const csv = require('csv-parser');  // reads csv file line by line
const fs = require('fs'); // node file system module (aloow to create ,read,write  and delete files from directory  provide asynchronus blocking and syncrhronus method for operation like reading,config files,saving user uploaded files ) we used to read csv
const nodemailer = require('nodemailer');// nodemailer is polar secure and zero dependecy library for node.js that enable easy mailing sending from server,it supporrts smtp ,html content,attachemnt and etc (we use becuse it send emails via SMTP)
const ejs = require('ejs'); // render HTML conetent with dynamic data(ejs is module in whcih we can use javascript nicely we have to not work hard to find id of element then change the thing we want ejs directly do)
const path = require('path'); // path module is use to handle and tranform directory path
require('dotenv').config();

const username=process.env.USER;
const passkey=process.env.PASS;
const upload = multer({ dest: 'uploads/' }); // configures multer to store uploaded files in the folder uploads

// mail config
const transporter = nodemailer.createTransport({// create transport object which engine that handle connection to our email services and deliever message read in readme more about it
    service: 'gmail',
    auth: {
        user: username,
        pass: passkey // use app password(not your real gmail password it get when you on two factor authentication for your account then genrate passkey)
    }
});

// Verify transporter
transporter.verify((error, success) => { // check if tranporter connect to gmail properly
    if (error) {
        console.log('Transporter verification failed:', error);
    } else {
        console.log('Transporter is ready to send emails');
    }
});

// GET page
router.get('/', (req, res) => { // define get routes at "/" renders index page our uploaded form
    res.render('index');
});

// POST upload
router.post('/upload',   // define Post Route At /upload
    upload.fields([ // accecpt two uploaded file
        { name: 'file', maxCount: 1 },  // csv file (csv file should ve in the note form as we genrated that when you open csv file in notes then it contain gmail,name then save and in type enter for all files)
        { name: 'image', maxCount: 1 } // optinal image upload 
    ]),
async (req, res) => { // we are using async so that wait until this finish

    const { subject, title, message, buttonText, buttonLink } = req.body;

    const csvFile = req.files['file'][0];  // get csv files
    const imageFile = req.files['image'] ? req.files['image'][0] : null; // get image files if provided (means image upload is optional) ,this code tells if image found then image files else return null

    const results = []; // define array name result

    fs.createReadStream(csvFile.path) // this read csv file line by line
        .pipe(csv())  // send file data to csv parser
        .on('data', (data) => results.push(data)) // runs each row after parsing then store in result array the data(gmail and name) then if there are two gmail in csv then array contain two element
        .on('error', (err) => {  // after parsing check error
            console.error('Error parsing CSV:', err);
            res.status(500).send('Error parsing CSV file');
        })
        .on('end', async () => {
            console.log('Parsed CSV data:', results);  //  Runs when entire file is finished reading Now `results` has **all rows**


            const delay = ms => new Promise(r => setTimeout(r, ms));  // define helfer function to pause between email to avoid gmail limit

            let sentCount = 0; // counts for sucessful and fail sends
            let failCount = 0;

            for (let user of results) { // look each row of csv we store in array results
                if (!user.email) {
                    console.log('Skipping user without email:', user); // skipping user without gmail
                    failCount++; 
                    continue;
                }

                // Render EJS template
                const html = await ejs.renderFile( // load and render email.ejs
                    path.join(__dirname, '../views/emailTemplates/email.ejs'), // inject dynamic values(ex titles,name,message,etc)
                    {
                        title, //this is in form 
                        name: user.name || "User", // name which is presnt in csv file if anme not found then use user
                        message,  // this in form that we want to send in gmail
                        image: !!imageFile, // return true if image uploaded 
                        buttonText, // this is button text present in our form what to write in button
                        buttonLink
                    }
                );
                 for(let i=1;i<=3;i++){
                try {
                    await transporter.sendMail({ // uses nodemailer and said wait until email is sent before moving on
                        from: 'aryanluvrrim@gmail.com',
                        to: user.email, // get email from csv
                        subject: subject,
                        html: html,
                        attachments: imageFile ? [{
                            filename: imageFile.originalname,
                            path: imageFile.path,
                            cid: 'myimage'
                        }] : []
                    });

                    console.log("Sent:", user.email);
                    sentCount++;
                    await delay(2000); // wait 2 secnodn to prevent gmail blocking rate

                } catch (err) {
                    console.log("Fail:", user.email, err.message);  // runs if sending fails 
                    failCount++;
                }
            }
        }

            res.send(`Emails sent: ${sentCount} successful, ${failCount} failed.`);
        });
});

module.exports = router;




