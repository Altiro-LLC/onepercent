/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-underscore-dangle */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the client is not recreated every time.
  // @ts-expect-error
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
