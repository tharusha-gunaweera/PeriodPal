import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../../../FirebaseConfig';

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' });
    }
  };

  // Validation functions
  const validateFirstName = (firstName) => {
    if (!firstName.trim()) return 'First name is required';
    if (!/^[A-Za-z]/.test(firstName)) return 'First name must start with a letter';
    if (!/^[A-Za-z\s]+$/.test(firstName)) return 'First name can only contain letters and spaces';
    if (firstName.length < 2) return 'First name must be at least 2 characters';
    return '';
  };

  const validateLastName = (lastName) => {
    if (!lastName.trim()) return 'Last name is required';
    if (!/^[A-Za-z]/.test(lastName)) return 'Last name must start with a letter';
    if (!/^[A-Za-z\s]+$/.test(lastName)) return 'Last name can only contain letters and spaces';
    if (lastName.length < 2) return 'Last name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber.trim()) return 'Phone number is required';
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(phoneNumber)) return 'Phone number can only contain numbers and + - ( )';
    if (phoneNumber.replace(/[^0-9]/g, '').length < 10) return 'Phone number must be at least 10 digits';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {
      firstName: validateFirstName(formData.firstName),
      lastName: validateLastName(formData.lastName),
      email: validateEmail(formData.email),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      password: validatePassword(formData.password),
      confirmPassword: formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Check if email already exists
  const checkEmailExists = async (email) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    // Check if email already exists
    setLoading(true);
    try {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        Alert.alert('Email Exists', 'This email is already registered. Please use a different email or login.');
        setLoading(false);
        return;
      }

      const { email, password } = formData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store additional user data in AsyncStorage
      const userData = {
        ...userCredential.user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('MainApp');
    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = 'Sign up failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (text) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format based on length
    let formatted = cleaned;
    if (cleaned.length > 3 && cleaned.length <= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else if (cleaned.length > 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    
    return formatted;
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    handleInputChange('phoneNumber', formatted);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>PP</Text>
            </View>
            <Text style={styles.appName}>Period Pal</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Get Started</Text>

            {/* First + Last Name */}
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={[styles.textInput, errors.firstName && styles.inputError]}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.firstName}
                  onChangeText={(v) => handleInputChange('firstName', v)}
                  autoCapitalize="words"
                />
                {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
              </View>

              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={[styles.textInput, errors.lastName && styles.inputError]}
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.lastName}
                  onChangeText={(v) => handleInputChange('lastName', v)}
                  autoCapitalize="words"
                />
                {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.textInput, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(v) => handleInputChange('email', v)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={[styles.textInput, errors.phoneNumber && styles.inputError]}
                placeholder="(123) 456-7890"
                placeholderTextColor="#9CA3AF"
                value={formData.phoneNumber}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={14}
              />
              {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={[styles.textInput, errors.password && styles.inputError]}
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(v) => handleInputChange('password', v)}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : (
                <Text style={styles.passwordHint}>
                  Must include: 6+ chars, uppercase, lowercase, number, special character
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={[styles.textInput, errors.confirmPassword && styles.inputError]}
                placeholder="Confirm password"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(v) => handleInputChange('confirmPassword', v)}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Your data is encrypted and secure. We never share your personal information.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF2F8' },
  scrollContainer: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#EC4899',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#EC4899', marginBottom: 4 },
  subtitle: { color: '#6B7280', fontSize: 16 },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, textAlign: 'center' },
  nameRow: { flexDirection: 'Column', justifyContent: 'space-between', marginBottom: 4 },
  halfInput: { flex: 0.48 },
  inputContainer: { marginBottom: 16 },
  label: { color: '#1F2937', fontWeight: '500', marginBottom: 6, fontSize: 14 },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordHint: { color: '#6B7280', fontSize: 12, marginTop: 4, marginLeft: 4 },
  termsContainer: { marginBottom: 20, marginTop: 8 },
  termsText: { color: '#6B7280', fontSize: 12, textAlign: 'center', lineHeight: 16 },
  termsLink: { color: '#EC4899', fontWeight: '500' },
  signUpButton: {
    backgroundColor: '#EC4899',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signUpButtonDisabled: { opacity: 0.7 },
  signUpButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: '#6B7280', fontSize: 14 },
  loginLink: { color: '#EC4899', fontWeight: 'bold', fontSize: 14 },
  infoContainer: { marginTop: 20 },
  infoText: { textAlign: 'center', color: '#6B7280', fontSize: 12, lineHeight: 16 },
});

export default SignUpScreen;