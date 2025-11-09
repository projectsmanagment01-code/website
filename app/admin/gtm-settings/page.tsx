"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Check, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GTMSettings {
  id?: string;
  gtmId?: string | null;
  ga4Id?: string | null;
  enableGTM?: boolean;
  enableGA4?: boolean;
  consentMode?: boolean;
  customHeadCode?: string | null;
  customBodyCode?: string | null;
  customFooterCode?: string | null;
}

export default function GTMSettingsPage() {
  const [settings, setSettings] = useState<GTMSettings>({
    enableGTM: false,
    enableGA4: false,
    consentMode: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/gtm-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else if (response.status === 401) {
        setMessage({ type: 'error', text: 'Please log in to access GTM settings' });
      } else if (response.status === 403) {
        setMessage({ type: 'error', text: 'Admin access required' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to load settings' });
      }
    } catch (error) {
      console.error('Error fetching GTM settings:', error);
      setMessage({ type: 'error', text: 'Failed to connect to server. Make sure you are logged in as admin.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/gtm-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving GTM settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Google Tag Manager & Analytics</h1>
        <p className="text-muted-foreground">
          Configure Google Tag Manager (GTM) and Google Analytics 4 (GA4) tracking
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {message.type === 'success' ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Google Tag Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Google Tag Manager</CardTitle>
            <CardDescription>
              Configure GTM container for centralized tag management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableGTM">Enable Google Tag Manager</Label>
                <p className="text-sm text-muted-foreground">
                  Activate GTM tracking across the website
                </p>
              </div>
              <Switch
                id="enableGTM"
                checked={settings.enableGTM}
                onCheckedChange={(checked) => setSettings({ ...settings, enableGTM: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gtmId">GTM Container ID</Label>
              <Input
                id="gtmId"
                placeholder="GTM-XXXXXXX"
                value={settings.gtmId || ''}
                onChange={(e) => setSettings({ ...settings, gtmId: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Find this in your GTM container (format: GTM-XXXXXXX)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Google Analytics 4 */}
        <Card>
          <CardHeader>
            <CardTitle>Google Analytics 4</CardTitle>
            <CardDescription>
              Direct GA4 implementation (alternative to GTM)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableGA4">Enable Google Analytics 4</Label>
                <p className="text-sm text-muted-foreground">
                  Activate GA4 tracking directly (without GTM)
                </p>
              </div>
              <Switch
                id="enableGA4"
                checked={settings.enableGA4}
                onCheckedChange={(checked) => setSettings({ ...settings, enableGA4: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ga4Id">GA4 Measurement ID</Label>
              <Input
                id="ga4Id"
                placeholder="G-XXXXXXXXXX"
                value={settings.ga4Id || ''}
                onChange={(e) => setSettings({ ...settings, ga4Id: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Find this in GA4 property settings (format: G-XXXXXXXXXX)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Google Consent Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Google Consent Mode v2</CardTitle>
            <CardDescription>
              GDPR/privacy-compliant tracking (recommended)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="consentMode">Enable Consent Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Respects user consent choices and enables privacy features
                </p>
              </div>
              <Switch
                id="consentMode"
                checked={settings.consentMode}
                onCheckedChange={(checked) => setSettings({ ...settings, consentMode: checked })}
              />
            </div>

            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Consent Mode allows GTM/GA4 to adapt behavior based on user consent choices.
                Default settings deny advertising/analytics storage until consent is granted.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Custom Code */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Tracking Code</CardTitle>
            <CardDescription>
              Add additional scripts or tracking pixels (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="customHeadCode">Custom Head Code</Label>
              <Textarea
                id="customHeadCode"
                placeholder="<script>/* Custom code for <head> */</script>"
                value={settings.customHeadCode || ''}
                onChange={(e) => setSettings({ ...settings, customHeadCode: e.target.value })}
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Injected in &lt;head&gt; (e.g., Facebook Pixel, LinkedIn Insight Tag)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customBodyCode">Custom Body Code</Label>
              <Textarea
                id="customBodyCode"
                placeholder="<!-- Custom code for <body> -->"
                value={settings.customBodyCode || ''}
                onChange={(e) => setSettings({ ...settings, customBodyCode: e.target.value })}
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Injected at start of &lt;body&gt; (e.g., noscript tags)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customFooterCode">Custom Footer Code</Label>
              <Textarea
                id="customFooterCode"
                placeholder="<!-- Custom code before </body> -->"
                value={settings.customFooterCode || ''}
                onChange={(e) => setSettings({ ...settings, customFooterCode: e.target.value })}
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Injected before &lt;/body&gt; (e.g., analytics, chat widgets)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
