'use client';

import { useState } from 'react';
import QRCodeGenerator from '@/components/QRCode/QRCodeGenerator';
import { getAvailableYears } from '@/data/sampleArtwork';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'qr-codes' | 'analytics' | 'moderation'>('qr-codes');
  const availableYears = getAvailableYears();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Footprints Across the Ocean - Admin
              </h1>
              <p className="text-gray-600">
                Manage your interactive art installation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('qr-codes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'qr-codes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              QR Codes
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'moderation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Moderation
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'qr-codes' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                QR Code Generation
              </h2>
              <p className="text-gray-600">
                Generate QR codes for gallery installation and mobile access to artwork panels.
              </p>
            </div>
            
            <QRCodeGenerator
              years={availableYears}
              mode="mobile"
              className="bg-white p-6 rounded-lg shadow-md"
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Analytics Dashboard
              </h2>
              <p className="text-gray-600">
                Monitor visitor engagement, comment activity, and system performance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Total Comments</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">1,247</p>
                <p className="text-sm text-gray-500 mt-1">+12% from last week</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Active Visitors</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">34</p>
                <p className="text-sm text-gray-500 mt-1">Currently online</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Languages</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">12</p>
                <p className="text-sm text-gray-500 mt-1">Different languages</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">QR Scans</h3>
                <p className="text-2xl font-bold text-orange-600 mt-2">892</p>
                <p className="text-sm text-gray-500 mt-1">Today</p>
              </div>
            </div>

            {/* Popular Years Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Years</h3>
              <div className="space-y-4">
                {availableYears.map((year, index) => (
                  <div key={year} className="flex items-center">
                    <span className="w-12 text-sm text-gray-600">{year}</span>
                    <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">{Math.floor(Math.random() * 200 + 50)} views</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Content Moderation
              </h2>
              <p className="text-gray-600">
                Review and manage user-generated comments on the artwork.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Comments</h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      3 Pending Review
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {/* Mock comments for demonstration */}
                {[
                  { id: 1, text: "This artwork really captures the uncertainty of that time.", user: "Anonymous", year: 2008, status: "approved", timestamp: "2 hours ago" },
                  { id: 2, text: "¡Increíble representación del mercado!", user: "Anonymous", year: 2007, status: "approved", timestamp: "4 hours ago" },
                  { id: 3, text: "Spam message here...", user: "Anonymous", year: 2009, status: "pending", timestamp: "6 hours ago" }
                ].map((comment) => (
                  <div key={comment.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">{comment.user}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{comment.year}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          comment.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {comment.status}
                        </span>
                        {comment.status === 'pending' && (
                          <div className="flex gap-1">
                            <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                              Approve
                            </button>
                            <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}