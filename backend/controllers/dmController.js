import admin, { db } from '../config/firebase.js';
import { createNotification } from './notificationController.js';

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const allConversations = await db.collection('conversations').get();
        const conversations = [];
        
        for (const doc of allConversations.docs) {
            const convData = doc.data();
            
            // Check if user is part of this conversation
            if (convData.user1_id !== userId && convData.user2_id !== userId) continue;
            
            const otherUserId = convData.user1_id === userId ? convData.user2_id : convData.user1_id;
            const otherUserDoc = await db.collection('users').doc(otherUserId).get();
            const otherUserData = otherUserDoc.data();
            
            // Get last message
            const lastMessageSnapshot = await db.collection('messages')
                .where('conversation_id', '==', doc.id)
                .orderBy('created_at', 'desc')
                .limit(1)
                .get();
            
            const lastMessage = lastMessageSnapshot.empty ? null : lastMessageSnapshot.docs[0].data().content;
            
            // Get unread count
            const unreadSnapshot = await db.collection('messages')
                .where('conversation_id', '==', doc.id)
                .where('sender_id', '!=', userId)
                .where('is_read', '==', false)
                .get();
            
            conversations.push({
                id: doc.id,
                ...convData,
                other_user_id: otherUserId,
                other_user_name: otherUserData?.name,
                other_user_pic: otherUserData?.profile_pic,
                other_user_role: otherUserData?.role,
                other_user_email: otherUserData?.email,
                last_message: lastMessage,
                unread_count: unreadSnapshot.size
            });
        }
        
        // Sort by last_message_at descending
        conversations.sort((a, b) => {
            const aTime = a.last_message_at?.toMillis?.() || 0;
            const bTime = b.last_message_at?.toMillis?.() || 0;
            return bTime - aTime;
        });
        
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    try {
        // Verify user is part of conversation
        const convRef = db.collection('conversations').doc(conversationId);
        const convDoc = await convRef.get();
        
        if (!convDoc.exists || (convDoc.data().user1_id !== userId && convDoc.data().user2_id !== userId)) {
            return res.status(403).json({ message: 'Unauthorized access to conversation' });
        }

        // Mark messages as read
        const unreadMessagesSnapshot = await db.collection('messages')
            .where('conversation_id', '==', conversationId)
            .where('sender_id', '!=', userId)
            .where('is_read', '==', false)
            .get();
        
        const batch = db.batch();
        unreadMessagesSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { is_read: true });
        });
        await batch.commit();

        const messagesSnapshot = await db.collection('messages')
            .where('conversation_id', '==', conversationId)
            .orderBy('created_at', 'asc')
            .get();
        
        const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;
    const senderName = req.user.name;

    if (!content || !receiverId) {
        return res.status(400).json({ message: 'Invalid data' });
    }

    try {
        // Guest user restrictions
        if (senderRole === 'Guest') {
            // Check if receiver is a coordinator of an event the guest is in
            const eventRegsSnapshot = await db.collection('event_registrations')
                .where('user_id', '==', senderId)
                .get();
            
            let isAllowed = false;
            
            for (const doc of eventRegsSnapshot.docs) {
                const regData = doc.data();
                const eventDoc = await db.collection('events').doc(regData.event_id).get();
                const eventData = eventDoc.data();
                
                if (eventData?.organizer) {
                    const organizerSnapshot = await db.collection('users')
                        .where('name', '==', eventData.organizer)
                        .where('id', '==', receiverId)
                        .get();
                    
                    if (!organizerSnapshot.empty) {
                        isAllowed = true;
                        break;
                    }
                }
            }
            
            if (!isAllowed) {
                // Also check if the receiver has messaged the guest first (reply allowed)
                const allConversations = await db.collection('conversations').get();
                let hasReplied = false;
                
                for (const convDoc of allConversations.docs) {
                    const convData = convDoc.data();
                    if ((convData.user1_id === senderId && convData.user2_id === receiverId) ||
                        (convData.user1_id === receiverId && convData.user2_id === senderId)) {
                        
                        const messagesSnapshot = await db.collection('messages')
                            .where('conversation_id', '==', convDoc.id)
                            .where('sender_id', '==', receiverId)
                            .get();
                        
                        if (!messagesSnapshot.empty) {
                            hasReplied = true;
                            break;
                        }
                    }
                }
                
                if (!hasReplied) {
                    return res.status(403).json({ message: 'Guest users can only DM coordinators of their registered events.' });
                }
            }
        }

        // Find or create conversation
        const user1 = Math.min(senderId, receiverId);
        const user2 = Math.max(senderId, receiverId);

        let conversationId;
        let foundConv = null;
        
        const allConversations = await db.collection('conversations').get();
        for (const convDoc of allConversations.docs) {
            const convData = convDoc.data();
            if (convData.user1_id === user1 && convData.user2_id === user2) {
                foundConv = convDoc;
                conversationId = convDoc.id;
                break;
            }
        }

        if (!foundConv) {
            const convRef = db.collection('conversations').doc();
            await convRef.set({
                user1_id: user1,
                user2_id: user2,
                last_message_at: admin.firestore.FieldValue.serverTimestamp(),
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });
            conversationId = convRef.id;
        }

        // Insert message
        await db.collection('messages').add({
            conversation_id: conversationId,
            sender_id: senderId,
            content,
            is_read: false,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update last_message_at
        await db.collection('conversations').doc(conversationId).update({
            last_message_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Notify receiver
        await createNotification(
            receiverId, 
            'dm', 
            `${senderName} sent you a message: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`, 
            '/dashboard'
        );

        res.status(201).json({ message: 'Message sent', conversationId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const searchMembersForDM = async (req, res) => {
    const { query } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        if (userRole === 'Guest') {
            // Guests can only search for coordinators of their events
            const eventRegsSnapshot = await db.collection('event_registrations')
                .where('user_id', '==', userId)
                .get();
            
            const organizerIds = new Set();
            
            for (const doc of eventRegsSnapshot.docs) {
                const regData = doc.data();
                const eventDoc = await db.collection('events').doc(regData.event_id).get();
                const eventData = eventDoc.data();
                
                if (eventData?.organizer) {
                    const organizerSnapshot = await db.collection('users')
                        .where('name', '==', eventData.organizer)
                        .get();
                    
                    organizerSnapshot.docs.forEach(d => organizerIds.add(d.id));
                }
            }
            
            const results = [];
            for (const orgId of organizerIds) {
                const userDoc = await db.collection('users').doc(orgId).get();
                const userData = userDoc.data();
                if (userData?.name?.toLowerCase().includes(query?.toLowerCase())) {
                    results.push({
                        id: orgId,
                        name: userData.name,
                        profile_pic: userData.profile_pic,
                        role: userData.role,
                        email: userData.email
                    });
                }
            }
            
            return res.json(results.slice(0, 10));
        } else {
            // Members can search for anyone except guests (unless already in conversation)
            // First, get existing conversation partners
            const allConversations = await db.collection('conversations').get();
            const conversationPartnerIds = new Set();
            
            for (const convDoc of allConversations.docs) {
                const convData = convDoc.data();
                if (convData.user1_id === userId) {
                    conversationPartnerIds.add(convData.user2_id);
                } else if (convData.user2_id === userId) {
                    conversationPartnerIds.add(convData.user1_id);
                }
            }
            
            const usersSnapshot = await db.collection('users').get();
            const results = [];
            
            for (const doc of usersSnapshot.docs) {
                const userData = doc.data();
                
                if (doc.id === userId) continue;
                if (userData.role === 'Guest' && !conversationPartnerIds.has(doc.id)) continue;
                if (!userData.name?.toLowerCase().includes(query?.toLowerCase())) continue;
                
                results.push({
                    id: doc.id,
                    name: userData.name,
                    profile_pic: userData.profile_pic,
                    role: userData.role,
                    email: userData.email
                });
                
                if (results.length >= 10) break;
            }
            
            res.json(results);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
