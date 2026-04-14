import { Mic, MicOff, Loader2, MessageSquare, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useGeminiLive } from "./hooks/useGeminiLive";
import { Visualizer } from "./components/Visualizer";
import { CharacterAvatar } from "./components/CharacterAvatar";

export default function App() {
  const { start, stop, isConnected, isConnecting, isSpeaking, transcript, aiTranscript, error } = useGeminiLive();

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100 flex flex-col h-[600px]">
        {/* Header */}
        <header className="p-6 border-b border-emerald-50 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Gemini Live</h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isConnected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}>
              {isConnected ? "オンライン" : "オフライン"}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth no-scrollbar">
          <AnimatePresence mode="wait">
            {!isConnected && !isConnecting ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-4 py-12"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Gemini Liveを開始</h2>
                <p className="text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                  リアルタイムでAIと音声対話<br/>
                  <span className="text-[10px] text-slate-400">※マイクへのアクセスが必要です</span>
                </p>
                <div className="flex items-center gap-2 justify-center text-xs text-slate-400 bg-emerald-50 py-2 px-4 rounded-full w-fit mx-auto">
                  <Info className="w-3 h-3" />
                  <span>マイクへのアクセス許可が必要</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8 flex flex-col"
              >
                <div className="flex flex-col items-center justify-center py-4 space-y-6">
                  <CharacterAvatar isConnected={isConnected} isSpeaking={isSpeaking} />
                  <div className="flex flex-col items-center gap-2">
                    <Visualizer isConnected={isConnected} />
                    <p className="text-sm font-medium text-emerald-600 animate-pulse">
                      {isSpeaking ? "お話し中..." : isConnected ? "聞き取り中..." : "接続中..."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-100"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              {error}
            </motion.div>
          )}
        </main>

        {/* Footer / Controls */}
        <footer className="p-8 bg-white border-t border-slate-50 flex flex-col items-center">
          <button
            onClick={isConnected ? stop : start}
            disabled={isConnecting}
            className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isConnected 
                ? "bg-red-500 hover:bg-red-600 shadow-red-200" 
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
            }`}
          >
            {isConnecting ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : isConnected ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
            
            {/* Ripple effect when active */}
            {isConnected && (
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
            )}
          </button>
          <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {isConnected ? "タップで終了" : "タップで開始"}
          </p>
        </footer>
      </div>
      
      <p className="mt-8 text-slate-400 text-sm">
        Powered by <span className="font-semibold text-emerald-600">Gemini 3.1 Flash Live</span>
      </p>
    </div>
  );
}
