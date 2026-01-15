const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            port: parseInt(process.env.DB_PORT || '1433')
        }
    };

    try {
        await sql.connect(config);
        const result = await sql.query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('note') AND name = 'is_deleted')
            BEGIN
                ALTER TABLE note ADD is_deleted bit NOT NULL DEFAULT 0;
                PRINT 'Column is_deleted added to note table';
            END
            ELSE
            BEGIN
                PRINT 'Column is_deleted already exists in note table';
            END
        `);
        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await sql.close();
    }
}

run();




