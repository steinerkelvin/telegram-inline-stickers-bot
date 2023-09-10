import { makeKyselyHook } from 'kanel-kysely';

const output_path = './src/db';
const postgres_pass = process.env.POSTGRES_PASSWORD;

if (!postgres_pass) {
  throw new Error('POSTGRES_PASSWORD not set');
}

// ---

export const preRenderHooks = [makeKyselyHook()];

export const outputPath = outputPath;

export const resolveViews = true;

export const connection = {
  host: 'localhost',
  user: 'postgres',
  password: postgres_pass,
  database: 'postgres',
  charset: 'utf8',
  port: 5432,
};
