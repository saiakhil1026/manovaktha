import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/manovaktha';
const isDevelopment = process.env.NODE_ENV === 'development';

export const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
      maxPoolSize: 10 // Maintain up to 10 socket connections
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    if (isDevelopment) {
      console.log('💡 Development mode: Server will continue without database');
      console.log('💡 To use MongoDB:');
      console.log('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      console.log('   2. Or use MongoDB Atlas: https://www.mongodb.com/atlas');
      console.log('   3. Update MONGODB_URI in .env file');
      // Don't exit in development mode
      return;
    }
    
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🚨 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('💤 MongoDB connection closed through app termination');
  process.exit(0);
});