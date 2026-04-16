# BdREN MindSpear Frontend

## Getting Started

**Run the development server:**

```bash
yarn install

# then

yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```
bdren_eduquest_frontend/
├── .github/                 # GitHub workflows and configurations
├── .next/                   # Next.js build output (git-ignored)
├── .vscode/                 # VS Code settings
├── docs/                    # Documentation files
├── public/                  # Static assets
├── src/                     # Source code
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Authentication-related pages
│   │   ├── (protected)/     # Protected routes
│   │   ├── (public)/        # Public pages
│   │   ├── api/             # API routes
│   │   ├── library/         # Library-related pages
│   │   ├── ClientLayout.tsx # Client-side layout
│   │   ├── error.tsx        # Error page
│   │   ├── layout.tsx       # Root layout
│   │   ├── not-found.tsx    # 404 page
│   │   ├── ProtectedRoute.tsx # Route protection component
│   │   └── providers.tsx    # Application providers
│   ├── assets/              # Static assets (images, icons, etc.)
│   ├── components/          # Reusable React components
│   │   ├── Auth/            # Authentication components
│   │   ├── blocks/          # Content blocks
│   │   ├── Breadcrumbs/     # Breadcrumb navigation
│   │   ├── Chart/           # Chart components
│   │   ├── Dashboard/       # Dashboard components
│   │   ├── editor/          # Text editors
│   │   ├── ErrorComponent/  # Error display components
│   │   ├── FormElements/    # Form elements
│   │   ├── Layouts/         # Layout components
│   │   ├── Library/         # Library components
│   │   ├── Liveui/          # Live UI components
│   │   ├── loadding/        # Loading components (typo in directory name)
│   │   ├── loading/         # Loading components
│   │   ├── QuestionBank/    # Question bank components
│   │   ├── questions/       # Question components
│   │   ├── QuestReports/    # Quest report components
│   │   ├── QuizReports/     # Quiz report components
│   │   ├── ResultComponent/ # Result display components
│   │   └── ui/              # UI components
│   ├── constants/           # Application constants
│   ├── css/                 # CSS stylesheets
│   ├── data/                # Static data files
│   ├── fonts/               # Font files
│   ├── hooks/               # Custom React hooks
│   ├── interfaces/          # TypeScript interfaces
│   ├── lib/                 # Utility libraries and helper functions
│   ├── services/            # Service layer (API calls, business logic)
│   │   ├── redux/           # Redux store configuration
│   │   └── surveyService.ts # Survey service
│   ├── socket/              # Socket.IO related files
│   │   ├── quest-socket.ts  # Quest socket implementation
│   │   └── socket.ts        # General socket implementation
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── views/               # Page-level components organized by feature
│       ├── dashboard/       # Dashboard views
│       ├── discover/        # Discovery views
│       ├── quest/           # Quest-related views
│       ├── survey/          # Survey views
│       └── web/             # Web-related views
├── .editorconfig            # Editor configuration
├── .env.example             # Environment variables example
├── .gitignore               # Git ignore rules
├── ecosystem.config.js      # PM2 ecosystem configuration
├── eslint.config.mjs        # ESLint configuration
├── favicon.ico              # Favicon
├── next.config.ts           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── README.md                # Project documentation
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## Key Features

-   **Real-time Interaction**: Uses Socket.IO for live quest participation
-   **Authentication**: Protected routes and authentication flows
-   **Quest Management**: Create, join, start, and complete educational quests
-   **Question Types**: Support for various question formats (multiple choice, ranking, short answers, etc.)
-   **Leaderboards**: Real-time leaderboard updates
-   **Responsive Design**: Mobile-friendly UI using Tailwind CSS
-   **State Management**: Redux for global state management
-   **Form Handling**: Comprehensive form components and validation

## Technologies Used

-   Next.js 14 (App Router)
-   React 18
-   TypeScript
-   Tailwind CSS
-   Socket.IO Client
-   Redux Toolkit
-   ESLint
-   PostCSS

## Environment Variables

The application uses the following environment variables (defined in `.env.example`):

-   `NEXT_PUBLIC_SOCKET_URL`: Socket server URL (default: "https://quest.bdren.net.bd")
-   `NEXT_PUBLIC_SOCKET_PATH`: Socket path (default: "/socket.io")

## Development Scripts

-   `yarn dev`: Start development server
-   `yarn build`: Build the application for production
-   `yarn start`: Start production server
-   `yarn lint`: Run ESLint
