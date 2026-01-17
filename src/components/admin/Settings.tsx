import React, { useEffect, useState } from 'react';
import { Save, Mail, Globe, Bell, Shield, Database, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Kwara PHC System',
    supportEmail: 'support@kwsphcda.gov.ng',
    emailNotifications: true,
    systemNotifications: true,
    maintenanceMode: false,
    requireApproval: true,
    sessionTimeout: 60,
  });

  const [cpanelConfig, setCpanelConfig] = useState({
    host: '',
    username: '',
    domain: 'KWSPHCDA.gov.ng',
    quota: '250',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('system_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...settings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    const savedCpanel = localStorage.getItem('cpanel_config');
    if (savedCpanel) {
      try {
        const parsed = JSON.parse(savedCpanel);
        setCpanelConfig({ ...cpanelConfig, ...parsed });
      } catch (error) {
        console.error('Error loading cPanel config:', error);
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      localStorage.setItem('system_settings', JSON.stringify(settings));
      localStorage.setItem('cpanel_config', JSON.stringify(cpanelConfig));

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleCpanelChange = (key: string, value: string) => {
    setCpanelConfig(prev => ({ ...prev, [key]: value }));
  };

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Manage system configuration and preferences</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving || !isSuperAdmin}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isSuperAdmin
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {!isSuperAdmin && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Note:</span> Only Super Administrators can modify system settings.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                disabled={!isSuperAdmin}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                disabled={!isSuperAdmin}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                disabled={!isSuperAdmin}
                min="15"
                max="240"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
                <p className="text-xs text-gray-500">Receive email alerts for important events</p>
              </div>
              <button
                onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                disabled={!isSuperAdmin}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-green-600' : 'bg-gray-200'
                } ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  System Notifications
                </label>
                <p className="text-xs text-gray-500">Display in-app notifications</p>
              </div>
              <button
                onClick={() => handleSettingChange('systemNotifications', !settings.systemNotifications)}
                disabled={!isSuperAdmin}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.systemNotifications ? 'bg-green-600' : 'bg-gray-200'
                } ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.systemNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Require Admin Approval
                </label>
                <p className="text-xs text-gray-500">New users need approval before access</p>
              </div>
              <button
                onClick={() => handleSettingChange('requireApproval', !settings.requireApproval)}
                disabled={!isSuperAdmin}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.requireApproval ? 'bg-green-600' : 'bg-gray-200'
                } ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Maintenance Mode
                </label>
                <p className="text-xs text-gray-500">Restrict access during maintenance</p>
              </div>
              <button
                onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                disabled={!isSuperAdmin}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
                } ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">cPanel Email Configuration</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                cPanel Host
              </label>
              <input
                type="text"
                value={cpanelConfig.host}
                onChange={(e) => handleCpanelChange('host', e.target.value)}
                disabled={!isSuperAdmin}
                placeholder="mail.KWSPHCDA.gov.ng"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                cPanel Username
              </label>
              <input
                type="text"
                value={cpanelConfig.username}
                onChange={(e) => handleCpanelChange('username', e.target.value)}
                disabled={!isSuperAdmin}
                placeholder="admin"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain
              </label>
              <input
                type="text"
                value={cpanelConfig.domain}
                onChange={(e) => handleCpanelChange('domain', e.target.value)}
                disabled={!isSuperAdmin}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Quota (MB)
              </label>
              <input
                type="text"
                value={cpanelConfig.quota}
                onChange={(e) => handleCpanelChange('quota', e.target.value)}
                disabled={!isSuperAdmin}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Database Status</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <p className="text-lg font-semibold text-gray-900">Connected</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">System Version</p>
            <p className="text-lg font-semibold text-gray-900">v1.0.0</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900">Jan 10, 2026</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Note:</span> Changes to system settings are saved locally. Contact system administrator for database-level configuration changes.
        </p>
      </div>
    </div>
  );
};

export default Settings;
