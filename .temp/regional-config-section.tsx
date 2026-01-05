{/* Configuración Regional - INSERTAR DESPUÉS DE LA SECCIÓN DEL AGENTE */ }
<section>
    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Globe className="w-4 h-4 text-cyan-500" />
        Configuración Regional
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Zona Horaria */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 px-1 italic">Zona Horaria</label>
            <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium appearance-none cursor-pointer"
                >
                    {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value} className="bg-zinc-900 text-white">
                            {tz.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {/* Formato de Fecha */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 px-1 italic">Formato de Fecha</label>
            <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium appearance-none cursor-pointer"
                >
                    {DATE_FORMATS.map((fmt) => (
                        <option key={fmt.value} value={fmt.value} className="bg-zinc-900 text-white">
                            {fmt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {/* Formato de Hora */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 px-1 italic">Formato de Hora</label>
            <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 pointer-events-none" />
                <select
                    value={settings.timeFormat}
                    onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                    className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium appearance-none cursor-pointer"
                >
                    {TIME_FORMATS.map((fmt) => (
                        <option key={fmt.value} value={fmt.value} className="bg-zinc-900 text-white">
                            {fmt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    </div>
</section>
