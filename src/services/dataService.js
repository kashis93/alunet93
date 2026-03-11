import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";

/**
 * Listen for startups in real-time
 */
export const subscribeToStartups = (callback) => {
    const q = query(collection(db, "startups"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
        const startups = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(startups);
    });
};

/**
 * Listen for opportunities in real-time
 */
export const subscribeToOpportunities = (callback) => {
    const q = query(collection(db, "opportunities"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (snapshot) => {
        const opportunities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Map Firestore fields to match local expected fields if necessary
            postedDate: doc.data().timestamp?.toDate?.().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
        }));
        callback(opportunities);
    });
};


/**
 * Add a new document to a collection
 * @param {string} collectionName 
 * @param {object} data 
 */
export const addData = async (collectionName, data) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            timestamp: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        return { success: false, error: error.message };
    }
};

/**
 * Specifically for questions
 */
export const addQuestion = async (question, user) => {
    return await addData("qna", {
        question,
        askedBy: user.displayName || user.name || "Anonymous",
        userId: user.uid,
        answers: []
    });
};

/**
 * Specifically for opportunities
 */
export const addOpportunity = async (opportunity, user) => {
    const result = await addData("opportunities", {
        ...opportunity,
        postedBy: user.displayName || user.name || "Anonymous",
        userId: user.uid
    });

    if (result.success) {
        // Create activity for connections
        await addData("activities", {
            type: "opportunity",
            title: opportunity.title,
            company: opportunity.company,
            authorId: user.uid,
            authorName: user.displayName || user.name,
            refId: result.id
        });
    }
    return result;
};

/**
 * Specifically for blog posts
 */
export const addBlog = async (blog, user) => {
    return await addData("blogs", {
        ...blog,
        author: user.displayName || user.name || "Anonymous",
        authorRole: user.role || "Alumni",
        userId: user.uid
    });
};

/**
 * Specifically for startups
 */
export const addStartup = async (startup, user) => {
    const result = await addData("startups", {
        ...startup,
        founder: user.displayName || user.name || "Anonymous",
        userId: user.uid
    });

    if (result.success) {
        // Create activity for connections
        await addData("activities", {
            type: "startup",
            title: startup.title,
            authorId: user.uid,
            authorName: user.displayName || user.name,
            refId: result.id,
            content: startup.description
        });
    }
    return result;
};
