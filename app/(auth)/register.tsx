import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Lock, Building, UserCheck } from 'lucide-react-native';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    surname: '',
    role: 'individual' as 'company' | 'individual',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { colors } = useTheme();

  const handleRegister = async () => {
    if (!formData.username.trim() || !formData.password.trim() || !formData.name.trim() || !formData.surname.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters long');
      return;
    }

    setIsLoading(true);
    const success = await register(
      formData.username.trim(),
      formData.password,
      formData.name.trim(),
      formData.surname.trim(),
      formData.role
    );
    setIsLoading(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Username already exists. Please choose a different username.');
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us to start calculating salaries</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    autoCapitalize="words"
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.surname}
                    onChangeText={(text) => setFormData({ ...formData, surname: text })}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <UserCheck size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.username}
                  onChangeText={(text) => setFormData({ ...formData, username: text })}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min. 4 characters)"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                />
              </View>

              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Account Type</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'individual' && styles.roleButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'individual' })}
                  >
                    <User size={20} color={formData.role === 'individual' ? '#FFFFFF' : colors.textSecondary} />
                    <Text style={[
                      styles.roleButtonText,
                      formData.role === 'individual' && styles.roleButtonTextActive,
                    ]}>
                      Individual
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      formData.role === 'company' && styles.roleButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, role: 'company' })}
                  >
                    <Building size={20} color={formData.role === 'company' ? '#FFFFFF' : colors.textSecondary} />
                    <Text style={[
                      styles.roleButtonText,
                      formData.role === 'company' && styles.roleButtonTextActive,
                    ]}>
                      Company
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      maxWidth: 400,
      alignSelf: 'center',
      width: '100%',
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    form: {
      marginBottom: 32,
    },
    inputRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    halfInput: {
      flex: 1,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      paddingVertical: 16,
    },
    roleContainer: {
      marginBottom: 24,
    },
    roleLabel: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 12,
    },
    roleButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    roleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    roleButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    roleButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.textSecondary,
      marginLeft: 8,
    },
    roleButtonTextActive: {
      color: '#FFFFFF',
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    linkText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.primary,
    },
  });