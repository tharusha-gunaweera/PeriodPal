import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const { width: screenWidth } = Dimensions.get('window');

const CommunityLocationView = ({ route, navigation }) => {
    const { communityName, locationPin } = route.params;
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    console.log('LocationPin data:', locationPin); // Debug log

    const nextPhoto = () => {
        if (locationPin.photos) {
            setSelectedPhotoIndex((prev) => 
                prev === locationPin.photos.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevPhoto = () => {
        if (locationPin.photos) {
            setSelectedPhotoIndex((prev) => 
                prev === 0 ? locationPin.photos.length - 1 : prev - 1
            );
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'High': return '#FF6B6B';
            case 'Medium': return '#FFA726';
            case 'Low': return '#4ECDC4';
            default: return '#4ECDC4';
        }
    };

    const renderPhotoGallery = () => {
        if (!locationPin.photos?.length) return null;

        return (
            <View style={styles.photoGallerySection}>
                <Text style={styles.sectionTitle}>📸 Location Photos</Text>
                <View style={styles.photoGallery}>
                    <View style={styles.mainPhotoContainer}>
                        <Image 
                            source={{ uri: locationPin.photos[selectedPhotoIndex].uri }}
                            style={styles.mainPhoto}
                            resizeMode="cover"
                        />
                        {locationPin.photos.length > 1 && (
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
                                {selectedPhotoIndex + 1} / {locationPin.photos.length}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.photoDescription}>
                        {locationPin.photos[selectedPhotoIndex].description}
                    </Text>
                </View>
            </View>
        );
    };

    const renderDemandInfo = () => {
        if (!locationPin.demand) return null;

        const { peopleWaiting, productsRequired, urgency, commonProducts } = locationPin.demand;

        return (
            <View style={styles.demandSection}>
                <Text style={styles.sectionTitle}>📊 Current Community Demand</Text>
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
                            <Text style={styles.urgencyText}>{urgency} Priority</Text>
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
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{communityName} - Location</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Map - This should take most of the screen */}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={{
                        latitude: locationPin.latitude || 6.9271,
                        longitude: locationPin.longitude || 79.8612,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    <Marker
                        coordinate={{
                            latitude: locationPin.latitude || 6.9271,
                            longitude: locationPin.longitude || 79.8612
                        }}
                        title={locationPin.landmark || 'Community Location'}
                        description={locationPin.address || 'Delivery Location'}
                        pinColor="#FF0000"
                    />
                </MapView>
            </View>

            {/* Location Details - Scrollable section at the bottom */}
            <View style={styles.detailsContainer}>
                <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
                    {/* Photo Gallery */}
                    {renderPhotoGallery()}

                    {/* Demand Information */}
                    {renderDemandInfo()}

                    <Text style={styles.sectionTitle}>📍 Delivery Location Details</Text>
                    
                    <View style={styles.locationCard}>
                        <Text style={styles.landmarkName}>{locationPin.landmark || 'Community Location'}</Text>
                        <Text style={styles.address}>{locationPin.address || 'Address not specified'}</Text>
                    </View>

                    {locationPin.description && (
                        <View style={styles.descriptionCard}>
                            <Text style={styles.descriptionTitle}>Location Description</Text>
                            <Text style={styles.descriptionText}>{locationPin.description}</Text>
                        </View>
                    )}

                    {locationPin.deliveryInstructions && (
                        <View style={styles.instructionsCard}>
                            <Text style={styles.instructionsTitle}>🚚 Delivery Instructions</Text>
                            <Text style={styles.instructionsText}>{locationPin.deliveryInstructions}</Text>
                        </View>
                    )}

                    <View style={styles.coordinatesCard}>
                        <Text style={styles.coordinatesTitle}>📍 Location Coordinates</Text>
                        <View style={styles.coordinateRow}>
                            <Text style={styles.coordinateLabel}>Latitude:</Text>
                            <Text style={styles.coordinateValue}>
                                {locationPin.latitude ? locationPin.latitude.toFixed(6) : 'Not available'}
                            </Text>
                        </View>
                        <View style={styles.coordinateRow}>
                            <Text style={styles.coordinateLabel}>Longitude:</Text>
                            <Text style={styles.coordinateValue}>
                                {locationPin.longitude ? locationPin.longitude.toFixed(6) : 'Not available'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.noteCard}>
                        <Text style={styles.noteText}>
                            💡 This location serves as the primary delivery point for {communityName} community. 
                            Members can request menstrual products to be delivered here.
                        </Text>
                    </View>
                </ScrollView>
            </View>
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
        padding: 16,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 12,
    },
    placeholder: {
        width: 60,
    },
    mapContainer: {
        flex: 1, // Takes most of the screen
        backgroundColor: '#F3F4F6',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    detailsContainer: {
        height: '40%', // Fixed height for details section
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    detailsScroll: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#EC4899',
        marginBottom: 16,
        textAlign: 'center',
    },
    locationCard: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6',
    },
    landmarkName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    descriptionCard: {
        backgroundColor: '#E8F4FD',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    descriptionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E40AF',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    instructionsCard: {
        backgroundColor: '#FFFBEB',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#92400E',
        marginBottom: 8,
    },
    instructionsText: {
        fontSize: 14,
        color: '#92400E',
        lineHeight: 20,
    },
    coordinatesCard: {
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#10B981',
    },
    coordinatesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#065F46',
        marginBottom: 12,
    },
    coordinateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    coordinateLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    coordinateValue: {
        fontSize: 14,
        color: '#1F2937',
        fontFamily: 'monospace',
        fontWeight: '500',
    },
    noteCard: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#6B7280',
    },
    noteText: {
        fontSize: 13,
        color: '#4B5563',
        fontStyle: 'italic',
        lineHeight: 18,
        textAlign: 'center',
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
});

export default CommunityLocationView;