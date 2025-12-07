import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, FileText, PlusCircle, User, Shield, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => handleNavigation('home')}
            className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            <FileText className="w-6 h-6" />
            <span>Vocea Pacienților</span>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigation('home')}
              className={`text-gray-700 hover:text-blue-600 transition-colors ${
                currentPage === 'home' ? 'font-semibold text-blue-600' : ''
              }`}
            >
              Postări
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleNavigation('create-post')}
                  className={`flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors ${
                    currentPage === 'create-post' ? 'font-semibold text-blue-600' : ''
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Creare postare
                </button>

                {profile?.is_admin && (
                  <button
                    onClick={() => handleNavigation('admin')}
                    className={`flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors ${
                      currentPage === 'admin' ? 'font-semibold text-blue-600' : ''
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                )}

                <button
                  onClick={() => handleNavigation('profile')}
                  className={`flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors ${
                    currentPage === 'profile' ? 'font-semibold text-blue-600' : ''
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profil
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Ieșire
                </button>
              </>
            )}

            {!user && (
              <button
                onClick={() => handleNavigation('auth')}
                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Autentificare
              </button>
            )}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleNavigation('home')}
                className={`text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md ${
                  currentPage === 'home' ? 'font-semibold text-blue-600 bg-blue-50' : ''
                }`}
              >
                Postări
              </button>

              {user && (
                <>
                  <button
                    onClick={() => handleNavigation('create-post')}
                    className={`text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2 ${
                      currentPage === 'create-post' ? 'font-semibold text-blue-600 bg-blue-50' : ''
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Creare postare
                  </button>

                  {profile?.is_admin && (
                    <button
                      onClick={() => handleNavigation('admin')}
                      className={`text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2 ${
                        currentPage === 'admin' ? 'font-semibold text-blue-600 bg-blue-50' : ''
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </button>
                  )}

                  <button
                    onClick={() => handleNavigation('profile')}
                    className={`text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2 ${
                      currentPage === 'profile' ? 'font-semibold text-blue-600 bg-blue-50' : ''
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Profil
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Ieșire
                  </button>
                </>
              )}

              {!user && (
                <button
                  onClick={() => handleNavigation('auth')}
                  className="text-left px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Autentificare
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
