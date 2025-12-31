import { db } from "@/lib/firebase-admin";
export const dynamic = 'force-dynamic';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Appointment {
    id: string;
    clientName: string;
    date: string;
    type: string;
    status: string;
}

async function getAppointments() {
    if (!db) return [];
    try {
        const snapshot = await db.collection("appointments").orderBy("date", "desc").get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Appointment[];
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
}

export default async function DashboardPage() {
    const appointments = db ? await getAppointments() : [];

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Lysandra</h1>
                    <p className="text-muted-foreground">Gestiona las citas agendadas por el asistente de IA.</p>
                </div>

                <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4 backdrop-blur-sm">
                    <Table>
                        <TableCaption>Lista de citas recientes agendadas por Lysandra.</TableCaption>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                <TableHead className="text-zinc-400">Cliente</TableHead>
                                <TableHead className="text-zinc-400">Fecha</TableHead>
                                <TableHead className="text-zinc-400">Tipo</TableHead>
                                <TableHead className="text-zinc-400">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-zinc-500">
                                        No hay citas registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                appointments.map((apt) => (
                                    <TableRow key={apt.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                        <TableCell className="font-medium text-white">{apt.clientName}</TableCell>
                                        <TableCell className="text-zinc-300">{new Date(apt.date).toLocaleString()}</TableCell>
                                        <TableCell className="text-zinc-300">{apt.type}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
