import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CityGrid } from './components/CityGrid';
import { SearchBar } from './components/SearchBar';
import { SortControl, type SortOption } from './components/SortControl';
import { Footer } from './components/Footer';
import { useWeather } from './services/weatherService';
import type { CityWeather } from './types/weather';
import { Loader2, AlertCircle } from 'lucide-react';

function App() {
  const { data, isLoading, error, isRefetching } = useWeather();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('city');

  const filteredAndSortedCities = useMemo(() => {
    if (!data) return [];

    let result = data.cities.filter((city: CityWeather) => 
      city.city.toLowerCase().includes(search.toLowerCase()) ||
      city.country.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a: CityWeather, b: CityWeather) => {
      switch (sortBy) {
        case 'temp':
          return b.wcTemperature - a.wcTemperature;
        case 'country':
          return a.country.localeCompare(b.country);
        case 'city':
          return a.city.localeCompare(b.city);
        case 'variance':
          return Math.abs(b.variance) - Math.abs(a.variance);
        default:
          return 0;
      }
    });

    return result;
  }, [data, search, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dash-bg flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-dash-accent animate-spin" />
        <p className="text-dash-muted font-bold tracking-widest uppercase text-xs">Initializing Satellite Link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dash-bg flex flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-dash-error" />
        <h2 className="text-xl font-bold text-dash-text">Connection Terminated</h2>
        <p className="text-dash-muted max-w-md">
          Unable to establish connection with global weather models. Please check your network configuration and try again.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-dash-accent hover:bg-dash-accent/80 text-white font-bold rounded-lg transition-colors"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dash-bg flex flex-col">
      <Header 
        wcOnline={data?.status.wcOnline ?? false} 
        ecmwfOnline={data?.status.ecmwfOnline ?? false}
        lastUpdated={data?.status.lastUpdated ?? ''}
      />
      
      <main className="flex-1 flex flex-col">
        {/* Controls Section */}
        <div className="bg-dash-card/30 border-b border-dash-border py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SearchBar value={search} onChange={setSearch} />
            <div className="flex items-center gap-4">
              {isRefetching && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-dash-accent uppercase animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Updating...
                </div>
              )}
              <SortControl value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="max-w-7xl mx-auto w-full px-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-dash-muted uppercase tracking-widest">
              Showing {filteredAndSortedCities.length} Global Stations
            </h2>
          </div>
        </div>

        {/* Grid Section */}
        {filteredAndSortedCities.length > 0 ? (
          <CityGrid 
            cities={filteredAndSortedCities} 
            wcOnline={data?.status.wcOnline ?? true} 
            ecmwfOnline={data?.status.ecmwfOnline ?? true} 
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="bg-dash-card p-8 rounded-2xl border border-dash-border">
              <p className="text-dash-muted font-medium">No weather stations match your search criteria.</p>
            </div>
          </div>
        )}
      </main>

      <Footer lastUpdated={data?.status.lastUpdated ?? ''} />
    </div>
  );
}

export default App;
