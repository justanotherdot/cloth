import HomePage from './home-page';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Cloth</h1>
            </div>
          </div>
        </div>
      </header>

      <main>
        <HomePage />
      </main>
    </div>
  );
}

export default App;
