const { sequelize } = require('./src/models');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');
require('dotenv').config();

// Configure Umzug for migrations
const umzug = new Umzug({
  storage: new SequelizeStorage({
    sequelize: sequelize,
    tableName: 'migrations'
  }),
  migrations: {
    params: [sequelize.getQueryInterface()],
    glob: path.join(__dirname, 'migrations') + '/*.js',
    resolve: ({ name, path, context }) => ({
      name,
      path,
      up: async () => {
        const migration = require(path || '');
        return migration.up(context.queryInterface, context.Sequelize);
      },
      down: async () => {
        const migration = require(path || '');
        return migration.down(context.queryInterface, context.Sequelize);
      }
    })
  }
});

async function runMigrations() {
  console.log('🔄 Starting migrations...');
  
  try {
    // Check current migration status
    const executed = await umzug.executed();
    console.log(`📊 Executed migrations: ${executed.length}`);
    
    // Run pending migrations
    const pending = await umzug.pending();
    console.log(`📋 Pending migrations: ${pending.length}`);
    
    if (pending.length > 0) {
      console.log('🚀 Running pending migrations:');
      const migrations = await umzug.up();
      migrations.forEach(migration => {
        console.log(`   ✅ ${migration.file}`);
      });
      console.log('🎉 All migrations completed successfully!');
    } else {
      console.log('✅ No pending migrations.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();