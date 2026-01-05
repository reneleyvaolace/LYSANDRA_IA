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
    appointments: {
        id: string;
        clientName: string;
        date: string;
        type: string;
        status: string;
    }[];
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

        // 3. Get Appointments
        const appointments: DashboardMetrics["appointments"] = apptsSnap.docs.map(doc => ({
            id: doc.id,
            clientName: doc.data().clientName || doc.data().name || "Cliente",
            date: doc.data().date || new Date().toISOString(),
            type: doc.data().type || "General",
            status: doc.data().status || "pending"
        }));

        // 4. Get Real Daily Interactions (Last 7 days)
        const dailyInteractions = [];
        const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Count conversations updated on this day
            // Note: In a production app, you might want a specialized 'stats' collection
            const dayCount = (await db.collection("conversations")
                .where("updatedAt", ">=", `${dateStr}T00:00:00`)
                .where("updatedAt", "<=", `${dateStr}T23:59:59`)
                .get()).size;

            dailyInteractions.push({
                date: days[d.getDay()],
                count: dayCount
            });
        }

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
            dailyInteractions,
            appointments
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
            dailyInteractions: [],
            appointments: []
        };
    }
}

export async function deleteAppointment(id: string) {
    try {
        await db.collection("appointments").doc(id).delete();
        return { success: true };
    } catch (error) {
        console.error("Error deleting appointment:", error);
        return { success: false, error: "Failed to delete" };
    }
}

export async function updateAppointment(id: string, data: Partial<DashboardMetrics["appointments"][0]>) {
    try {
        await db.collection("appointments").doc(id).update({
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating appointment:", error);
        return { success: false, error: "Failed to update" };
    }
}
