'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCodeGenerator from '@/components/QRCode/QRCodeGenerator';
import { getAvailableYears } from '@/data/sampleArtwork';
import { subscribeToAllComments, deleteComment } from '@/services/firebaseComments';
import { Comment } from '@/types/comment';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'qr-codes' | 'analytics' | 'moderation'>('qr-codes');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    total: number;
    approved: number;
    pending: number;
    byYear: Record<number, number>;
    byType: Record<string, number>;
    byDevice: Record<string, number>;
    byLanguage: Record<string, number>;
    todayComments: number;
    weeklyGrowth: number;
  } | null>(null);
  const availableYears = getAvailableYears();

  // Simple authentication - in production, use proper auth service
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem('admin_authenticated', 'true');
    } else {
      setAuthError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    localStorage.removeItem('admin_authenticated');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
      } catch (error) {
        console.error('Failed to delete comment:', error);
        alert('Failed to delete comment. Please try again.');
      }
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const authenticated = localStorage.getItem('admin_authenticated') === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  // Subscribe to comments
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      const unsubscribe = subscribeToAllComments((allComments) => {
        setComments(allComments);
        setLoading(false);
        
        // Update analytics when comments change
        updateAnalytics(allComments);
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Update analytics based on comments
  const updateAnalytics = (allComments: Comment[]) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    const todayComments = allComments.filter(c => c.timestamp > oneDayAgo).length;
    const thisWeekComments = allComments.filter(c => c.timestamp > oneWeekAgo).length;
    const lastWeekComments = allComments.filter(c => 
      c.timestamp > (oneWeekAgo - 7 * 24 * 60 * 60 * 1000) && c.timestamp <= oneWeekAgo
    ).length;
    
    const weeklyGrowth = lastWeekComments > 0 
      ? ((thisWeekComments - lastWeekComments) / lastWeekComments) * 100 
      : thisWeekComments > 0 ? 100 : 0;
    
    // Group by device
    const byDevice: Record<string, number> = {};
    allComments.forEach(comment => {
      const device = comment.metadata?.device || 'unknown';
      byDevice[device] = (byDevice[device] || 0) + 1;
    });
    
    // Group by language
    const byLanguage: Record<string, number> = {};
    allComments.forEach(comment => {
      const language = comment.language || 'en';
      byLanguage[language] = (byLanguage[language] || 0) + 1;
    });
    
    // Group by year
    const byYear: Record<number, number> = {};
    allComments.forEach(comment => {
      byYear[comment.year] = (byYear[comment.year] || 0) + 1;
    });
    
    // Group by type
    const byType: Record<string, number> = {};
    allComments.forEach(comment => {
      byType[comment.type] = (byType[comment.type] || 0) + 1;
    });
    
    setAnalytics({
      total: allComments.length,
      approved: allComments.filter(c => c.approved).length,
      pending: allComments.filter(c => !c.approved).length,
      byYear,
      byType,
      byDevice,
      byLanguage,
      todayComments,
      weeklyGrowth: Math.round(weeklyGrowth)
    });
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Sign in to access the admin panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            {authError && (
              <div className="text-red-600 text-sm">{authError}</div>
            )}
            
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </form>
          
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                A Digital Moving Mountain - Admin
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
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
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
                QR Code Management
              </h2>
              <p className="text-gray-600">
                Generate and manage QR codes for gallery installations, mobile access, and sharing artwork panels.
              </p>
            </div>

            {/* QR Code Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                <h4 className="text-sm font-medium text-gray-500">Total QR Codes</h4>
                <p className="text-xl font-bold text-blue-600 mt-1">{availableYears.length}</p>
                <p className="text-sm text-gray-500 mt-1">Active artwork panels</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                <h4 className="text-sm font-medium text-gray-500">Gallery Mode</h4>
                <p className="text-xl font-bold text-green-600 mt-1">Ready</p>
                <p className="text-sm text-gray-500 mt-1">High-resolution codes</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
                <h4 className="text-sm font-medium text-gray-500">Print Ready</h4>
                <p className="text-xl font-bold text-purple-600 mt-1">Available</p>
                <p className="text-sm text-gray-500 mt-1">PDF download ready</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                  Generate All Mobile QR Codes
                </button>
                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                  Download Gallery Pack
                </button>
                <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                  Create Print Sheet
                </button>
                <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors">
                  Generate Share Links
                </button>
              </div>
            </div>
            
            <QRCodeGenerator
              years={availableYears}
              mode="mobile"
              className="bg-white p-6 rounded-lg shadow-md"
            />

            {/* QR Code Usage Guide */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Gallery Installation</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use high-resolution QR codes (512px minimum)</li>
                    <li>• Place codes at eye level (48-60 inches)</li>
                    <li>• Ensure good lighting without glare</li>
                    <li>• Include brief instructions for visitors</li>
                    <li>• Test scanning from 2-3 feet distance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mobile Sharing</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Standard resolution (256px) works well</li>
                    <li>• Include year information in QR code</li>
                    <li>• Direct link to specific artwork panel</li>
                    <li>• Optimized for mobile viewing experience</li>
                    <li>• Trackable for engagement analytics</li>
                  </ul>
                </div>
              </div>
            </div>
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
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {analytics?.total.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.weeklyGrowth !== undefined 
                    ? `${analytics.weeklyGrowth >= 0 ? '+' : ''}${analytics.weeklyGrowth}% from last week`
                    : 'Loading...'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Today&apos;s Comments</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {analytics?.todayComments || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">New comments today</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Languages</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {analytics ? Object.keys(analytics.byLanguage).length : 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Different languages</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Approval Rate</h3>
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  {analytics ? Math.round((analytics.approved / Math.max(analytics.total, 1)) * 100) : 0}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics?.pending || 0} pending approval
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Comments by Year Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments by Year</h3>
                <div className="space-y-4">
                  {availableYears.map((year) => {
                    const count = analytics?.byYear[year] || 0;
                    const maxCount = Math.max(...Object.values(analytics?.byYear || {}), 1);
                    const percentage = (count / maxCount) * 100;
                    return (
                      <div key={year} className="flex items-center">
                        <span className="w-12 text-sm text-gray-600">{year}</span>
                        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-16 text-right">
                          {count} comment{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Device Usage Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
                <div className="space-y-4">
                  {analytics && Object.entries(analytics.byDevice)
                    .sort(([,a], [,b]) => b - a)
                    .map(([device, count]) => {
                      const percentage = (count / analytics.total) * 100;
                      const colors = {
                        mobile: 'bg-green-600',
                        desktop: 'bg-blue-600',
                        tablet: 'bg-purple-600',
                        unknown: 'bg-gray-600'
                      };
                      return (
                        <div key={device} className="flex items-center">
                          <span className="w-16 text-sm text-gray-600 capitalize">{device}</span>
                          <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${colors[device as keyof typeof colors] || colors.unknown}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-16 text-right">
                            {Math.round(percentage)}% ({count})
                          </span>
                        </div>
                      );
                    })
                  }
                  {!analytics && (
                    <div className="text-center text-gray-500 py-4">Loading device data...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Language Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {analytics && Object.entries(analytics.byLanguage)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 8)
                  .map(([language, count]) => {
                    const percentage = (count / analytics.total) * 100;
                    const languageNames: Record<string, string> = {
                      en: 'English',
                      es: 'Español',
                      fr: 'Français',
                      de: 'Deutsch',
                      it: 'Italiano',
                      pt: 'Português',
                      zh: '中文',
                      ja: '日本語',
                      ko: '한국어',
                      ar: 'العربية',
                      hi: 'हिन्दी'
                    };
                    return (
                      <div key={language} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{count}</div>
                        <div className="text-sm text-gray-600">
                          {languageNames[language] || language.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(percentage)}%
                        </div>
                      </div>
                    );
                  })
                }
                {!analytics && (
                  <div className="col-span-full text-center text-gray-500 py-4">Loading language data...</div>
                )}
              </div>
            </div>

            {/* Comment Types */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comment Types</h3>
              <div className="flex gap-8 justify-center">
                {analytics && Object.entries(analytics.byType).map(([type, count]) => {
                  const percentage = (count / analytics.total) * 100;
                  return (
                    <div key={type} className="text-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                        type === 'text' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        {count}
                      </div>
                      <div className="mt-2 text-sm font-medium text-gray-900 capitalize">
                        {type} Comments
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  );
                })}
                {!analytics && (
                  <div className="text-center text-gray-500 py-4">Loading comment type data...</div>
                )}
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
                  <h3 className="text-lg font-medium text-gray-900">All Comments</h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {comments.length} Total
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {comments.filter(c => c.approved).length} Approved
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {comments.filter(c => !c.approved).length} Pending
                    </span>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No comments found.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.userId || 'Anonymous'}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">Year {comment.year}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              comment.type === 'text' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {comment.type}
                            </span>
                          </div>
                          {comment.text && (
                            <p className="text-gray-700 mb-2">{comment.text}</p>
                          )}
                          {comment.imageData && (
                            <div className="mb-2">
                              <Image 
                                src={comment.imageData} 
                                alt="User drawing" 
                                width={200}
                                height={128}
                                className="max-w-xs max-h-32 border rounded object-contain"
                              />
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            Device: {comment.metadata?.device} • 
                            Input: {comment.metadata?.inputMethod}
                            {comment.language && ` • Language: ${comment.language}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            comment.approved
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {comment.approved ? 'approved' : 'pending'}
                          </span>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}