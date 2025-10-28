import { connectDB } from '../server/config/database.js';

async function testDatabaseConnection() {
  console.log('🔍 Testing MongoDB connection...');
  
  try {
    await connectDB();
    console.log('✅ MongoDB connection successful!');
    
    // Test basic operations
    const { User, ManuscriptHistory, SavedSolution, JourneyPlan, ChatSession } = await import('../server/models/index.js');
    
    console.log('🔍 Testing model definitions...');
    
    // Test User model
    const userCount = await User.countDocuments();
    console.log(`📊 Users in database: ${userCount}`);
    
    // Test other models
    const manuscriptCount = await ManuscriptHistory.countDocuments();
    console.log(`📊 Manuscript entries: ${manuscriptCount}`);
    
    const savedSolutionsCount = await SavedSolution.countDocuments();
    console.log(`📊 Saved solutions: ${savedSolutionsCount}`);
    
    const journeyCount = await JourneyPlan.countDocuments();
    console.log(`📊 Journey plans: ${journeyCount}`);
    
    const chatCount = await ChatSession.countDocuments();
    console.log(`📊 Chat sessions: ${chatCount}`);
    
    console.log('✅ All models working correctly!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();