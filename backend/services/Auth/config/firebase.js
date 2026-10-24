import { cert, initializeApp } from "firebase-admin/app";
import { readFile } from "node:fs/promises";

const serviceAccountPath = new URL(
  "../../../serviceAccountKey.json",
  import.meta.url,
);
const serviceAccount = JSON.parse(await readFile(serviceAccountPath, "utf8"));

export const app = initializeApp({
  credential: cert(serviceAccount),
});
