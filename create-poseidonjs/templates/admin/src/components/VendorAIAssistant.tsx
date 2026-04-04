'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
// Using div with card styling instead
import { Loader2, Copy, Check, Facebook, Instagram, Globe, FileText, Hash } from 'lucide-react';

interface VendorAIAssistantProps {
  productId?: string;
}

export default function VendorAIAssistant({ productId }: VendorAIAssistantProps) {
  const [type, setType] = useState<string>('');
  const [content, setContent] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/vendor/ai/write', {
        ...data,
        productId,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      toast.success('Content generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate content');
    },
  });

  const handleGenerate = (contentType: string) => {
    setType(contentType);
    generateMutation.mutate({
      type: contentType,
      content,
      targetLanguage: contentType === 'translate' ? targetLanguage : undefined,
    });
  };

  const handleCopy = () => {
    const text = typeof generatedContent === 'string' 
      ? generatedContent 
      : JSON.stringify(generatedContent, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Content Generator</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content to work with (optional if product selected)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter product description or content..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-h-[100px]"
            />
          </div>

          {/* Content Type Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => handleGenerate('facebook_ad')}
                disabled={generateMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
              <Facebook className="w-4 h-4" />
              Facebook Ad
            </button>
            <button
              onClick={() => handleGenerate('instagram_caption')}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2"
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </button>
            <button
              onClick={() => handleGenerate('tiktok_script')}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              TikTok Script
            </button>
            <button
              onClick={() => handleGenerate('seo_keywords')}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2"
            >
              <Hash className="w-4 h-4" />
              SEO Keywords
            </button>
            <button
              onClick={() => handleGenerate('seo_description')}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              SEO Description
            </button>
            <button
              onClick={() => handleGenerate('better_title')}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Better Title
            </button>
            <button
              onClick={() => handleGenerate('better_description')}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Better Description
            </button>
            <button
              onClick={() => handleGenerate('translate')}
              disabled={generateMutation.isPending || !content}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Translate
            </button>
          </div>

          {/* Translation Language Selector */}
          {type === 'translate' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="english">English</option>
                <option value="bangla">Bangla (Bengali)</option>
                <option value="hindi">Hindi</option>
                <option value="arabic">Arabic</option>
              </select>
            </div>
          )}

          {generateMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          )}

          {/* Generated Content */}
          {generatedContent && !generateMutation.isPending && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Generated Content</h3>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {typeof generatedContent === 'string' ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                    {generatedContent}
                  </pre>
                ) : (
                  <pre className="text-sm text-gray-900 dark:text-white font-mono">
                    {JSON.stringify(generatedContent, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

