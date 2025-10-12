import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Keyboard,
    TouchableWithoutFeedback,
    Modal,
    Animated,
    Dimensions
} from 'react-native';
import { 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    serverTimestamp,
    doc,
    getDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../../FirebaseConfig';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const CommunityChatScreen = ({ route, navigation }) => {
    const { communityId, communityName } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [inputModalVisible, setInputModalVisible] = useState(false);
    
    const flatListRef = useRef();
    const textInputRef = useRef();
    const modalAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        
        const user = getAuth().currentUser;
        setCurrentUser(user);
        
        loadCommunityData();
        setupMessagesListener();
    }, [communityId]);

    const loadCommunityData = async () => {
        try {
            const communityDoc = await getDoc(doc(db, 'communities', communityId));
            if (communityDoc.exists()) {
                const communityData = {
                    id: communityDoc.id,
                    ...communityDoc.data()
                };
                setCommunity(communityData);
                navigation.setOptions({ 
                    title: communityData.Name || 'Community Chat' 
                });
            } else {
                Alert.alert('Error', 'Community not found');
            }
        } catch (error) {
            console.error('Error loading community:', error);
            Alert.alert('Error', 'Failed to load community data');
        }
    };

    const setupMessagesListener = () => {
        setLoading(true);
        
        const messagesQuery = query(
            collection(db, 'communities', communityId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, 
            (querySnapshot) => {
                const messagesData = [];
                querySnapshot.forEach((doc) => {
                    messagesData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                setMessages(messagesData);
                setLoading(false);
                
                
                setTimeout(() => {
                    if (flatListRef.current && messagesData.length > 0) {
                        flatListRef.current.scrollToEnd({ animated: true });
                    }
                }, 100);
            },
            (error) => {
                console.error('Error listening to messages:', error);
                Alert.alert('Error', 'Failed to load messages');
                setLoading(false);
            }
        );

        return unsubscribe;
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        if (!currentUser) {
            Alert.alert('Error', 'You must be logged in to send messages');
            return;
        }

        setSending(true);

        try {
            const messageData = {
                text: newMessage.trim(),
                userId: currentUser.uid,
                userEmail: currentUser.email || 'Anonymous',
                userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                createdAt: serverTimestamp(),
                type: 'text'
            };

            await addDoc(
                collection(db, 'communities', communityId, 'messages'),
                messageData
            );

            setNewMessage('');
            closeInputModal();
            
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const openInputModal = () => {
        setInputModalVisible(true);
        Animated.timing(modalAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
           
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 100);
        });
    };

    const closeInputModal = () => {
        Keyboard.dismiss();
        Animated.timing(modalAnimation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setInputModalVisible(false);
        });
    };

    const handleViewLocation = async () => {
        if (!community?.locationPin) {
            Alert.alert('Info', 'No location pin set for this community');
            return;
        }

        setLocationLoading(true);

        try {
            const { latitude, longitude } = community.locationPin;
            
            if (!latitude || !longitude) {
                Alert.alert('Error', 'Invalid location data');
                return;
            }

            navigation.navigate('CommunityLocationView', {
                communityId: community.id,
                communityName: community.Name,
                locationPin: community.locationPin
            });

        } catch (error) {
            console.error('Error navigating to location:', error);
            Alert.alert('Error', 'Failed to open location map');
        } finally {
            setLocationLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const isSameDay = (timestamp1, timestamp2) => {
        if (!timestamp1 || !timestamp2) return false;
        return timestamp1.toDate().toDateString() === timestamp2.toDate().toDateString();
    };

    const isSameUser = (message1, message2) => {
        return message1.userId === message2.userId;
    };

    const scrollToBottom = () => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    const renderMessage = ({ item, index }) => {
        const isMyMessage = item.userId === currentUser?.uid;
        const isSystemMessage = item.type === 'system';
        const showDate = index === 0 || !isSameDay(item.createdAt, messages[index - 1]?.createdAt);
        const showAvatar = !isSystemMessage && (index === 0 || !isSameUser(item, messages[index - 1]) || !isSameDay(item.createdAt, messages[index - 1]?.createdAt));

        if (isSystemMessage) {
            return (
                <View style={styles.systemMessageContainer}>
                    <Text style={styles.systemMessageText}>{item.text}</Text>
                    {item.isLocationPin && (
                        <TouchableOpacity 
                            style={styles.locationPinButton}
                            onPress={handleViewLocation}
                        >
                            <Text style={styles.locationPinButtonText}>📍 View Location on Map</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        return (
            <View>
                {showDate && (
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateSeparatorText}>
                            {formatDate(item.createdAt)}
                        </Text>
                    </View>
                )}

                <View style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessage : styles.otherMessage
                ]}>
                    {!isMyMessage && showAvatar && (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.userName?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    )}

                    <View style={styles.messageContent}>
                        {!isMyMessage && showAvatar && (
                            <Text style={styles.userName}>{item.userName}</Text>
                        )}

                        <View style={[
                            styles.messageBubble,
                            isMyMessage ? styles.myBubble : styles.otherBubble
                        ]}>
                            <Text style={[
                                styles.messageText,
                                isMyMessage ? styles.myMessageText : styles.otherMessageText
                            ]}>
                                {item.text}
                            </Text>
                        </View>

                        <Text style={styles.messageTime}>
                            {formatTime(item.createdAt)}
                        </Text>
                    </View>

                    {!isMyMessage && !showAvatar && (
                        <View style={styles.avatarSpacer} />
                    )}
                </View>
            </View>
        );
    };

    // Modal animation styles
    const modalBackgroundStyle = {
        opacity: modalAnimation,
    };

    const modalContentStyle = {
        transform: [
            {
                translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [screenHeight, 0],
                }),
            },
        ],
    };

    if (!community) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EC4899" />
                <Text style={styles.loadingText}>Loading community...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Community Header */}
            <View style={styles.communityHeader}>
                <Text style={styles.communityEmoji}>{community.image || '👥'}</Text>
                <View style={styles.communityInfo}>
                    <Text style={styles.communityName}>{community.Name}</Text>
                    <Text style={styles.memberStatus}>
                        {community.memberCount || 1} members • You are a member
                    </Text>
                </View>
                {community.locationPin && (
                    <TouchableOpacity 
                        style={styles.viewLocationButton}
                        onPress={handleViewLocation}
                        disabled={locationLoading}
                    >
                        {locationLoading ? (
                            <ActivityIndicator size="small" color="#EC4899" />
                        ) : (
                            <Text style={styles.viewLocationText}>📍</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Messages List */}
            {loading ? (
                <View style={styles.messagesLoading}>
                    <ActivityIndicator size="large" color="#EC4899" />
                    <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    style={styles.messagesList}
                    contentContainerStyle={styles.messagesContainer}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={scrollToBottom}
                    onLayout={scrollToBottom}
                />
            )}

            {/* Fixed Input Button at Bottom */}
            <TouchableOpacity 
                style={styles.openInputButton}
                onPress={openInputModal}
            >
                <Text style={styles.openInputButtonText}>Type a message...</Text>
            </TouchableOpacity>

            {/* Modal Input */}
            <Modal
                visible={inputModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={closeInputModal}
            >
                <TouchableWithoutFeedback onPress={closeInputModal}>
                    <Animated.View style={[styles.modalOverlay, modalBackgroundStyle]}>
                        <TouchableWithoutFeedback>
                            <Animated.View style={[styles.modalContent, modalContentStyle]}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>New Message</Text>
                                    <TouchableOpacity 
                                        style={styles.closeButton}
                                        onPress={closeInputModal}
                                    >
                                        <Text style={styles.closeButtonText}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <TextInput
                                    ref={textInputRef}
                                    style={styles.modalTextInput}
                                    placeholder="Type your message here..."
                                    placeholderTextColor="#9CA3AF"
                                    value={newMessage}
                                    onChangeText={setNewMessage}
                                    multiline
                                    maxLength={500}
                                    editable={!sending}
                                    autoFocus={true}
                                    blurOnSubmit={false}
                                />
                                
                                <View style={styles.modalActions}>
                                    <TouchableOpacity 
                                        style={styles.cancelButton}
                                        onPress={closeInputModal}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        style={[
                                            styles.sendButton, 
                                            (!newMessage.trim() || sending) && styles.sendButtonDisabled
                                        ]}
                                        onPress={handleSendMessage}
                                        disabled={!newMessage.trim() || sending}
                                    >
                                        {sending ? (
                                            <ActivityIndicator color="#FFFFFF" size="small" />
                                        ) : (
                                            <Text style={styles.sendButtonText}>Send</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
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
    messagesLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    communityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    communityEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    communityInfo: {
        flex: 1,
    },
    communityName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    memberStatus: {
        fontSize: 12,
        color: '#10B981',
        marginTop: 2,
    },
    viewLocationButton: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        marginLeft: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewLocationText: {
        fontSize: 16,
    },
    messagesList: {
        flex: 1,
    },
    messagesContainer: {
        padding: 16,
        paddingBottom: 80, // Extra space for the input button
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: 16,
    },
    dateSeparatorText: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        maxWidth: '100%',
    },
    myMessage: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    otherMessage: {
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
    },
    systemMessageContainer: {
        alignItems: 'center',
        marginVertical: 8,
        padding: 12,
        backgroundColor: '#E8F4FD',
        borderRadius: 12,
        marginHorizontal: 20,
    },
    systemMessageText: {
        fontSize: 14,
        color: '#1E40AF',
        fontWeight: '500',
        textAlign: 'center',
    },
    locationPinButton: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#3B82F6',
        borderRadius: 8,
    },
    locationPinButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        alignSelf: 'flex-end',
        marginBottom: 4,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    avatarSpacer: {
        width: 32,
        marginRight: 8,
    },
    messageContent: {
        flex: 1,
        maxWidth: '70%',
    },
    userName: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        marginLeft: 8,
        fontWeight: '500',
    },
    messageBubble: {
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 4,
    },
    myBubble: {
        backgroundColor: '#EC4899',
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    otherMessageText: {
        color: '#1F2937',
    },
    messageTime: {
        fontSize: 10,
        color: '#9CA3AF',
        marginLeft: 12,
        marginBottom: 8,
    },
    // Fixed Input Button
    openInputButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    openInputButtonText: {
        color: '#9CA3AF',
        fontSize: 16,
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxHeight: screenHeight * 0.6,
        padding: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#6B7280',
        fontWeight: 'bold',
    },
    modalTextInput: {
        minHeight: 120,
        maxHeight: 200,
        padding: 20,
        fontSize: 16,
        color: '#1F2937',
        textAlignVertical: 'top',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
    sendButton: {
        flex: 1,
        paddingVertical: 15,
        backgroundColor: '#EC4899',
        borderRadius: 12,
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#9CA3AF',
        opacity: 0.6,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CommunityChatScreen;