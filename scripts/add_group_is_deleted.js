const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        options: {
            encrypt: process.env.NODE_ENV === 'production',
            trustServerCertificate: true,
            port: parseInt(process.env.DB_PORT || '1433')
        }
    };

    try {
        await sql.connect(config);
        
        // Check if column exists
        const checkResult = await sql.query(`
            SELECT * FROM sys.columns 
            WHERE object_id = OBJECT_ID('[group]') 
            AND name = 'is_deleted'
        `);

        if (checkResult.recordset.length === 0) {
            console.log('Adding is_deleted column to [group] table...');
            await sql.query(`
                ALTER TABLE [group] 
                ADD is_deleted bit NOT NULL DEFAULT 0
            `);
            console.log('Column added successfully');
        } else {
            console.log('Column is_deleted already exists');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await sql.close();
    }
}

run();
