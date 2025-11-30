<img width="1701" height="1297" alt="image" src="https://github.com/user-attachments/assets/a4ead66c-87ad-40e2-9c5d-76ee4610a8a6" />
<img width="1700" height="1296" alt="image" src="https://github.com/user-attachments/assets/76df1d6e-567f-4b56-9b14-2db3ee626619" />
<img width="1694" height="1294" alt="image" src="https://github.com/user-attachments/assets/19444d4f-6bb5-4f44-b067-8dc8da9eb809" />
<img width="1701" height="1299" alt="image" src="https://github.com/user-attachments/assets/9fb551f5-7817-4fc7-a239-716845fb6151" />
<img width="471" height="251" alt="image" src="https://github.com/user-attachments/assets/3b07b95c-3904-451f-b665-7c2688f373de" />
<img width="691" height="308" alt="image" src="https://github.com/user-attachments/assets/5d8f4dda-e963-4e43-8f6d-eb9fb09438aa" />
<img width="1398" height="116" alt="image" src="https://github.com/user-attachments/assets/0a632e06-4af3-4396-9bd6-8ebe3c7f1bcd" />
<img width="1386" height="273" alt="image" src="https://github.com/user-attachments/assets/c5a57749-8f12-41b9-aaeb-32efe7453773" />

<div align="center">

# 🚀 PyTextNow Demo App

**A modern, feature-rich messaging application built with Next.js, integrating with TextNow API for SMS, MMS, and AI-powered voice messaging.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Preview](#-preview) • [Installation](#-installation) • [Usage](#-usage) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 💬 Messaging
- **SMS Messaging** - Send and receive text messages in real-time
- **MMS Support** - Share images and videos seamlessly
- **Voice Messages** - Record and send audio messages
- **AI Voice Messages** - Generate AI-powered voice messages using Google Gemini 2.5 Flash Preview TTS
  - 30+ preset voices to choose from
  - Customizable accent, mood, and tone
  - Natural-sounding speech synthesis

### 🎨 User Experience
- **Modern Dark Theme** - Beautiful black and electric blue UI
- **Mobile-First Design** - Optimized for all device sizes
- **Real-Time Updates** - Instant message delivery and synchronization
- **Conversation Management** - Organize and manage multiple conversations
- **Search Functionality** - Quickly find conversations

### 🔐 Security & Authentication
- **Secure User Accounts** - SQLite-based user management
- **Encrypted Credentials** - Safe storage of TextNow API credentials
- **Session Management** - Persistent login sessions

### ⚙️ Advanced Features
- **Media Proxy** - Secure authenticated media loading
- **Contact Management** - Edit and customize contact names
- **User Settings** - Manage API keys and preferences
- **Error Handling** - Robust error handling and user feedback

---

## 📸 Preview

<div align="center">

### Main Dashboard & Conversations

| Dashboard View | Conversation Interface |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/a4ead66c-87ad-40e2-9c5d-76ee4610a8a6" alt="Dashboard" width="450"/> | <img src="https://github.com/user-attachments/assets/76df1d6e-567f-4b56-9b14-2db3ee626619" alt="Conversation View" width="450"/> |

### Messaging Features

| Message Interface | AI Voice Messages |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/19444d4f-6bb5-4f44-b067-8dc8da9eb809" alt="Message Features" width="450"/> | <img src="https://github.com/user-attachments/assets/9fb551f5-7817-4fc7-a239-716845fb6151" alt="AI Voice Messages" width="450"/> |

### Settings & UI Components

| UI Components | User Settings | Additional Features |
|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/3b07b95c-3904-451f-b665-7c2688f373de" alt="UI Components" width="300"/> | <img src="https://github.com/user-attachments/assets/5d8f4dda-e963-4e43-8f6d-eb9fb09438aa" alt="Settings" width="300"/> | <img src="https://github.com/user-attachments/assets/0a632e06-4af3-4396-9bd6-8ebe3c7f1bcd" alt="Additional View" width="300"/> |

<details>
<summary><b>📱 View Additional Screenshots</b></summary>

<br/>

<div align="center">
<img src="https://github.com/user-attachments/assets/c5a57749-8f12-41b9-aaeb-32efe7453773" alt="Additional View 2" width="600"/>
</div>

</details>

</div>

---

## 🛠️ Installation

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **TextNow Account** with API credentials
- **Google Gemini API Key** (optional, for AI voice messages)

### Step 1: Clone the Repository

```bash
git clone https://github.com/zodyking/PyTextNow-Demo-App.git
cd PyTextNow-Demo-App
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage

### Getting TextNow API Credentials

1. Log in to [TextNow](https://www.textnow.com) in your browser
2. Open **Developer Tools** (F12)
3. Navigate to **Application** → **Cookies** → `https://www.textnow.com`
4. Copy the following cookie values:
   - `connect.sid` - Session ID cookie
   - `_csrf` - CSRF token cookie
5. Note your TextNow username

### Setting Up Your Account

1. **Sign Up**: Create a new account with your TextNow credentials
2. **Login**: Access your dashboard with your credentials
3. **Configure AI Voice** (Optional): Add your Google Gemini API key in User Settings for AI voice message generation

### Sending Messages

- **SMS**: Type your message and click send
- **MMS**: Click the attachment icon and select an image or video
- **Voice Message**: Click the microphone icon and record your message
- **AI Voice Message**: Click the AI voice icon, type your message, select voice/accent/mood/tone, and send

---

## 🏗️ Project Structure

```
PyTextNow-Demo-App/
├── app/
│   ├── api/                    # API routes
│   │   ├── conversations/      # Conversation management
│   │   ├── messages/           # Message fetching
│   │   ├── send-sms/           # SMS sending
│   │   ├── send-mms/           # MMS sending
│   │   ├── send-voice/         # Voice message sending
│   │   ├── gemini-tts/         # AI voice generation
│   │   ├── media-proxy/        # Authenticated media proxy
│   │   └── users/              # User management
│   ├── dashboard/              # Main dashboard
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   └── layout.tsx              # Root layout
├── components/                 # React components
│   ├── ConversationList.tsx    # Conversation sidebar
│   ├── MessageView.tsx         # Message display
│   ├── SendMessageForm.tsx     # Message input form
│   ├── UserSettings.tsx        # User settings modal
│   └── ContactNameEditor.tsx   # Contact name editor
├── lib/
│   └── db.ts                   # SQLite database setup
├── types/
│   └── index.ts                # TypeScript type definitions
└── scripts/
    └── clear-db.js             # Database cleanup utility
```

---

## 🔌 API Reference

### Internal API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/signup` | POST | Create a new user account |
| `/api/users/login` | POST | Authenticate user |
| `/api/users/get` | POST | Get user information |
| `/api/users/update` | POST | Update user settings |
| `/api/conversations` | POST | Fetch all conversations |
| `/api/messages` | POST | Get messages for a conversation |
| `/api/send-sms` | POST | Send SMS message |
| `/api/send-mms` | POST | Send MMS message (image/video) |
| `/api/send-voice` | POST | Send voice message |
| `/api/gemini-tts` | POST | Generate AI voice message |
| `/api/media-proxy` | GET | Proxy authenticated media requests |

### TextNow API Integration

This app integrates with the TextNow API following the specifications from [PyTextNow_API issue #75](https://github.com/leogomezz4t/PyTextNow_API/issues/75).

**MMS Flow:**
1. Get upload URL: `GET /api/v3/attachment_url?message_type=2`
2. Upload file: `PUT {pre-signed-url}` with raw file data
3. Send message: `POST /api/v3/send_attachment` with attachment URL

**Voice Message Flow:**
1. Get upload URL: `GET /api/v3/attachment_url?message_type=3`
2. Upload audio: `PUT {pre-signed-url}` with audio data
3. Send message: `POST /api/v3/send_attachment` with attachment URL

---

## 🎨 Technologies

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[React 18](https://reactjs.org/)** - UI library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[HeroUI](https://heroui.com/)** - Modern UI component library
- **[Better-SQLite3](https://github.com/WiseLibs/better-sqlite3)** - Fast SQLite database
- **[Google Gemini API](https://ai.google.dev/)** - AI voice generation
- **[TextNow API](https://www.textnow.com/)** - Messaging backend

---

## 🔒 Security Notes

⚠️ **Important Security Considerations:**

- This is a **demo application** for educational purposes
- Credentials are stored in SQLite database (local development)
- For production use, implement:
  - JWT token-based authentication
  - Encrypted credential storage
  - Environment variables for sensitive data
  - HTTPS-only communication
  - Rate limiting and request validation
  - Proper session management

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- [PyTextNow_API](https://github.com/leogomezz4t/PyTextNow_API) - TextNow API reference
- [TextNow](https://www.textnow.com/) - Messaging platform
- [Google Gemini](https://ai.google.dev/) - AI voice generation

---

<div align="center">

**Made with ❤️ using Next.js and TypeScript**

[⭐ Star this repo](https://github.com/zodyking/PyTextNow-Demo-App) if you find it helpful!

</div>
