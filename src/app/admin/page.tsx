'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AlertTriangle, Users, Clock, CheckCircle, XCircle, MoreHorizontal, Download, QrCode, BarChart3, Shield, LogOut, Search, Filter, RefreshCw, Trash2, Eye, Settings } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

import QRCodeGenerator from '@/components/QRCode/QRCodeGenerator';
import { getAvailableYears } from '@/data/sampleArtwork';
import { subscribeToAllComments, deleteComment, updateCommentApproval, bulkUpdateComments, searchComments, exportComments } from '@/services/firebaseComments';
import { Comment } from '@/types/comment';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'moderation' | 'qr'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
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
  const [qrGenerating, setQrGenerating] = useState(false);
  const availableYears = getAvailableYears();
  
  // Export functionality
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setError(null);
      const data = await exportComments(format);
      
      // Create and download file
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `comments-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data. Please try again.');
    }
  };

  // Simple authentication - in production, use proper auth service
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
    try {
      setError(null);
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleApproveComment = async (commentId: string, approved: boolean) => {
    try {
      setError(null);
      await updateCommentApproval(commentId, approved);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, approved } : c));
    } catch (error) {
      console.error('Failed to update comment approval:', error);
      setError('Failed to update comment. Please try again.');
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedComments.length === 0) return;
    
    setBulkLoading(true);
    setError(null);
    
    try {
      const results = await bulkUpdateComments(selectedComments, action);
      
      if (results.failed.length > 0) {
        setError(`${action} completed with ${results.failed.length} failures out of ${selectedComments.length} items`);
      }
      
      // Update local state for successful operations
      if (action === 'delete') {
        setComments(prev => prev.filter(c => !results.success.includes(c.id)));
      } else {
        setComments(prev => prev.map(c => 
          results.success.includes(c.id) 
            ? { ...c, approved: action === 'approve' }
            : c
        ));
      }
      
      setSelectedComments([]);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
      setError(`Failed to ${action} selected comments. Please try again.`);
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.text?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         comment.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'approved' && comment.approved) || 
                         (filterStatus === 'pending' && !comment.approved);
    return matchesSearch && matchesFilter;
  });

  const urgentComments = comments.filter(c => !c.approved).length;
  const todayComments = comments.filter(c => {
    const today = new Date();
    const commentDate = new Date(c.timestamp);
    return commentDate.toDateString() === today.toDateString();
  }).length;

  // Check authentication on mount
  useEffect(() => {
    const authenticated = localStorage.getItem('admin_authenticated') === 'true';
    setIsAuthenticated(authenticated);
  }, []);

  // Debounced search functionality
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const debounceTimeout = setTimeout(async () => {
      if (searchTerm || filterStatus !== 'all') {
        setSearchLoading(true);
        try {
          const results = await searchComments({
            searchTerm: searchTerm || undefined,
            status: filterStatus,
            limit: 100
          });
          setComments(results);
          updateAnalytics(results);
        } catch (error) {
          console.error('Search failed:', error);
          setError('Search failed. Please try again.');
        } finally {
          setSearchLoading(false);
        }
      }
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, filterStatus, isAuthenticated]);
  
  // Subscribe to comments
  useEffect(() => {
    if (isAuthenticated && !searchTerm && filterStatus === 'all') {
      setLoading(true);
      const unsubscribe = subscribeToAllComments((allComments) => {
        setComments(allComments);
        setLoading(false);
        setError(null);
        
        // Update analytics when comments change
        updateAnalytics(allComments);
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated, searchTerm, filterStatus]);

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
      <div className="light min-h-screen bg-white text-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-gray-200">
          <CardHeader className="text-center bg-white">
            <CardTitle className="text-2xl text-black">Admin Login</CardTitle>
            <CardDescription className="text-gray-600">Sign in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-black">
                  Username
                </label>
                <Input
                  className="bg-white border-gray-300 text-black"
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-black">
                  Password
                </label>
                <Input
                  className="bg-white border-gray-300 text-black"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {authError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Shield className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="light min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-black">
              <h1 className="text-2xl font-bold text-black">
                A Digital Moving Mountain - Admin
              </h1>
              <p className="text-gray-600">
                Manage your interactive art installation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
              <Button variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-50" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-black text-gray-700 hover:text-black">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-black text-gray-700 hover:text-black">
              <Shield className="h-4 w-4" />
              Moderation
              {urgentComments > 0 && (
                <Badge variant="destructive" className="ml-1 bg-red-600 text-white">
                  {urgentComments}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-black text-gray-700 hover:text-black">
              <QrCode className="h-4 w-4" />
              QR Codes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome and Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white border-gray-200">
                <CardHeader className="bg-white">
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Users className="h-5 w-5" />
                    Welcome Back, Admin
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Here&apos;s what&apos;s happening with your installation today.
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="text-2xl font-bold text-blue-600">
                    {todayComments} new comments today
                  </div>
                  <p className="text-gray-600 mt-1">
                    {analytics?.total || 0} total comments across all years
                  </p>
                </CardContent>
              </Card>

              {urgentComments > 0 && (
                <Card className="border-red-500 bg-white">
                  <CardHeader className="bg-white">
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Urgent Actions Required
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Comments pending your review
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="bg-white">
                    <div className="text-2xl font-bold text-red-600 mb-2">
                      {urgentComments} pending approval
                    </div>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                      onClick={() => setActiveTab('moderation')}
                    >
                      Review Now
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="bg-white border-gray-200">
                <CardContent className="pt-6 bg-white">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Comments</p>
                      <div className="text-2xl font-bold text-black">{analytics?.total || 0}</div>
                    </div>
                    <Users className="h-8 w-8 text-gray-400 ml-auto" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="pt-6 bg-white">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <div className="text-2xl font-bold text-green-600">{analytics?.approved || 0}</div>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600 ml-auto" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="pt-6 bg-white">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <div className="text-2xl font-bold text-orange-600">{analytics?.pending || 0}</div>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600 ml-auto" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardContent className="pt-6 bg-white">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today</p>
                      <div className="text-2xl font-bold text-blue-600">{todayComments}</div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-black">Recent Activity</CardTitle>
                <CardDescription className="text-gray-600">Latest comments from visitors</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="space-y-4">
                  {comments.slice(0, 5).map((comment) => (
                    <div key={comment.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">
                          {comment.text || 'Drawing comment'} 
                          <Badge variant="outline" className="ml-2 border-gray-300 text-gray-700">
                            Year {comment.year}
                          </Badge>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={comment.approved ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}>
                        {comment.approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Moderation Header */}
            <div className="flex flex-col gap-4 items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black">Content Moderation</h2>
                <p className="text-gray-600">
                  Review and manage user-generated comments
                </p>
              </div>
              
              {selectedComments.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedComments.length} selected
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-50" disabled={bulkLoading}>
                        {bulkLoading ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="mr-2 h-4 w-4" />
                        )}
                        Bulk Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border-gray-200">
                      <DropdownMenuItem className="text-black hover:bg-gray-100" onClick={() => handleBulkAction('approve')}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-black hover:bg-gray-100" onClick={() => handleBulkAction('reject')}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleBulkAction('delete')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Filters and Search */}
            <Card className="bg-white border-gray-200">
              <CardContent className="pt-6 bg-white">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      {searchLoading ? (
                        <RefreshCw className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                      ) : (
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      )}
                      <Input
                        placeholder="Search comments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-gray-300 text-black h-12 text-base"
                        disabled={searchLoading}
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={(value: 'all' | 'approved' | 'pending') => setFilterStatus(value)}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300 text-black h-12 text-base">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem className="text-black hover:bg-gray-100" value="all">All Comments</SelectItem>
                      <SelectItem className="text-black hover:bg-gray-100" value="pending">Pending Review</SelectItem>
                      <SelectItem className="text-black hover:bg-gray-100" value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Comments Table */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-black">Comments ({filteredComments.length})</CardTitle>
                  <Button variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-50" size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="bg-white">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                    <span className="ml-2 text-black">Loading comments...</span>
                  </div>
                ) : filteredComments.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    No comments found matching your criteria.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Mobile Card Layout for small screens */}
                    <div className="md:hidden space-y-4">
                      {filteredComments.map((comment) => (
                        <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Checkbox
                              checked={selectedComments.includes(comment.id)}
                              onCheckedChange={(checked) => {
                                setSelectedComments(prev => 
                                  checked 
                                    ? [...prev, comment.id]
                                    : prev.filter(id => id !== comment.id)
                                );
                              }}
                              aria-label={`Select comment ${comment.id}`}
                            />
                            <div className="flex gap-2">
                              <Badge variant="outline" className="border-gray-300 text-gray-700 text-xs">{comment.year}</Badge>
                              <Badge className={comment.approved ? 'bg-green-600 text-white text-xs' : 'bg-gray-500 text-white text-xs'}>
                                {comment.approved ? 'Approved' : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {comment.text && (
                              <p className="text-base text-black leading-relaxed">{comment.text}</p>
                            )}
                            {comment.imageData && (
                              <div className="flex items-center gap-3">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <div 
                                      className="border-2 rounded p-1 cursor-pointer hover:opacity-80 transition-opacity"
                                      style={{ borderColor: comment.color || '#000000' }}
                                    >
                                      <Image 
                                        src={comment.imageData} 
                                        alt="Drawing thumbnail" 
                                        width={60}
                                        height={60}
                                        className="rounded object-cover"
                                        unoptimized={true}
                                      />
                                    </div>
                                  </DialogTrigger>
                                  <DialogContent className="bg-white border-gray-200 max-w-[90vw] max-h-[80vh]">
                                    <DialogHeader className="bg-white">
                                      <DialogTitle className="text-black text-lg">Drawing - Year {comment.year}</DialogTitle>
                                      <DialogDescription className="text-gray-600">
                                        {new Date(comment.timestamp).toLocaleString()} • Color: {comment.color || '#000000'}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-center p-4">
                                      <div 
                                        className="border-4 rounded-lg p-2"
                                        style={{ borderColor: comment.color || '#000000' }}
                                      >
                                        <Image 
                                          src={comment.imageData} 
                                          alt="Full size drawing" 
                                          width={400}
                                          height={300}
                                          className="rounded object-contain max-w-full h-auto"
                                          unoptimized={true}
                                        />
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Eye className="h-4 w-4" />
                                  Drawing
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                {comment.type}
                              </Badge>
                              {comment.color && (
                                <div 
                                  className="w-4 h-4 rounded-full border" 
                                  style={{ backgroundColor: comment.color }}
                                />
                              )}
                              <span className="text-xs">{new Date(comment.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            {!comment.approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white border-gray-300 text-black hover:bg-gray-50 h-10 px-4 text-sm"
                                onClick={() => handleApproveComment(comment.id, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            )}
                            {comment.approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white border-gray-300 text-black hover:bg-gray-50 h-10 px-4 text-sm"
                                onClick={() => handleApproveComment(comment.id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-50 h-10 px-4 text-sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white border-gray-200 max-w-[90vw] max-h-[80vh] overflow-y-auto">
                                <DialogHeader className="bg-white">
                                  <DialogTitle className="text-black text-lg">Comment Details</DialogTitle>
                                  <DialogDescription className="text-gray-600">
                                    Year {comment.year} • {new Date(comment.timestamp).toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {comment.text && (
                                    <div>
                                      <h4 className="font-medium mb-2 text-black text-base">Text Content</h4>
                                      <p className="text-base bg-gray-100 p-4 rounded text-black">{comment.text}</p>
                                    </div>
                                  )}
                                  {comment.imageData && (
                                    <div>
                                      <h4 className="font-medium mb-2 text-black text-base">Drawing</h4>
                                      <Image 
                                        src={comment.imageData} 
                                        alt="User drawing" 
                                        width={300}
                                        height={200}
                                        className="border rounded max-w-full h-auto"
                                      />
                                    </div>
                                  )}
                                  <div className="grid grid-cols-1 gap-4 text-base">
                                    <div>
                                      <span className="font-medium text-black">Status:</span>
                                      <Badge className={`ml-2 ${comment.approved ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}`}>
                                        {comment.approved ? 'Approved' : 'Pending'}
                                      </Badge>
                                    </div>
                                    <div>
                                      <span className="font-medium text-black">Type:</span>
                                      <Badge className="ml-2 border-gray-300 text-gray-700" variant="outline">{comment.type}</Badge>
                                    </div>
                                    <div>
                                      <span className="font-medium text-black">Device:</span>
                                      <span className="ml-2 text-gray-600">{comment.metadata?.device || 'Unknown'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-black">Input:</span>
                                      <span className="ml-2 text-gray-600">{comment.metadata?.inputMethod || 'Unknown'}</span>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-600 hover:text-red-700 bg-white border-gray-300 hover:bg-red-50 h-10 px-4 text-sm"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Desktop Table Layout for larger screens */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table className="bg-white">
                      <TableHeader className="bg-gray-50">
                        <TableRow className="border-gray-200">
                          <TableHead className="w-12 text-black">
                            <Checkbox
                              checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                              onCheckedChange={(checked) => {
                                setSelectedComments(
                                  checked ? filteredComments.map(c => c.id) : []
                                );
                              }}
                              aria-label="Select all comments"
                            />
                          </TableHead>
                          <TableHead className="min-w-[200px] text-black">Content</TableHead>
                          <TableHead className="min-w-[80px] text-black">Year</TableHead>
                          <TableHead className="min-w-[100px] text-black">Date</TableHead>
                          <TableHead className="min-w-[100px] text-black">Status</TableHead>
                          <TableHead className="min-w-[120px] text-black">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="bg-white">
                        {filteredComments.map((comment) => (
                          <TableRow key={comment.id} className="hover:bg-gray-50 border-gray-200">
                            <TableCell>
                              <Checkbox
                                checked={selectedComments.includes(comment.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedComments(prev => 
                                    checked 
                                      ? [...prev, comment.id]
                                      : prev.filter(id => id !== comment.id)
                                  );
                                }}
                                aria-label={`Select comment ${comment.id}`}
                              />
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="space-y-1">
                                {comment.text && (
                                  <p className="text-sm truncate text-black">{comment.text}</p>
                                )}
                                {comment.imageData && (
                                  <div className="flex items-center gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <div 
                                          className="border-2 rounded p-1 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                          style={{ borderColor: comment.color || '#000000' }}
                                        >
                                          <Image 
                                            src={comment.imageData} 
                                            alt="Drawing thumbnail" 
                                            width={48}
                                            height={48}
                                            className="rounded object-cover"
                                            unoptimized={true}
                                          />
                                        </div>
                                      </DialogTrigger>
                                      <DialogContent className="bg-white border-gray-200 max-w-2xl">
                                        <DialogHeader className="bg-white">
                                          <DialogTitle className="text-black">Drawing - Year {comment.year}</DialogTitle>
                                          <DialogDescription className="text-gray-600">
                                            {new Date(comment.timestamp).toLocaleString()} • Color: {comment.color || '#000000'}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-center p-4">
                                          <div 
                                            className="border-4 rounded-lg p-2"
                                            style={{ borderColor: comment.color || '#000000' }}
                                          >
                                            <Image 
                                              src={comment.imageData} 
                                              alt="Full size drawing" 
                                              width={500}
                                              height={400}
                                              className="rounded object-contain max-w-full h-auto"
                                              unoptimized={true}
                                            />
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Eye className="h-3 w-3" />
                                      Drawing
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                                    {comment.type}
                                  </Badge>
                                  {comment.color && (
                                    <div 
                                      className="w-3 h-3 rounded-full border" 
                                      style={{ backgroundColor: comment.color }}
                                    />
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-gray-300 text-gray-700">{comment.year}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={comment.approved ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}>
                                {comment.approved ? 'Approved' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {!comment.approved && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleApproveComment(comment.id, true)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {comment.approved && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white border-gray-300 text-black hover:bg-gray-50"
                                    onClick={() => handleApproveComment(comment.id, false)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="bg-white border-gray-300 text-black hover:bg-gray-50">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-white border-gray-200">
                                    <DialogHeader className="bg-white">
                                      <DialogTitle className="text-black">Comment Details</DialogTitle>
                                      <DialogDescription className="text-gray-600">
                                        Year {comment.year} • {new Date(comment.timestamp).toLocaleString()}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      {comment.text && (
                                        <div>
                                          <h4 className="font-medium mb-2 text-black">Text Content</h4>
                                          <p className="text-sm bg-gray-100 p-3 rounded text-black">{comment.text}</p>
                                        </div>
                                      )}
                                      {comment.imageData && (
                                        <div>
                                          <h4 className="font-medium mb-2 text-black">Drawing</h4>
                                          <Image 
                                            src={comment.imageData} 
                                            alt="User drawing" 
                                            width={300}
                                            height={200}
                                            className="border rounded"
                                          />
                                        </div>
                                      )}
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium text-black">Status:</span>
                                          <Badge className={`ml-2 ${comment.approved ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}`}>
                                            {comment.approved ? 'Approved' : 'Pending'}
                                          </Badge>
                                        </div>
                                        <div>
                                          <span className="font-medium text-black">Type:</span>
                                          <Badge className="ml-2 border-gray-300 text-gray-700" variant="outline">{comment.type}</Badge>
                                        </div>
                                        <div>
                                          <span className="font-medium text-black">Device:</span>
                                          <span className="ml-2 text-gray-600">{comment.metadata?.device || 'Unknown'}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-black">Input:</span>
                                          <span className="ml-2 text-gray-600">{comment.metadata?.inputMethod || 'Unknown'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-red-600 hover:text-red-700 bg-white border-gray-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="qr" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-black">QR Code Management</h2>
              <p className="text-gray-600">
                Generate and manage QR codes for gallery installations, mobile access, and sharing artwork panels.
              </p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <Card className="bg-white border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
                  <CardTitle className="text-sm font-medium text-black">Total QR Codes</CardTitle>
                  <QrCode className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="text-2xl font-bold text-blue-600">{availableYears.length}</div>
                  <p className="text-xs text-gray-600">Active artwork panels</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
                  <CardTitle className="text-sm font-medium text-black">Gallery Mode</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="text-2xl font-bold text-green-600">Ready</div>
                  <p className="text-xs text-gray-600">High-resolution codes</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
                  <CardTitle className="text-sm font-medium text-black">Print Ready</CardTitle>
                  <Download className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="text-2xl font-bold text-purple-600">Available</div>
                  <p className="text-xs text-gray-600">PDF download ready</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-black">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600">Generate and manage QR codes for different use cases</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap">
                  <Button 
                    disabled={qrGenerating}
                    onClick={async () => {
                      setQrGenerating(true);
                      try {
                        // Trigger QR code generation for all years
                        const event = new CustomEvent('generateAllQRCodes');
                        window.dispatchEvent(event);
                      } catch {
                        setError('Failed to generate QR codes');
                      } finally {
                        setQrGenerating(false);
                      }
                    }}
                    className="h-12 text-sm"
                  >
                    {qrGenerating ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <QrCode className="mr-2 h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Generate All Mobile QR Codes</span>
                    <span className="sm:hidden">Generate QR Codes</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-white border-gray-300 text-black hover:bg-gray-50 h-12 text-sm"
                    onClick={() => {
                      const baseURL = window.location.origin;
                      const links = availableYears.map(year => `${baseURL}/?year=${year}`).join('\n');
                      const blob = new Blob([`A Digital Moving Mountain - Share Links\n\n${links}`], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'share-links.txt';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Download Share Links</span>
                    <span className="sm:hidden">Share Links</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-white border-gray-300 text-black hover:bg-gray-50 h-12 text-sm"
                    onClick={() => {
                      const event = new CustomEvent('generatePrintableQRCodes');
                      window.dispatchEvent(event);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Create Print Sheet</span>
                    <span className="sm:hidden">Print Sheet</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-white border-gray-300 text-black hover:bg-gray-50 h-12 text-sm"
                    onClick={() => {
                      // Generate tracking URLs for analytics
                      const trackingLinks = availableYears.map(year => 
                        `${window.location.origin}/?year=${year}&utm_source=qr&utm_medium=print&utm_campaign=gallery`
                      ).join('\n');
                      const blob = new Blob([`Tracking URLs for Analytics:\n\n${trackingLinks}`], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'tracking-urls.txt';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Generate Tracking URLs</span>
                    <span className="sm:hidden">Tracking URLs</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-black">QR Code Generator</CardTitle>
                <CardDescription className="text-gray-600">Generate QR codes for each artwork year</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <QRCodeGenerator
                  years={availableYears}
                  mode="mobile"
                  className=""
                />
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle className="text-black">Usage Guidelines</CardTitle>
                <CardDescription className="text-gray-600">Best practices for QR code deployment</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium">Gallery Installation</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use high-resolution QR codes (512px minimum)</li>
                      <li>• Place codes at eye level (48-60 inches)</li>
                      <li>• Ensure good lighting without glare</li>
                      <li>• Include brief instructions for visitors</li>
                      <li>• Test scanning from 2-3 feet distance</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Mobile Sharing</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Standard resolution (256px) works well</li>
                      <li>• Include year information in QR code</li>
                      <li>• Direct link to specific artwork panel</li>
                      <li>• Optimized for mobile viewing experience</li>
                      <li>• Trackable for engagement analytics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}