# Firebase Setup Guide for Chat System

The chat system uses Firebase Firestore for real-time messaging. Follow these steps to configure Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Test mode" (for development)
4. Select a Cloud Firestore location (preferably close to your users)

## 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "MJ Cargo Sales Dashboard")
5. Copy the `firebaseConfig` object

## 4. Add Environment Variables

Add the following to your `.env` or `.env.local` file:

```bash
# Firebase Configuration (for Chat System)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### For Vercel Production

Run these commands to add Firebase variables to Vercel:

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
```

Select "Production", "Preview", and "Development" when prompted.

## 5. Configure Firestore Security Rules

In Firebase Console > Firestore Database > Rules, add these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;

      match /messages/{messageId} {
        allow read: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow write: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
```

**Note:** These rules are basic. For production, you may want to add more granular permissions.

## 6. Test the Chat System

1. Restart your development server: `pnpm dev`
2. Log in to your application
3. Navigate to `/dashboard/chat` (or the chat page)
4. Select a contact and send a message
5. Messages should persist in Firebase Firestore

## 7. Verify Firebase Data

1. Go to Firebase Console > Firestore Database
2. You should see a `chats` collection
3. Each chat document has a `messages` subcollection

## Architecture Overview

### Database Structure

```
chats (collection)
  └── chat_{userId1}_{userId2} (document)
      ├── participants: [userId1, userId2]
      ├── lastMessage: "Hello!"
      ├── lastMessageTime: timestamp
      ├── unseenMsgs: 0
      └── messages (subcollection)
          └── messageId (document)
              ├── message: "Hello!"
              ├── senderId: userId1
              ├── receiverId: userId2
              ├── time: timestamp
              └── replayMetadata: false
```

### Chat ID Format

Chat IDs are generated consistently by sorting user IDs alphabetically:
- `chat_user1_user2` (always in alphabetical order)
- This ensures both users access the same chat regardless of who sends first

## Troubleshooting

### "Unauthorized" errors
- Ensure you're logged in with NextAuth
- Check that Firebase rules allow your authenticated user

### Messages not appearing
- Verify Firebase environment variables are set correctly
- Check browser console for errors
- Ensure Firestore is created in Firebase Console

### Permission denied errors
- Update Firestore security rules as shown above
- Make sure rules are published (click "Publish" in Firebase Console)

## Security Best Practices

✅ **DO:**
- Keep Firebase API keys in environment variables
- Use Firestore security rules to protect data
- Validate user permissions on the server-side
- Use NEXT_PUBLIC_ prefix only for client-side variables

❌ **DON'T:**
- Commit `.env` files to Git (they're in `.gitignore`)
- Share Firebase credentials publicly
- Allow unauthenticated access in production
- Store sensitive data in Firebase without encryption

---

**Questions?** Check the [Firebase Documentation](https://firebase.google.com/docs/firestore)
