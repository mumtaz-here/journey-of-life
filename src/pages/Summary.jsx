import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MoreVertical, BarChart2, Calendar, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function Summary() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from an API
  const moodData = {
    week: [65, 59, 80, 81, 56, 55, 40],
    month: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59],
  };

  const moodAverages = {
    week: 72,
    month: 68,
  };

  const moodTrend = {
    week: 5, // percentage up or down
    month: 2,
  };

  const commonThemes = [
    { name: 'Keluarga', count: 15, percentage: 45 },
    { name: 'Pekerjaan', count: 12, percentage: 36 },
    { name: 'Kesehatan', count: 8, percentage: 24 },
    { name: 'Hobi', count: 5, percentage: 15 },
  ];

  const recentEntries = [
    {
      id: 1,
      date: 'Hari ini',
      time: '08:32',
      preview: 'Hari ini aku bangun kesiangan, jadi agak panik pas nyiapin barang buat ke kampus...',
      mood: 'Happy',
      moodColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 2,
      date: 'Kemarin',
      time: '14:30',
      preview: 'Hari ini banyak tugas yang harus diselesaikan. Rasanya sedikit kewalahan...',
      mood: 'Neutral',
      moodColor: 'bg-yellow-100 text-yellow-800',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">Ringkasan</h1>
            
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
          
          {/* Time range selector */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {['week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    timeRange === range ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === 'week' ? 'Minggu ini' : 'Bulan ini'}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-4 h-4 mr-1" />
              Filter
              {showFilters ? (
                <ChevronUp className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-1" />
              )}
            </button>
          </div>
          
          {/* Filters - shown conditionally */}
          {showFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by:</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Mood', 'Tags', 'Kata kunci', 'Tanggal'].map((filter) => (
                  <button
                    key={filter}
                    className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Mood average */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Rata-rata Mood</h3>
              <BarChart2 className="w-5 h-5 text-primary-500" />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">{moodAverages[timeRange]}</span>
              <span className="ml-2 text-sm text-gray-500">/ 100</span>
              <span
                className={`ml-2 text-sm font-medium ${
                  moodTrend[timeRange] >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {moodTrend[timeRange] >= 0 ? '↑' : '↓'} {Math.abs(moodTrend[timeRange])}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                style={{ width: `${moodAverages[timeRange]}%` }}
              />
            </div>
          </div>

          {/* Entries count */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Entri</h3>
              <Calendar className="w-5 h-5 text-primary-500" />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                {timeRange === 'week' ? '5' : '23'}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                {timeRange === 'week' ? 'dalam seminggu' : 'dalam sebulan'}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {timeRange === 'week'
                ? 'Rata-rata 1.2 entri/hari'
                : 'Rata-rata 5.7 entri/minggu'}
            </div>
          </div>
        </div>

        {/* Common themes */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Tema Umum</h2>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Lihat semua
            </button>
          </div>

          <div className="space-y-3">
            {commonThemes.map((theme, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{theme.name}</span>
                  <span className="text-gray-500">{theme.count} entri</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                    style={{ width: `${theme.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent entries */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Entri Terbaru</h2>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Lihat semua
            </button>
          </div>

          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{entry.date}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{entry.time}</span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${entry.moodColor}`}
                  >
                    {entry.mood}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{entry.preview}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}