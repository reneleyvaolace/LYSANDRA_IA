import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Bot,
  Cpu,
  Zap,
  Globe
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0a0a0c] text-white overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="w-full max-w-7xl flex justify-between items-center p-8 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center glow-purple">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-xl">LYSANDRA</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#soluciones" className="hover:text-white transition-colors">Soluciones</a>
          <a href="#tecnologia" className="hover:text-white transition-colors">Tecnología</a>
          <Link href="/dashboard" className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-8 animate-bounce">
          <Zap className="w-3 h-3 fill-cyan-400" />
          Nueva Actualización: Gemini 2.0 Flash
        </div>

        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6">
          La Inteligencia de <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500">
            CoreAura
          </span>
        </h1>

        <p className="max-w-2xl text-zinc-400 text-lg md:text-xl mb-12 leading-relaxed">
          Lysandra es el asistente autónomo diseñado para transformar la comunicación de tu empresa de software.
          Agendado inteligente, soporte técnico y captura de leads en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="px-8 py-4 rounded-2xl bg-white text-black font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all group shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Acceder al Panel
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="https://wa.me/your-number" target="_blank" className="px-8 py-4 rounded-2xl bg-zinc-900 border border-white/10 text-white font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all leading-none">
            Demo WhatsApp
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-8 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Agente Autónomo",
            desc: "Capaz de tomar decisiones de agendado basadas en la disponibilidad de tu equipo.",
            icon: Bot
          },
          {
            title: "Stack de Vanguardia",
            desc: "Construido sobre Next.js 14, Firebase y los modelos más avanzados de Google Gemini.",
            icon: Cpu
          },
          {
            title: "Omnicanal",
            desc: "Conéctalo con WhatsApp, Web y tus CRMs favoritos de forma nativa.",
            icon: Globe
          }
        ].map((feature, i) => (
          <div key={i} className="glass p-8 rounded-3xl group hover:border-cyan-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

      <footer className="w-full border-t border-white/5 py-12 px-8 flex flex-col md:flex-row justify-between items-center text-zinc-600 text-xs gap-4">
        <p>© 2025 CoreAura S.A.S. de C.V. - Lysandra IA Control System</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Términos</a>
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          <a href="#" className="hover:text-white transition-colors">Documentación API</a>
        </div>
      </footer>
    </main>
  );
}
