import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy,
    setDoc,
    getDocs,
    deleteDoc
} from "firebase/firestore";

// --- CONNECTION REQUESTS ---

/**
 * Send a connection request to another user - prevents duplicates
 */
export const sendConnectionRequest = async (fromUser, toUserId) => {
    // Check if request already exists (pending or accepted)
    const existingQ = query(
        collection(db, "connections"),
        where("fromId", "==", fromUser.uid),
        where("toId", "==", toUserId)
    );

    const existingSnap = await getDocs(existingQ);

    if (!existingSnap.empty) {
        const existing = existingSnap.docs[0].data();
        if (existing.status === "pending") {
            throw new Error("Request already pending");
        }
        if (existing.status === "accepted") {
            throw new Error("Already connected");
        }
    }

    // Also check reverse direction
    const reverseQ = query(
        collection(db, "connections"),
        where("fromId", "==", toUserId),
        where("toId", "==", fromUser.uid)
    );

    const reverseSnap = await getDocs(reverseQ);
    if (!reverseSnap.empty) {
        const existing = reverseSnap.docs[0].data();
        if (existing.status === "accepted") {
            throw new Error("Already connected");
        }
    }

    const requestData = {
        fromId: fromUser.uid,
        fromName: fromUser.displayName || fromUser.name,
        fromPhoto: fromUser.photoURL || "",
        toId: toUserId,
        status: "pending",
        timestamp: serverTimestamp(),
    };

    return await addDoc(collection(db, "connections"), requestData);
};

/**
 * Listen for incoming connection requests in real-time
 */
export const subscribeToIncomingRequests = (userId, callback) => {
    const q = query(
        collection(db, "connections"),
        where("toId", "==", userId),
        where("status", "==", "pending")
    );

    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(requests);
    });
};

/**
 * Accept a connection request
 */
export const acceptConnection = async (requestId) => {
    const requestRef = doc(db, "connections", requestId);
    return await updateDoc(requestRef, { status: "accepted" });
};

/**
 * Reject a connection request
 */
export const rejectConnection = async (requestId) => {
    const requestRef = doc(db, "connections", requestId);
    return await deleteDoc(requestRef);
};

/**
 * Listen for accepted connections in real-time (deduplicated)
 */
export const subscribeToConnections = (userId, callback) => {
    const q1 = query(
        collection(db, "connections"),
        where("fromId", "==", userId),
        where("status", "==", "accepted")
    );
    const q2 = query(
        collection(db, "connections"),
        where("toId", "==", userId),
        where("status", "==", "accepted")
    );

    let fromCons = [];
    let toCons = [];

    const unsub1 = onSnapshot(q1, (snapshot) => {
        fromCons = snapshot.docs.map(d => ({ id: d.id, ...d.data(), partnerId: d.data().toId }));
        const allConnections = [...fromCons, ...toCons];
        const deduped = Array.from(new Map(allConnections.map(c => [c.partnerId, c])).values());
        callback(deduped);
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
        toCons = snapshot.docs.map(d => ({ id: d.id, ...d.data(), partnerId: d.data().fromId }));
        const allConnections = [...fromCons, ...toCons];
        const deduped = Array.from(new Map(allConnections.map(c => [c.partnerId, c])).values());
        callback(deduped);
    });

    return () => { unsub1(); unsub2(); };
};

/**
 * Listen to all outgoing connection requests from the current user.
 * We only filter by fromId on the server to avoid composite index requirements.
 * Client can derive 'pending' or 'accepted' states.
 */
export const subscribeToOutgoingRequests = (userId, callback) => {
    const q = query(
        collection(db, "connections"),
        where("fromId", "==", userId)
    );

    return onSnapshot(q, (snapshot) => {
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(requests);
    });
};

/**
 * Listen for activities from connections
 */
export const subscribeToActivities = (connectionPartnerIds, callback) => {
    if (!connectionPartnerIds || connectionPartnerIds.length === 0) {
        callback([]);
        return () => { };
    }

    // Firestore 'in' query supports up to 10 IDs
    const chunks = [];
    for (let i = 0; i < connectionPartnerIds.length; i += 10) {
        chunks.push(connectionPartnerIds.slice(i, i + 10));
    }

    const unsubs = chunks.map(chunk => {
        const q = query(
            collection(db, "activities"),
            where("authorId", "in", chunk),
            orderBy("timestamp", "desc")
        );
        return onSnapshot(q, (snapshot) => {
            const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(activities);
        });
    });

    return () => unsubs.forEach(unsub => unsub());
};

/**
 * Send a message in a specific chat room
 */
export const sendMessage = async (chatId, senderId, text) => {
    const messageData = {
        senderId,
        text,
        timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, `chats/${chatId}/messages`), messageData);

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, { lastUpdate: serverTimestamp() });
};

/**
 * Listen for messages in a chat room in real-time
 */
export const subscribeToMessages = (chatId, callback) => {
    const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(messages);
    });
};

/**
 * Get or create a chat room between two users
 */
export const getOrCreateChat = async (user1Id, user2Id) => {
    const chatId = [user1Id, user2Id].sort().join("_");
    const chatRef = doc(db, "chats", chatId);

    // Initialize chat document if it doesn't exist
    await setDoc(chatRef, {
        participants: [user1Id, user2Id],
        lastUpdate: serverTimestamp()
    }, { merge: true });

    return chatId;
};

/**
 * Subscribe to the last message in a chat for preview
 */
export const subscribeToLastMessage = (userId, partnerId, callback) => {
    const chatId = [userId, partnerId].sort().join("_");
    const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (messages.length > 0) {
            callback(messages[0]);
        }
    });
};

/**
 * Subscribe to incoming messages from all connections
 */
export const subscribeToIncomingMessages = (userId, callback) => {
    let messageUnsubs = [];

    const q1 = query(
        collection(db, "connections"),
        where("fromId", "==", userId),
        where("status", "==", "accepted")
    );
    const q2 = query(
        collection(db, "connections"),
        where("toId", "==", userId),
        where("status", "==", "accepted")
    );

    const unsub1 = onSnapshot(q1, (snapshot) => {
        const partnerIds = snapshot.docs.map(d => d.data().toId);
        subscribeToAllMessages(userId, partnerIds, callback, messageUnsubs);
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
        const partnerIds = snapshot.docs.map(d => d.data().fromId);
        subscribeToAllMessages(userId, partnerIds, callback, messageUnsubs);
    });

    return () => {
        unsub1();
        unsub2();
        messageUnsubs.forEach(unsub => unsub?.());
    };
};

/**
 * Helper function to subscribe to all messages from partners
 */
const subscribeToAllMessages = (userId, partnerIds, callback, unsubs) => {
    unsubs.forEach(unsub => unsub?.());
    unsubs.length = 0;

    const allMessages = [];

    partnerIds.forEach(partnerId => {
        const chatId = [userId, partnerId].sort().join("_");
        const q = query(
            collection(db, `chats/${chatId}/messages`),
            orderBy("timestamp", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    chatId,
                    partnerId
                }))
                .filter(msg => msg.senderId !== userId);

            allMessages.length = 0;
            partnerIds.forEach(pId => {
                const pMessages = messages.filter(m => m.partnerId === pId);
                if (pMessages.length > 0) allMessages.push(pMessages[0]);
            });
            callback(allMessages);
        });

        unsubs.push(unsub);
    });
};

/**
 * Get user suggestions (users not yet connected)
 */
export const getSuggestions = async (currentUserId) => {
    // 1. Get all users
    const usersSnap = await getDocs(collection(db, "users"));
    const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Get current connections/requests
    const connQ1 = query(collection(db, "connections"), where("fromId", "==", currentUserId));
    const connQ2 = query(collection(db, "connections"), where("toId", "==", currentUserId));

    const [snap1, snap2] = await Promise.all([getDocs(connQ1), getDocs(connQ2)]);

    const connectedIds = new Set([currentUserId]);
    snap1.docs.forEach(d => connectedIds.add(d.data().toId));
    snap2.docs.forEach(d => connectedIds.add(d.data().fromId));

    // 3. Filter out users who are already connected or the current user
    return allUsers.filter(u => !connectedIds.has(u.id)).slice(0, 10);
};
