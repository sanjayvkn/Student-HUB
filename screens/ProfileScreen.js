
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { getUserDisplayName, getUserEmail } from '../utils/userDisplay';
import { colors } from '../styles/common';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.pageTitle}>Profile</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={colors.white} />
          </View>
          <Text style={styles.name}>{getUserDisplayName(user)}</Text>
          <Text style={styles.email}>{getUserEmail(user)}</Text>
          <View style={styles.studentBadge}>
            <Text style={styles.studentBadgeText}>Student</Text>
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 14,
    color: colors.text,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 4,
  },
  studentBadge: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  studentBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e53935',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#e53935',
    fontSize: 15,
    fontWeight: '600',
  },
});