'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SugerirJugador() {
  const [formData, setFormData] = useState({
    nombre: '',
    edad: 20,
    posicion: 'DEL',
    team_id: '',
    foto_url: '',
    perfil_fisico: '',
    cualidades_tecnicas: '',
    fortalezas: '',
    debilidades: '',
    rol_tactico: '',
    overall_rating: 75,
    pace: 70,
    shooting: 70,
    passing: 70,
    dribbling: 70,
    defending: 70,
    physical: 70
  });

  const [teams, setTeams] = useState([]);
  const [generatedJson, setGeneratedJson] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('teams').select('id, name').order('name');
      if (data) {
        setTeams(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, team_id: data[0].id }));
        }
      }
    };
    fetchTeams();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isNumber = ['edad', 'overall_rating', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].includes(name);
    setFormData(prev => ({
      ...prev,
      [name]: isNumber ? parseInt(value) || 0 : value
    }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    
    // Parse arrays correctly
    const playerToExport = {
      ...formData,
      cualidades_tecnicas: formData.cualidades_tecnicas.split(',').map(s => s.trim()).filter(Boolean),
      fortalezas: formData.fortalezas.split(',').map(s => s.trim()).filter(Boolean),
      debilidades: formData.debilidades.split(',').map(s => s.trim()).filter(Boolean),
    };

    setGeneratedJson(JSON.stringify(playerToExport, null, 2));
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-black font-outfit text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-500">
        Sugerir un Jugador
      </h1>
      <p className="text-center text-slate-400 mb-8">
        Llena tus estadísticas o las de tu amigo. Generaremos un código para que se lo envíes al administrador.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-2xl flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nombre</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Edad</label>
              <input type="number" name="edad" value={formData.edad} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Posición Principal</label>
              <select name="posicion" value={formData.posicion} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                <option value="POR">Portero (POR)</option>
                <option value="DEF">Defensa (DEF)</option>
                <option value="MED">Mediocampista (MED)</option>
                <option value="DEL">Delantero (DEL)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Equipo</label>
              <select name="team_id" value={formData.team_id} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">URL de Foto (Opcional - ej: imgur.com)</label>
            <input type="url" name="foto_url" value={formData.foto_url} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white placeholder:text-slate-600" placeholder="https://..." />
          </div>

          <div className="border-t border-slate-700 pt-4 mt-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Estadísticas FC 26</h3>
            <div className="grid grid-cols-3 gap-3">
              {['overall_rating', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map(stat => (
                <div key={stat}>
                  <label className="block text-xs text-slate-400 mb-1 uppercase">{stat.replace('_rating', ' (OVR)')}</label>
                  <input type="number" name={stat} min="1" max="99" value={formData[stat]} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold text-center" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 mt-4">
            <h3 className="text-lg font-bold text-green-400 mb-2">Análisis (Opcional)</h3>
            <label className="block text-xs text-slate-400 mb-1">Perfil Físico</label>
            <textarea name="perfil_fisico" value={formData.perfil_fisico} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm mb-2" rows="2" placeholder="Ej: Alto, robusto..."></textarea>
            
            <label className="block text-xs text-slate-400 mb-1">Fortalezas (separadas por coma)</label>
            <input type="text" name="fortalezas" value={formData.fortalezas} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm mb-2" placeholder="Ej: Cabezazo, barridas..." />
            
            <label className="block text-xs text-slate-400 mb-1">Debilidades (separadas por coma)</label>
            <input type="text" name="debilidades" value={formData.debilidades} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm mb-2" placeholder="Ej: Velocidad, mal pie..." />
          </div>

          <button type="submit" className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-xl transition-all shadow-lg mt-4">
            Generar Código JSON
          </button>
        </form>

        {generatedJson && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="glass-panel p-4 rounded-xl flex-1 flex flex-col">
              <h3 className="text-xl font-bold font-outfit text-white mb-2">Código Generado</h3>
              <p className="text-sm text-slate-400 mb-4">Copia este código y envíaselo al administrador por WhatsApp para que lo importe con 1 clic.</p>
              
              <textarea 
                readOnly 
                value={generatedJson}
                className="w-full flex-1 bg-black/50 border border-slate-700 rounded-lg p-4 text-green-400 font-mono text-sm resize-none mb-4 outline-none"
              />
              
              <button 
                onClick={copyToClipboard}
                className={`w-full py-3 font-bold rounded-xl transition-all ${copied ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600'}`}
              >
                {copied ? '¡Copiado!' : 'Copiar Código'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
