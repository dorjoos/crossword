import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { userId, score } = await request.json();
    console.log('API received score:', score);
    
    // Read current user data
    const filePath = path.join(process.cwd(), 'public', 'user.json');
    const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Find the user
    const userIndex = userData.users.findIndex((u: any) => u.user_id === userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const user = userData.users[userIndex];
    
    // Check if award has already been sent
    if (user.award_sent && user.award_response_status === 200) {
      return NextResponse.json({ 
        message: 'Award already sent', 
        alreadySent: true 
      });
    }
    
    // Send award to CTFd API
    const awardData = {
      user_id: userId,
      challenge_id: 1,
      team_id: null,
      name: "Bonus: Crossword",
      description: "Ugiin suljee onoo",
      value: score,
      category: "bonus"
    };
    
    // Log the request details
    const requestDetails = {
      timestamp: new Date().toISOString(),
      url: 'http://ethics.golomtbank.com/api/v1/awards',
      method: 'POST',
      headers: {
        'Authorization': 'Token ctfd_e1c32838169d3b76f9e1588f992546e35ec7fd39ece8caacecc90b40edead800',
        'Content-Type': 'application/json',
      },
      body: awardData
    };

    const ctfdResponse = await fetch('http://ethics.golomtbank.com/api/v1/awards', {
      method: 'POST',
      headers: {
        'Authorization': 'Token ctfd_e1c32838169d3b76f9e1588f992546e35ec7fd39ece8caacecc90b40edead800',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(awardData),
    });
    
    const responseStatus = ctfdResponse.status;
    const isSuccess = responseStatus === 200;
    
    // Get response body for logging
    let responseBody = '';
    try {
      responseBody = await ctfdResponse.text();
    } catch (e) {
      responseBody = 'Failed to read response body';
    }

    // Log the response details
    const responseDetails = {
      timestamp: new Date().toISOString(),
      status: responseStatus,
      statusText: ctfdResponse.statusText,
      headers: Object.fromEntries(ctfdResponse.headers.entries()),
      body: responseBody
    };
    
    // Update user data
    userData.users[userIndex] = {
      ...user,
      last_final_score: score,
      award_sent: isSuccess,
      award_response_status: responseStatus
    };

    // Add submission to submissions array
    const submission = {
      user_id: userId,
      timestamp: new Date().toISOString(),
      success: isSuccess,
      data: {
        request: requestDetails,
        response: responseDetails
      }
    };

    // Initialize submissions array if it doesn't exist
    if (!userData.submissions) {
      userData.submissions = [];
    }

    // Add new submission
    userData.submissions.push(submission);
    
    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
    
    return NextResponse.json({ 
      success: isSuccess,
      status: responseStatus,
      message: isSuccess ? 'Award sent successfully' : 'Failed to send award',
      submission: submission
    });
    
  } catch (error) {
    console.error('Error sending award:', error);
    
    // Try to log error to user.json if possible
    try {
      const filePath = path.join(process.cwd(), 'public', 'user.json');
      const userData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const { userId } = await request.json();
      const userIndex = userData.users.findIndex((u: any) => u.user_id === userId);
      
      if (userIndex !== -1) {
        // Add error submission
        const errorSubmission = {
          user_id: userId,
          timestamp: new Date().toISOString(),
          success: false,
          data: {
            error: {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined
            }
          }
        };

        // Initialize submissions array if it doesn't exist
        if (!userData.submissions) {
          userData.submissions = [];
        }

        // Add error submission
        userData.submissions.push(errorSubmission);
        fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
      }
    } catch (logError) {
      console.error('Failed to log error to user.json:', logError);
    }
    
    return NextResponse.json({ error: 'Failed to send award' }, { status: 500 });
  }
}

