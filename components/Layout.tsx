// components/Header.tsx
'use client';

import React from 'react';
import { FaMicrophoneAlt } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 py-3 bg-[#101828] border-b border-gray-700 shadow-md text-white">
      <div className="flex items-center gap-4">
        <FaMicrophoneAlt className="text-blue-400 text-xl" />
        <h1 className="text-xl font-bold">Veena</h1>
        <span className="text-sm px-2 py-1 rounded-full bg-blue-800 text-blue-200">Voice-First AI</span>
        <span className="text-sm px-2 py-1 rounded-full bg-purple-800 text-purple-200">Always Listening</span>
      </div>

      <select className="bg-gray-900 border border-gray-700 text-white rounded px-3 py-1">
        <option>English</option>
        <option>Hindi</option>
        <option>Marathi</option>
      </select>
    </header>
  );
}
