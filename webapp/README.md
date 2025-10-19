# Prepify Frontend

A modern, AI-powered career intelligence platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Firebase Auth with email/password
- 📊 **Analysis Dashboard**: View all your career analyses
- 🎯 **Resume Analysis**: Upload and analyze your resume against job descriptions
- 🎤 **Voice Interviews**: AI-powered mock interviews with Vapi
- 📈 **Detailed Feedback**: Comprehensive interview performance analysis
- 🎨 **Modern UI**: Clean, responsive design with dark theme

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Voice AI**: Vapi AI for interviews
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository
2. Navigate to the webapp directory:
   ```bash
   cd webapp
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env.local` file in the webapp directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Firebase Admin (Server-side)
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PROJECT_ID=your_project_id

   # Vapi Configuration
   NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
   VAPI_SERVER_SECRET=your_vapi_server_secret

   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
webapp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Protected pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── AuthForm.tsx      # Authentication form
│   ├── Navbar.tsx        # Navigation component
│   ├── AnalysisCard.tsx  # Analysis card component
│   └── ...
├── lib/                  # Utility libraries
│   ├── actions/          # Server actions
│   ├── firebase/         # Firebase configuration
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── constants/            # Application constants
```

## Key Pages

### Dashboard (`/`)
- Displays all user analyses
- Quick access to create new analysis
- Analysis history with status indicators

### Analysis (`/analyze`)
- Form to submit resume, job description, and social profiles
- Real-time validation and error handling
- Progress indicators during submission

### Report (`/report/[id]`)
- Detailed analysis results
- Match score visualization
- Skill gaps and strengths breakdown
- Interview focus areas
- Direct link to start mock interview

### Interview (`/interview/[id]`)
- Voice-powered mock interview
- Real-time conversation with AI
- Dynamic follow-up questions
- Interview controls (mute, end call)

### Feedback (`/feedback/[id]`)
- Comprehensive interview feedback
- Performance scoring with visual indicators
- Detailed analysis and recommendations
- Next steps and action items

## API Routes

### `/api/analysis`
- **POST**: Create new career analysis
- Validates input and saves to Firestore
- Returns analysis ID for navigation

### `/api/interview`
- **POST**: Generate interview questions
- Creates interview session with personalized questions
- Returns interview ID for voice session

### `/api/feedback`
- **POST**: Analyze interview transcript
- Generates detailed feedback report
- Updates interview status

### `/api/interview/followup`
- **POST**: Generate dynamic follow-up questions
- Real-time question generation during interview
- Context-aware conversation flow

## Styling

The application uses a custom design system built on Tailwind CSS:

- **Dark Theme**: Consistent dark theme throughout
- **Custom Colors**: Primary, success, destructive color schemes
- **Components**: Reusable component classes
- **Responsive**: Mobile-first responsive design
- **Animations**: Smooth transitions and loading states

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for version control

## Deployment

The frontend is designed to be deployed on Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

## Backend Integration

The frontend is designed to work with a Python FastAPI backend:

- Analysis endpoint for resume/job analysis
- Interview generation with AI
- Feedback analysis with detailed insights
- Real-time follow-up question generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.