import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToIncomingRequests,
  subscribeToConnections,
  subscribeToActivities,
  subscribeToIncomingMessages,
  getSuggestions
} from "@/services/socialService";
import { toast } from "sonner";
import { db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastRequestIds, setLastRequestIds] = useState(new Set());
  const [lastMessageIds, setLastMessageIds] = useState(new Set());
  const [senderData, setSenderData] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  // Subscribe to incoming connection requests
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToIncomingRequests(user.uid, (requests) => {
      const newRequests = requests.filter(req => !lastRequestIds.has(req.id));

      // Show toast for new requests
      newRequests.forEach(req => {
        toast.info(`New connection request from ${req.fromName}`);
      });

      // Update last seen request IDs
      const allIds = new Set([...lastRequestIds, ...requests.map(r => r.id)]);
      setLastRequestIds(allIds);

      setConnectionRequests(requests);
      setUnreadCount(prev => prev + newRequests.length);
    });

    return () => unsubscribe();
  }, [user?.uid, lastRequestIds]);

  // Subscribe to messages and fetch sender info
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToIncomingMessages(user.uid, (newMessages) => {
      const lastMessages = new Map(messages.map(m => [m.id, m]));
      const incomingNewMessages = newMessages.filter(msg => !lastMessages.has(msg.id));

      // Fetch sender information for messages
      Promise.all(
        newMessages.map(async (msg) => {
          if (senderData[msg.senderId]) {
            return [msg.senderId, senderData[msg.senderId]];
          }
          const userDoc = await getDoc(doc(db, "users", msg.senderId));
          if (userDoc.exists()) {
            return [msg.senderId, userDoc.data()];
          }
          return null;
        })
      ).then(results => {
        const senders = { ...senderData };
        results.forEach(result => {
          if (result) senders[result[0]] = result[1];
        });
        setSenderData(senders);
      });

      // Show toast for new messages
      incomingNewMessages.forEach(msg => {
        const senderName = senderData[msg.senderId]?.name || "Someone";
        toast.info(`New message from ${senderName}`, {
          description: msg.text?.substring(0, 50) + "...",
        });
      });

      setMessages(newMessages);
      setUnreadCount(prev => prev + incomingNewMessages.length);
    });

    return () => unsubscribe();
  }, [user?.uid, messages, senderData]);

  // Subscribe to activities
  useEffect(() => {
    if (!user?.uid) return;

    const handleConnections = (connections) => {
      if (connections.length === 0) return;

      const partnerIds = connections.map(c => c.partnerId);
      const unsubActivities = subscribeToActivities(partnerIds, (newActivities) => {
        setActivities(newActivities);
      });

      return unsubActivities;
    };

    const unsubConnections = subscribeToConnections(user.uid, handleConnections);

    return () => unsubConnections();
  }, [user?.uid]);

  // Fetch suggestions
  useEffect(() => {
    if (!user?.uid) return;
    getSuggestions(user.uid).then(setSuggestions).catch(console.error);
  }, [user?.uid]);

  // Calculate total unread notifications
  const totalNotifications = connectionRequests.length + messages.length;

  // Enrich messages with sender data
  const enrichedMessages = messages.map(msg => ({
    ...msg,
    senderName: senderData[msg.senderId]?.name || "Unknown",
    senderPhoto: senderData[msg.senderId]?.photoURL || "",
  }));

  return (
    <NotificationContext.Provider
      value={{
        connectionRequests,
        messages: enrichedMessages,
        activities,
        unreadCount,
        totalNotifications,
        suggestions
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
