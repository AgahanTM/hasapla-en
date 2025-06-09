import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  User, 
  Building, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronRight,
  Shield,
  Info
} from 'lucide-react-native';

export default function SettingsTab() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <View style={styles.profileContainer}>
              <View style={styles.avatar}>
                {user?.role === 'company' ? (
                  <Building size={32} color={colors.primary} />
                ) : (
                  <User size={32} color={colors.primary} />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.name} {user?.surname}
                </Text>
                <Text style={styles.profileUsername}>@{user?.username}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {user?.role === 'company' ? 'Company Account' : 'Individual Account'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
              <View style={styles.settingLeft}>
                {theme === 'dark' ? (
                  <Moon size={24} color={colors.primary} />
                ) : (
                  <Sun size={24} color={colors.primary} />
                )}
                <Text style={styles.settingText}>
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Info size={24} color={colors.primary} />
                <View>
                  <Text style={styles.settingText}>Salary Calculator</Text>
                  <Text style={styles.settingSubtext}>Version 1.0.0</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Shield size={24} color={colors.primary} />
                <View>
                  <Text style={styles.settingText}>Privacy & Security</Text>
                  <Text style={styles.settingSubtext}>
                    All data is stored locally on your device
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Account Actions Section */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.card}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={24} color={colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    section: {
      marginBottom: 24,
    },
    lastSection: {
      marginBottom: 40,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 12,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    profileUsername: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    roleBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    roleBadgeText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: colors.primary,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingText: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      marginLeft: 16,
    },
    settingSubtext: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginLeft: 16,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.error + '10',
      borderRadius: 12,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.error + '20',
    },
    logoutText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.error,
      marginLeft: 12,
    },
  });