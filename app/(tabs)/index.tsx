import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  calculateSalary, 
  calculateGrossFromDaily, 
  formatCurrency, 
  defaultDeductionRates 
} from '@/utils/salaryCalculator';
import { DeductionRates, CalculationHistory } from '@/types';
import { Calculator, DollarSign, Percent, Save } from 'lucide-react-native';

export default function CalculatorTab() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [inputType, setInputType] = useState<'gross' | 'daily'>('gross');
  const [grossSalary, setGrossSalary] = useState('');
  const [dailyEarnings, setDailyEarnings] = useState('');
  const [workingDays, setWorkingDays] = useState('22');
  const [deductionRates, setDeductionRates] = useState<DeductionRates>(defaultDeductionRates);
  const [calculation, setCalculation] = useState(null);

  const handleCalculate = () => {
    let gross = 0;
    
    if (inputType === 'gross') {
      gross = parseFloat(grossSalary) || 0;
    } else {
      const daily = parseFloat(dailyEarnings) || 0;
      const days = parseInt(workingDays) || 0;
      gross = calculateGrossFromDaily(daily, days);
    }

    if (gross <= 0) {
      Alert.alert('Error', 'Please enter valid salary information');
      return;
    }

    const result = calculateSalary(gross, deductionRates);
    setCalculation(result);
  };

  const handleSaveCalculation = async () => {
    if (!calculation || !user) return;

    try {
      const historyData = await AsyncStorage.getItem('calculationHistory');
      const history = historyData ? JSON.parse(historyData) : [];

      const newCalculation: CalculationHistory = {
        id: Date.now().toString(),
        userId: user.id,
        calculation,
        deductionRates,
        createdAt: new Date().toISOString(),
      };

      history.push(newCalculation);
      await AsyncStorage.setItem('calculationHistory', JSON.stringify(history));
      Alert.alert('Success', 'Calculation saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save calculation');
    }
  };

  const resetDeductionRates = () => {
    setDeductionRates(defaultDeductionRates);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Salary Calculator</Text>
          <Text style={styles.subtitle}>Calculate your net salary with custom deductions</Text>
        </View>

        {/* Input Type Toggle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Input Method</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                inputType === 'gross' && styles.toggleButtonActive,
              ]}
              onPress={() => setInputType('gross')}
            >
              <DollarSign 
                size={20} 
                color={inputType === 'gross' ? '#FFFFFF' : colors.textSecondary} 
              />
              <Text style={[
                styles.toggleButtonText,
                inputType === 'gross' && styles.toggleButtonTextActive,
              ]}>
                Gross Salary
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                inputType === 'daily' && styles.toggleButtonActive,
              ]}
              onPress={() => setInputType('daily')}
            >
              <Calculator 
                size={20} 
                color={inputType === 'daily' ? '#FFFFFF' : colors.textSecondary} 
              />
              <Text style={[
                styles.toggleButtonText,
                inputType === 'daily' && styles.toggleButtonTextActive,
              ]}>
                Daily Earnings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Salary Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Salary Information</Text>
          {inputType === 'gross' ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gross Salary ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter gross salary"
                placeholderTextColor={colors.textSecondary}
                value={grossSalary}
                onChangeText={setGrossSalary}
                keyboardType="numeric"
              />
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Daily Earnings ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter daily earnings"
                  placeholderTextColor={colors.textSecondary}
                  value={dailyEarnings}
                  onChangeText={setDailyEarnings}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Working Days</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter working days"
                  placeholderTextColor={colors.textSecondary}
                  value={workingDays}
                  onChangeText={setWorkingDays}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}
        </View>

        {/* Deduction Rates */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Deduction Rates (%)</Text>
            <TouchableOpacity onPress={resetDeductionRates} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tax Rate (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Tax rate"
              placeholderTextColor={colors.textSecondary}
              value={deductionRates.tax.toString()}
              onChangeText={(text) => setDeductionRates({
                ...deductionRates,
                tax: parseFloat(text) || 0
              })}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Retirement Rate (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Retirement rate"
              placeholderTextColor={colors.textSecondary}
              value={deductionRates.retirement.toString()}
              onChangeText={(text) => setDeductionRates({
                ...deductionRates,
                retirement: parseFloat(text) || 0
              })}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Insurance Rate (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Insurance rate"
              placeholderTextColor={colors.textSecondary}
              value={deductionRates.insurance.toString()}
              onChangeText={(text) => setDeductionRates({
                ...deductionRates,
                insurance: parseFloat(text) || 0
              })}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Calculate Button */}
        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
          <Calculator size={24} color="#FFFFFF" />
          <Text style={styles.calculateButtonText}>Calculate Salary</Text>
        </TouchableOpacity>

        {/* Results */}
        {calculation && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Calculation Results</Text>
              <TouchableOpacity onPress={handleSaveCalculation} style={styles.saveButton}>
                <Save size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Gross Salary:</Text>
              <Text style={styles.resultValue}>{formatCurrency(calculation.grossSalary)}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Tax ({deductionRates.tax}%):</Text>
              <Text style={[styles.resultValue, styles.deductionValue]}>
                -{formatCurrency(calculation.taxAmount)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Retirement ({deductionRates.retirement}%):</Text>
              <Text style={[styles.resultValue, styles.deductionValue]}>
                -{formatCurrency(calculation.retirementAmount)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Insurance ({deductionRates.insurance}%):</Text>
              <Text style={[styles.resultValue, styles.deductionValue]}>
                -{formatCurrency(calculation.insuranceAmount)}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Deductions:</Text>
              <Text style={[styles.resultValue, styles.deductionValue]}>
                -{formatCurrency(calculation.totalDeductions)}
              </Text>
            </View>
            
            <View style={[styles.resultRow, styles.netSalaryRow]}>
              <Text style={styles.netSalaryLabel}>Net Salary:</Text>
              <Text style={styles.netSalaryValue}>{formatCurrency(calculation.netSalary)}</Text>
            </View>
          </View>
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
    scrollView: {
      flex: 1,
      padding: 20,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    resetButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: colors.primary + '20',
      borderRadius: 8,
    },
    resetButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.primary,
    },
    toggleContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    toggleButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    toggleButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.textSecondary,
      marginLeft: 8,
    },
    toggleButtonTextActive: {
      color: '#FFFFFF',
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    calculateButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    calculateButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginLeft: 8,
    },
    saveButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    resultLabel: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
    },
    resultValue: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    deductionValue: {
      color: colors.error,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
    },
    netSalaryRow: {
      backgroundColor: colors.primary + '10',
      marginHorizontal: -20,
      marginBottom: -20,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    netSalaryLabel: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    netSalaryValue: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.success,
    },
  });