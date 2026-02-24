'use client';

import { useState } from 'react';
import { Calendar, Download, Upload, RefreshCw, ExternalLink } from 'lucide-react';

export default function HolidayCalendarSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleExportICS = async () => {
    // Export to iCal format
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/calendar/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `holidays-${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncGoogle = async () => {
    // Sync with Google Calendar
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/calendar/sync-google', {
        method: 'POST',
      });
      if (response.ok) {
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncOutlook = async () => {
    // Sync with Outlook Calendar
    setSyncing(true);
    try {
      const response = await fetch('/api/admin/calendar/sync-outlook', {
        method: 'POST',
      });
      if (response.ok) {
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Calendar Sync
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Export and sync employee leaves
            </p>
          </div>
        </div>
        {lastSync && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last sync: {lastSync.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Export to iCal */}
        <button
          onClick={handleExportICS}
          disabled={syncing}
          className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                Export to iCal
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Download .ics file for any calendar app
              </div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
        </button>

        {/* Sync with Google Calendar */}
        <button
          onClick={handleSyncGoogle}
          disabled={syncing}
          className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${syncing ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                Sync with Google Calendar
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Two-way sync with Google Workspace
              </div>
            </div>
          </div>
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-red-500 rounded" />
        </button>

        {/* Sync with Outlook */}
        <button
          onClick={handleSyncOutlook}
          disabled={syncing}
          className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-600 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${syncing ? 'animate-spin' : ''}`} />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                Sync with Outlook Calendar
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Connect with Microsoft 365
              </div>
            </div>
          </div>
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
            O
          </div>
        </button>

        {/* Upload holidays */}
        <label className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 transition-colors group cursor-pointer">
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                Import Public Holidays
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Upload CSV or iCal file
              </div>
            </div>
          </div>
          <input
            type="file"
            accept=".ics,.csv"
            className="hidden"
            onChange={(e) => {
              // Handle file upload
              console.log('File selected:', e.target.files?.[0]);
            }}
          />
        </label>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Tip:</strong> Calendar sync updates automatically every 6 hours. 
          You can also manually trigger sync anytime.
        </p>
      </div>
    </div>
  );
}
