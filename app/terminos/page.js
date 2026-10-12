import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones | Ultimate Loja',
  description: 'Términos y condiciones de uso de la plataforma recreativa Ultimate Loja.',
};

export default function TerminosPage() {
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
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black font-outfit text-white">
              Términos y Condiciones
            </h1>
            <p className="text-xs text-slate-400">Última actualización: Octubre 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-slate-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">1. Naturaleza del Proyecto</h2>
            <p>
              <strong>Ultimate Loja</strong> es una iniciativa recreativa y sin ánimo de lucro creada para fomentar el compañerismo y el deporte entre amigos en las canchas de césped sintético de la ciudad de Loja, Ecuador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">2. Carácter Lúdico de las Estadísticas (OVR)</h2>
            <p>
              Las valoraciones numéricas, medias generales (Overall Rating) y atributos individuales asignados en las cartas están inspirados en la estética de los videojuegos de fútbol y tienen un propósito <strong>estrictamente humorístico, lúdico y de entretenimiento entre amigos</strong>. En ningún caso representan una evaluación profesional, médica o deportiva formal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">3. Uso de Fotografías y Contenido</h2>
            <p>
              Al sugerir o proporcionar una fotografía para una carta deportiva, el usuario garantiza contar con el consentimiento del jugador retratado. Queda terminantemente prohibido subir imágenes con contenido ofensivo, violento o inapropiado. La administración se reserva el derecho de retirar cualquier imagen que vulnere estas pautas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">4. Organización de Canchas y Cuotas</h2>
            <p>
              La herramienta de cálculo de cuotas en el módulo de convocados sirve únicamente como calculadora de asistencia y división de gastos compartidos de alquiler de canchas. La plataforma no procesa pagos, transferencias ni recaudaciones monetarias directas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-outfit text-white mb-2">5. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de actualizar o ajustar las funcionalidades, cartas y estos términos conforme evolucione la plataforma comunitaria.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
