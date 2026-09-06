# 📧 Bulk Email Sender & Android App (base.apk)

An **automated, mobile-friendly bulk email dispatch system** built with **Node.js, Express, EJS, and Android WebView container**. 

Send personalized email outreach campaigns from your computer or Android smartphone with **one-time credential setup**, **dynamic HTML templates**, **image attachments**, and **3 distinct sending modes**.

---

## 🚀 Key Features

* 🔐 **One-Time Credential Onboarding**: Enter your Gmail address and 16-character Google App Passkey once; the app remembers it permanently across sessions.
* ⚡ **3 Dispatch Modes**:
  1. **Standard Mode**: Single personalized delivery per contact with anti-ban rate limiting (2-second spacing).
  2. **Repeat Burst Mode**: Sends 2x to 5x sequential follow-up rounds per recipient with cooldown spacing.
  3. **Interval Waves Mode**: Sends an initial wave immediately, followed by automated reminder waves spaced across user-defined minute intervals.
* 📱 **Android Mobile Ready (`base.apk`)**: Full Android wrapper with DOM storage persistence, responsive mobile UI, and native file pickers for CSV and images.
* 📄 **CSV Recipient Parsing**: Streams recipient lists (`email`, `name`) efficiently without memory leaks.
* 🎨 **Personalized Templates**: Injects personalized names, custom button links, and inline images (`cid:myimage`).
* 📊 **Interactive Live Progress**: Visual live logs, success counts, and error reports without page reloading.

---

## 📱 Three Sending Modes Explained

| Mode | Behavior | Best Used For |
| :--- | :--- | :--- |
| **⚡ Standard** | Dispatches 1 email to each recipient with a 2-second rate-limiting delay. | Newsletters, announcements, regular campaigns. |
| **🔁 Repeat Burst** | Dispatches 3 sequential follow-up emails to each recipient with spacing. | Urgent notifications, critical alerts, time-sensitive reminders. |
| **⏱️ Interval Waves** | Dispatches Wave 1 immediately, then automatically schedules Wave 2 and Wave 3 after your chosen delay (e.g. 1 min, 5 min). | Automated reminder sequences, webinar follow-ups. |

---

## 🔐 One-Time Gmail App Password Setup

Due to Google security policies, regular passwords cannot be used for SMTP. You must generate a **16-character Google App Password**:

1. Log in to your **Google Account** and go to **Security**.
2. Make sure **2-Step Verification** is turned **ON**.
3. Search for **"App passwords"** in the top search bar.
4. Enter an app name (e.g., `Bulk Email Sender`) and click **Create**.
5. Copy the generated **16-character password** (e.g., `abcd efgh ijkl mnop`).
6. Paste it into the Bulk Email Sender setup modal. Click **Verify & Save**. The app will test the connection and store it securely on your device.

---

## 📂 Project Structure

```
01BulkEmailSender/
├── android/                         # Android Studio Project for base.apk
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml
│   │   ├── src/main/java/.../MainActivity.java
│   │   └── build.gradle             # Configured to output base.apk
│   ├── settings.gradle
│   ├── build.gradle
│   └── build-apk.bat                # Windows 1-click APK build script
├── .github/workflows/
│   └── build-apk.yml                # Automated GitHub Actions APK build workflow
├── public/                          # Client assets
│   ├── style.css                    # Mobile-first responsive styling
│   └── manifest.json                # PWA manifest
├── routes/
│   └── mailRoutes.js                # Dynamic SMTP & 3-mode sending engine
├── views/
│   ├── index.ejs                    # Modern responsive dashboard & modals
│   └── emailTemplates/
│       └── email.ejs                # Dynamic HTML email template
├── uploads/                         # Temporary upload directory for CSV/images
├── app.js                           # Express server entry point
├── package.json
└── README.md
```

---

## ▶️ Running the Web App

### 1. Prerequisites
* Node.js (v18+) installed.

### 2. Install & Start
```bash
# Navigate to project folder
cd 01BulkEmailSender

# Install dependencies
npm install

# Start the server
npm start
```

### 3. Open in Browser
Open [http://localhost:3000](http://localhost:3000). On your first visit, the setup modal will appear. Enter your Gmail and App Password, click **Verify & Save**, and start sending!

---

## 📦 Building the Android APK (`base.apk`)

You can generate `base.apk` in any of the following ways:

### Method 1: Automated Cloud Build via GitHub Actions (Zero Local Setup)
1. Push this repository to your GitHub account.
2. Go to the **Actions** tab in GitHub.
3. Select **"Build Android APK (base.apk)"** and click **Run workflow**.
4. Once completed, download `base.apk` directly from the workflow run artifacts!

### Method 2: Android Studio (Local)
1. Open **Android Studio**.
2. Click **Open** and select the `01BulkEmailSender/android` directory.
3. In `MainActivity.java`, set `DEFAULT_URL` to your deployed backend or your PC's local IP (e.g., `http://192.168.1.X:3000`).
4. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. The generated file will be in `android/app/build/outputs/apk/release/base.apk`.

### Method 3: 1-Click Windows Batch Script
If you have Gradle or Android command-line tools installed:
```cmd
cd 01BulkEmailSender\android
build-apk.bat
```

---

## 📄 CSV Format

Ensure your CSV contains an `email` column (case-insensitive) and an optional `name` column:

```csv
email,name
customer1@example.com,Alex
customer2@example.com,Taylor
```

---

## 💡 Best Practices & Limits

* **Gmail Limits**: Gmail typically allows up to 500 emails/day for free accounts (2,000/day for Google Workspace).
* **Anti-Ban Delay**: The built-in 2-second rate-limiting delay prevents Gmail from throttling or temporarily locking your SMTP connection.
* **Network Access in APK**: If running the Node backend on your laptop and using the APK on a phone connected to the same Wi-Fi, change `DEFAULT_URL` in `MainActivity.java` from `http://10.0.2.2:3000` to your computer's local IP (e.g. `http://192.168.1.50:3000`).

---

## 📜 License
MIT
