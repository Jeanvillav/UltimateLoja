        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Import JSON Section */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h2 className="text-2xl font-bold font-outfit text-yellow-400 mb-4">Importar JSON Bruto</h2>
          <p className="text-sm text-slate-400 mb-4">
            Pega aquí el código que te mandó un amigo y haz clic en revisar. También puedes iniciar una carta vacía: 
            <button onClick={() => setJsonInput('{"nombre":"","edad":20,"posicion":"DEL","overall_rating":70,"pace":70,"shooting":70,"passing":70,"dribbling":70,"defending":70,"physical":70}')} className="text-yellow-400 underline ml-2 hover:text-yellow-300">Plantilla en Blanco</button>
          </p>
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-green-400 font-mono text-xs mb-4 outline-none focus:border-yellow-500 min-h-[150px]"
            placeholder='{"nombre": "Jugador", "overall_rating": 80...}'
          />
          <button onClick={handleParseJSON} className="w-full py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition border border-slate-600 font-bold">
            Cargar al Panel de Edición
          </button>
        </div>

        {/* Intuitive Edit Section */}
        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <h2 className="text-2xl font-bold font-outfit text-green-400 mb-4">Editor Intuitivo</h2>
          {!previewPlayer ? (
            <div className="flex-1 min-h-[250px] flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg bg-black/20">
              Carga un JSON o dale "Editar" a un jugador para empezar
            </div>
          ) : (
            <div className="bg-slate-900 p-4 rounded-lg border border-green-500/30 flex-1 flex flex-col overflow-y-auto max-h-[600px] custom-scrollbar pr-2 relative">
              <div className="flex items-center justify-between mb-6">
                <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-inner ${previewPlayer.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                  {previewPlayer.id ? '✏️ MODO EDICIÓN' : '✨ CREACIÓN NUEVA'}
                </span>
                {previewPlayer.id && (
                  <button onClick={() => { setPreviewPlayer(null); setJsonInput(''); }} className="text-xs text-red-400 hover:text-red-300 underline font-bold">
                    Cancelar Edición
                  </button>
                )}
              </div>
              
              <div className="flex gap-4 mb-6 bg-black/40 p-4 rounded-xl border border-slate-800">
                <div className="relative group cursor-pointer w-24 h-24 flex-shrink-0">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewPlayer.foto_url || `https://placehold.co/100x100/111827/22c55e?text=${previewPlayer.nombre.charAt(0)}`} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-slate-600 group-hover:border-green-500 transition shadow-lg" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none rounded-full bg-black/60 backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Cambiar Foto</span>
                  </div>
                  <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <input type="text" name="nombre" value={previewPlayer.nombre || ''} onChange={handleInputChange} placeholder="Nombre del Jugador" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-bold placeholder:text-slate-500 focus:border-green-500 outline-none transition" />
                  <div className="flex gap-2">
                    <select name="posicion" value={previewPlayer.posicion || 'DEL'} onChange={handleInputChange} className="w-1/2 bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm font-bold focus:border-green-500 outline-none transition cursor-pointer">
                      <option value="POR">Portero (POR)</option>
                      <option value="DEF">Defensa (DEF)</option>
                      <option value="MED">Medio (MED)</option>
                      <option value="DEL">Delantero (DEL)</option>
                    </select>
                    <input type="number" name="edad" value={previewPlayer.edad || 0} onChange={handleInputChange} placeholder="Edad" className="w-1/2 bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm font-bold text-center focus:border-green-500 outline-none transition" />
                  </div>
                  <div className="flex gap-2">
                    <select name="team_id" value={previewPlayer.team_id || ''} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm font-bold focus:border-green-500 outline-none transition cursor-pointer">
                      <option value="">Sin Equipo (Agente Libre)</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mb-6 bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-xl flex flex-col items-center">
                <label className="block text-xs text-yellow-500 font-bold mb-2 uppercase tracking-widest text-center">Media General (OVR) Calculada</label>
                <div className="w-full bg-black/40 border border-yellow-500/50 rounded-lg p-3 text-yellow-400 font-black text-center text-3xl shadow-inner cursor-not-allowed opacity-80">
                  {calculateOVR({
                    ritmo: previewPlayer.pace,
                    tiro: previewPlayer.shooting,
                    pase: previewPlayer.passing,
                    regate: previewPlayer.dribbling,
                    defensa: previewPlayer.defending,
                    fisico: previewPlayer.physical
                  }, previewPlayer.posicion)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'].map(stat => (
                  <div key={stat} className="flex flex-col bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 focus-within:border-green-500/50 transition">
                    <label className="text-[10px] text-slate-400 uppercase font-bold text-center mb-1">{stat}</label>
                    <input type="number" name={stat} value={previewPlayer[stat] || 0} onChange={handleInputChange} className="w-full bg-transparent text-center text-green-400 font-bold text-lg outline-none" />
                  </div>
                ))}
              </div>

              <div className="mt-auto border-t border-slate-800 pt-6">
                <button 
                  onClick={handleSavePlayer} 
                  disabled={loading || uploading}
                  className={`w-full py-4 font-black text-lg uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] ${
                    previewPlayer.id 
                    ? 'btn-fifa btn-fifa-cyan w-full' 
                    : 'btn-fifa w-full'
                  }`}
                >
                  {loading ? 'Guardando en Base de Datos...' : (previewPlayer.id ? 'Actualizar Jugador' : 'Crear Nuevo Jugador')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Players Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <h2 className="text-2xl font-bold font-outfit text-white p-6 border-b border-white/10">Jugadores Existentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="p-4 text-slate-400 font-medium">Nombre</th>
                <th className="p-4 text-slate-400 font-medium">Posición</th>
                <th className="p-4 text-slate-400 font-medium">Media (OVR)</th>
                <th className="p-4 text-slate-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={player.foto_url || `https://placehold.co/30x30/111827/22c55e?text=${player.nombre.charAt(0)}`} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    {player.nombre}
                  </td>
                  <td className="p-4 text-slate-300">
                    <span className="bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-300">{player.posicion}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-yellow-400 font-black text-lg bg-yellow-400/10 px-3 py-1 rounded-lg border border-yellow-400/20">{calculateOVR({
                      ritmo: player.pace,
                      tiro: player.shooting,
                      pase: player.passing,
                      regate: player.dribbling,
                      defensa: player.defending,
                      fisico: player.physical
                    }, player.posicion)}</span>
                  </td>
                  <td className="p-4 flex gap-3">
                    <button 
                      onClick={() => handleEdit(player)}
                      className="text-blue-400 hover:text-white hover:bg-blue-500 text-sm font-bold bg-blue-500/10 px-4 py-2 rounded-lg transition"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(player.id)}
                      className="text-red-400 hover:text-white hover:bg-red-500 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-lg transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500 text-lg">La base de datos está vacía. ¡Empieza creando un jugador!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}
