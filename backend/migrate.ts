import { sequelize } from './src/models';
import { Umzug, SequelizeStorage } from 'umzug';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const umzug = new Umzug({
  storage: new SequelizeStorage({
    sequelize: sequelize,
    tableName: 'migrations'
  }),
  migrations: {
    // @ts-expect-error - Umzug params type mismatch with Sequelize v6
    params: [sequelize.getQueryInterface()],
    glob: path.join(__dirname, 'migrations') + '/*.js',
    resolve: ({ name, path: migrationPath, context }) => ({
      name,
      path: migrationPath,
      up: async () => {
        const migration = require(migrationPath || '');
        return migration.up((context as unknown as { queryInterface: unknown; Sequelize: unknown }).queryInterface, (context as unknown as { queryInterface: unknown; Sequelize: unknown }).Sequelize);
      },
      down: async () => {
        const migration = require(migrationPath || '');
        return migration.down((context as unknown as { queryInterface: unknown; Sequelize: unknown }).queryInterface, (context as unknown as { queryInterface: unknown; Sequelize: unknown }).Sequelize);
      }
    })
  }
});

async function runMigrations(): Promise<void> {
  console.log('🔄 Starting migrations...');

  try {
    const executed = await umzug.executed();
    console.log(`📊 Executed migrations: ${executed.length}`);

    const pending = await umzug.pending();
    console.log(`📋 Pending migrations: ${pending.length}`);

    if (pending.length > 0) {
      console.log('🚀 Running pending migrations:');
      const migrations = await umzug.up();
      migrations.forEach(migration => {
        console.log(`   ✅ ${migration.name}`);
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
