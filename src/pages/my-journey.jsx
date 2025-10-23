import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MoreVertical, X, Smile, Paperclip, Send } from 'lucide-react';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';

export default function MyJourney() {
  const [entry, setEntry] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [entries, setEntries] = useState([]);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // ambil data dari localStorage saat pertama kali
  useEffect(() => {
    const saved = localStorage.getItem('journeyEntries');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  // auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [entry]);

  // kirim & simpan ke localStorage
  const handleSubmit = (e) => {
    e.preventDefault();
    if (entry.trim()) {
      const newEntry = {
        id: Date.now(),
        text: entry.trim(),
        date: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      const updated = [newEntry, ...entries];
      setEntries(updated);
      localStorage.setItem('journeyEntries', JSON.stringify(updated));
      setEntry('');
      setIsExpanded(false);
    }
  };

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'EEEE, d MMMM yyyy', { locale: id });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900">Catatan Harian</h1>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600" aria-label="More options">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        {entries.length === 0 ? (
          <p className="text-center text-gray-400 italic mt-6">
            Belum ada catatan hari ini 🌿
          </p>
        ) : (
          <div className="space-y-6">
            {entries.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.date}</span>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Input area */}
      <div
        className={`bg-white border-t border-gray-200 p-4 ${
          isExpanded ? 'fixed inset-0 z-20 flex flex-col' : ''
        }`}
      >
        {isExpanded && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Tulisan Baru</h2>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Minimize"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-2">
            <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#D8BFAA] focus-within:ring-1 focus-within:ring-[#D8BFAA]">
              <textarea
                ref={textareaRef}
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-4 placeholder-gray-400 sm:text-sm"
                placeholder="Bagaimana perasaanmu hari ini?"
                rows={isExpanded ? 5 : 1}
              />

              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    aria-label="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    aria-label="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!entry.trim()}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    entry.trim()
                      ? 'bg-[#D8BFAA] text-white hover:opacity-90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Simpan
                </button>
              </div>
            </div>

            {!isExpanded && (
              <button
                type="submit"
                disabled={!entry.trim()}
                className={`p-3 rounded-full ${
                  entry.trim()
                    ? 'bg-[#D8BFAA] text-white hover:opacity-90'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
