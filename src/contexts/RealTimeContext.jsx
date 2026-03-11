import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/services/firebase';
import { collection, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Listen for new challenges in real-time
  useEffect(() => {
    if (!user) return;

    const challengesRef = collection(db, 'challenges');
    const q = query(
      challengesRef,
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const challenge = change.doc.data();

          // Show notification for new challenges (not from current user)
          if (challenge.postedBy !== user.uid) {
            toast.success(`New challenge posted: ${challenge.title}`, {
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  window.open(`/challenges/${change.doc.id}`, '_blank');
                }
              }
            });

            // Add to notifications list
            const notification = {
              id: `challenge-${change.doc.id}-${Date.now()}`,
              type: 'challenge',
              title: `New Challenge Posted`,
              message: `${challenge.postedByName} posted: ${challenge.title}`,
              timestamp: new Date(),
              data: {
                challengeId: change.doc.id,
                postedBy: challenge.postedBy,
                postedByName: challenge.postedByName,
                title: challenge.title
              }
            };

            setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only last 50
          }
        }
      });
    }, (error) => {
      console.error('Error listening to challenges:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for activities from connections
  useEffect(() => {
    if (!user) return;

    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef,
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const activity = change.doc.data();

          // Show notification for activities from connections (not from current user)
          if (activity.authorId !== user.uid) {
            const notification = {
              id: `activity-${change.doc.id}-${Date.now()}`,
              type: 'activity',
              title: activity.title,
              message: activity.description,
              timestamp: activity.timestamp?.toDate() || new Date(),
              data: {
                activityId: change.doc.id,
                authorId: activity.authorId,
                type: activity.type,
                metadata: activity.metadata
              }
            };

            setNotifications(prev => [notification, ...prev.slice(0, 49)]);
          }
        }
      });
    }, (error) => {
      console.error('Error listening to activities:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen for connection requests
  useEffect(() => {
    if (!user) return;

    const connectionsRef = collection(db, 'connections');
    const q = query(
      connectionsRef,
      where('toId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pending = [];
      snapshot.forEach((doc) => {
        const connection = doc.data();
        if (connection.status === 'pending') {
          pending.push({ id: doc.id, ...connection });
        }
      });
      pending
        .sort((a, b) => {
          const ta = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
          const tb = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
          return tb - ta;
        })
        .forEach((connection) => {
          toast.info(`${connection.fromName} wants to connect with you!`, {
            duration: 8000,
            action: {
              label: 'View',
              onClick: () => {
                window.open('/connections', '_blank');
              }
            }
          });

          const notification = {
            id: `connection-${connection.id}-${Date.now()}`,
            type: 'connection_request',
            title: 'New Connection Request',
            message: `${connection.fromName} wants to connect with you`,
            timestamp: connection.timestamp?.toDate ? connection.timestamp.toDate() : new Date(),
            data: {
              connectionId: connection.id,
              fromId: connection.fromId,
              fromName: connection.fromName,
              fromPhoto: connection.fromPhoto
            }
          };

          setNotifications(prev => [notification, ...prev.slice(0, 49)]);
        });
    }, (error) => {
      console.error('Error listening to connections:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Notify when my outgoing requests are accepted
  useEffect(() => {
    if (!user) return;

    const outgoingRef = collection(db, 'connections');
    const q = query(outgoingRef, where('fromId', '==', user.uid));
    const seenAccepted = new Set();

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const accepted = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'accepted') {
          accepted.push({ id: docSnap.id, ...data });
        }
      });

      for (const conn of accepted) {
        if (seenAccepted.has(conn.id)) continue;
        seenAccepted.add(conn.id);

        let otherName = 'Someone';
        try {
          const userDoc = await import('firebase/firestore').then(({ doc, getDoc }) => getDoc(doc(db, 'users', conn.toId)));
          if (userDoc.exists()) {
            const d = userDoc.data();
            otherName = d?.name || d?.displayName || otherName;
          }
        } catch (error) {
          console.error("Error fetching user for connection:", error);
        }

        toast.success(`${otherName} accepted your connection request`, { duration: 6000 });

        const notification = {
          id: `connection-accepted-${conn.id}-${Date.now()}`,
          type: 'connection_accepted',
          title: 'Connection Accepted',
          message: `${otherName} is now connected with you`,
          timestamp: conn.timestamp?.toDate ? conn.timestamp.toDate() : new Date(),
          data: {
            connectionId: conn.id,
            toId: conn.toId
          }
        };
        setNotifications(prev => [notification, ...prev.slice(0, 49)]);
      }
    }, (error) => {
      console.error('Error listening to outgoing connections:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const value = {
    notifications,
    onlineUsers,
    clearNotifications,
    markNotificationAsRead
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};
