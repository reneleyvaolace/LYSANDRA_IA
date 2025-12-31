import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[#0a0a0c] text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-900/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-zinc-800/30 lg:p-4">
          Lysandra AI MVP&nbsp;
          <code className="font-bold">v1.0.0</code>
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-purple-500/20 before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-cyan-500/20 after:via-purple-500/20 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-purple-700/10 before:dark:opacity-10 after:dark:from-cyan-900 after:dark:via-[#0141ff]/40 after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <h1 className="text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600 animate-pulse">
          LYSANDRA
        </h1>
      </div>

      <div className="mt-12 mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <Link
          href="/dashboard"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Dashboard{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm text-zinc-400`}>
            Ver el historial de citas y conversaciones del asistente.
          </p>
        </Link>

        <a
          href="https://wa.me/your-number"
          target="_blank"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            WhatsApp{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm text-zinc-400`}>
            Interactúa con Lysandra directamente en WhatsApp Business.
          </p>
        </a>
      </div>
    </main>
  );
}
