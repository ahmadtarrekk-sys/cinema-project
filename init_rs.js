const { MongoClient } = require('mongodb');

async function main() {
  const uri = "mongodb://127.0.0.1:27017/?directConnection=true";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('admin');
    
    // Check if already initialized
    try {
      const status = await db.command({ replSetGetStatus: 1 });
      if (status.ok === 1) {
        console.log("Replica set already initialized.");
        return;
      }
    } catch (e) {
      if (e.codeName !== 'NotYetInitialized') {
        throw e;
      }
    }

    const result = await db.command({
      replSetInitiate: {
        _id: "rs0",
        members: [{ _id: 0, host: "127.0.0.1:27017" }]
      }
    });
    console.log("Replica Set Initiated:", result);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main();
