import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json();
    
    // Path to user.json file
    const filePath = path.join(process.cwd(), 'public', 'user.json');
    
    // Write updated users data to file
    fs.writeFileSync(filePath, JSON.stringify({ users }, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json({ error: 'Failed to update user data' }, { status: 500 });
  }
}
