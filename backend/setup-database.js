const { sequelize } = require('./src/models');
require('dotenv').config();

async function setupDatabase() {
  console.log('🎯 Setting up Smart Student Planner Database\n');
  
  try {
    // 1. Test connection
    console.log('1️⃣ Testing database connection...');
    await sequelize.authenticate();
    console.log('   ✅ Database connection successful');
    
    // 2. Create tables
    console.log('\n2️⃣ Creating database tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('   ✅ Tables created/updated');
    
    // 3. Check what tables were created
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n3️⃣ Database tables:');
    tables.forEach(table => {
      console.log(`   ✅ ${table.table_name}`);
    });
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   Start server: npm run dev');
    console.log(`   Check health: http://${process.env.SERVER_HOST || 'localhost'}:${process.env.PORT || 5000}/health`);
    console.log(`   Check tables: http://${process.env.SERVER_HOST || 'localhost'}:${process.env.PORT || 5000}/health/db`);
    console.log('\n� Security: No default users are created. Register via the mobile app.');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\n🔧 Common issues:');
    console.error('1. PostgreSQL not running');
    console.error('2. Wrong password in .env file');
    console.error('3. Database "student_planner" doesn\'t exist');
    console.error('\n💡 Fix:');
    console.error('   Create database: CREATE DATABASE student_planner;');
    process.exit(1);
  }
}

setupDatabase();