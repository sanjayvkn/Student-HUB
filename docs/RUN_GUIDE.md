# Student Hub Run Guide

## Initial setup

```bash
cd /Users/bharath/Sanjay-APP
npm install
```

Ensure these files exist:

- `config/firebaseConfig.js`
- `config/googleAuth.js`
- `google-services.json`

## Expo Go

Start Expo:

```bash
npx expo start -c
```

Then:

- Physical Android or iPhone: scan the QR code.
- Android emulator: press `a`.
- iOS simulator: press `i`.

The following features work in Expo Go:

- Email and password login
- Dashboard and navigation
- Firestore tasks
- Timetable
- Subject folders and PDF listing
- Profile and logout

Google Sign-In does not work in Expo Go. It uses the native
`RNGoogleSignin` module, which is not included with this project's native
configuration in Expo Go. The app therefore disables the Google login button
there.

PDFs open from their Firebase Storage download URL using the device browser or
PDF application.

## Android emulator or physical Android device

Start an Android emulator first, then run:

```bash
npm run android
```

This creates and installs a native development build. The following features
should work:

- Email login
- Google login
- Firestore task operations
- Firebase Storage PDFs
- Timetable
- Navigation and logout

Google login requires:

- Package name `com.studenthub.app`
- The correct `google-services.json`
- The correct Android OAuth client
- The APK signing SHA-1 registered in Firebase and Google Cloud
- Google Play Services on the emulator or device

A `DEVELOPER_ERROR` normally means the package name, OAuth client, or SHA-1
does not match.

## iOS

Start Expo and scan the QR code or press `i`:

```bash
npx expo start -c
```

These features work on iOS:

- Email login
- Firestore tasks
- Dashboard
- Timetable
- Notes from Firebase Storage
- Profile and logout

Google login is currently disabled on iOS because the project does not have:

- A Firebase iOS application configuration
- `GoogleService-Info.plist`
- An iOS OAuth client ID
- The required reversed-client-ID URL scheme

## Uploading PDF notes

PDF files belong in Firebase Storage, not Firestore.

1. Open Firebase Console and select the Student Hub project.
2. Open **Storage**, select **Files**, and create a folder named `notes`.
3. Inside `notes`, create the required subject folder.
4. Open that subject folder and upload the PDF files.

The app uses these exact paths:

```text
notes/web-development
notes/database-systems
notes/ui-ux-design
notes/software-engineering
```

For example, upload Web Development PDFs to:

```text
notes/web-development/intro-web-development.pdf
notes/web-development/advanced-web-development.pdf
```

Use these Firebase Storage rules if only signed-in users should read notes and
uploads will be performed through Firebase Console:

```text
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /notes/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

Firebase Console administrators can still upload files when client writes are
disabled. Pull down on the Notes list to reload files after an upload.

## Common failures

### Firebase permission error

- Confirm Firestore is enabled.
- Confirm the user is authenticated.
- Confirm Firestore rules allow access to `users/{uid}/tasks`.

### Expo cannot connect

- Keep the computer and phone on the same Wi-Fi network.
- Disable restrictive VPNs or firewalls.
- Try tunnel mode:

```bash
npx expo start --tunnel
```

### Changes are not appearing

Restart Expo and clear the Metro cache:

```bash
npx expo start -c
```

### Android emulator is not detected

Check the connected devices:

```bash
$HOME/Library/Android/sdk/platform-tools/adb devices
```

### PDF limitations

- An internet connection is required to list and download PDFs.
- Only files ending in `.pdf` are displayed.
- Files must be uploaded to one of the configured subject paths.
- Opening uses the operating system's browser or PDF application.
