# 📋 INSTRUCCIONES: Añadir Configuración Regional al Panel de Settings

## ✅ Paso 1: Verificar que los imports estén completos

En `src/app/dashboard/settings/page.tsx`, verifica que el import de `Globe` esté presente (línea ~41):

```tsx
import {
    // ... otros imports
    Globe
} from "lucide-react";
```

✅ **YA ESTÁ HECHO** - El icono Globe ya fue añadido.

---

## ✅ Paso 2: Verificar las constantes

Las constantes `TIMEZONES`, `DATE_FORMATS` y `TIME_FORMATS` ya están definidas al inicio del archivo (líneas ~45-80).

✅ **YA ESTÁ HECHO** - Las constantes ya existen.

---

## 📝 Paso 3: Añadir la sección de Configuración Regional

**UBICACIÓN**: En `src/app/dashboard/settings/page.tsx`, busca la línea que dice:

```tsx
<section>
    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-cyan-500" />
        Canales de IA
    </h3>
```

**ACCIÓN**: ANTES de esa sección, añade el siguiente código:

```tsx
{/* Configuración Regional */}
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
```

---

## ✅ Resumen de lo que YA ESTÁ IMPLEMENTADO:

1. ✅ **Backend Completo**:
   - Campos `timezone`, `dateFormat`, `timeFormat` en `CompanySettings`
   - Valores por defecto en Firestore
   - Herramienta `getCurrentDateTime` actualizada para usar configuración
   - Scripts de inicialización ejecutados

2. ✅ **Frontend Parcial**:
   - Imports de iconos ✅
   - Constantes de opciones ✅
   - **FALTA**: Añadir la sección visual en el UI (Paso 3 arriba)

---

## 🧪 Cómo Probar:

1. Añade la sección del Paso 3
2. Guarda el archivo
3. Ve a **Settings > General**
4. Deberías ver la nueva sección "Configuración Regional" con 3 selectores
5. Cambia la zona horaria a otra (ej: "Nueva York")
6. Haz clic en "Guardar Cambios"
7. Ve al **Laboratorio IA**
8. Pregunta: "¿Qué hora es?"
9. La IA debería usar `getCurrentDateTime` y mostrar la hora en la zona horaria configurada

---

## 📊 Beneficios de Esta Implementación:

- 🌍 **19 zonas horarias** disponibles (México, USA, Latinoamérica, Europa, Asia)
- 📅 **5 formatos de fecha** (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, etc.)
- ⏰ **2 formatos de hora** (12h con AM/PM, 24h)
- 🔄 **Dinámico**: La IA siempre usa la configuración actual
- 💾 **Persistente**: Se guarda en Firestore
- 🎯 **Preciso**: Elimina el problema de fechas incorrectas al agendar citas
