"use server";

import { db } from "@/lib/firebase-admin";

export interface DashboardMetrics {
    totalInteractions: number;
    scheduledAppointments: number;
    capturedLeads: number;
    successRate: number;
    recentActivity: {
        id: string;
        user: string;
        action: string;
        time: string;
        status: "success" | "pending" | "info";
    }[];
    modelHealth: {
        latency: string;
        uptime: string;
        tokensUsed: string;
    };
    dailyInteractions: { date: string; count: number }[];
}

export async function getDashboardData(): Promise<DashboardMetrics> {
    try {
        if (!db) throw new Error("Firebase not initialized");

        // 1. Get Totals
        const [apptsSnap, convosSnap] = await Promise.all([
            db.collection("appointments").get(),
            db.collection("conversations").get()
        ]);

        const totalInteractions = convosSnap.size;
        const scheduledAppointments = apptsSnap.size;

        // Mocking some data for metrics that require more complex logic or don't have enough data yet
        const capturedLeads = Math.floor(totalInteractions * 0.4); // Assume 40% lead conversion
        const successRate = totalInteractions > 0 ? Math.round((scheduledAppointments / totalInteractions) * 100) : 0;

        // 2. Get Recent Activity
        const recentActivity: DashboardMetrics["recentActivity"] = [];

        // Add appointments to activity
        apptsSnap.docs.slice(0, 3).forEach(doc => {
            const data = doc.data();
            recentActivity.push({
                id: doc.id,
                user: data.name || "Usuario",
                action: `Agendó cita de ${data.type || 'Interés'}`,
                time: "Hoy",
                status: "success"
            });
        });

        // 3. Daily Interactions (Last 7 days mock for UI)
        const dailyInteractions = [
            { date: "Lun", count: 12 },
            { date: "Mar", count: 18 },
            { date: "Mie", count: 15 },
            { date: "Jue", count: 25 },
            { date: "Vie", count: 22 },
            { date: "Sab", count: 30 },
            { date: "Dom", count: 28 },
        ];

        return {
            totalInteractions,
            scheduledAppointments,
            capturedLeads,
            successRate,
            recentActivity: recentActivity.length > 0 ? recentActivity : [
                { id: "1", user: "Sistema", action: "Lysandra inicializada", time: "Ahora", status: "info" }
            ],
            modelHealth: {
                latency: "1.2s",
                uptime: "99.9%",
                tokensUsed: "12,450"
            },
            dailyInteractions
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            totalInteractions: 0,
            scheduledAppointments: 0,
            capturedLeads: 0,
            successRate: 0,
            recentActivity: [],
            modelHealth: { latency: "0ms", uptime: "0%", tokensUsed: "0" },
            dailyInteractions: []
        };
    }
}
