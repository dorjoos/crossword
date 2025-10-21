import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read user data from user.json
    const filePath = path.join(process.cwd(), 'public', 'user.json');
    const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error reading user data:', error);
    return NextResponse.json({ error: 'Failed to read user data' }, { status: 500 });
  }
}
