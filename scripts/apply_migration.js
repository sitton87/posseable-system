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
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('activity_checklist') AND name = 'assigned_to_volunteer_id')
            BEGIN
                ALTER TABLE activity_checklist ADD assigned_to_volunteer_id varchar(9) NULL;
                ALTER TABLE activity_checklist ADD CONSTRAINT FK_activity_checklist_volunteer FOREIGN KEY (assigned_to_volunteer_id) REFERENCES volunteer(national_id);
                PRINT 'Column added';
            END
            ELSE
            BEGIN
                PRINT 'Column already exists';
            END
        `);
        console.log('Migration done');
    } catch (err) {
        console.error(err);
    } finally {
        await sql.close();
    }
}

run();


