const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
require('dotenv').config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: uploadsDir });

// Helper delay to prevent Gmail rate-limit blocks
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// GET / - Render main app dashboard
router.get('/', (req, res) => {
    res.render('index');
});

// POST /verify-credentials - Test user email & app password before saving
router.post('/verify-credentials', async (req, res) => {
    try {
        const { email, passkey } = req.body;
        const userEmail = (email || '').trim();
        const userPass = (passkey || '').replace(/\s+/g, '');

        if (!userEmail || !userPass) {
            return res.status(400).json({
                success: false,
                error: 'Both Sender Email and 16-character App Passkey are required.'
            });
        }

        const testTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: userEmail,
                pass: userPass
            }
        });

        await testTransporter.verify();
        return res.json({
            success: true,
            message: 'Credentials verified! Gmail SMTP is ready.'
        });
    } catch (err) {
        console.error('Credential verification error:', err.message);
        return res.status(400).json({
            success: false,
            error: err.message || 'Failed to authenticate with Gmail. Please check your App Password.'
        });
    }
});

// POST /upload - Execute bulk email campaign
router.post('/upload',
    upload.fields([
        { name: 'file', maxCount: 1 },
        { name: 'image', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const {
                subject = 'Notification',
                title = 'Announcement',
                message = '',
                buttonText = '',
                buttonLink = '',
                mode = 'single',            // 'single' | 'repeat' | 'interval'
                repeatCount = 3,            // for repeat mode
                intervalMinutes = 1,        // for interval mode
                senderEmail,
                senderPassword
            } = req.body;

            // Prioritize user-provided credentials from UI, fallback to .env
            const userEmail = (senderEmail || process.env.USER || '').trim();
            const userPass = (senderPassword || process.env.PASS || '').replace(/\s+/g, '');

            if (!userEmail || !userPass) {
                return res.status(400).json({
                    success: false,
                    error: 'Sender email and passkey are required. Please configure your credentials.'
                });
            }

            if (!req.files || !req.files['file'] || req.files['file'].length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Please upload a valid CSV file containing recipient emails.'
                });
            }

            const csvFile = req.files['file'][0];
            const imageFile = req.files['image'] ? req.files['image'][0] : null;

            // Create transporter with the user's credentials
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: userEmail,
                    pass: userPass
                }
            });

            // Parse CSV
            const results = [];
            fs.createReadStream(csvFile.path)
                .pipe(csv())
                .on('data', (data) => {
                    // Normalize keys to lowercase to avoid 'Email' vs 'email' mismatches
                    const normalized = {};
                    for (const key of Object.keys(data)) {
                        normalized[key.trim().toLowerCase()] = data[key] ? data[key].trim() : '';
                    }
                    if (normalized.email) {
                        results.push(normalized);
                    }
                })
                .on('error', (err) => {
                    console.error('Error parsing CSV:', err);
                    if (fs.existsSync(csvFile.path)) fs.unlinkSync(csvFile.path);
                    if (imageFile && fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
                    return res.status(500).json({ success: false, error: 'Error parsing CSV file.' });
                })
                .on('end', async () => {
                    console.log(`Parsed ${results.length} valid recipients from CSV.`);

                    if (results.length === 0) {
                        if (fs.existsSync(csvFile.path)) fs.unlinkSync(csvFile.path);
                        if (imageFile && fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);
                        return res.status(400).json({
                            success: false,
                            error: 'No valid recipient rows found in CSV. Please ensure the header includes "email".'
                        });
                    }

                    let sentCount = 0;
                    let failCount = 0;
                    const logs = [];

                    const templatePath = path.join(__dirname, '../views/emailTemplates/email.ejs');

                    // ==========================================
                    // MODE 1: Standard Bulk Send (Single)
                    // ==========================================
                    if (mode === 'single') {
                        for (const user of results) {
                            try {
                                const html = await ejs.renderFile(templatePath, {
                                    title,
                                    name: user.name || 'User',
                                    message,
                                    image: !!imageFile,
                                    buttonText,
                                    buttonLink
                                });

                                await transporter.sendMail({
                                    from: userEmail,
                                    to: user.email,
                                    subject: subject,
                                    html: html,
                                    attachments: imageFile ? [{
                                        filename: imageFile.originalname,
                                        path: imageFile.path,
                                        cid: 'myimage'
                                    }] : []
                                });

                                sentCount++;
                                logs.push({ email: user.email, status: 'Sent' });
                                console.log(`[Single Mode] Sent to: ${user.email}`);
                                await delay(2000); // 2-second rate limit
                            } catch (err) {
                                failCount++;
                                logs.push({ email: user.email, status: 'Failed', error: err.message });
                                console.error(`[Single Mode] Failed for: ${user.email} - ${err.message}`);
                            }
                        }
                    }

                    // ==========================================
                    // MODE 2: Repeat Burst Send (Sequential)
                    // ==========================================
                    else if (mode === 'repeat') {
                        const totalRounds = Math.min(Math.max(parseInt(repeatCount) || 3, 1), 5); // between 1 and 5
                        for (const user of results) {
                            for (let round = 1; round <= totalRounds; round++) {
                                try {
                                    const roundSubject = `${subject}${totalRounds > 1 ? ` (Follow-up #${round})` : ''}`;
                                    const html = await ejs.renderFile(templatePath, {
                                        title,
                                        name: user.name || 'User',
                                        message,
                                        image: !!imageFile,
                                        buttonText,
                                        buttonLink
                                    });

                                    await transporter.sendMail({
                                        from: userEmail,
                                        to: user.email,
                                        subject: roundSubject,
                                        html: html,
                                        attachments: imageFile ? [{
                                            filename: imageFile.originalname,
                                            path: imageFile.path,
                                            cid: 'myimage'
                                        }] : []
                                    });

                                    sentCount++;
                                    logs.push({ email: user.email, status: `Sent (Round ${round}/${totalRounds})` });
                                    console.log(`[Repeat Mode] Sent Round ${round} to: ${user.email}`);
                                    await delay(2000);
                                } catch (err) {
                                    failCount++;
                                    logs.push({ email: user.email, status: `Failed (Round ${round})`, error: err.message });
                                    console.error(`[Repeat Mode] Failed Round ${round} for: ${user.email} - ${err.message}`);
                                }
                            }
                        }
                    }

                    // ==========================================
                    // MODE 3: Interval / Staggered Waves
                    // ==========================================
                    else if (mode === 'interval') {
                        const intervalMin = Math.max(parseFloat(intervalMinutes) || 1, 0.5);

                        // Send Wave 1 immediately for all recipients
                        for (const user of results) {
                            try {
                                const html = await ejs.renderFile(templatePath, {
                                    title,
                                    name: user.name || 'User',
                                    message,
                                    image: !!imageFile,
                                    buttonText,
                                    buttonLink
                                });

                                await transporter.sendMail({
                                    from: userEmail,
                                    to: user.email,
                                    subject: `${subject} (Initial Notice)`,
                                    html: html,
                                    attachments: imageFile ? [{
                                        filename: imageFile.originalname,
                                        path: imageFile.path,
                                        cid: 'myimage'
                                    }] : []
                                });

                                sentCount++;
                                logs.push({ email: user.email, status: 'Sent (Wave 1 Initial)' });
                                console.log(`[Interval Mode] Sent Wave 1 to: ${user.email}`);
                                await delay(2000);
                            } catch (err) {
                                failCount++;
                                logs.push({ email: user.email, status: 'Failed (Wave 1)', error: err.message });
                            }
                        }

                        // Schedule Wave 2 and Wave 3 in background with user-configured intervals
                        const scheduleWave = (waveNum, delayMinutes) => {
                            setTimeout(async () => {
                                console.log(`Starting scheduled Wave ${waveNum} after ${delayMinutes} min...`);
                                for (const user of results) {
                                    try {
                                        const html = await ejs.renderFile(templatePath, {
                                            title,
                                            name: user.name || 'User',
                                            message,
                                            image: !!imageFile,
                                            buttonText,
                                            buttonLink
                                        });

                                        await transporter.sendMail({
                                            from: userEmail,
                                            to: user.email,
                                            subject: `${subject} (Reminder Wave #${waveNum})`,
                                            html: html,
                                            attachments: imageFile ? [{
                                                filename: imageFile.originalname,
                                                path: imageFile.path,
                                                cid: 'myimage'
                                            }] : []
                                        });
                                        console.log(`[Interval Mode - Wave ${waveNum}] Sent to: ${user.email}`);
                                        await delay(2000);
                                    } catch (err) {
                                        console.error(`[Interval Mode - Wave ${waveNum}] Error for ${user.email}:`, err.message);
                                    }
                                }
                            }, delayMinutes * 60 * 1000);
                        };

                        scheduleWave(2, intervalMin);
                        scheduleWave(3, intervalMin * 2);
                    }

                    // Clean up CSV file after dispatch
                    if (fs.existsSync(csvFile.path)) {
                        fs.unlinkSync(csvFile.path);
                    }

                    // Respond to client
                    if (req.xhr || req.headers.accept?.includes('application/json')) {
                        return res.json({
                            success: true,
                            mode,
                            totalRecipients: results.length,
                            sentCount,
                            failCount,
                            logs: logs.slice(0, 50),
                            message: mode === 'interval'
                                ? `Wave 1 dispatched! (${sentCount} sent). Waves 2 & 3 scheduled every ${intervalMinutes} min.`
                                : `Campaign complete! ${sentCount} sent successfully, ${failCount} failed.`
                        });
                    } else {
                        return res.send(`
                            <div style="font-family: sans-serif; text-align: center; padding: 40px;">
                                <h2>Campaign Results (${mode.toUpperCase()} Mode)</h2>
                                <p><strong>Sent:</strong> ${sentCount}</p>
                                <p><strong>Failed:</strong> ${failCount}</p>
                                <a href="/" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#007bff; color:white; text-decoration:none; border-radius:5px;">Back to App</a>
                            </div>
                        `);
                    }
                });
        } catch (error) {
            console.error('Upload handler fatal error:', error);
            return res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
        }
    }
);

module.exports = router;
