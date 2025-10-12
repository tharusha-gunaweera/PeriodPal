import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut, updateProfile, updateEmail } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db } from '../../../../FirebaseConfig';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    joinDate: '',
    profileImage: null,
    bio: '',
    location: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        setUser(currentUser);
        
        // Load basic user data from Firebase Auth
        const basicUserData = {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          phoneNumber: currentUser.phoneNumber || '',
          joinDate: new Date(currentUser.metadata.creationTime).toLocaleDateString(),
          profileImage: currentUser.photoURL || null
        };

        // Load additional user data from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const firestoreData = userDoc.data();
            setUserData({
              ...basicUserData,
              phoneNumber: firestoreData.phoneNumber || basicUserData.phoneNumber,
              bio: firestoreData.bio || 'Tell us about yourself...',
              location: firestoreData.location || 'Add your location',
            });
          } else {
            setUserData({
              ...basicUserData,
              bio: 'Tell us about yourself...',
              location: 'Add your location'
            });
          }
        } catch (firestoreError) {
          console.error('Error loading Firestore data:', firestoreError);
          setUserData({
            ...basicUserData,
            bio: 'Tell us about yourself...',
            location: 'Add your location'
          });
        }

        // Load profile image from local storage if exists
        const localImage = await AsyncStorage.getItem('user_profile_image');
        if (localImage) {
          setUserData(prev => ({ ...prev, profileImage: localImage }));
        }
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: performLogout
        }
      ]
    );
  };

  const performLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      
      // Clear all local storage
      await AsyncStorage.multiRemove([
        'user',
        'user_profile',
        'user_profile_image',
        'notifications_enabled',
        'dark_mode',
        'user_feelings',
        'cycle_settings'
      ]);
      
      // Use replace instead of reset to avoid navigation issues
      navigation.replace('Login');
      
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleEditField = (field, value) => {
    setEditingField(field);
    setEditValue(value);
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingField || !user) return;

    setSaving(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (editingField === 'name') {
        await updateProfile(currentUser, {
          displayName: editValue
        });
        setUserData(prev => ({ ...prev, name: editValue }));
      } 
      else if (editingField === 'email') {
        await updateEmail(currentUser, editValue);
        setUserData(prev => ({ ...prev, email: editValue }));
      }
      else if (editingField === 'phoneNumber') {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          phoneNumber: editValue,
          updatedAt: new Date()
        });
        setUserData(prev => ({ ...prev, phoneNumber: editValue }));
      }
      else if (editingField === 'bio' || editingField === 'location') {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          [editingField]: editValue,
          updatedAt: new Date()
        });
        setUserData(prev => ({ ...prev, [editingField]: editValue }));
      }

      await AsyncStorage.setItem('user_profile', JSON.stringify(userData));

      setShowEditModal(false);
      setEditingField(null);
      setEditValue('');
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log in again to update your email';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleImagePick = async () => {
    try {
      setUploadingImage(true);
      
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
        includeBase64: false,
      };

      launchImageLibrary(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.error('ImagePicker Error: ', response.error);
          Alert.alert('Error', 'Failed to pick image');
        } else if (response.assets && response.assets[0]) {
          const imageUri = response.assets[0].uri;
          
          // Store image locally
          await AsyncStorage.setItem('user_profile_image', imageUri);
          
          // Update local state
          setUserData(prev => ({ ...prev, profileImage: imageUri }));
          
          Alert.alert('Success', 'Profile image updated!');
        }
        setUploadingImage(false);
      });
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to update profile image');
      setUploadingImage(false);
    }
  };

  const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={24} color="#EC4899" />
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {userData.profileImage ? (
              <Image
                source={{ uri: userData.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handleImagePick}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {userData.name || 'No Name Set'}
            </Text>
            <Text style={styles.userEmail}>
              {userData.email || 'No Email'}
            </Text>
            <Text style={styles.joinDate}>
              Member since {userData.joinDate || 'Unknown'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => handleEditField('name', userData.name)}
          >
            <Ionicons name="create-outline" size={20} color="#EC4899" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TouchableOpacity onPress={() => handleEditField('bio', userData.bio)}>
            <Ionicons name="create-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
        <Text style={styles.bioText}>
          {userData.bio || 'Tell us about yourself...'}
        </Text>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <MenuItem
          icon="mail-outline"
          title="Email"
          subtitle={userData.email || 'Not set'}
          onPress={() => handleEditField('email', userData.email)}
        />
        
        <MenuItem
          icon="call-outline"
          title="Phone"
          subtitle={userData.phoneNumber || 'Not set'}
          onPress={() => handleEditField('phoneNumber', userData.phoneNumber)}
        />
        
        <MenuItem
          icon="location-outline"
          title="Location"
          subtitle={userData.location || 'Not set'}
          onPress={() => handleEditField('location', userData.location)}
        />
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <MenuItem
          icon="shield-checkmark-outline"
          title="Privacy & Security"
          subtitle="Manage your privacy settings"
          onPress={() => Alert.alert('Privacy', 'Privacy settings screen would open here')}
        />
        
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage your notification preferences"
          onPress={() => Alert.alert('Notifications', 'Notification settings screen would open here')}
        />
        
        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => Alert.alert('Support', 'Support screen would open here')}
        />
      </View>

      {/* Community Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community</Text>
        
        <MenuItem
          icon="heart-outline"
          title="My Donations"
          subtitle="View your donation history"
          onPress={() => navigation.navigate('DonationScreen')}
        />
        
        <MenuItem
          icon="cart-outline"
          title="My Purchases"
          subtitle="View your purchase history"
          onPress={() => Alert.alert('Purchases', 'Purchase history screen would open here')}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Period Pal v1.0.0</Text>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit {editingField?.charAt(0).toUpperCase() + editingField?.slice(1)}
            </Text>
            
            <TextInput
              style={[
                styles.modalInput,
                editingField === 'bio' && styles.modalInputMultiline
              ]}
              value={editValue}
              onChangeText={setEditValue}
              multiline={editingField === 'bio'}
              numberOfLines={editingField === 'bio' ? 4 : 1}
              placeholder={`Enter your ${editingField}`}
              autoCapitalize={editingField === 'name' ? 'words' : 'none'}
              keyboardType={
                editingField === 'email' ? 'email-address' : 
                editingField === 'phoneNumber' ? 'phone-pad' : 'default'
              }
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowEditModal(false)}
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalSave, saving && styles.modalSaveDisabled]}
                onPress={saveEdit}
                disabled={saving || !editValue.trim()}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#EC4899',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#EC4899',
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#EC4899',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  editProfileButton: {
    padding: 8,
    backgroundColor: '#FDF2F8',
    borderRadius: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 20,
  },
  modalInputMultiline: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  modalSave: {
    flex: 1,
    backgroundColor: '#EC4899',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalSaveDisabled: {
    backgroundColor: '#9CA3AF',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;