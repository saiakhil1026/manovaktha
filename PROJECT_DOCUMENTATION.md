# ManoVaktha - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Component Documentation](#component-documentation)
10. [Services Documentation](#services-documentation)
11. [Authentication System](#authentication-system)
12. [Multi-language Support](#multi-language-support)
13. [Offline Support](#offline-support)
14. [Development Setup](#development-setup)
15. [Deployment Guide](#deployment-guide)

---

## Project Overview

**ManoVaktha** is a comprehensive spiritual wellness application that provides personalized guidance from Hindu scriptures using AI technology. The name "ManoVaktha" translates to "The Speaker of the Mind," embodying its role as a spiritual guide that helps users find solutions to life's challenges through ancient wisdom.

### Key Features
- 🧘 **Manuscript Solutions**: AI-powered guidance from Bhagavad Gita and Hindu Puranas
- 🌱 **Wellness Journey**: Structured multi-day healing programs
- 💬 **Interactive Chat**: Real-time spiritual guidance conversations
- 📚 **Save & History**: Personal collection of wisdom and session tracking
- 🌍 **Multi-language Support**: English, Hindi, and Telugu
- 🔐 **User Authentication**: Secure JWT-based authentication
- 📱 **Responsive Design**: Mobile-first approach with sacred manuscript theme

---

## Architecture Overview

ManoVaktha follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React +      │───▶│   (Node.js +    │───▶│   (MongoDB)     │
│   TypeScript)   │    │   Express)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   API Routes    │    │   Collections   │
│   Contexts      │    │   Middleware    │    │   Schemas       │
│   Services      │    │   Models        │    │   Indexes       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### External Services
- **Google Gemini AI**: Content generation and chat functionality
- **MongoDB Atlas**: Cloud database (optional)
- **JWT**: Authentication tokens

---

## Technology Stack

### Frontend Technologies
- **React 19.1.1**: Modern React with latest features
- **TypeScript 5.8.2**: Type-safe development
- **Vite 6.2.0**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Three.js 0.132.2**: 3D graphics for visual elements
- **Axios**: HTTP client for API communication

### Backend Technologies
- **Node.js**: JavaScript runtime
- **Express.js 4.18.2**: Web application framework
- **MongoDB 8.0.0**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT (jsonwebtoken 9.0.2)**: Authentication
- **bcryptjs 2.4.3**: Password hashing
- **CORS 2.8.5**: Cross-origin resource sharing
- **dotenv 16.3.1**: Environment variable management

### AI & External APIs
- **Google Gemini AI (@google/genai 1.15.0)**: AI content generation
- **Gemini 2.5 Flash**: Primary AI model for responses

### Development Tools
- **Nodemon**: Development server auto-restart
- **ESM modules**: Modern JavaScript module system
- **TypeScript configuration**: Strict type checking

---

## Project Structure

```
d:\base_manovatha_898\
├── components/                 # React UI components
│   ├── icons/                 # SVG icon components
│   │   ├── BookmarkIcon.tsx
│   │   ├── CheckCircleIcon.tsx
│   │   ├── CloseIcon.tsx
│   │   ├── GlobeIcon.tsx
│   │   ├── LotusIcon.tsx
│   │   ├── ManoVakthaIcon.tsx
│   │   ├── SendIcon.tsx
│   │   ├── SpeakerOffIcon.tsx
│   │   ├── SpeakerOnIcon.tsx
│   │   └── StarIcon.tsx
│   ├── AnalysisView.tsx       # Stress/anxiety analysis
│   ├── AuthView.tsx           # Login/register forms
│   ├── DoctorsView.tsx        # Professional consultation
│   ├── Header.tsx             # Main navigation header
│   ├── HistoryView.tsx        # Session history display
│   ├── IntroAnimation.tsx     # Welcome animation
│   ├── JourneyDashboard.tsx   # Journey progress tracking
│   ├── JourneySession.tsx     # Individual journey session
│   ├── JourneyView.tsx        # Wellness journey main view
│   ├── LanguageSwitcher.tsx   # Language selection
│   ├── Loader.tsx             # Loading animations
│   ├── MediaView.tsx          # Video recommendations
│   ├── ProblemInput.tsx       # Problem description form
│   ├── ProfileDropdown.tsx    # User profile menu
│   ├── ProfileSettingsModal.tsx # User settings modal
│   ├── QuickChatView.tsx      # Quick chat interface
│   ├── SavedView.tsx          # Saved solutions display
│   ├── SolutionCard.tsx       # Individual solution display
│   ├── StoryCard.tsx          # Story display component
│   ├── TempChatView.tsx       # Temporary chat view
│   └── Welcome.tsx            # Welcome message
├── contexts/                   # React contexts
│   ├── AuthContext.tsx        # Authentication state
│   └── LanguageContext.tsx    # Language/i18n state
├── locales/                   # Internationalization
│   ├── en.json               # English translations
│   ├── hi.json               # Hindi translations
│   └── te.json               # Telugu translations
├── server/                    # Backend application
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   └── database.js      # Database middleware
│   ├── models/              # MongoDB schemas
│   │   ├── ChatHistory.js   # Chat session model
│   │   ├── JourneyPlan.js   # Journey plan model
│   │   ├── ManuscriptHistory.js # Manuscript query model
│   │   ├── SavedSolution.js # Saved solution model
│   │   ├── User.js          # User model
│   │   └── index.js         # Model exports
│   ├── routes/              # API endpoints
│   │   ├── auth.js          # Authentication routes
│   │   ├── chatSessions.js  # Chat management
│   │   ├── journeyPlans.js  # Journey management
│   │   ├── manuscript.js    # Manuscript queries
│   │   └── savedSolutions.js # Saved solutions
│   └── server.js            # Main server file
├── services/                 # Frontend services
│   ├── apiClient.ts         # HTTP client wrapper
│   ├── authService.ts       # Authentication service
│   ├── chatService.ts       # Chat functionality
│   ├── errorHandler.ts      # Error handling
│   ├── geminiService.ts     # AI service integration
│   ├── index.ts             # Service exports
│   ├── journeyService.ts    # Journey management
│   ├── manuscriptService.ts # Manuscript functionality
│   ├── offlineSyncService.ts # Offline data sync
│   └── savedSolutionsService.ts # Saved solutions
├── src/
│   └── vite-env.d.ts        # Vite type definitions
├── test/
│   └── db-test.js           # Database connectivity test
├── App.tsx                  # Main React application
├── index.html               # HTML entry point
├── index.tsx                # React entry point
├── types.ts                 # TypeScript type definitions
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies
├── README.md                # Basic project info
├── SETUP.md                 # Detailed setup guide
└── metadata.json            # Project metadata
```

---

## Frontend Architecture

### Component Hierarchy

```
App.tsx (Root)
├── IntroAnimation.tsx (Initial screen)
├── AuthView.tsx (Authentication)
└── Main Application
    ├── Header.tsx
    │   ├── LanguageSwitcher.tsx
    │   └── ProfileDropdown.tsx
    ├── View Components (Conditional Rendering)
    │   ├── Welcome.tsx + ProblemInput.tsx (Manuscript)
    │   ├── JourneyView.tsx
    │   │   ├── JourneyDashboard.tsx
    │   │   └── JourneySession.tsx
    │   ├── AnalysisView.tsx
    │   ├── QuickChatView.tsx
    │   ├── MediaView.tsx
    │   ├── DoctorsView.tsx
    │   ├── HistoryView.tsx
    │   └── SavedView.tsx
    ├── SolutionCard.tsx (Multiple instances)
    ├── Loader.tsx
    └── ProfileSettingsModal.tsx
```

### State Management
- **React Context API**: Global state management
- **useState/useEffect**: Local component state
- **AuthContext**: User authentication and profile
- **LanguageContext**: Internationalization and language switching

### Routing Strategy
- Single-page application with view-based navigation
- State-driven view switching instead of traditional routing
- Maintains application state across view changes

---

## Backend Architecture

### API Structure
```
/api
├── /auth               # Authentication endpoints
├── /manuscript         # Manuscript query management
├── /saved-solutions    # Saved solutions management
├── /journey-plans      # Wellness journey management
├── /chat-sessions      # Chat functionality
└── /health            # Health check endpoint
```

### Middleware Stack
1. **CORS**: Cross-origin resource sharing
2. **JSON Parser**: Request body parsing
3. **Request Logger**: Request logging middleware
4. **Authentication**: JWT token verification
5. **Error Handler**: Global error handling

### Database Connection
- **MongoDB**: Primary database
- **Mongoose**: ODM for MongoDB
- **Connection Pooling**: Automatic connection management
- **Error Handling**: Graceful fallback mechanisms

---

## Database Schema

### Collections Overview

#### 1. Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  preferences: {
    language: String (enum: ['English', 'Hindi', 'Telugu']),
    theme: String (enum: ['light', 'dark'])
  },
  profile: {
    avatar: String,
    bio: String,
    dateOfBirth: Date,
    phone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. ManuscriptHistory Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  problem: String (required),
  solutions: [Solution],
  language: String,
  tags: [String],
  createdAt: Date
}
```

#### 3. SavedSolutions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  solution: Solution,
  isFavorite: Boolean,
  tags: [String],
  notes: String,
  createdAt: Date
}
```

#### 4. JourneyPlans Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  title: String,
  description: String,
  originalProblem: String,
  days: [JourneyDay],
  status: String (enum: ['active', 'completed', 'paused']),
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. ChatHistory Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  sessionId: String,
  messages: [ChatMessage],
  sessionType: String (enum: ['quick', 'journey', 'general']),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
**Purpose**: User registration
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "language": "English" | "Hindi" | "Telugu"
}
```
**Response**: User object + JWT token

#### POST /api/auth/login
**Purpose**: User authentication
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**: User object + JWT token

#### GET /api/auth/me
**Purpose**: Get current user information
**Headers**: Authorization: Bearer [token]
**Response**: Current user object

#### PUT /api/auth/preferences
**Purpose**: Update user preferences
```json
{
  "language": "English" | "Hindi" | "Telugu",
  "theme": "light" | "dark"
}
```

#### PUT /api/auth/profile
**Purpose**: Update user profile
```json
{
  "name": "string",
  "bio": "string",
  "phone": "string",
  "dateOfBirth": "string"
}
```

### Manuscript Endpoints

#### GET /api/manuscript
**Purpose**: Get user's manuscript history
**Response**: Array of manuscript history items

#### POST /api/manuscript
**Purpose**: Save new manuscript query
```json
{
  "problem": "string",
  "solutions": [Solution],
  "language": "string",
  "tags": ["string"]
}
```

#### DELETE /api/manuscript/:id
**Purpose**: Delete specific manuscript entry

#### DELETE /api/manuscript
**Purpose**: Clear all manuscript history

### Saved Solutions Endpoints

#### GET /api/saved-solutions
**Purpose**: Get user's saved solutions
**Response**: Array of saved solutions

#### POST /api/saved-solutions
**Purpose**: Save a new solution
```json
{
  "solution": Solution,
  "tags": ["string"],
  "notes": "string"
}
```

#### DELETE /api/saved-solutions/:id
**Purpose**: Remove saved solution

#### PATCH /api/saved-solutions/:id/favorite
**Purpose**: Toggle favorite status

### Journey Plans Endpoints

#### GET /api/journey-plans
**Purpose**: Get user's journey plans
**Response**: Array of journey plans

#### GET /api/journey-plans/current
**Purpose**: Get active journey plan
**Response**: Current active journey

#### POST /api/journey-plans
**Purpose**: Create new journey plan
```json
{
  "title": "string",
  "description": "string",
  "originalProblem": "string",
  "days": [JourneyDay]
}
```

#### PATCH /api/journey-plans/:id/days/:dayNumber/complete
**Purpose**: Mark specific day as complete

### Chat Sessions Endpoints

#### GET /api/chat-sessions
**Purpose**: Get user's chat sessions
**Response**: Array of chat sessions

#### POST /api/chat-sessions
**Purpose**: Create new chat session
```json
{
  "sessionType": "quick" | "journey" | "general"
}
```

#### POST /api/chat-sessions/:id/messages
**Purpose**: Add message to chat session
```json
{
  "role": "user" | "model",
  "content": "string"
}
```

### Health Check

#### GET /api/health
**Purpose**: Server health check
**Response**:
```json
{
  "status": "OK",
  "timestamp": "ISO Date",
  "service": "ManoVaktha API"
}
```

---

## Component Documentation

### Core Components

#### App.tsx
**Purpose**: Root application component and main state management
**Features**:
- View routing logic
- Global state coordination
- Authentication flow control
- Language initialization
- Error boundary handling

#### Header.tsx
**Purpose**: Main navigation header
**Features**:
- View navigation
- User profile access
- Language switching
- Responsive design

#### AuthView.tsx
**Purpose**: Authentication interface
**Features**:
- Login/register forms
- Input validation
- Error handling
- Language selection

### View Components

#### JourneyView.tsx
**Purpose**: Wellness journey management
**Features**:
- Journey dashboard
- Progress tracking
- Session management
- Day completion

#### AnalysisView.tsx
**Purpose**: Stress and anxiety analysis
**Features**:
- Symptom selection
- Personalized assessment
- Guidance generation
- Progress tracking

#### QuickChatView.tsx
**Purpose**: Real-time chat interface
**Features**:
- Streaming responses
- Journey plan generation
- Voice reading
- Session persistence

#### MediaView.tsx
**Purpose**: Video recommendations
**Features**:
- YouTube integration
- Content curation
- Problem-based suggestions

#### DoctorsView.tsx
**Purpose**: Professional consultation
**Features**:
- Doctor profiles
- Appointment booking
- Specialization filtering
- Contact management

### Utility Components

#### SolutionCard.tsx
**Purpose**: Display individual solutions
**Features**:
- Text-to-speech
- Save functionality
- Share options
- Responsive layout

#### Loader.tsx
**Purpose**: Loading animations
**Features**:
- Spiritual themed messages
- Smooth transitions
- Multiple animation states

---

## Services Documentation

### Frontend Services

#### geminiService.ts
**Purpose**: Google Gemini AI integration
**Key Functions**:
- `getSolutionsFromPuranas()`: Generate scripture-based solutions
- `streamMessageToExpert()`: Real-time chat streaming
- `getJourneyDayContent()`: Generate daily journey content
- `getVideoSuggestions()`: Get YouTube recommendations
- `getDoctorProfiles()`: Generate doctor profiles

**AI Prompts**:
- Structured JSON schema responses
- Multi-language support
- Context-aware generation
- Rate limiting handling

#### authService.ts
**Purpose**: Authentication management
**Key Functions**:
- `register()`: User registration
- `login()`: User authentication
- `getCurrentUser()`: Profile retrieval
- `updatePreferences()`: Settings update
- `logout()`: Session termination

#### apiClient.ts
**Purpose**: HTTP client wrapper
**Features**:
- Automatic token management
- Request/response interceptors
- Error handling
- Base URL configuration

#### offlineSyncService.ts
**Purpose**: Offline data synchronization
**Features**:
- localStorage migration
- Data persistence
- Sync on authentication
- Conflict resolution

### Backend Services

#### Authentication Middleware
**Purpose**: JWT token validation
**Features**:
- Token verification
- User context injection
- Protected route handling
- Error responses

#### Database Configuration
**Purpose**: MongoDB connection management
**Features**:
- Connection pooling
- Error handling
- Environment configuration
- Graceful shutdown

---

## Authentication System

### JWT Implementation
- **Token Generation**: Server-side with expiration
- **Token Storage**: localStorage in browser
- **Token Validation**: Middleware verification
- **Token Refresh**: Manual re-authentication

### Security Features
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configured origins
- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Mongoose ODM

### Authentication Flow
1. User submits credentials
2. Server validates and generates JWT
3. Token stored in localStorage
4. Token sent with subsequent requests
5. Middleware validates token
6. User context attached to request

---

## Multi-language Support

### Internationalization Architecture
- **Language Context**: React context for global state
- **Translation Files**: JSON files in `locales/`
- **Dynamic Loading**: Language-specific content
- **Font Support**: Font families for each language

### Supported Languages
1. **English**: Default language, Latin script
2. **Hindi**: Devanagari script, RTL support
3. **Telugu**: Telugu script, regional content

### Implementation Details
- **Translation Keys**: Consistent naming convention
- **Parameterization**: Dynamic content insertion
- **Fallback Mechanism**: Default to English
- **Font Loading**: Google Fonts integration

### AI Language Support
- **Prompt Engineering**: Language-specific prompts
- **Response Formatting**: Native language output
- **Cultural Context**: Region-appropriate content
- **Script Recognition**: Proper character encoding

---

## Offline Support

### Data Persistence Strategy
- **Primary**: MongoDB for authenticated users
- **Fallback**: localStorage for offline use
- **Migration**: Automatic sync on login
- **Conflict Resolution**: Server data priority

### Offline Features
- **Cached Solutions**: Previously fetched content
- **Local Storage**: Temporary data storage
- **Sync on Connect**: Automatic upload on authentication
- **Error Handling**: Graceful offline degradation

### Implementation
- **Migration Service**: `offlineSyncService.ts`
- **Storage Detection**: Check for existing data
- **Batch Upload**: Efficient data transfer
- **Progress Tracking**: User feedback during sync

---

## Development Setup

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Google Gemini API key
- Git

### Installation Steps
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd base_manovatha_898
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file:
   ```env
   VITE_API_KEY=your_gemini_api_key
   MONGODB_URI=mongodb://localhost:27017/manovaktha
   JWT_SECRET=your_jwt_secret
   VITE_API_BASE_URL=http://localhost:3001/api
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   - Local MongoDB: Start service
   - Atlas: Update connection string

5. **Start Development**
   ```bash
   # Terminal 1: Backend
   npm run server:dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

### Available Scripts
- `npm run dev`: Start frontend development server
- `npm run server:dev`: Start backend with nodemon
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm start`: Start production server
- `npm run test:db`: Test database connection

---

## Deployment Guide

### Production Build
1. **Frontend Build**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   - Set production API keys
   - Configure database URLs
   - Update CORS origins

3. **Server Deployment**
   - Deploy to cloud provider
   - Configure environment
   - Set up MongoDB Atlas
   - Configure domain/SSL

### Environment Considerations
- **API Rate Limits**: Monitor Gemini usage
- **Database Scaling**: MongoDB Atlas clusters
- **CDN**: Static asset delivery
- **Monitoring**: Error tracking and analytics

### Security Checklist
- [ ] Strong JWT secrets
- [ ] HTTPS enforcement
- [ ] Rate limiting
- [ ] Input sanitization
- [ ] CORS configuration
- [ ] Environment variable security

---

## Troubleshooting

### Common Issues

#### MongoDB Connection
**Problem**: Connection refused
**Solution**: Verify MongoDB service and connection string

#### Gemini API Errors
**Problem**: Rate limits or invalid keys
**Solution**: Check API key and usage quotas

#### CORS Issues
**Problem**: Cross-origin requests blocked
**Solution**: Update FRONTEND_URL in backend configuration

#### Authentication Failures
**Problem**: Token validation errors
**Solution**: Clear localStorage and re-authenticate

### Health Checks
- **Backend**: `http://localhost:3001/api/health`
- **Database**: `npm run test:db`
- **Frontend**: Console for errors
- **API**: Network tab in browser dev tools

---

## Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use provided ESLint configuration
3. Maintain component structure
4. Write descriptive commit messages
5. Test authentication flows
6. Verify multi-language support

### Code Style
- **Components**: PascalCase
- **Files**: camelCase for services, PascalCase for components
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types**: PascalCase with interface prefix

### Testing Strategy
- Manual testing for user flows
- Database connectivity tests
- API endpoint verification
- Multi-language validation
- Authentication edge cases

---

## License & Support

### License
MIT License - see project files for details

### Support Channels
- GitHub Issues for bugs
- Documentation updates via PR
- Feature requests through issues
- Community discussions

### Maintenance
- Regular dependency updates
- Security patch monitoring
- Performance optimization
- Feature enhancements based on user feedback

---

**Last Updated**: 2025-01-06
**Version**: 3.09 with all integrations
**Documentation**: Complete project architecture and implementation guide