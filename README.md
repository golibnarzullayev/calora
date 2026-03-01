# 🍽️ AI Calorie Tracking Platform

A production-ready AI-powered calorie tracking platform built for Telegram WebApp with Google Gemini Vision integration. Designed for mobile-first experience with Uzbek language support.

## ✨ Features

- **Telegram WebApp Integration**: Seamless integration with Telegram Bot API
- **AI Food Detection**: Google Gemini Vision for automatic food recognition and calorie estimation
- **Smart Calorie Calculations**: Mifflin-St Jeor formula for BMR/TDEE calculations
- **Mobile-First UI**: Native mobile app feel with smooth animations
- **Comprehensive Statistics**: Daily, weekly, and monthly tracking with charts
- **User Onboarding**: Step-by-step profile setup with goal selection
- **Macro Tracking**: Protein, carbs, and fat monitoring with visual progress bars
- **Weight Progress**: Track weight changes over time
- **Uzbek Language**: Full UI in Uzbek (Latin script)
- **PWA Ready**: Offline-capable progressive web app

## 🏗️ Architecture

### Backend Stack

- **Node.js** with TypeScript
- **Express.js** for REST API
- **MongoDB** with Mongoose ODM
- **Google Generative AI** (Gemini Vision)
- **Telegraf** for Telegram Bot integration

### Frontend Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization
- **Telegram WebApp SDK** for native integration

### DevOps

- **Docker** & **Docker Compose** for containerization
- **Nginx** for reverse proxy and static file serving
- **MongoDB** in Docker for development

## 📁 Project Structure

```
calories-calculator/
├── backend/
│   ├── src/
│   │   ├── models/           # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Meal.ts
│   │   │   ├── DailyStats.ts
│   │   │   └── Weight.ts
│   │   ├── controllers/       # Request handlers
│   │   │   ├── UserController.ts
│   │   │   ├── MealController.ts
│   │   │   └── StatsController.ts
│   │   ├── services/          # Business logic
│   │   │   ├── CalorieCalculator.ts
│   │   │   └── GeminiService.ts
│   │   ├── routes/            # API routes
│   │   │   ├── userRoutes.ts
│   │   │   ├── mealRoutes.ts
│   │   │   └── statsRoutes.ts
│   │   ├── config/            # Configuration
│   │   │   └── database.ts
│   │   ├── telegram/          # Telegram bot
│   │   │   └── bot.ts
│   │   └── index.ts           # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   └── Navigation.tsx
│   │   ├── store/             # Zustand store
│   │   │   └── useAppStore.ts
│   │   ├── services/          # API client
│   │   │   └── api.ts
│   │   ├── utils/             # Utilities
│   │   │   └── telegram.ts
│   │   ├── constants/         # Constants
│   │   │   └── uz.ts          # Uzbek translations
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Local development setup
├── nginx.conf                 # Nginx reverse proxy config
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- MongoDB (or use Docker)
- Google Gemini API Key
- Telegram Bot Token

### Local Development

1. **Clone and setup backend**:

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

2. **Setup frontend** (in another terminal):

```bash
cd frontend
npm install
npm run dev
```

3. **Start MongoDB** (if not using Docker):

```bash
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0-alpine
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access:
# Frontend: http://localhost
# API: http://localhost/api
# MongoDB: localhost:27017
```

## 🔑 Environment Variables

### Backend (.env)

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/calories-tracker
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBAPP_URL=https://your-domain.com
CORS_ORIGIN=http://localhost:5173,https://your-domain.com
```

## 📊 API Endpoints

### Users

- `POST /api/users` - Create/update user profile
- `GET /api/users/:telegramId` - Get user profile
- `PATCH /api/users/:telegramId/weight` - Update weight

### Meals

- `POST /api/meals/:telegramId/upload` - Upload meal image
- `GET /api/meals/:telegramId/today` - Get today's meals
- `GET /api/meals/:telegramId/by-date` - Get meals by date
- `DELETE /api/meals/:mealId` - Delete meal

### Statistics

- `GET /api/stats/:telegramId/daily` - Daily stats
- `GET /api/stats/:telegramId/weekly` - Weekly stats
- `GET /api/stats/:telegramId/monthly` - Monthly stats
- `POST /api/stats/:telegramId/weight` - Record weight
- `GET /api/stats/:telegramId/weight-progress` - Weight history

## 🤖 AI Integration

### Gemini Vision Food Detection

The system uses Google Gemini Pro Vision to:

1. Analyze uploaded meal images
2. Detect if image contains food
3. Identify meal name
4. Estimate calories and macros
5. Return confidence score

**Rejection criteria**:

- Non-food images (confidence < 0.6)
- Invalid image format
- Processing errors

**Response format**:

```json
{
  "isFood": true,
  "mealName": "Chicken rice",
  "calories": 450,
  "protein": 35,
  "carbs": 45,
  "fat": 12,
  "confidence": 0.85
}
```

## 📐 Calorie Calculations

### Mifflin-St Jeor Formula

**BMR Calculation**:

- Male: (10 × weight) + (6.25 × height) - (5 × age) + 5
- Female: (10 × weight) + (6.25 × height) - (5 × age) - 161

**TDEE** = BMR × Activity Multiplier

**Activity Multipliers**:

- Sedentary (0 days/week): 1.2
- Light (1 day/week): 1.375
- Moderate (2-3 days/week): 1.55
- Active (4-5 days/week): 1.725
- Very Active (6-7 days/week): 1.9

**Goal Adjustments**:

- Lose weight: TDEE × 0.8 (-20%)
- Maintain: TDEE × 1.0
- Gain weight: TDEE × 1.15 (+15%)

### Macro Distribution

**Protein**:

- Lose: 2.0g/kg
- Maintain: 1.6g/kg
- Gain: 2.2g/kg

**Fat**: 25% of daily calories

**Carbs**: Remaining calories

## 🎨 UI/UX Features

- **Circular Progress Ring**: Visual calorie consumption tracking
- **Macro Progress Bars**: Protein, carbs, fat visualization
- **Bottom Navigation**: Mobile-native navigation pattern
- **Floating Action Button**: Quick meal upload
- **Smooth Animations**: Slide-up and fade-in effects
- **Skeleton Loaders**: Loading states
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Tailwind CSS support

## 🔐 Security

- JWT authentication ready
- Input validation on all endpoints
- CORS configuration
- Environment variable protection
- Non-root Docker user
- Secure password hashing (bcryptjs)

## 📱 Telegram WebApp Integration

### Bot Commands

- `/start` - Launch WebApp
- `/help` - Show help message

### WebApp Features

- Automatic user ID extraction
- Haptic feedback support
- Cloud storage integration ready
- Native alert/confirm dialogs

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests (coming soon)
npm run test:e2e
```

## 📦 Production Deployment

### Heroku

```bash
git push heroku main
```

### AWS/GCP/Azure

Use the provided Dockerfile for containerized deployment.

### Environment Setup

1. Set all required environment variables
2. Configure MongoDB Atlas or managed database
3. Set up Telegram bot webhook
4. Configure domain and SSL certificate
5. Deploy using Docker or native Node.js

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy.yml`):

- Run tests
- Build Docker image
- Push to registry
- Deploy to production

## 📝 Uzbek Language Support

All UI text is in Uzbek (Latin script):

- Navigation labels
- Form placeholders
- Error messages
- Success notifications
- Meal descriptions

Located in: `frontend/src/constants/uz.ts`

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Reset MongoDB
docker-compose down -v
docker-compose up -d
```

### Gemini API Errors

- Verify API key is valid
- Check rate limits
- Ensure image format is supported

### Telegram WebApp Not Loading

- Verify TELEGRAM_WEBAPP_URL is correct
- Check CORS settings
- Ensure bot token is valid

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For issues and questions:

- Open GitHub Issues
- Check existing documentation
- Review API error messages

## 🎯 Roadmap

- [ ] Advanced meal caching
- [ ] Barcode scanning
- [ ] Recipe suggestions
- [ ] Social features
- [ ] Workout integration
- [ ] Push notifications
- [ ] Offline sync
- [ ] Multi-language support

---

**Built with ❤️ for health-conscious Telegram users**
