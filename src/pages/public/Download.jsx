import React from 'react';

export default function Download() {
  const documents = [
    {
      id: 1,
      title: 'NGO Registration Certificate (80G/12A)',
      category: 'Legal Documents',
      size: '2.4 MB',
      format: 'PDF',
      color: 'border-purple-100 bg-purple-50/40 text-purple-700'
    },
    {
      id: 2,
      title: 'Sanitary Pad Scheme Brochure',
      category: 'Awareness Material',
      size: '1.8 MB',
      format: 'PDF',
      color: 'border-emerald-100 bg-emerald-50/40 text-emerald-700'
    },
    {
      id: 3,
      title: 'Tree Plantation Farmer Application Form',
      category: 'Forms',
      size: '950 KB',
      format: 'PDF',
      color: 'border-emerald-100 bg-emerald-50/40 text-emerald-700'
    },
    {
      id: 4,
      title: 'Annual Impact Report (Previous Year)',
      category: 'Reports',
      size: '4.1 MB',
      format: 'PDF',
      color: 'border-purple-100 bg-purple-50/40 text-purple-700'
    }
  ];

  const handleDownload = (title) => {
    alert(`"${title}" download hona shuru ho gaya hai! (Backend storage asset link incoming)`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Resource & Download Center</h2>
        <p className="text-gray-500 text-sm sm:text-base font-medium">
          Sabka Vikas Jayti NGO ke saare zaroori certificates, forms aur awareness materials yahan se safely download karein.
        </p>
      </div>

      {/* Grid Layout (Mobile=1, Tablet/Laptop=2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition duration-150">
            <div className="space-y-1.5">
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${doc.color}`}>
                {doc.category}
              </span>
              <h4 className="text-base sm:text-lg font-black text-gray-950 leading-snug">{doc.title}</h4>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Format: <span className="text-gray-600">{doc.format}</span> • Size: <span className="text-gray-600">{doc.size}</span>
              </p>
            </div>

            <button
              onClick={() => handleDownload(doc.title)}
              className="bg-gray-50 hover:bg-gray-900 hover:text-white text-gray-700 p-3 rounded-xl border border-gray-200 transition duration-150 shrink-0 cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}