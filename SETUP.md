# ManoVaktha - MongoDB Integrated Wellness Application

A spiritual wellness application that provides guidance from Hindu scriptures using AI, now fully integrated with MongoDB for data persistence.

## Features

- 🧘 **Manuscript Solutions**: Get spiritual guidance from Puranas and Vedas
- 🌱 **Wellness Journey**: Structured multi-day healing programs
- 💬 **AI Chat**: Interactive conversations with spiritual guidance
- 📚 **Save & History**: Save favorite solutions and track your journey
- 🌍 **Multi-language**: Support for English, Hindi, and Telugu
- 🔐 **User Authentication**: Secure login and personalized experience
- 📊 **MongoDB Integration**: All data persisted in MongoDB with offline fallback

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI**: Google Gemini API for content generation
- **Styling**: Tailwind CSS (custom colors)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd base_manovatha_898
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Gemini AI API Key
VITE_API_KEY=your_gemini_api_key_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/manovaktha

# JWT Secret (use a strong secret in production)
JWT_SECRET=your_jwt_secret_key_here

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
PORT=3001

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get the connection string
3. Update `MONGODB_URI` in `.env` file

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `VITE_API_KEY`

## Running the Application

### Development Mode

1. **Start the Backend Server**:
   ```bash
   npm run server:dev
   ```
   Server will run on http://localhost:3001

2. **Start the Frontend** (in a new terminal):
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### Production Mode

1. **Build the Frontend**:
   ```bash
   npm run build
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

## Database Schema

The application uses the following MongoDB collections:

- **users**: User accounts and preferences
- **manuscripthistories**: Saved manuscript query results
- **savedsolutions**: User's bookmarked solutions
- **journeyplans**: Wellness journey plans and progress
- **chatsessions**: Chat history and session data

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update user preferences
- `PUT /api/auth/profile` - Update user profile

### Manuscript History
- `GET /api/manuscript` - Get user's manuscript history
- `POST /api/manuscript` - Save new manuscript entry
- `DELETE /api/manuscript/:id` - Delete manuscript entry
- `DELETE /api/manuscript` - Clear all history

### Saved Solutions
- `GET /api/saved-solutions` - Get saved solutions
- `POST /api/saved-solutions` - Save a solution
- `DELETE /api/saved-solutions/:id` - Remove saved solution
- `PATCH /api/saved-solutions/:id/favorite` - Toggle favorite

### Journey Plans
- `GET /api/journey-plans` - Get journey plans
- `GET /api/journey-plans/current` - Get active journey
- `POST /api/journey-plans` - Create new journey
- `PATCH /api/journey-plans/:id/days/:dayNumber/complete` - Mark day complete

### Chat Sessions
- `GET /api/chat-sessions` - Get chat sessions
- `POST /api/chat-sessions` - Create new session
- `POST /api/chat-sessions/:id/messages` - Add message

## Migration from localStorage

The application automatically migrates existing localStorage data to MongoDB when a user logs in. This includes:

- Manuscript history
- Saved solutions  
- Journey plans

Users can continue using the app offline with localStorage fallback if not authenticated.

## Features

### User Authentication
- Secure registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Session management

### Data Persistence
- MongoDB for authenticated users
- localStorage fallback for offline use
- Automatic data migration
- Error handling with graceful fallbacks

### Multi-language Support
- English, Hindi, Telugu
- AI responses in user's preferred language
- RTL support for applicable languages

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Custom color palette inspired by traditional themes

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity for cloud MongoDB

2. **Gemini API Errors**
   - Verify API key is correct
   - Check API quotas and limits
   - Ensure API key has necessary permissions

3. **CORS Issues**
   - Verify `FRONTEND_URL` in `.env`
   - Check if both frontend and backend are running

4. **Authentication Issues**
   - Clear browser localStorage/cookies
   - Verify JWT secret configuration
   - Check token expiration

### Health Check

Visit http://localhost:3001/api/health to verify the backend is running correctly.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open a GitHub issue or contact the development team.