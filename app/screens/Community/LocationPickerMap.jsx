import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Callout, Marker, Polyline } from 'react-native-maps';

// Enhanced landmark data with photos, demand data, and detailed information
const predefinedDeliveries = [
    {
        id: '1',
        latitude: 6.9271,
        longitude: 79.8612,
        address: 'No. 123, Galle Road, Colombo 03, Sri Lanka',
        type: 'landmark',
        landmark: 'Colombo City Center',
        description: 'Two families that lives for 10 years in this bangalow requires menstrual products tht enough for a month. Make your valuable delivery',
        photos: [
            { id: 1, uri: 'https://i.pinimg.com/736x/67/83/2c/67832cb660e193de763e3691c73300c5.jpg', description: 'Main entrance with security' },
            { id: 2, uri: 'https://i.pinimg.com/736x/dd/d2/d0/ddd2d085cb8adfeba304cad5e45f4975.jpg', description: 'Delivery area near entrance 2' }
        ],
        demand: {
            peopleWaiting: 15,
            productsRequired: 45,
            urgency: 'High',
            commonProducts: ['Regular Pads', 'Tampons', 'Pain Relief']
        },
        deliveryInstructions: 'Deliver to security desk at entrance 2. Ask for Mr. Perera.'
    },
    {
        id: '2',
        latitude: 7.2906,
        longitude: 80.6337,
        address: 'No. 45, Temple Road, Kandy 20000, Sri Lanka',
        type: 'landmark',
        landmark: 'Kandy City Center',
        description: 'Central city location near Temple of the Tooth Family is waiting for your valuable deliveries.',
        photos: [
            { id: 1, uri: 'https://images.unsplash.com/photo-1751486877474-a58e3390d398?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764', description: 'Community center building' },
            { id: 2, uri: 'https://images.unsplash.com/photo-1718134840922-53c040c33552?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1168', description: 'Main delivery entrance' }
        ],
        demand: {
            peopleWaiting: 8,
            productsRequired: 24,
            urgency: 'Medium',
            commonProducts: ['Super Pads', 'Menstrual Cups', 'Heating Pad']
        },
        deliveryInstructions: 'Community center - deliver to front desk. Available 9 AM - 5 PM.'
    },
    {
        id: '3',
        latitude: 6.0535,
        longitude: 80.2210,
        address: 'No. 78, Church Street, Galle Fort 80000, Sri Lanka',
        type: 'landmark',
        landmark: 'Galle Fort Heritage',
        description: 'Students in an Old school situated in Galle.Are waiting for your valuable donation',
        photos: [
            { id: 1, uri: 'https://i.pinimg.com/736x/19/71/ba/1971badb94b652c6ed479016abb5bed8.jpg', description: 'Heritage community hall' },
            { id: 2, uri: 'https://i.pinimg.com/1200x/90/fb/4d/90fb4dfb27f876bec957124bf857d6bb.jpg', description: 'Main courtyard entrance' }
        ],
        demand: {
            peopleWaiting: 50,
            productsRequired: 200,
            urgency: 'High',
            commonProducts: ['Regular Pads', 'Pantyliners', 'Period Panties']
        },
        deliveryInstructions: 'Heritage community hall - ring bell at side entrance'
    },
    {
        id: '4',
        latitude: 7.1785,
        longitude: 79.8731,
        address: 'No. 56, Beach Road, Negombo 11500, Sri Lanka',
        type: 'landmark',
        landmark: 'Negombo Beach Community',
        description: 'Beach side family requires. Menstural products that enough for a month. Make your valuable delivery.',
        photos: [
            { id: 1, uri: 'https://images.unsplash.com/photo-1749655048206-71ea213bd8f4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764', description: 'Beach community center' },
            { id: 2, uri: 'https://images.unsplash.com/photo-1669123547600-28b2a1b6582d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171', description: 'Main delivery point' }
        ],
        demand: {
            peopleWaiting: 6,
            productsRequired: 18,
            urgency: 'Low',
            commonProducts: ['Tampons', 'Menstrual Cups', 'Pain Relief']
        },
        deliveryInstructions: 'Beach community center - deliver to Ms. Fernando at reception'
    },
    {
        id: '5',
        latitude: 9.6615,
        longitude: 80.0255,
        address: 'No. 34, Main Street, Jaffna 40000, Sri Lanka',
        type: 'landmark',
        landmark: 'Jaffna Town Center',
        description: 'Central town location serving Northern Province communities.',
        photos: [
            { id: 1, uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop', description: 'Town center building' },
            { id: 2, uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop', description: 'Community service area' }
        ],
        demand: {
            peopleWaiting: 20,
            productsRequired: 55,
            urgency: 'High',
            commonProducts: ['Regular Pads', 'Super Pads', 'Heating Pad']
        },
        deliveryInstructions: 'Town center - back entrance near parking area'
    }
];

const LocationPickerMap = ({ onLocationSelect, onClose }) => {
    const [region, setRegion] = useState({
        latitude: 7.8731,
        longitude: 80.7718,
        latitudeDelta: 2.0,
        longitudeDelta: 2.0,
    });
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [showLocationDetails, setShowLocationDetails] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const [routeToLocation, setRouteToLocation] = useState([]);

    useEffect(() => {
        getUserLocation();
    }, []);

    const getUserLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Need location permission to get your current location');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const userLoc = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
        setUserLocation(userLoc);
        setRegion(prev => ({
            ...prev,
            latitude: userLoc.latitude,
            longitude: userLoc.longitude,
        }));
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        setSelectedPhotoIndex(0);
        
        // Calculate route from user location to selected location
        if (userLocation) {
            const route = [
                { latitude: userLocation.latitude, longitude: userLocation.longitude },
                { latitude: location.latitude, longitude: location.longitude }
            ];
            setRouteToLocation(route);
        }
        
        setShowLocationDetails(true);
    };

    const handleConfirmSelection = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation);
        }
    };

    const getMarkerColor = (location) => {
        return location.id === selectedLocation?.id ? '#FF0000' : '#FF6B6B'; // Red color for all landmarks
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'High': return '#FF6B6B';
            case 'Medium': return '#FFA726';
            case 'Low': return '#4ECDC4';
            default: return '#4ECDC4';
        }
    };

    const nextPhoto = () => {
        if (selectedLocation) {
            setSelectedPhotoIndex((prev) => 
                prev === selectedLocation.photos.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevPhoto = () => {
        if (selectedLocation) {
            setSelectedPhotoIndex((prev) => 
                prev === 0 ? selectedLocation.photos.length - 1 : prev - 1
            );
        }
    };

    const renderPhotoGallery = () => {
        if (!selectedLocation?.photos?.length) return null;

        return (
            <View style={styles.photoGallerySection}>
                <Text style={styles.sectionTitle}>📸 Location Photos</Text>
                <View style={styles.photoGallery}>
                    <View style={styles.mainPhotoContainer}>
                        <Image 
                            source={{ uri: selectedLocation.photos[selectedPhotoIndex].uri }}
                            style={styles.mainPhoto}
                            resizeMode="cover"
                        />
                        {selectedLocation.photos.length > 1 && (
                            <>
                                <TouchableOpacity style={[styles.photoNavButton, styles.prevButton]} onPress={prevPhoto}>
                                    <Text style={styles.photoNavText}>‹</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.photoNavButton, styles.nextButton]} onPress={nextPhoto}>
                                    <Text style={styles.photoNavText}>›</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        <View style={styles.photoCounter}>
                            <Text style={styles.photoCounterText}>
                                {selectedPhotoIndex + 1} / {selectedLocation.photos.length}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.photoDescription}>
                        {selectedLocation.photos[selectedPhotoIndex].description}
                    </Text>
                    
                    {/* Thumbnail Strip */}
                    {selectedLocation.photos.length > 1 && (
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            style={styles.thumbnailStrip}
                        >
                            {selectedLocation.photos.map((photo, index) => (
                                <TouchableOpacity 
                                    key={photo.id}
                                    style={[
                                        styles.thumbnailContainer,
                                        index === selectedPhotoIndex && styles.selectedThumbnail
                                    ]}
                                    onPress={() => setSelectedPhotoIndex(index)}
                                >
                                    <Image 
                                        source={{ uri: photo.uri }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>
            </View>
        );
    };

    const renderDemandInfo = () => {
        if (!selectedLocation?.demand) return null;

        const { peopleWaiting, productsRequired, urgency, commonProducts } = selectedLocation.demand;

        return (
            <View style={styles.demandSection}>
                <Text style={styles.sectionTitle}>📊 Current Demand</Text>
                <View style={styles.demandGrid}>
                    <View style={styles.demandItem}>
                        <Text style={styles.demandNumber}>{peopleWaiting}</Text>
                        <Text style={styles.demandLabel}>People Waiting</Text>
                    </View>
                    <View style={styles.demandItem}>
                        <Text style={styles.demandNumber}>{productsRequired}</Text>
                        <Text style={styles.demandLabel}>Products Needed</Text>
                    </View>
                    <View style={styles.demandItem}>
                        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(urgency) }]}>
                            <Text style={styles.urgencyText}>{urgency} Need</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.productsSection}>
                    <Text style={styles.productsTitle}>Most Requested Products:</Text>
                    <View style={styles.productsList}>
                        {commonProducts.map((product, index) => (
                            <View key={index} style={styles.productChip}>
                                <Text style={styles.productChipText}>{product}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Select Delivery Location</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Instructions */}
            <View style={styles.instructions}>
                <Text style={styles.instructionsText}>
                    📍 Tap on any red landmark pin to select as delivery location
                </Text>
            </View>

            {/* Map */}
            <MapView
                style={styles.map}
                region={region}
            >
                {/* User Location */}
                {userLocation && (
                    <Marker
                        coordinate={userLocation}
                        title="Your Location"
                        pinColor="blue"
                    />
                )}
                
                {/* Route to Selected Location */}
                {routeToLocation.length > 0 && (
                    <Polyline
                        coordinates={routeToLocation}
                        strokeColor="#FF0000"
                        strokeWidth={4}
                        lineDashPattern={[10, 5]}
                    />
                )}
                
                {/* Landmark Locations - All in RED */}
                {predefinedDeliveries.map((location) => (
                    <Marker
                        key={location.id}
                        coordinate={location}
                        title={location.landmark}
                        description={`${location.demand.peopleWaiting} people waiting`}
                        pinColor={getMarkerColor(location)} // All landmarks are red
                        onPress={() => handleLocationSelect(location)}
                    >
                        <Callout tooltip={true}>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{location.landmark}</Text>
                                <Text style={styles.calloutAddress} numberOfLines={2}>
                                    {location.address}
                                </Text>
                                <View style={styles.calloutDemand}>
                                    <Text style={styles.calloutDemandText}>
                                        👥 {location.demand.peopleWaiting} people • 🛍️ {location.demand.productsRequired} products
                                    </Text>
                                </View>
                                <Text style={styles.calloutTap}>Tap for details →</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Location Details Modal */}
            <Modal
                visible={showLocationDetails}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowLocationDetails(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {selectedLocation && (
                            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>📍 {selectedLocation.landmark}</Text>
                                    <TouchableOpacity 
                                        onPress={() => setShowLocationDetails(false)}
                                        style={styles.closeButton}
                                    >
                                        <Text style={styles.closeButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Photo Gallery */}
                                {renderPhotoGallery()}

                                <View style={styles.locationDetails}>
                                    {/* Demand Information */}
                                    {renderDemandInfo()}

                                    <Text style={styles.sectionTitle}>📍 Location Information</Text>
                                    
                                    <View style={styles.detailCard}>
                                        <Text style={styles.detailLabel}>Exact Address:</Text>
                                        <Text style={styles.detailValue}>{selectedLocation.address}</Text>
                                    </View>
                                    
                                    <View style={styles.detailCard}>
                                        <Text style={styles.detailLabel}>Description:</Text>
                                        <Text style={styles.detailValue}>{selectedLocation.description}</Text>
                                    </View>

                                    <View style={styles.deliveryInstructions}>
                                        <Text style={styles.deliveryInstructionsTitle}>🚚 Delivery Instructions</Text>
                                        <Text style={styles.deliveryInstructionsText}>
                                            {selectedLocation.deliveryInstructions}
                                        </Text>
                                    </View>

                                    {/* Route Information */}
                                    {userLocation && (
                                        <View style={styles.routeInfo}>
                                            <Text style={styles.routeInfoTitle}>📍 Route Information</Text>
                                            <Text style={styles.routeInfoText}>
                                                Best route from your location is highlighted in red on the map
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.cancelSelectionButton}
                                        onPress={() => setShowLocationDetails(false)}
                                    >
                                        <Text style={styles.cancelSelectionText}>Cancel</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        style={styles.confirmSelectionButton}
                                        onPress={handleConfirmSelection}
                                    >
                                        <Text style={styles.confirmSelectionText}>Select This Location</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Selection Info Bar */}
            {selectedLocation && !showLocationDetails && (
                <View style={styles.selectionInfo}>
                    <View style={styles.selectionTextContainer}>
                        <Text style={styles.selectionTitle}>Selected: {selectedLocation.landmark}</Text>
                        <Text style={styles.selectionSubtitle}>
                            {selectedLocation.demand.peopleWaiting} people waiting • Route highlighted in red
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.viewDetailsButton}
                        onPress={() => setShowLocationDetails(true)}
                    >
                        <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Action Buttons */}
            
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF2F8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#EC4899',
        fontWeight: '500',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#EC4899',
        textAlign: 'center',
        flex: 1,
    },
    placeholder: {
        width: 60,
    },
    instructions: {
        padding: 16,
        backgroundColor: '#E8F4FD',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    instructionsText: {
        fontSize: 14,
        color: '#1E40AF',
        fontWeight: '500',
        textAlign: 'center',
    },
    map: {
        flex: 1,
    },
    calloutContainer: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 12,
        width: 220,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    calloutAddress: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
        lineHeight: 16,
    },
    calloutDemand: {
        marginBottom: 4,
    },
    calloutDemandText: {
        fontSize: 11,
        color: '#EC4899',
        fontWeight: '600',
    },
    calloutTap: {
        fontSize: 10,
        color: '#FF6B6B',
        fontStyle: 'italic',
    },
    selectionInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    selectionTextContainer: {
        flex: 1,
    },
    selectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    selectionSubtitle: {
        fontSize: 12,
        color: '#EC4899',
        marginTop: 2,
    },
    viewDetailsButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewDetailsText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginRight: 12,
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
    confirmButton: {
        flex: 2,
        backgroundColor: '#EC4899',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalScrollView: {
        maxHeight: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fafafa',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#666',
        fontSize: 18,
        fontWeight: 'bold',
    },
    locationDetails: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    // Photo Gallery Styles
    photoGallerySection: {
        marginBottom: 20,
    },
    photoGallery: {
        marginBottom: 10,
    },
    mainPhotoContainer: {
        position: 'relative',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    mainPhoto: {
        width: '100%',
        height: '100%',
    },
    photoNavButton: {
        position: 'absolute',
        top: '50%',
        transform: [{ translateY: -20 }],
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    prevButton: {
        left: 10,
    },
    nextButton: {
        right: 10,
    },
    photoNavText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    photoCounter: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    photoCounterText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    photoDescription: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 8,
    },
    thumbnailStrip: {
        marginTop: 8,
    },
    thumbnailContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedThumbnail: {
        borderColor: '#FF6B6B',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
    },
    // Demand Information Styles
    demandSection: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#EC4899',
    },
    demandGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    demandItem: {
        alignItems: 'center',
        flex: 1,
    },
    demandNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#EC4899',
        marginBottom: 4,
    },
    demandLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    urgencyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    urgencyText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    productsSection: {
        marginTop: 8,
    },
    productsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    productsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    productChip: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    productChipText: {
        fontSize: 11,
        color: '#374151',
        fontWeight: '500',
    },
    // Detail Cards
    detailCard: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        color: '#1F2937',
        lineHeight: 22,
    },
    deliveryInstructions: {
        backgroundColor: '#FFFBEB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    deliveryInstructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#92400E',
        marginBottom: 8,
    },
    deliveryInstructionsText: {
        fontSize: 14,
        color: '#92400E',
        lineHeight: 20,
    },
    // Route Information
    routeInfo: {
        backgroundColor: '#FEF2F2',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF0000',
    },
    routeInfoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#DC2626',
        marginBottom: 8,
    },
    routeInfoText: {
        fontSize: 14,
        color: '#7F1D1D',
        lineHeight: 20,
    },
    modalActions: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 12,
    },
    cancelSelectionButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    cancelSelectionText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
    confirmSelectionButton: {
        flex: 2,
        backgroundColor: '#EC4899',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    confirmSelectionText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LocationPickerMap;