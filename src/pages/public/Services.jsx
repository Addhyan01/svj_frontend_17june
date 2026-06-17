import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Services() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);

  // Dynamic Content Objects based on your backend schemas
  const servicesList = [
    {
      id: 'pad-subscription',
      title: 'Sanitary Pad Distribution Scheme',
      tagline: 'Rural Women Health & Hygiene Protection',
      type: 'SUBSCRIPTION',
      price: '₹300 / Year',
      benefits: [
        'Saal bhar mein kul 12 packs sanitary pads ka secure quota.',
        'Ground Associates dwara har mahine doorstep access delivery.',
        'Health awareness camps aur proper hygiene counseling guidance.',
        'Virtual subscription identity tracking layout block.'
      ],
      detailedDesc: 'Yeh scheme graameen kshetron ki mahilaon aur betiyon ko dhyan mein rakh kar design ki gayi hai. Isme saal bhar ka subscription fee sirf ₹300 hai, taaki har ek parivar ise easily afford kar sake. Hamare Field Associates har mahine block-wise scheduled tracking ke mutabik members tak pads safely pahunchate hain.'
    },
    {
      id: 'tree-plantation',
      title: 'Tree Plantation & Farmers Support',
      tagline: 'Environment Protection & Multi-Slab Discount Pricing',
      type: 'ON_DEMAND',
      price: 'Slab-Based Pricing Matrix',
      benefits: [
        'Pehla kisaan/member tree allocation cost = ₹625.',
        'Uske baad us saal mein har ek extra tree sirf ₹300 each.',
        'High-quality, fruit-bearing ya commercial timber plants distribution.',
        'Field monitoring aur initial development stage growth checks.'
      ],
      detailedDesc: 'Hamara Tree Allocation system multi-slab pricing framework par chalta hai. Pehle tree ki booking cost ₹625 hoti hai jisme logistics aur initial setup managed hota hai. Kisaan apni aamdani badhane ke liye jitne chahein extra trees order kar sakte hain, jahan har extra tree par flat discount milta hai aur wo sirf ₹300 per tree ke rate par milti hai.'
    }
  ];

  // Secure Membership Join Action Trigger
  const handleJoinMembership = (serviceId) => {
    // Frontend guardrail security token crosscheck
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Membership lene ke liye kripya pehle apna Account Login ya Register karein!');
      navigate('/login'); // We will create this path in next milestone
    } else {
      // If user logged in, redirect to order processing window
      navigate(`/dashboard/order-service/${serviceId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header Grid */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">NGO Active Operational Services</h2>
        <p className="text-gray-500 text-sm sm:text-base font-medium">
          Graameen kshetron ka vikas aur swasthya suraksha hamari priority hai. Niche di gayi schemes ka direct labh uthayein.
        </p>
      </div>

      {/* ─── GRID PANEL (Mobile=1, Tablet/Laptop=2) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {servicesList.map((service) => (
          <div 
            key={service.id} 
            className="bg-white border border-gray-100 rounded-3xl shadow-md p-6 sm:p-8 flex flex-col justify-between space-y-6 transform hover:scale-[1.01] transition duration-200"
          >
            <div className="space-y-4">
              {/* Type Badge Row */}
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-md tracking-wider border ${
                  service.type === 'SUBSCRIPTION'
                    ? 'bg-purple-50 border-purple-100 text-purple-700'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}>
                  {service.type}
                </span>
                <p className="text-lg font-black text-gray-900">{service.price}</p>
              </div>

              {/* Title Header */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight">{service.title}</h3>
                <p className="text-xs font-bold text-gray-400 mt-0.5">{service.tagline}</p>
              </div>

              {/* Quick Benefits Bullet points list */}
              <ul className="space-y-2 pt-2">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600 font-medium gap-2">
                    <svg className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Dynamic Toggles Row */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setSelectedService(selectedService?.id === service.id ? null : service)}
                className="w-full sm:w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl text-sm transition cursor-pointer text-center"
              >
                {selectedService?.id === service.id ? 'Hide Details' : 'Full Logic Description'}
              </button>
              <button
                onClick={() => handleJoinMembership(service.id)}
                className="w-full sm:w-1/2 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition transform hover:-translate-y-0.5 cursor-pointer text-center"
                style={{ backgroundColor: '#3A7D44' }}
              >
                Apply Membership
              </button>
            </div>

            {/* Expanded Content Block (Smooth dynamic slide drawer) */}
            {selectedService?.id === service.id && (
              <div className="bg-gray-50 border border-gray-200/60 p-4 rounded-2xl text-xs sm:text-sm text-gray-600 font-medium leading-relaxed animate-fadeIn mt-2">
                <p className="font-bold text-gray-900 mb-1">Detailed Workflow Overview:</p>
                {service.detailedDesc}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}