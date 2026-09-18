
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { canUseGoogleSignIn, getGoogleSetupMessage } from '../config/googleAuth';
import { getAuthErrorMessage } from '../services/authService';
import { configureGoogleSignIn, getGoogleIdToken } from '../services/googleSignIn';
import { colors, commonStyles } from '../styles/common';

export default function LoginScreen() {
  const auth = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const canUseGoogle = canUseGoogleSignIn();
  const googleSetupMsg = getGoogleSetupMessage();

  useEffect(() => {
    if (canUseGoogle) configureGoogleSignIn();
  }, [canUseGoogle]);

  const doEmailLogin = async () => {
    setErr('');
    setLoading(true);
    
    try {
      await auth.signInWithEmail(form.email, form.password);
    } catch (error) {
      const msg = getAuthErrorMessage(error);
      setErr(msg || 'Login failed');
    }
    
    setLoading(false);
  };

  const doGoogleLogin = async () => {
    if (!canUseGoogle) {
      setErr(googleSetupMsg || 'Google sign-in not available');
      return;
    }
    
    setErr('');
    setLoading(true);

    try {
      const token = await getGoogleIdToken();
      if (!token) {
        setLoading(false);
        return;
      }
      await auth.signInWithGoogle(token);
    } catch (error) {
      if (error?.code === 'SIGN_IN_CANCELLED' || error?.code === '-5') {
        setLoading(false);
        return;
      }
      
      let msg = error?.message || getAuthErrorMessage(error);
      if (error?.code) {
        msg = msg + ' (' + error.code + ')';
      }
      setErr(msg);
    }
    
    setLoading(false);
  };

  const updateForm = (field, val) => {
    setForm({
      ...form,
      [field]: val
    });
  };

  return (
    <SafeAreaView style={commonStyles.screen}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollView} 
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="school" size={52} color={colors.primary} />
            </View>
            <Text style={styles.title}>StudentHub</Text>
            <Text style={styles.tag}>LEARN • PLAN • ACHIEVE</Text>
            <Text style={styles.sub}>Your Campus Companion</Text>
          </View>

          <View style={styles.inputWrap}>
            <Ionicons 
              name="mail-outline" 
              size={18} 
              color={colors.textLight} 
              style={styles.icon} 
            />
            <TextInput
              style={[commonStyles.input, styles.inputPad]}
              placeholder="Email address"
              placeholderTextColor={colors.textLight}
              value={form.email}
              onChangeText={t => updateForm('email', t)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons 
              name="lock-closed-outline" 
              size={18} 
              color={colors.textLight} 
              style={styles.icon} 
            />
            <TextInput
              style={[commonStyles.input, styles.inputPad]}
              placeholder="Password"
              placeholderTextColor={colors.textLight}
              value={form.password}
              onChangeText={t => updateForm('password', t)}
              secureTextEntry
              autoCorrect={false}
            />
          </View>

          {err ? <Text style={styles.err}>{err}</Text> : null}

          <Pressable
            style={[styles.btn, loading && styles.disabled]}
            onPress={doEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.googleBtn, 
              (loading || !canUseGoogle) && styles.disabled
            ]}
            onPress={doGoogleLogin}
            disabled={loading || !canUseGoogle}
          >
            <Ionicons name="logo-google" size={18} color={colors.text} />
            <Text style={styles.googleBtnText}>
              {canUseGoogle ? 'Continue with Google' : 'Google unavailable'}
            </Text>
          </Pressable>

          {googleSetupMsg ? (
            <Text style={styles.setupMsg}>{googleSetupMsg}</Text>
          ) : null}

          <View style={styles.arc} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  tag: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textLight,
  },
  inputWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  icon: {
    position: 'absolute',
    left: 14,
    top: 16,
    zIndex: 1,
  },
  inputPad: {
    paddingLeft: 42,
  },
  err: {
    color: '#c62828',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  btn: {
    marginTop: 4,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  googleBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  disabled: {
    opacity: 0.6,
  },
  setupMsg: {
    marginTop: 10,
    fontSize: 12,
    color: '#c62828',
    textAlign: 'center',
  },
  arc: {
    marginTop: 40,
    alignSelf: 'center',
    width: 280,
    height: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 140,
    borderTopRightRadius: 140,
    borderBottomWidth: 0,
  },
});