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
│   ├── features/live/       # Live Reverb hooks, services, and UI
│   ├── lib/echo.ts          # Laravel Echo/Reverb client
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

-   **Real-time Interaction**: Uses Laravel Echo/Reverb for live quiz and quest participation
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
-   Laravel Echo + Reverb
-   Redux Toolkit
-   ESLint
-   PostCSS

## Environment Variables

The application uses the following environment variables (defined in `.env.example`):

-   `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL, for example `http://localhost:8000/api/v1`
-   `NEXT_PUBLIC_REVERB_APP_KEY`: Reverb app key from the Laravel backend
-   `NEXT_PUBLIC_REVERB_HOST`: Reverb websocket host, for example `localhost`
-   `NEXT_PUBLIC_REVERB_PORT`: Reverb websocket port, usually `8080` locally
-   `NEXT_PUBLIC_REVERB_SCHEME`: `http` for local development or `https` in production

## Development Scripts

-   `yarn dev`: Start development server
-   `yarn build`: Build the application for production
-   `yarn start`: Start production server
-   `yarn lint`: Run ESLint
