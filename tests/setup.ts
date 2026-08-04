import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Set required env vars before any module (e.g. src/app.ts -> validateEnv())
// reads process.env at import time.
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRE_IN = "1h";
process.env.MONGO_URI = "placeholder"; // validateEnv() only checks presence, not validity
process.env.NODE_ENV = "test";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  // Wipe all collections between tests so each test starts from a clean DB
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});