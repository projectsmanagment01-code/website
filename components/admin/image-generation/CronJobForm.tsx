// Cron Job creation/editing form
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

interface CronJobFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function CronJobForm({ onSubmit, onCancel, initialData }: CronJobFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    schedule: initialData?.schedule || '0 9 * * *', // 9 AM daily
    batchSize: initialData?.batchSize || 10,
    aiProvider: initialData?.aiProvider || 'github',
    aiModel: initialData?.aiModel || 'openai/gpt-4.1-mini',
    aiApiKey: '', // Never pre-fill API keys
    aiEndpoint: initialData?.aiEndpoint || '',
    imageQuality: initialData?.imageQuality || 80,
    imageFormat: initialData?.imageFormat || 'webp',
    maxImageWidth: initialData?.maxImageWidth || 1024,
    maxImageHeight: initialData?.maxImageHeight || 1024,
    watermarkEnabled: initialData?.watermarkEnabled ?? true,
    watermarkPosition: initialData?.watermarkPosition || 'bottom-center'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.schedule.trim()) {
      newErrors.schedule = 'Schedule is required';
    }

    if (!formData.aiApiKey.trim()) {
      newErrors.aiApiKey = 'API Key is required';
    }

    if (formData.batchSize < 1 || formData.batchSize > 100) {
      newErrors.batchSize = 'Batch size must be between 1 and 100';
    }

    if (formData.imageQuality < 1 || formData.imageQuality > 100) {
      newErrors.imageQuality = 'Image quality must be between 1 and 100';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  const commonSchedules = [
    { value: '0 9 * * *', label: '9:00 AM Daily' },
    { value: '0 */6 * * *', label: 'Every 6 hours' },
    { value: '0 0 * * *', label: 'Midnight Daily' },
    { value: '0 9 * * 1', label: '9:00 AM Monday' },
    { value: '0 9 1 * *', label: '9:00 AM 1st of month' }
  ];

  const aiModels = {
    github: [
      'openai/gpt-4.1-mini',
      'openai/gpt-4.1',
      'openai/gpt-4o',
      'openai/gpt-4o-mini'
    ],
    azure: [
      'gpt-4.1-mini',
      'gpt-4.1',
      'gpt-4o',
      'gpt-4o-mini'
    ],
    openai: [
      'gpt-4o-mini',
      'gpt-4o',
      'dall-e-3',
      'dall-e-2'
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {initialData ? 'Edit Cron Job' : 'Create New Cron Job'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Settings</h3>
              
              <div>
                <Label htmlFor="name">Job Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Daily Recipe Image Generation"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
                <Select
                  value={formData.schedule}
                  onValueChange={(value) => setFormData({ ...formData, schedule: value })}
                >
                  <SelectTrigger className={errors.schedule ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonSchedules.map((schedule) => (
                      <SelectItem key={schedule.value} value={schedule.value}>
                        {schedule.label} ({schedule.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.schedule && <p className="text-sm text-red-500 mt-1">{errors.schedule}</p>}
              </div>

              <div>
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.batchSize}
                  onChange={(e) => setFormData({ ...formData, batchSize: parseInt(e.target.value) })}
                  className={errors.batchSize ? 'border-red-500' : ''}
                />
                <p className="text-sm text-gray-500 mt-1">Number of recipes to process at once</p>
                {errors.batchSize && <p className="text-sm text-red-500 mt-1">{errors.batchSize}</p>}
              </div>
            </div>

            {/* AI Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Configuration</h3>

              <div>
                <Label htmlFor="aiProvider">AI Provider</Label>
                <Select
                  value={formData.aiProvider}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    aiProvider: value,
                    aiModel: aiModels[value as keyof typeof aiModels]?.[0] || ''
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub Models</SelectItem>
                    <SelectItem value="azure">Azure AI Foundry</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aiModel">AI Model</Label>
                <Select
                  value={formData.aiModel}
                  onValueChange={(value) => setFormData({ ...formData, aiModel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels[formData.aiProvider as keyof typeof aiModels]?.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="aiApiKey">API Key</Label>
                <Input
                  id="aiApiKey"
                  type="password"
                  value={formData.aiApiKey}
                  onChange={(e) => setFormData({ ...formData, aiApiKey: e.target.value })}
                  placeholder="Enter your API key"
                  className={errors.aiApiKey ? 'border-red-500' : ''}
                />
                {errors.aiApiKey && <p className="text-sm text-red-500 mt-1">{errors.aiApiKey}</p>}
              </div>

              {formData.aiProvider === 'azure' && (
                <div>
                  <Label htmlFor="aiEndpoint">Custom Endpoint (Optional)</Label>
                  <Input
                    id="aiEndpoint"
                    value={formData.aiEndpoint}
                    onChange={(e) => setFormData({ ...formData, aiEndpoint: e.target.value })}
                    placeholder="https://your-endpoint.ai.azure.com"
                  />
                </div>
              )}
            </div>

            {/* Image Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Image Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageQuality">Quality (1-100)</Label>
                  <Input
                    id="imageQuality"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.imageQuality}
                    onChange={(e) => setFormData({ ...formData, imageQuality: parseInt(e.target.value) })}
                    className={errors.imageQuality ? 'border-red-500' : ''}
                  />
                  {errors.imageQuality && <p className="text-sm text-red-500 mt-1">{errors.imageQuality}</p>}
                </div>

                <div>
                  <Label htmlFor="imageFormat">Format</Label>
                  <Select
                    value={formData.imageFormat}
                    onValueChange={(value) => setFormData({ ...formData, imageFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webp">WebP</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxImageWidth">Max Width (px)</Label>
                  <Input
                    id="maxImageWidth"
                    type="number"
                    min="256"
                    max="4096"
                    value={formData.maxImageWidth}
                    onChange={(e) => setFormData({ ...formData, maxImageWidth: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="maxImageHeight">Max Height (px)</Label>
                  <Input
                    id="maxImageHeight"
                    type="number"
                    min="256"
                    max="4096"
                    value={formData.maxImageHeight}
                    onChange={(e) => setFormData({ ...formData, maxImageHeight: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="watermarkEnabled">Enable Watermark</Label>
                  <p className="text-sm text-gray-500">Add domain watermark to generated images</p>
                </div>
                <Switch
                  id="watermarkEnabled"
                  checked={formData.watermarkEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, watermarkEnabled: checked })}
                />
              </div>

              {formData.watermarkEnabled && (
                <div>
                  <Label htmlFor="watermarkPosition">Watermark Position</Label>
                  <Select
                    value={formData.watermarkPosition}
                    onValueChange={(value) => setFormData({ ...formData, watermarkPosition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {initialData ? 'Update Cron Job' : 'Create Cron Job'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}