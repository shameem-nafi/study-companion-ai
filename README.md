# Study Companion AI - Your Personal Study To-Do List

Study Companion AI is an intelligent to-do list application designed specifically for study management. Organize your study tasks, track progress, and get AI-powered assistance to help you stay on top of your academic goals.

## Features

- ✅ **Easy Task Management**: Create, organize, and manage your study tasks effortlessly
- 🤖 **AI Study Assistant**: Chat with an AI-powered assistant for study help and explanations
- 📊 **Progress Tracking**: Monitor completion status and see your study progress
- 🎯 **Priority-Based Organization**: Organize tasks by priority and subject
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌙 **Dark Mode**: Easy on the eyes with built-in dark mode support
- 🌍 **Multi-language**: Support for English and Bengali

## Getting Started

### Prerequisites

- Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd study-companion-ai

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

The application will open at `http://localhost:5173`

### Building for Production

```sh
npm run build
```

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn-ui** - High-quality UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend and authentication
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **i18next** - Internationalization

## How to Edit

### Local Development with IDE

Clone the repository and edit files in your preferred IDE:

```sh
git clone <YOUR_GIT_URL>
cd study-companion-ai
npm install
npm run dev
```

### Edit on GitHub

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon) at the top right
- Make your changes and commit

### Use GitHub Codespaces

- Click the "Code" button (green) on the repository
- Select the "Codespaces" tab
- Click "New codespace"
- Edit files and commit changes

## Deployment

### Deploy to Vercel

The cleanest way to deploy is using Vercel:

1. Push your code to GitHub
2. Import the repository at [vercel.com](https://vercel.com)
3. Vercel will auto-detect it as a Vite React app
4. Set environment variables (Supabase keys)
5. Click Deploy

### Deploy to Other Platforms

This is a standard React + Vite application and can be deployed to:

- **Netlify** - Connect your GitHub repo and deploy automatically
- **GitHub Pages** - Use `npm run build` and deploy the `dist` folder
- **Traditional Hosting** - Build the project and serve the `dist` folder

## Environment Variables

Create a `.env.local` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

This project is open source.

## Support

For issues, questions, or feedback, please open a GitHub issue.

---

**Built with ❤️ for students and learners everywhere**

