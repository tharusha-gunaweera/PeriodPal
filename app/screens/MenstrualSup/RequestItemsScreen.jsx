import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const RequestItemsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('pads');
  const [selectedItems, setSelectedItems] = useState({});
  const [isUrgent, setIsUrgent] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmDetails, setConfirmDetails] = useState(false);

  // Delivery details state
  const [deliveryDetails, setDeliveryDetails] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    phone: ''
  });

  // Product categories and items
  const productCategories = {
    pads: {
      title: 'Pads',
      items: [
        { id: 'pad_regular', name: 'Regular Pads', quantity: 0 },
        { id: 'pad_overnight', name: 'Overnight Pads', quantity: 0 },
        { id: 'pad_winged', name: 'Winged Pads', quantity: 0 },
        { id: 'panty_liners', name: 'Panty Liners', quantity: 0 }
      ]
    },
    tampons: {
      title: 'Tampons',
      items: [
        { id: 'tampon_regular', name: 'Regular Tampons', quantity: 0 },
        { id: 'tampon_super', name: 'Super Tampons', quantity: 0 },
        { id: 'tampon_organic', name: 'Organic Tampons', quantity: 0 }
      ]
    },
    comfort: {
      title: 'Comfort Items',
      items: [
        { id: 'pain_relief', name: 'Pain Relief', quantity: 0 },
        { id: 'heating_pad', name: 'Heating Pad', quantity: 0 },
        { id: 'wet_wipes', name: 'Intimate Wipes', quantity: 0 },
        { id: 'chocolate', name: 'Comfort Snacks', quantity: 0 }
      ]
    },
    eco: {
      title: 'Eco-Friendly',
      items: [
        { id: 'menstrual_cup', name: 'Menstrual Cup', quantity: 0 },
        { id: 'period_panties', name: 'Period Panties', quantity: 0 },
        { id: 'reusable_pads', name: 'Reusable Pads', quantity: 0 }
      ]
    }
  };

  const updateQuantity = (itemId, change) => {
    setSelectedItems(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [itemId]: newQty };
    });
  };

  const getItemName = (itemId) => {
    for (const category of Object.values(productCategories)) {
      const item = category.items.find(i => i.id === itemId);
      if (item) return item.name;
    }
    return '';
  };

  const calculateTotalItems = () => {
    return Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
  };

  const handleDeliveryDetailChange = (field, value) => {
    setDeliveryDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (calculateTotalItems() === 0) {
      Alert.alert('Empty Request', 'Please select at least one item');
      return false;
    }

    if (!deliveryDetails.name || !deliveryDetails.address || !deliveryDetails.city || !deliveryDetails.province || !deliveryDetails.phone) {
      Alert.alert('Missing Information', 'Please fill in all delivery details');
      return false;
    }

    if (!confirmDetails) {
      Alert.alert('Confirmation Required', 'Please confirm that the details entered are correct');
      return false;
    }

    return true;
  };

  const handleSubmitRequest = () => {
    if (!validateForm()) return;
    setShowConfirmation(true);
  };

  const confirmRequest = () => {
    setShowConfirmation(false);
    Alert.alert(
      'Request Submitted!',
      `Your request for ${calculateTotalItems()} items has been received${isUrgent ? ' (URGENT)' : ''}. You will receive a confirmation shortly.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const CategoryButton = ({ category, title }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.categoryButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const QuantitySelector = ({ itemId, itemName }) => (
    <View style={styles.quantitySelector}>
      <Text style={styles.itemName}>{itemName}</Text>
      <View style={styles.quantityControls}>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.quantityButtonPressed
          ]}
          onPress={() => updateQuantity(itemId, -1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </Pressable>
        <Text style={styles.quantityText}>{selectedItems[itemId] || 0}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.quantityButton,
            pressed && styles.quantityButtonPressed
          ]}
          onPress={() => updateQuantity(itemId, 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );


  const CustomCheckbox = ({ value, onValueChange, label }) => (
    <Pressable
      style={({ pressed }) => [
        styles.checkboxContainer,
        pressed && styles.checkboxPressed
      ]}
      onPress={() => onValueChange(!value)}
    >
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Text style={styles.checkboxCheckmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        >
        {/* Header - Now scrolls with content */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Request Sanitary Items</Text>
          <Text style={styles.headerSubtitle}>Get what you need, when you need it</Text>
        </View>

        {/* Urgent Request Toggle */}
        <View style={styles.urgentContainer}>
          <View style={styles.urgentTextContainer}>
            <Text style={styles.urgentLabel}>🚨 Urgent Request</Text>
            <Text style={styles.urgentDescription}>
              Items will be delivered within 24 hours
            </Text>
          </View>
          <Switch
            value={isUrgent}
            onValueChange={setIsUrgent}
            trackColor={{ false: '#E5E7EB', true: '#FECACA' }}
            thumbColor={isUrgent ? '#fa6464ff' : '#FFFFFF'}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <View style={styles.categoriesRow}>
            <CategoryButton category="pads" title="Pads" />
            <CategoryButton category="tampons" title="Tampons" />
          </View>
          <View style={styles.categoriesRow}>
            <CategoryButton category="comfort" title="Comfort" />
            <CategoryButton category="eco" title="Eco-Friendly" />
          </View>
        </View>

        {/* Product Selection */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>
            {productCategories[selectedCategory].title}
          </Text>
          {productCategories[selectedCategory].items.map((item) => (
            <QuantitySelector
              key={item.id}
              itemId={item.id}
              itemName={item.name}
            />
          ))}
        </View>

        {/* Delivery Details */}
        <View style={styles.deliveryContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>📍</Text>
            </View>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
          </View>
          
          <View style={styles.deliveryInputContainer}>
            <Text style={styles.deliveryLabel}>Full Name</Text>
            <TextInput
              style={styles.deliveryTextInput}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              value={deliveryDetails.name}
              onChangeText={(text) => handleDeliveryDetailChange('name', text)}
              autoCorrect={false}
              autoCapitalize="words"
              pointerEvents="auto"
            />
          </View>
          
          <View style={styles.deliveryInputContainer}>
            <Text style={styles.deliveryLabel}>Address</Text>
            <TextInput
              style={[styles.deliveryTextInput, styles.multilineInput]}
              placeholder="Enter your street address"
              placeholderTextColor="#9CA3AF"
              value={deliveryDetails.address}
              onChangeText={(text) => handleDeliveryDetailChange('address', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoCorrect={false}
              autoCapitalize="words"
              pointerEvents="auto"
            />
          </View>
          
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <View style={styles.deliveryInputContainer}>
                <Text style={styles.deliveryLabel}>City</Text>
                <TextInput
                  style={styles.deliveryTextInput}
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  value={deliveryDetails.city}
                  onChangeText={(text) => handleDeliveryDetailChange('city', text)}
                  autoCorrect={false}
                  autoCapitalize="words"
                  pointerEvents="auto"
                />
              </View>
            </View>
            <View style={styles.halfInput}>
              <View style={styles.deliveryInputContainer}>
                <Text style={styles.deliveryLabel}>Province</Text>
                <TextInput
                  style={styles.deliveryTextInput}
                  placeholder="Province"
                  placeholderTextColor="#9CA3AF"
                  value={deliveryDetails.province}
                  onChangeText={(text) => handleDeliveryDetailChange('province', text)}
                  autoCorrect={false}
                  autoCapitalize="words"
                  pointerEvents="auto"
                />
              </View>
            </View>
          </View>
          
          <View style={styles.deliveryInputContainer}>
            <Text style={styles.deliveryLabel}>Phone Number</Text>
            <TextInput
              style={styles.deliveryTextInput}
              placeholder="Enter your phone number"
              placeholderTextColor="#9CA3AF"
              value={deliveryDetails.phone}
              onChangeText={(text) => handleDeliveryDetailChange('phone', text)}
              keyboardType="phone-pad"
              autoCorrect={false}
              autoCapitalize="none"
              pointerEvents="auto"
            />
          </View>
        </View>

        {/* Delivery Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.sectionTitle}>Delivery Instructions (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="Any special delivery instructions or preferences..."
            placeholderTextColor="#9CA3AF"
            value={deliveryNote}
            onChangeText={setDeliveryNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
            pointerEvents="auto"
          />
        </View>

        {/* Order Summary */}
        {calculateTotalItems() > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryContent}>
              {Object.entries(selectedItems).map(([itemId, quantity]) => (
                <View key={itemId} style={styles.summaryItem}>
                  <Text style={styles.summaryItemName}>{getItemName(itemId)}</Text>
                  <Text style={styles.summaryItemQuantity}>x{quantity}</Text>
                </View>
              ))}
              <View style={styles.summaryTotal}>
                <Text style={styles.summaryTotalText}>
                  Total Items: {calculateTotalItems()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Confirmation Checkbox */}
        <View style={styles.confirmationContainer}>
          <CustomCheckbox
            value={confirmDetails}
            onValueChange={setConfirmDetails}
            label="I confirm that the details entered above are correct"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (calculateTotalItems() === 0 || !confirmDetails) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitRequest}
          disabled={calculateTotalItems() === 0 || !confirmDetails}
        >
          <Text style={styles.submitButtonText}>
            Request {calculateTotalItems()} Items
          </Text>
          <Text style={styles.submitButtonSubtext}>
            {isUrgent ? 'Urgent - 24hr Delivery' : 'Standard Delivery'}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Your Request</Text>
            
            <ScrollView style={styles.modalItemsList}>
              {Object.entries(selectedItems).map(([itemId, quantity]) => (
                <View key={itemId} style={styles.modalItem}>
                  <Text style={styles.modalItemName}>{getItemName(itemId)}</Text>
                  <Text style={styles.modalItemQuantity}>x{quantity}</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.modalTotal}>
              Total Items: {calculateTotalItems()}
            </Text>
            {isUrgent && (
              <Text style={styles.urgentBadge}>🚨 URGENT DELIVERY</Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmRequest}
              >
                <Text style={styles.modalConfirmText}>Confirm Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#EC4899',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  urgentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  urgentTextContainer: {
    flex: 1,
  },
  urgentLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  urgentDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoriesContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FDF2F8',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryButton: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  categoryButtonActive: {
    borderColor: '#EC4899',
    backgroundColor: '#FDF2F8',
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#EC4899',
    fontWeight: 'bold',
  },
  productsContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  quantitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#EC4899',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPressed: {
    backgroundColor: '#DB2777',
    transform: [{ scale: 0.95 }],
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  deliveryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deliveryInputContainer: {
    marginBottom: 16,
  },
  deliveryLabel: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  deliveryTextInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  noteContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryContent: {
    marginTop: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryItemName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  summaryItemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
  },
  summaryTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  summaryTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  confirmationContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxPressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6B7280',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#EC4899',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 30,
    shadowColor: '#ec489ac7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  submitButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItemsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemName: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  modalItemQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EC4899',
  },
  modalTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  urgentBadge: {
    backgroundColor: '#FECACA',
    color: '#DC2626',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 0.48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 0.48,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RequestItemsScreen;