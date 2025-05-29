# Odyssey
🔗 https://odyssey-seven-chi.vercel.app/

Odyssey is a full-stack, AI-enhanced travel itinerary builder that lets you discover destinations, generate personalized day-by-day plans, track expenses, and manage all aspects of your journey in one place.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See **Deployment** for notes on how to deploy the project on a live system.

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16.x or higher) and npm
- MongoDB (local or Atlas)
- A Google Maps API key
- A Google Gemini API key
- The `jsonwebtoken` (JWT) secret for auth

### Installing

1. Clone the repository:

   ```bash
   git clone https://github.com/xxfmin/odyssey.git
   cd odyssey
   ```

2. Install dependencies

   ```bash
   npm run install
   ```

3. Create a `.env` file in the root of the project with the following variables:

   ```env
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_KEY=your-google_gemini_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000` to view the app.

## Deployment

Odyssey can be deployed to Vercel (frontend) and a Node.js hosting service (backend). Ensure environment variables are set in your hosting dashboards:

1. Push the frontend to Vercel with the `NEXT_PUBLIC_*` keys.
2. Deploy the backend API to Heroku or another provider, setting `MONGODB_URL`
3. Point the frontend API URL to your live backend.

## Built With

- [Next.js](https://nextjs.org/) - Frontend framework
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [MongoDB & Mongoose](https://mongoosejs.com/) - Database
- [Google Maps API](https://developers.google.com/maps) - Interactive maps
- [Google Gemini API](https://ai.google.dev/api?lang=node) – AI-powered suggestions
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) – JWT generation/verification

## Authors

- **Felipe Min** - [xxfmin](https://github.com/xxfmin)
