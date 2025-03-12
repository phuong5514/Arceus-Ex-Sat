import dotenv from 'dotenv';
import PocketBase from 'pocketbase';

dotenv.config();

const superuserClient = new PocketBase('http://127.0.0.1:8090');

superuserClient.autoCancellation(false);

await superuserClient.collection("_superusers").authWithPassword(
  process.env.SUPERUSER_EMAIL, process.env.SUPERUSER_PASSWORD, {
    autoRefeshThreshold: 30 * 60, // 30 minutes
  }
);

//superuserClient.authStore.save(process.env.SUPERUSER_TOKEN, null);

export default superuserClient;