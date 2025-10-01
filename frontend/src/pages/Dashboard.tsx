import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, LoadingSpinner } from '@/components/common';
import { useDocumentTitle } from '@/hooks';

const Dashboard: React.FC = () => {
  useDocumentTitle('Dashboard - AI Calling Agent');

  // Mock data for demonstration
  const metrics = {
    totalCalls: 1248,
    activeCampaigns: 5,
    successRate: 73.2,
    totalContacts: 2834,
  };

  const recentCalls = [
    {
      id: '1',
      contact: 'John Smith',
      phone: '+1 (555) 123-4567',
      status: 'completed',
      duration: '00:02:34',
      time: '2 minutes ago'
    },
    {
      id: '2',
      contact: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      status: 'in_progress',
      duration: '00:00:45',
      time: 'Just now'
    },
    {
      id: '3',
      contact: 'Mike Davis',
      phone: '+1 (555) 345-6789',
      status: 'failed',
      duration: '00:00:12',
      time: '5 minutes ago'
    },
    {
      id: '4',
      contact: 'Emily Wilson',
      phone: '+1 (555) 456-7890',
      status: 'completed',
      duration: '00:01:23',
      time: '8 minutes ago'
    },
    {
      id: '5',
      contact: 'David Brown',
      phone: '+1 (555) 567-8901',
      status: 'no_answer',
      duration: '00:00:30',
      time: '15 minutes ago'
    },
  ];

  const activeCampaigns = [
    {
      id: '1',
      name: 'Summer Sale Outreach',
      status: 'running',
      progress: 65,
      totalContacts: 500,
      completed: 325,
      successRate: 78.2,
      estimatedCompletion: '2 hours'
    },
    {
      id: '2',
      name: 'Customer Follow-up',
      status: 'paused',
      progress: 42,
      totalContacts: 200,
      completed: 84,
      successRate: 65.5,
      estimatedCompletion: 'Paused'
    },
    {
      id: '3',
      name: 'Lead Qualification',
      status: 'running',
      progress: 23,
      totalContacts: 150,
      completed: 35,
      successRate: 82.1,
      estimatedCompletion: '4 hours'
    },
  ];

  const systemStatus = {
    aiEngine: 'online',
    voiceService: 'online',
    database: 'online',
    webhooks: 'degraded'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="h-2 w-2 bg-green-500 rounded-full" />;
      case 'in_progress':
        return <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'failed':
        return <div className="h-2 w-2 bg-red-500 rounded-full" />;
      case 'no_answer':
        return <div className="h-2 w-2 bg-yellow-500 rounded-full" />;
      default:
        return <div className="h-2 w-2 bg-gray-500 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'offline':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your AI calling campaigns.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="success" size="sm">
            System Online
          </Badge>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Calls
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {metrics.totalCalls.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                +12.3%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                from last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Campaigns
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {metrics.activeCampaigns}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                2 running
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                3 scheduled
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {metrics.successRate}%
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                +5.2%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Contacts
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {metrics.totalContacts.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                +23 today
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                new additions
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Calls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Calls</CardTitle>
              <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(call.status)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {call.contact}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {call.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {call.duration}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {call.time}
                      </p>
                    </div>
                    <Badge
                      variant={
                        call.status === 'completed' ? 'success' :
                        call.status === 'in_progress' ? 'info' :
                        call.status === 'failed' ? 'error' : 'warning'
                      }
                      size="sm"
                    >
                      {call.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Campaigns</CardTitle>
              <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                Manage All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {campaign.name}
                    </h4>
                    <Badge
                      variant={campaign.status === 'running' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {campaign.completed} / {campaign.totalContacts}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{campaign.progress}% complete</span>
                      <span>{campaign.totalContacts - campaign.completed} remaining</span>
                    </div>

                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {campaign.successRate}%
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">ETA</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {campaign.estimatedCompletion}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="font-medium text-gray-900 dark:text-white">AI Engine</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(systemStatus.aiEngine)}`}>
                  {systemStatus.aiEngine.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="font-medium text-gray-900 dark:text-white">Voice Service</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(systemStatus.voiceService)}`}>
                  {systemStatus.voiceService.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="font-medium text-gray-900 dark:text-white">Database</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(systemStatus.database)}`}>
                  {systemStatus.database.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                  <span className="font-medium text-gray-900 dark:text-white">Webhooks</span>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(systemStatus.webhooks)}`}>
                  {systemStatus.webhooks.toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  New Campaign
                </span>
              </button>

              <button className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group">
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Import Contacts
                </span>
              </button>

              <button className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors group">
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  View Analytics
                </span>
              </button>

              <button className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Settings
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;