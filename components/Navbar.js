import Link from 'next/link';
import { Home, Users, Search, ClipboardList, Shield, PlusCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-yellow-500 flex items-center justify-center">
              <span className="font-outfit font-black text-black">UL</span>
            </div>
            <span className="font-outfit font-bold text-xl text-white tracking-wider">Ultimate Loja</span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition">
              <Home size={18} /> Inicio
            </Link>
            <Link href="/equipos" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition">
              <Shield size={18} /> Equipos
            </Link>
            <Link href="/jugadores" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition">
              <Users size={18} /> Jugadores
            </Link>
            <Link href="/squad-builder" className="flex items-center gap-2 text-slate-300 hover:text-green-400 transition">
              <ClipboardList size={18} /> Squad Builder
            </Link>
            <Link href="/sugerir" className="flex items-center gap-2 text-slate-300 hover:text-yellow-400 transition">
              <PlusCircle size={18} /> Sugerir
            </Link>
          </div>

          <div className="flex items-center">
            <Link href="/admin" className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 py-1 px-3 rounded-full transition border border-slate-700">
              Admin
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile nav could go here */}
      <div className="md:hidden flex justify-around p-2 bg-slate-900 border-t border-slate-800 overflow-x-auto text-xs">
         <Link href="/" className="p-2 text-slate-400 hover:text-white"><Home size={20} /></Link>
         <Link href="/equipos" className="p-2 text-slate-400 hover:text-white"><Shield size={20} /></Link>
         <Link href="/jugadores" className="p-2 text-slate-400 hover:text-white"><Users size={20} /></Link>
         <Link href="/squad-builder" className="p-2 text-slate-400 hover:text-white"><ClipboardList size={20} /></Link>
         <Link href="/sugerir" className="p-2 text-yellow-500 hover:text-yellow-400"><PlusCircle size={20} /></Link>
      </div>
    </nav>
  );
}
