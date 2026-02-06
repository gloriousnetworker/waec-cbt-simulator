export default function OfflinePage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">You're Offline</h1>
            <p className="text-gray-600 mb-6">
              The WAEC CBT Simulator needs internet connection to load new content.
              Your previously loaded exams are still accessible.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Available Offline</h2>
            <ul className="text-left text-gray-600 space-y-2">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Practice exams you've already loaded
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Timer functionality
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Answer review
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                App interface
              </li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 bg-[#039994] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#028a85] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }