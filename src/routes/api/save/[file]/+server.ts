import type { RequestHandler } from './$types';
import fs from 'fs/promises';
import pako from 'pako';

export const POST: RequestHandler = async ({ url, request }) => {
  const buf = await request.arrayBuffer();
  const svg = pako.inflate(buf, { to: 'string' });

  try {
    await fs.writeFile('./test.svg', svg);
  } catch (err) {
    console.log(err);
    return new Response('Error', {
      status: 500,
    });
  }

  return new Response('Success');
}