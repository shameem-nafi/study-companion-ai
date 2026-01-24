# Study Companion AI - Your Personalized Study Organizer

Study Companion AI is an intelligent study organization platform that helps students manage their academic workload with AI-powered assistance. Organize your studies into departments, courses, and topics with built-in revision tracking and global search capabilities.

## Core Features

### 1. Hierarchical Content Management
- **Departments**: Top-level categories (e.g., Computer Science, Mathematics)
- **Courses**: Belong to departments with optional course codes
- **Topics**: Include name, description, tags, and completion status
- **Resources**: Attach PDFs, links, notes, and YouTube videos to topics

### 2. Section-Based Dashboard UI
- Clean, organized interface with separate sections for each level
- Smart navigation: Select Department → View Courses → View Topics
- Strong visual hierarchy with breadcrumb navigation
- No cluttered nested layouts - everything is clearly structured

### 3. Global Search Bar
- Search by course or topic name
- Results display full hierarchy (Department → Course → Topic)
- Direct navigation to search results

### 4. Revision Tracking
- Displays revision status as readable text (e.g., "Revised 1 time", "2 revisions")
- Track revision count and last revision date per topic
- Clear text-based display without intrusive buttons

### 5. AI Study Assistant
- In-page chatbot accessible from all sections
- Provides study schedule suggestions and revision recommendations
- Respects your language preference (English/Bengali)
- Markdown-formatted responses for better readability

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

