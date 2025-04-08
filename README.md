# New Tube - Youtube Clone

This repository contains the source code for a YouTube clone developed using Next.js 15, React 19, tRPC, Drizzle ORM, Mux, AI features, PostgreSQL, and Tailwind CSS. The clone allows for video upload, playback, and management, as well as automatic thumbnail and transcription generation. Additionally, it features an interactive comment system, subscription management, and a suite of tools for content creators.

You can access the deployed app here: [New Tube - Youtube Clone](https://new-tube-inky.vercel.app/)

## Key Features
- **Advanced Video Player**: Interactive playback and quality controls.
- **Real-time Video Processing with Mux**: Optimized video upload and processing.
- **Automatic Video Transcription**: Real-time subtitle generation.
- **Smart Thumbnail Generation**: Automatic thumbnail creation.
- **AI-Powered Title and Description Generation**: AI-driven enhancements for better visibility.
- **Creator Studio**: Video metrics and performance analytics for creators.
- **Custom Playlist Management**: Organize and curate content in playlists.
- **Responsive Design**: Mobile-first and responsive design for all devices.
- **Interactive Comment System**: Comments with reactions and replies.
- **Like and Subscription System**: Engage with content through likes and subscriptions.
- **Watch History Tracking**: Keep track of videos viewed by the user.
- **Secure Authentication**: Login and registration system for users and creators.
- **Modular Architecture**: Component-based system for scalability and flexibility.
- **Vercel Deployment**: Quick and efficient deployment with Next.js and Vercel.

## Main Technologies and Dependencies
- **Next.js 15**: React framework used for building both the frontend and backend with advanced optimizations and server-side rendering.
- **React 19**: Used to build interactive and fast user interfaces.
- **tRPC**: Provides secure and type-safe APIs for efficient communication between frontend and backend.
- **Mux**: Real-time video processing and smart thumbnail generation.
- **Drizzle ORM**: ORM for efficient database management with PostgreSQL.
- **PostgreSQL**: Relational database for storing user data, videos, comments, and more.
- **AI-powered Features**: AI-driven automatic generation of titles, descriptions.
- **TailwindCSS**: Utility-first CSS framework for creating modern, responsive UI.
- **Clerk**: Authentication management for users.
- **Shadcn UI**: A library of customizable, accessible, high-quality UI components built on top of Radix UI, offering enhanced flexibility and style options.
- **Zod**: Data validation and schema enforcement for ensuring data integrity.
- **Uploadthing**: Cloud file upload service for managing image and file uploads in the application.

## Full List of Dependencies

```json
  "dependencies": {
    "@clerk/nextjs": "6.10.3",
    "@hookform/resolvers": "^4.1.3",
    "@mux/mux-node": "9.0.1",
    "@mux/mux-player-react": "3.2.4",
    "@mux/mux-uploader-react": "1.1.1",
    "@neondatabase/serverless": "0.10.4",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-aspect-ratio": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-collapsible": "^1.1.3",
    "@radix-ui/react-context-menu": "^2.2.6",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-hover-card": "^1.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-menubar": "^1.1.6",
    "@radix-ui/react-navigation-menu": "^1.2.5",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-radio-group": "^1.2.3",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slider": "^1.2.3",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-toggle": "^1.1.2",
    "@radix-ui/react-toggle-group": "^1.1.2",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@tanstack/react-query": "5.65.1",
    "@trpc/client": "11.0.0-rc.730",
    "@trpc/react-query": "11.0.0-rc.730",
    "@trpc/server": "11.0.0-rc.730",
    "@uploadthing/react": "7.1.5",
    "@upstash/ratelimit": "2.0.5",
    "@upstash/redis": "1.34.3",
    "@upstash/workflow": "0.2.6",
    "class-variance-authority": "^0.7.1",
    "client-only": "0.0.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "concurrently": "9.1.2",
    "date-fns": "^3.6.0",
    "dotenv": "16.4.7",
    "drizzle-orm": "0.39.0",
    "drizzle-zod": "0.7.0",
    "embla-carousel-react": "^8.5.2",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.479.0",
    "next": "15.1.6",
    "next-themes": "^0.4.4",
    "react": "^19.0.0",
    "react-day-picker": "^8.10.1",
    "react-dom": "^19.0.0",
    "react-error-boundary": "5.0.0",
    "react-hook-form": "^7.54.2",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.1",
    "server-only": "0.0.1",
    "sonner": "^2.0.1",
    "superjson": "2.2.2",
    "svix": "1.45.1",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7",
    "uploadthing": "7.4.4",
    "vaul": "^1.1.2",
    "zod": "3.24.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "drizzle-kit": "0.30.3",
    "eslint": "^9",
    "eslint-config-next": "15.1.6",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "tsx": "4.19.2",
    "typescript": "^5"
  }
```
## Setup and Installation

### Clone the Repository

1. Clone this repository to your local machine:

```sh
git clone "https://github.com/JairGuzman1810/youtube-clone"
```
2. Navigate into the project directory:

```sh
cd youtube-clone
```

### Install Dependencies

1. Run the following command to install all necessary dependencies:

```sh
bun install
```

## Configuring Environment Variables

1. Create a `.env` file in the root of your project and add the following environment variables (replace with your own values):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
SIGNING_SECRET=your_clerk_signing_secret

DATABASE_URL="mysql://username:password@localhost:3306/your_database_name"

UPSTASH_REDIS_REST_URL=https://your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
MUX_WEBHOOK_SECRET=your_mux_webhook_secret

UPLOADTHING_TOKEN=your_uploadthing_token

QSTASH_TOKEN=your_qstash_token
UPSTASH_WORKFLOW_URL=https://your-upstash-workflow-url
QSTASH_CURRENT_SIGNING_KEY=your_qstash_current_signing_key
QSTASH_NEXT_SIGNING_KEY=your_qstash_next_signing_key

OPEN_ROUTER_API_KEY=your_open_router_api_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```
2. Replace the placeholders (e.g., `your_publishable_key`, `your_secret_key`) with your actual credentials.

## Configuring Scripts in `package.json`

1. In your `package.json`, replace the script segment with the following:

```json
"scripts": {
  "dev:webhook": "ngrok http --url=[YOUR_NGROK_DOMAIN_URL] 3000",
  "dev:all": "concurrently \"npm run dev\" \"npm run dev:webhook\"",
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```
Replace [YOUR_NGROK_DOMAIN_URL] with your actual Ngrok URL (e.g., https://example.ngrok.io).

## Running the Application

1. Once you've installed all dependencies and configured your environment variables, you can run the application using the following command:

```sh
bun dev:all
```

## Screenshots of the Application

<div style="display:flex; flex-wrap:wrap; justify-content:space-between;">
    <img src="https://github.com/JairGuzman1810/youtube-clone/blob/master/resources/App-1.jpeg" alt="Screenshot 1" width="180"/>
    <img src="https://github.com/JairGuzman1810/youtube-clone/blob/master/resources/App-2.jpeg" alt="Screenshot 2" width="180"/>
    <img src="https://github.com/JairGuzman1810/youtube-clone/blob/master/resources/App-3.jpeg" alt="Screenshot 3" width="180"/>
</div>
<div style="display:flex; flex-wrap:wrap; justify-content:space-between;">
    <img src="https://github.com/JairGuzman1810/youtube-clone/blob/master/resources/App-4.jpeg" alt="Screenshot 4" width="180"/>
    <img src="https://github.com/JairGuzman1810/youtube-clone/blob/master/resources/App-5.jpeg" alt="Screenshot 5" width="180"/>
    <img src="https://github.com/JairGuzman1810/youtube-clone/blob/master/resources/App-6.jpeg" alt="Screenshot 6" width="180"/>
</div>
<div style="display:flex; flex-wrap:wrap; justify-content:space-between;">
    <img src="https://github.com/JairGuzman1810/youtube-clone/blob/master/resources/App-7.jpeg" alt="Screenshot 7" width="180"/>
    <img src="https://github.com/JairGuzman1810/youtube-clone/blob/master/resources/App-8.jpeg" alt="Screenshot 8" width="180"/>
    <img src="https://github.com/JairGuzman1810/youtube-clone/blob/master/resources/App-9.jpeg" alt="Screenshot 9" width="180"/>
</div>



