"use server";

import { db } from "@/lib/firebase-admin";

export interface Conversation {
    id: string;
    lastMessage?: string;
    lastActive?: string;
    phoneNumber: string;
}

export interface Message {
    id: string;
    role: "user" | "model";
    content: string;
    timestamp: string;
}

export async function getConversations() {
    try {
        if (!db) return [];

        const snapshot = await db.collection("conversations").get();
        const conversations: Conversation[] = [];

        for (const doc of snapshot.docs) {
            // Get last message from history subcollection
            const lastMsgSnap = await db.collection("conversations")
                .doc(doc.id)
                .collection("history")
                .orderBy("timestamp", "desc")
                .limit(1)
                .get();

            let lastMessage = "Sin mensajes";
            let lastActive = new Date().toISOString();

            if (!lastMsgSnap.empty) {
                lastMessage = lastMsgSnap.docs[0].data().content;
                lastActive = lastMsgSnap.docs[0].data().timestamp;
            }

            conversations.push({
                id: doc.id,
                phoneNumber: doc.id,
                lastMessage,
                lastActive
            });
        }

        return conversations.sort((a, b) =>
            new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime()
        );
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
}

export async function getConversationHistory(phoneNumber: string) {
    try {
        if (!db) return [];

        const snapshot = await db.collection("conversations")
            .doc(phoneNumber)
            .collection("history")
            .orderBy("timestamp", "asc")
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Message[];
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
}
