import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { getUserDisplayName, getUserEmail } from '../utils/userDisplay';
import { colors, commonStyles } from '../styles/common';

const QUICK_LINKS = [
  { id: '1', label: 'Study Notes', icon: 'folder-outline', color: '#8e24aa', screen: 'Notes' },
  { id: '2', label: 'Timetable', icon: 'calendar-outline', color: '#43a047', screen: 'Timetable' },
  { id: '3', label: 'Tasks', icon: 'document-text-outline', color: '#f9a825', screen: 'Tasks' },
  { id: '4', label: 'Attendance', icon: 'time-outline', color: '#5b6fd8', screen: 'Attendance' },
];

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const displayName = getUserDisplayName(user);
  const displayEmail = getUserEmail(user);

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
            <View style={styles.studentBadge}>
              <Text style={styles.studentBadgeText}>Student</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Links</Text>
        <View style={styles.grid}>
          {QUICK_LINKS.map((item) => (
            <Pressable
              key={item.id}
              style={styles.gridItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.gridIconBox, { borderColor: item.color }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={styles.gridLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  studentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  studentBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridItem: {
    width: '31%',
    alignItems: 'center',
    marginBottom: 14,
  },
  gridIconBox: {
    width: 58,
    height: 58,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  gridLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
});