import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MoreVertical, X, Smile, Paperclip, Send } from 'lucide-react';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';

export default function MyJourney() {
  const [entry, setEntry] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [entry]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entry.trim()) {
      console.log('Journal entry submitted:', entry);
      setEntry('');
      setIsExpanded(false);
    }
  };

  const currentDate = new Date();
  const formattedDate = format(currentDate, 'EEEE, d MMMM yyyy', { locale: id });
  const formattedTime = format(currentDate, 'HH:mm');

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
            <button 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        <div className="space-y-6">
          {/* Example journal entry */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Hari ini, {formattedTime}</span>
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Bahagia
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-700">
              Hari ini aku bangun kesiangan, jadi agak panik pas nyiapin barang buat ke kampus.
              Tapi di jalan aku liat kucing kecil duduk di pinggir trotoar, gemes banget.
              Hal itu bikin aku tersenyum. Rasanya hari ini campur aduk tapi lumayan menyenangkan.
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Dibuat pada {formattedTime}</span>
              <button className="text-primary-600 hover:text-primary-800">Edit</button>
            </div>
          </div>

          {/* Previous entries */}
          <div className="text-center py-4">
            <span className="inline-block px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
              Kemarin
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4 opacity-70">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Kemarin, 14:30</span>
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Biasa saja
                </span>
              </div>
            </div>
            <p className="text-gray-700">
              Hari ini banyak tugas yang harus diselesaikan. Rasanya sedikit kewalahan,
              tapi aku yakin bisa melewatinya satu per satu. Besok harus lebih baik lagi!
            </p>
          </div>
        </div>
      </main>

      {/* Input area */}
      <div className={`bg-white border-t border-gray-200 p-4 ${isExpanded ? 'fixed inset-0 z-20 flex flex-col' : ''}`}>
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
            <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500">
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
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
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
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
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
