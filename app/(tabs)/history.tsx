import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CalculationHistory } from '@/types';
import { formatCurrency } from '@/utils/salaryCalculator';
import { History as HistoryIcon, Calendar, DollarSign, Trash2 } from 'lucide-react-native';

export default function HistoryTab() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [history, setHistory] = useState<CalculationHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem('calculationHistory');
      const allHistory = historyData ? JSON.parse(historyData) : [];
      const userHistory = allHistory
        .filter((item: CalculationHistory) => item.userId === user?.id)
        .sort((a: CalculationHistory, b: CalculationHistory) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setHistory(userHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const deleteHistoryItem = async (itemId: string) => {
    try {
      const historyData = await AsyncStorage.getItem('calculationHistory');
      const allHistory = historyData ? JSON.parse(historyData) : [];
      const updatedHistory = allHistory.filter((item: CalculationHistory) => item.id !== itemId);
      await AsyncStorage.setItem('calculationHistory', JSON.stringify(updatedHistory));
      loadHistory();
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHistoryItem = (item: CalculationHistory) => {
    return (
      <View key={item.id} style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.historyInfo}>
            <View style={styles.historyIcon}>
              <DollarSign size={20} color={colors.primary} />
            </View>
            <View style={styles.historyDetails}>
              <Text style={styles.historyTitle}>
                {item.employeeName || 'Salary Calculation'}
              </Text>
              <View style={styles.dateContainer}>
                <Calendar size={14} color={colors.textSecondary} />
                <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteHistoryItem(item.id)}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.calculationDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gross Salary:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(item.calculation.grossSalary)}
            </Text>
          </View>
          
          <View style={styles.deductionsContainer}>
            <Text style={styles.deductionsTitle}>Deductions:</Text>
            <View style={styles.deductionRow}>
              <Text style={styles.deductionLabel}>
                Tax ({item.deductionRates.tax}%):
              </Text>
              <Text style={styles.deductionValue}>
                -{formatCurrency(item.calculation.taxAmount)}
              </Text>
            </View>
            <View style={styles.deductionRow}>
              <Text style={styles.deductionLabel}>
                Retirement ({item.deductionRates.retirement}%):
              </Text>
              <Text style={styles.deductionValue}>
                -{formatCurrency(item.calculation.retirementAmount)}
              </Text>
            </View>
            <View style={styles.deductionRow}>
              <Text style={styles.deductionLabel}>
                Insurance ({item.deductionRates.insurance}%):
              </Text>
              <Text style={styles.deductionValue}>
                -{formatCurrency(item.calculation.insuranceAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.netSalaryContainer}>
            <Text style={styles.netSalaryLabel}>Net Salary:</Text>
            <Text style={styles.netSalaryValue}>
              {formatCurrency(item.calculation.netSalary)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calculation History</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <HistoryIcon size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your saved salary calculations will appear here
            </Text>
          </View>
        ) : (
          history.map(renderHistoryItem)
        )}
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
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
    },
    emptyTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    historyCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    historyInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    historyIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    historyDetails: {
      flex: 1,
    },
    historyTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    historyDate: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
      marginLeft: 6,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.error + '20',
    },
    calculationDetails: {
      gap: 8,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
    },
    detailValue: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    deductionsContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
    },
    deductionsTitle: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 8,
    },
    deductionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    deductionLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    deductionValue: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.error,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    netSalaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.success + '10',
      borderRadius: 12,
      padding: 16,
    },
    netSalaryLabel: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    netSalaryValue: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.success,
    },
  });