import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Employee } from '@/types';
import { 
  calculateSalary, 
  calculateGrossFromDaily, 
  formatCurrency, 
  defaultDeductionRates 
} from '@/utils/salaryCalculator';
import { Plus, User, CreditCard as Edit3, Trash2, Calculator, X } from 'lucide-react-native';

export default function EmployeesTab() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    grossSalary: '',
    dailyEarnings: '',
    workingDays: '22',
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const employeesData = await AsyncStorage.getItem('employees');
      const allEmployees = employeesData ? JSON.parse(employeesData) : [];
      const userEmployees = allEmployees.filter((emp: Employee) => emp.companyId === user?.id);
      setEmployees(userEmployees);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const saveEmployee = async () => {
    if (!formData.name.trim() || !formData.surname.trim()) {
      Alert.alert('Error', 'Please fill in name and surname');
      return;
    }

    const grossSalary = parseFloat(formData.grossSalary) || 0;
    const dailyEarnings = parseFloat(formData.dailyEarnings) || 0;
    const workingDays = parseInt(formData.workingDays) || 22;

    if (grossSalary <= 0 && dailyEarnings <= 0) {
      Alert.alert('Error', 'Please enter salary information');
      return;
    }

    try {
      const employeesData = await AsyncStorage.getItem('employees');
      const allEmployees = employeesData ? JSON.parse(employeesData) : [];

      const finalGrossSalary = grossSalary > 0 ? grossSalary : calculateGrossFromDaily(dailyEarnings, workingDays);

      if (editingEmployee) {
        // Update existing employee
        const updatedEmployees = allEmployees.map((emp: Employee) =>
          emp.id === editingEmployee.id
            ? {
                ...emp,
                name: formData.name.trim(),
                surname: formData.surname.trim(),
                grossSalary: finalGrossSalary,
                dailyEarnings,
                workingDays,
              }
            : emp
        );
        await AsyncStorage.setItem('employees', JSON.stringify(updatedEmployees));
      } else {
        // Add new employee
        const newEmployee: Employee = {
          id: Date.now().toString(),
          name: formData.name.trim(),
          surname: formData.surname.trim(),
          grossSalary: finalGrossSalary,
          dailyEarnings,
          workingDays,
          companyId: user!.id,
          createdAt: new Date().toISOString(),
        };
        allEmployees.push(newEmployee);
        await AsyncStorage.setItem('employees', JSON.stringify(allEmployees));
      }

      resetForm();
      setShowAddModal(false);
      setEditingEmployee(null);
      loadEmployees();
    } catch (error) {
      Alert.alert('Error', 'Failed to save employee');
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const employeesData = await AsyncStorage.getItem('employees');
              const allEmployees = employeesData ? JSON.parse(employeesData) : [];
              const updatedEmployees = allEmployees.filter((emp: Employee) => emp.id !== employeeId);
              await AsyncStorage.setItem('employees', JSON.stringify(updatedEmployees));
              loadEmployees();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete employee');
            }
          },
        },
      ]
    );
  };

  const editEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      surname: employee.surname,
      grossSalary: employee.grossSalary.toString(),
      dailyEarnings: employee.dailyEarnings.toString(),
      workingDays: employee.workingDays.toString(),
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      grossSalary: '',
      dailyEarnings: '',
      workingDays: '22',
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingEmployee(null);
    resetForm();
  };

  const renderEmployee = (employee: Employee) => {
    const calculation = calculateSalary(employee.grossSalary, defaultDeductionRates);
    
    return (
      <View key={employee.id} style={styles.employeeCard}>
        <View style={styles.employeeHeader}>
          <View style={styles.employeeInfo}>
            <View style={styles.avatar}>
              <User size={24} color={colors.primary} />
            </View>
            <View style={styles.employeeDetails}>
              <Text style={styles.employeeName}>
                {employee.name} {employee.surname}
              </Text>
              <Text style={styles.employeeSubtitle}>
                {employee.workingDays} working days
              </Text>
            </View>
          </View>
          <View style={styles.employeeActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => editEmployee(employee)}
            >
              <Edit3 size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => deleteEmployee(employee.id)}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.salaryInfo}>
          <View style={styles.salaryRow}>
            <Text style={styles.salaryLabel}>Gross Salary:</Text>
            <Text style={styles.salaryValue}>{formatCurrency(calculation.grossSalary)}</Text>
          </View>
          <View style={styles.salaryRow}>
            <Text style={styles.salaryLabel}>Net Salary:</Text>
            <Text style={[styles.salaryValue, styles.netSalary]}>{formatCurrency(calculation.netSalary)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Employees</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {employees.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Employees Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first employee to start calculating salaries
            </Text>
          </View>
        ) : (
          employees.map(renderEmployee)
        )}
      </ScrollView>

      {/* Add/Edit Employee Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingEmployee ? 'Edit Employee' : 'Add Employee'}
            </Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                placeholderTextColor={colors.textSecondary}
                value={formData.surname}
                onChangeText={(text) => setFormData({ ...formData, surname: text })}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gross Salary ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter gross salary (optional if using daily earnings)"
                placeholderTextColor={colors.textSecondary}
                value={formData.grossSalary}
                onChangeText={(text) => setFormData({ ...formData, grossSalary: text })}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.sectionTitle}>OR</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Daily Earnings ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter daily earnings"
                placeholderTextColor={colors.textSecondary}
                value={formData.dailyEarnings}
                onChangeText={(text) => setFormData({ ...formData, dailyEarnings: text })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Working Days</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter working days"
                placeholderTextColor={colors.textSecondary}
                value={formData.workingDays}
                onChangeText={(text) => setFormData({ ...formData, workingDays: text })}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveEmployee}>
              <Text style={styles.saveButtonText}>
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 12,
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
    employeeCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    employeeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    employeeInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    employeeDetails: {
      flex: 1,
    },
    employeeName: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
      marginBottom: 4,
    },
    employeeSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: colors.textSecondary,
    },
    employeeActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    salaryInfo: {
      gap: 8,
    },
    salaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    salaryLabel: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
    },
    salaryValue: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    netSalary: {
      color: colors.success,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: colors.textSecondary,
      textAlign: 'center',
      marginVertical: 20,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
    },
  });