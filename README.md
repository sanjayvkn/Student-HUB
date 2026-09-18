# Student Hub

Student Hub is an Expo React Native app with Firebase authentication, personal
tasks stored in Firestore, PDF notes from Cloudinary, daily attendance, a
timetable, and a profile screen.

## Setup

1. Install Node.js and the Android Studio tools required by Expo.
2. Install packages:

```bash
npm install
```

3. Copy `config/firebaseConfig.example.js` to
   `config/firebaseConfig.js` and add the Firebase web app values.
4. Create `config/googleAuth.js` with the Google web OAuth client ID. It must
   export `GOOGLE_WEB_CLIENT_ID`, `canUseGoogleSignIn`, and
   `getGoogleSetupMessage`. Google login should be disabled when
   `Constants.appOwnership === 'expo'`.
5. Download the Android `google-services.json` from Firebase and place it in
   the project root.
6. Enable Email/Password and Google sign-in in Firebase Authentication.
7. Copy `config/cloudinary.example.js` to `config/cloudinary.js` and add your
   Cloudinary cloud name, API key, and API secret.
8. Upload PDF notes in the Cloudinary Media Library under these folders:

```text
notes/web-development
notes/database-systems
notes/ui-ux-design
notes/software-engineering
```

Enable **PDF delivery** in Cloudinary Settings → Security.

Tasks are stored at `users/{uid}/tasks/{taskId}`. Firestore rules should only
allow a signed-in user to read and write their own path.

## Run

```bash
npm start
npm run android
```

Email login works in Expo Go. Google login is configured for Android and uses
a native module, so test it with `npm run android` or another Android app
build. iOS Google login needs a separate Firebase iOS app and
`GoogleService-Info.plist`.

## Main files

- `navigation/AppNavigator.js` handles authentication and bottom tabs.
- `services/firebase.js` initializes Firebase.
- `services/taskStorage.js` contains all task database operations.
- `services/notesService.js` loads subject PDFs from Cloudinary and supports delete.
- `screens/AttendanceScreen.js` handles daily clock-in and clock-out.
