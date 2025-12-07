import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User } from 'lucide-react';

export function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [county, setCounty] = useState('');
  const [showRealName, setShowRealName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCounty(profile.county || '');
      setShowRealName(profile.show_real_name);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName || null,
          county: county || null,
          show_real_name: showRealName,
        })
        .eq('id', profile!.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSuccess('Profil actualizat cu succes!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la actualizare');
    } finally {
      setLoading(false);
    }
  };

  const romanianCounties = [
    'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
    'Brașov', 'Brăila', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța',
    'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita',
    'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș',
    'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava',
    'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea', 'București'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Profilul meu</h1>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Nume complet (opțional)
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Numele tău"
              />
              <p className="mt-1 text-sm text-gray-500">
                Acest nume va fi afișat la postări dacă alegi să nu fii anonim
              </p>
            </div>

            <div>
              <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-1">
                Județ (opțional)
              </label>
              <select
                id="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selectează județul</option>
                {romanianCounties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Preferințe de confidențialitate</h3>
              <div className="flex items-start">
                <input
                  id="showRealName"
                  type="checkbox"
                  checked={showRealName}
                  onChange={(e) => setShowRealName(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showRealName" className="ml-3 block">
                  <span className="text-sm font-medium text-gray-700">
                    Afișează numele meu real la postări
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Dacă această opțiune este activată, numele tău va fi afișat implicit la postări.
                    Poți totuși alege să publici anonim la fiecare postare individual.
                  </p>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Se salvează...' : 'Salvează modificările'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
