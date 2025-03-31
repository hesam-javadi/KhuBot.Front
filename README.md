# KhuBot

A conversational AI chatbot application built for Kharazmi University students and alumni. This project provides a React-based web interface for interacting with an AI assistant tailored for the university community.

## 📋 Features

- **AI Chat Interface**: Modern chat interface for interacting with the KhuBot AI assistant
- **Persian Language Support**: Full support for Persian (Farsi) language with RTL text direction
- **User Authentication**: Secure login system for students and alumni
- **Responsive Design**: Works on all devices from desktops to mobile phones
- **Markdown Support**: Display rich text with Markdown formatting in chat responses

## 🚀 Technologies

### Frontend
- React 19
- TypeScript
- Vite
- React Router for navigation
- Tailwind CSS for styling
- Headless UI for accessible components
- i18next for internationalization
- Axios for API requests

## 📦 Project Structure

```
KhuBot/
├── frontend/                # Frontend React application
│   ├── src/
│   │   ├── assets/          # Static assets like images
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Public assets
│   └── ...                  # Configuration files
└── ...                      # Backend and other configurations
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/KhuBot.git
   cd KhuBot
   ```

2. Install dependencies
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Mobile Testing

To test the application on a mobile device:

1. Connect your computer and mobile device to the same WiFi network
2. Find your computer's IP address
3. Update the Vite configuration to use `host: '0.0.0.0'`
4. Access the app from your mobile device using `http://your-ip-address:5173`

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📜 License

This project is available for Kharazmi University students and alumni to learn from and contribute to.

## 🙏 Acknowledgements

- Kharazmi University for supporting this educational project
- All contributors and students who have participated in its development 