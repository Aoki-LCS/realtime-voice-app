import React, { useState } from 'react';
import { Key, Eye, EyeOff, ExternalLink, Trash2, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedApiKey: string;
  onSaveApiKey: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, savedApiKey, onSaveApiKey }: ApiKeyModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState(savedApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    setApiKeyInput(savedApiKey);
    setIsSaved(false);
  }, [isOpen, savedApiKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(apiKeyInput.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setApiKeyInput('');
    onSaveApiKey('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">APIキーの設定</h2>
              <p className="text-xs text-slate-400">ご自身のGemini APIキーで会話します</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            入力したAPIキーはあなたのブラウザ内（ローカルストレージ）にのみ保存され、外部のサーバーには送信されません。
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 pr-11 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 hover:underline"
              >
                APIキーを取得する (Google AI Studio)
                <ExternalLink className="w-3 h-3" />
              </a>

              {savedApiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-red-500 hover:text-red-600 inline-flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-3 h-3" />
                  削除
                </button>
              )}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    保存完了
                  </>
                ) : (
                  "保存する"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
