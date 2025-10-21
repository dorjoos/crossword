# Crossword Game with Login and Awards System

## Implementation Overview

This implementation adds a complete login system and awards API integration to the crossword game.

### Features Implemented

1. **Login System**
   - Username/password authentication using `user.json`
   - One-time login restriction (prevents duplicate logins)
   - Session persistence using localStorage
   - Beautiful login UI with dark theme

2. **Awards API Integration**
   - Automatic score submission to CTFd awards API
   - Prevents duplicate award submissions
   - Updates user data with final score and award status

3. **User Data Management**
   - JSON-based user storage in `public/user.json`
   - Real-time user status updates
   - Award response tracking

### File Structure

```
├── components/
│   ├── login-page.tsx          # Login page component
│   └── crossword-game.tsx      # Updated game with auth integration
├── app/
│   ├── api/
│   │   ├── update-user/route.ts # API to update user.json
│   │   └── send-award/route.ts  # API to send awards to CTFd
│   └── page.tsx                # Main page with auth routing
└── public/
    └── user.json               # User data storage
```

### User Data Structure

```json
{
  "users": [
    {
      "name": "Dorjoo",
      "token": "abc123",
      "user_id": 1,
      "logged_status": false,
      "last_final_score": 300,
      "award_sent": true,
      "award_response_status": 200
    }
  ]
}
```

### API Endpoints

1. **POST /api/update-user**
   - Updates user login status in user.json
   - Used during login process

2. **POST /api/send-award**
   - Sends final score to CTFd awards API
   - Updates user data with award status
   - Prevents duplicate submissions

### Login Flow

1. User enters username and password
2. System checks user.json for matching user
3. Validates login status (prevents duplicate logins)
4. Updates user.json with `logged_status: true`
5. Redirects to crossword game

### Awards Flow

1. User completes crossword and clicks "Шалгах" (Check)
2. System calculates final score
3. If user is logged in and award not sent:
   - Sends score to CTFd API
   - Updates user.json with award status
4. Prevents duplicate award submissions

### Security Features

- One-time login restriction
- Award submission tracking
- User session management
- API error handling

### Usage

1. Start the development server: `npm run dev`
2. Navigate to the application
3. Login with username "Dorjoo" and password "abc123"
4. Play the crossword game
5. Click "Шалгах" to submit answers and send award

The system will automatically handle user authentication and award submissions according to the specified requirements.

