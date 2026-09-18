// helper functions for getting user info
// handles different auth providers and edge cases

// get display name from user object
// tries displayName first, falls back to email prefix, then default
export function getUserDisplayName(user) {
  if (!user) return 'Student';
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split('@')[0]; // use email username as fallback
  return 'Student'; // final fallback
}

// get user email - simple and safe
export function getUserEmail(user) {
  return user?.email || ''; // optional chaining to avoid errors
}