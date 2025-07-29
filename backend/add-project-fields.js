const { Client } = require('pg');

async function addProjectFields() {
  const client = new Client({
    connectionString: 'postgresql://zur_user:IvxA3wUZqDFhSgmKWuuAzlbMkJ4LBrh@dpg-d0vs5k0gjchc73a3e5ng-a.oregon-postgres.render.com/zur',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // 添加 SEO 欄位
    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "seoTitle" VARCHAR(200) DEFAULT ''`);
    console.log('Added seoTitle column');

    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "seoDescription" VARCHAR(500) DEFAULT ''`);
    console.log('Added seoDescription column');

    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "seoKeywords" VARCHAR(300) DEFAULT ''`);
    console.log('Added seoKeywords column');

    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "ogImage" VARCHAR(500) DEFAULT ''`);
    console.log('Added ogImage column');

    // 添加 AEO (FAQ) 欄位
    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "faqList" JSON`);
    console.log('Added faqList column');

    // 添加 GEO 欄位
    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "address" VARCHAR(200) DEFAULT ''`);
    console.log('Added address column');

    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "lat" DECIMAL(10,6)`);
    console.log('Added lat column');

    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "lng" DECIMAL(10,6)`);
    console.log('Added lng column');

    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "city" VARCHAR(50) DEFAULT ''`);
    console.log('Added city column');

    await client.query(`ALTER TABLE "project" ADD COLUMN IF NOT EXISTS "zipcode" VARCHAR(10) DEFAULT ''`);
    console.log('Added zipcode column');

    console.log('All columns added successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

addProjectFields(); 