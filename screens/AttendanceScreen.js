import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import {
  clockIn,
  clockOut,
  formatClockTime,
  formatDuration,
  getTodayAttendance,
} from '../services/attendanceStorage';
import { colors, commonStyles } from '../styles/common';

export default function AttendanceScreen() {
  const [record, setRecord] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      setRecord(await getTodayAttendance());
    } catch (e) {
      setErr(e.message || 'Could not load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function onClockIn() {
    setBusy(true);
    setErr('');
    try {
      setRecord(await clockIn());
    } catch (e) {
      setErr(e.message || 'Clock in failed');
    }
    setBusy(false);
  }

  async function onClockOut() {
    setBusy(true);
    setErr('');
    try {
      setRecord(await clockOut());
    } catch (e) {
      setErr(e.message || 'Clock out failed');
    }
    setBusy(false);
  }

  const clockedIn = record?.clockIn && !record?.clockOut;
  const done = record?.clockIn && record?.clockOut;

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>ATTENDANCE</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={34} color={colors.primary} />
            </View>

            {!record?.clockIn && (
              <>
                <Text style={styles.cardTitle}>Start your day</Text>
                <Text style={styles.cardText}>
                  Hit clock in when you arrive. Resets tomorrow.
                </Text>
                <Pressable
                  style={[styles.primaryButton, busy && styles.disabled]}
                  onPress={onClockIn}
                  disabled={busy}
                >
                  <Text style={styles.primaryButtonText}>
                    {busy ? 'Saving...' : 'Clock In'}
                  </Text>
                </Pressable>
              </>
            )}

            {clockedIn && (
              <>
                <Text style={styles.cardTitle}>Clocked in</Text>
                <Text style={styles.timeLabel}>Logged in at</Text>
                <Text style={styles.timeValue}>{formatClockTime(record.clockIn)}</Text>
                <Pressable
                  style={[styles.secondaryButton, busy && styles.disabled]}
                  onPress={onClockOut}
                  disabled={busy}
                >
                  <Text style={styles.secondaryButtonText}>
                    {busy ? 'Saving...' : 'Clock Out'}
                  </Text>
                </Pressable>
              </>
            )}

            {done && (
              <>
                <Text style={styles.cardTitle}>Today</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>In</Text>
                  <Text style={styles.summaryValue}>{formatClockTime(record.clockIn)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Out</Text>
                  <Text style={styles.summaryValue}>{formatClockTime(record.clockOut)}</Text>
                </View>
                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatDuration(record.clockIn, record.clockOut)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {err ? <Text style={styles.errorText}>{err}</Text> : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  loader: {
    marginTop: 36,
  },
  content: {
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  timeLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: 180,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    minWidth: 180,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
  summaryRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  totalBox: {
    width: '100%',
    marginTop: 8,
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
