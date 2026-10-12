import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad | Ultimate Loja',
  description: 'Información sobre el tratamiento de datos y privacidad en la plataforma Ultimate Loja.',
};

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Volver al Inicio
      </Link>

      <div className="glass-panel p-8 md:p-12 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/20 text-green-400 rounded-xl border border-green-500/30">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-outfit text-white">
              Política de Privacidad
            </h1>
            <p className="text-xs text-slate-400">Última actualización: Octubre 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">1. Introducción</h2>
            <p>
              En <strong>Ultimate Loja</strong> respetamos la privacidad de los futbolistas y usuarios que participan en nuestra comunidad recreativa de fútbol amateur en las canchas sintéticas de Loja, Ecuador. Esta política describe cómo manejamos la información registrada en el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">2. Datos Recopilados</h2>
            <p>
              Los únicos datos tratados en la plataforma corresponden a información deportiva y lúdica necesaria para las cartas de estadísticas y convocatorias:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-300">
              <li>Nombre o apodo deportivo del jugador.</li>
              <li>Edad aproximada y posición en la cancha (POR, DEF, MED, DEL).</li>
              <li>Fotografía de perfil deportiva suministrada voluntariamente.</li>
              <li>Atributos de juego recreativos (ritmo, tiro, pase, regate, defensa, físico).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">3. Uso de la Información</h2>
            <p>
              La información es utilizada exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2 text-slate-300">
              <li>Visualización de cartas de estadísticas estilo Ultimate Team.</li>
              <li>Generación de plantillas tácticas en el Squad Builder.</li>
              <li>Organización de partidos comunitarios y cálculo de cuotas de cancha en el módulo de convocados.</li>
            </ul>
            <p className="mt-2 text-slate-400">
              No comercializamos, cedemos ni compartimos datos personales con terceros para fines publicitarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">4. Almacenamiento y Seguridad</h2>
            <p>
              Las bases de datos e imágenes están alojadas en infraestructura segura de <strong>Supabase</strong> con cifrado en tránsito (HTTPS) y políticas estrictas de seguridad por fila (RLS).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">5. Derechos del Usuario (Modificación y Supresión)</h2>
            <p>
              Cualquier jugador o participante puede solicitar en cualquier momento la actualización de su fotografía, rectificación de estadísticas o eliminación completa de su perfil enviando una solicitud a través del panel de sugerencias o comunicándose con el administrador del torneo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">6. Cookies y Almacenamiento Local</h2>
            <p>
              Utilizamos cookies esenciales y almacenamiento local del navegador únicamente para recordar preferencias técnicas (como el consentimiento de cookies y el estado temporal de plantillas armadas).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
