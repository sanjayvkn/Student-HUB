import { GOOGLE_WEB_CLIENT_ID } from '../config/googleAuth';

let configured = false;

function getGoogleSignInModule() {
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  return GoogleSignin;
}

export function configureGoogleSignIn() {
  if (configured) return;

  const GoogleSignin = getGoogleSignInModule();
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });

  configured = true;
}

export async function getGoogleIdToken() {
  configureGoogleSignIn();
  const GoogleSignin = getGoogleSignInModule();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const result = await GoogleSignin.signIn();
  if (result.type === 'cancelled') {
    return null;
  }

  const idToken = result.data?.idToken;
  if (!idToken) {
    throw new Error('Google sign-in did not return a token.');
  }

  return idToken;
}
