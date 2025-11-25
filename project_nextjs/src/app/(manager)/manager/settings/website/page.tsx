"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ManagerSettingsWebsitePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"appearance" | "setup" | "plugins">("appearance");
  const [activeAppearanceSubTab, setActiveAppearanceSubTab] = useState<"theme" | "setup" | "advanced">("theme");
  const [activeSetupSubTab, setActiveSetupSubTab] = useState<"information" | "languages" | "navigationMenus" | "announcements" | "lists" | "privacy" | "dateTime">("information");
  const [activePluginsSubTab, setActivePluginsSubTab] = useState<"installedPlugins" | "pluginGallery">("installedPlugins");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Get primary locale
  const [primaryLocale, setPrimaryLocale] = useState('en_US');

  // Appearance - Theme state
  const [theme, setTheme] = useState({ activeTheme: 'default' });

  // Appearance - Setup state
  const [appearanceSetup, setAppearanceSetup] = useState({ pageFooter: '' });

  // Appearance - Advanced state
  const [appearanceAdvanced, setAppearanceAdvanced] = useState({ customCss: '' });

  // Setup - Information state
  const [information, setInformation] = useState({ 
    journalTitle: '', 
    journalDescription: '', 
    aboutJournal: '' 
  });

  // Setup - Languages state
  const [languages, setLanguages] = useState<{
    primaryLocale: string;
    languages: Record<string, { ui: boolean; forms: boolean; submissions: boolean }>;
  }>({
    primaryLocale: 'en_US',
    languages: {}
  });

  // Setup - Announcements state
  const [announcements, setAnnouncements] = useState({ enableAnnouncements: false });

  // Setup - Lists state
  const [lists, setLists] = useState({ itemsPerPage: 25 });

  // Setup - Privacy state
  const [privacy, setPrivacy] = useState({ privacyStatement: '' });

  // Setup - Date/Time state
  const [dateTime, setDateTime] = useState({ timeZone: 'UTC', dateFormat: 'Y-m-d' });

  // Load settings from database
  useEffect(() => {
    if (!journalId) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Load journal to get primary_locale
        const { data: journal } = await supabase
          .from('journals')
          .select('primary_locale')
          .eq('id', journalId)
          .single();

        const locale = journal?.primary_locale || 'en_US';
        setPrimaryLocale(locale);

        // Load website settings from journal_settings
        // Some settings use primary locale, some use empty locale
        const { data: websiteSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value, locale')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'activeTheme', 'pageFooter', 'customCss',
            'enableAnnouncements', 'itemsPerPage', 'privacyStatement',
            'timeZone', 'dateFormat'
          ])
          .in('locale', [locale, '']);

        if (websiteSettings) {
          const settings: Record<string, string> = {};
          // Prioritize locale-specific settings, fallback to empty locale
          websiteSettings.forEach((s: any) => {
            if (!settings[s.setting_name] || s.locale === locale) {
              settings[s.setting_name] = s.setting_value || '';
            }
          });

          if (settings.activeTheme) setTheme({ activeTheme: settings.activeTheme });
          if (settings.pageFooter) setAppearanceSetup({ pageFooter: settings.pageFooter });
          if (settings.customCss) setAppearanceAdvanced({ customCss: settings.customCss });
          if (settings.enableAnnouncements) setAnnouncements({ enableAnnouncements: settings.enableAnnouncements === 'true' || settings.enableAnnouncements === '1' });
          if (settings.itemsPerPage) setLists({ itemsPerPage: parseInt(settings.itemsPerPage) || 25 });
          if (settings.privacyStatement) setPrivacy({ privacyStatement: settings.privacyStatement });
          if (settings.timeZone) setDateTime(prev => ({ ...prev, timeZone: settings.timeZone }));
          if (settings.dateFormat) setDateTime(prev => ({ ...prev, dateFormat: settings.dateFormat }));
        }

        // Load information from journal_settings (name, description, about)
        const { data: infoSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .in('setting_name', ['name', 'description', 'about'])
          .eq('locale', locale);

        if (infoSettings) {
          const info: Record<string, string> = {};
          infoSettings.forEach((s: any) => {
            info[s.setting_name] = s.setting_value || '';
          });
          setInformation({
            journalTitle: info.name || '',
            journalDescription: info.description || '',
            aboutJournal: info.about || '',
          });
        }

        // Load languages settings
        const { data: langSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .eq('setting_name', 'supportedLocales')
          .maybeSingle();

        if (langSettings?.setting_value) {
          try {
            const parsed = JSON.parse(langSettings.setting_value);
            if (parsed.languages) {
              setLanguages(parsed);
            }
          } catch {
            // Ignore parse error
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setFeedback({ type: 'error', message: 'Failed to load settings.' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [journalId]);

  // Auto-dismiss feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      minHeight: '100%',
      backgroundColor: '#eaedee',
      padding: 0,
      margin: 0,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Page Header - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #e5e5e5',
        padding: '1.5rem 0',
      }}>
        <div style={{ padding: '0 1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <Link
              href="/manager"
              style={{
                color: '#006798',
                textDecoration: 'underline',
              }}
            >
              Dashboard
            </Link>
            <span style={{ color: '#6B7280', margin: '0 0.5rem' }}>»</span>
            <Link
              href="/manager/settings"
              style={{
                color: '#006798',
                textDecoration: 'underline',
              }}
            >
              Journal Settings
            </Link>
            <span style={{ color: '#6B7280', margin: '0 0.5rem' }}>»</span>
            <span style={{ color: '#111827' }}>Website</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Website Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure your journal's website appearance, navigation, languages, and plugins.
          </p>
        </div>
      </div>

      {/* Content - OJS PKP 3.3 Style */}
      <div style={{ padding: '0 1.5rem', marginTop: '1.5rem' }}>
        {/* Feedback Message */}
        {feedback && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
            color: feedback.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '0.875rem',
          }}>
            {feedback.message}
          </div>
        )}

        {/* Main Tabs Navigation - OJS PKP 3.3 Style */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e5e5',
          display: 'flex',
          gap: 0,
        }}>
          <button
            onClick={() => setActiveTab('appearance')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'appearance' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'appearance' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'appearance' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'setup' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'setup' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'setup' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('plugins')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'plugins' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'plugins' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'plugins' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Plugins
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderTop: 'none',
          padding: '1.5rem',
          minHeight: '400px',
        }}>
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              {/* Appearance Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActiveAppearanceSubTab('theme')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'theme' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'theme' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Theme
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab('setup')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'setup' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'setup' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab('advanced')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'advanced' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'advanced' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Advanced
                </button>
              </div>

              {/* Theme Sub-tab */}
              {activeAppearanceSubTab === 'theme' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Theme
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Select the theme for your journal website.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Active Theme
                    </label>
                    <select
                      value={theme.activeTheme}
                      onChange={(e) => setTheme({ activeTheme: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="default">Default Theme</option>
                      <option value="custom">Custom Theme</option>
                    </select>
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'activeTheme',
                            setting_value: theme.activeTheme,
                            setting_type: 'string',
                            locale: primaryLocale,
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Theme settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving theme:', error);
                        setFeedback({ type: 'error', message: 'Failed to save theme settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Setup Sub-tab */}
              {activeAppearanceSubTab === 'setup' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Appearance Setup
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Page Footer
                    </label>
                    <textarea
                      value={appearanceSetup.pageFooter}
                      onChange={(e) => setAppearanceSetup({ pageFooter: e.target.value })}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'pageFooter',
                            setting_value: appearanceSetup.pageFooter,
                            setting_type: 'string',
                            locale: primaryLocale,
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Appearance setup saved successfully.' });
                      } catch (error) {
                        console.error('Error saving appearance setup:', error);
                        setFeedback({ type: 'error', message: 'Failed to save appearance setup.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Advanced Sub-tab */}
              {activeAppearanceSubTab === 'advanced' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Advanced Appearance
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Custom CSS
                    </label>
                    <textarea
                      value={appearanceAdvanced.customCss}
                      onChange={(e) => setAppearanceAdvanced({ customCss: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'customCss',
                            setting_value: appearanceAdvanced.customCss,
                            setting_type: 'string',
                            locale: '',
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Advanced appearance settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving advanced appearance:', error);
                        setFeedback({ type: 'error', message: 'Failed to save advanced appearance settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Setup Tab */}
          {activeTab === 'setup' && (
            <div>
              {/* Setup Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setActiveSetupSubTab('information')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'information' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'information' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('languages')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'languages' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'languages' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Languages
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('navigationMenus')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'navigationMenus' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'navigationMenus' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Navigation Menus
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('announcements')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'announcements' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'announcements' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Announcements
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('lists')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'lists' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'lists' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Lists
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('privacy')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'privacy' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'privacy' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Privacy
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('dateTime')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'dateTime' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'dateTime' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Date/Time
                </button>
              </div>

              {/* Information Sub-tab */}
              {activeSetupSubTab === 'information' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'name', setting_value: information.journalTitle, locale: primaryLocale },
                      { setting_name: 'description', setting_value: information.journalDescription, locale: primaryLocale },
                      { setting_name: 'about', setting_value: information.aboutJournal, locale: primaryLocale },
                    ];
                    for (const setting of settings) {
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: setting.setting_name,
                          setting_value: setting.setting_value,
                          setting_type: 'string',
                          locale: setting.locale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                    }
                    setFeedback({ type: 'success', message: 'Information settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving information:', error);
                    setFeedback({ type: 'error', message: 'Failed to save information settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Information
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Journal Title
                    </label>
                    <input
                      type="text"
                      value={information.journalTitle}
                      onChange={(e) => setInformation({ ...information, journalTitle: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Journal Description
                    </label>
                    <textarea
                      value={information.journalDescription}
                      onChange={(e) => setInformation({ ...information, journalDescription: e.target.value })}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      About the Journal
                    </label>
                    <textarea
                      value={information.aboutJournal}
                      onChange={(e) => setInformation({ ...information, aboutJournal: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Languages Sub-tab */}
              {activeSetupSubTab === 'languages' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Languages
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Configure which languages are available for your journal's user interface, forms, and submissions.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Primary Locale
                    </label>
                    <select
                      value={languages.primaryLocale}
                      onChange={(e) => setLanguages({ ...languages, primaryLocale: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="en_US">English (US)</option>
                      <option value="id_ID">Indonesian</option>
                      <option value="es_ES">Spanish</option>
                      <option value="fr_FR">French</option>
                    </select>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1rem',
                  }}>
                    Language management grid will be implemented here.
                  </p>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'supportedLocales',
                            setting_value: JSON.stringify(languages),
                            setting_type: 'string',
                            locale: '',
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Language settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving languages:', error);
                        setFeedback({ type: 'error', message: 'Failed to save language settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Navigation Menus Sub-tab */}
              {activeSetupSubTab === 'navigationMenus' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Navigation Menus
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Navigation menus management will be implemented here.
                  </p>
                </div>
              )}

              {/* Announcements Sub-tab */}
              {activeSetupSubTab === 'announcements' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'enableAnnouncements',
                        setting_value: announcements.enableAnnouncements ? '1' : '0',
                        setting_type: 'bool',
                        locale: '',
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Announcements settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving announcements:', error);
                    setFeedback({ type: 'error', message: 'Failed to save announcements settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Announcements
                  </h2>
                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="enableAnnouncements"
                      checked={announcements.enableAnnouncements}
                      onChange={(e) => setAnnouncements({ enableAnnouncements: e.target.checked })}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                    />
                    <label htmlFor="enableAnnouncements" style={{
                      fontSize: '0.875rem',
                      color: '#002C40',
                      cursor: 'pointer',
                    }}>
                      Enable Announcements
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Lists Sub-tab */}
              {activeSetupSubTab === 'lists' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'itemsPerPage',
                        setting_value: lists.itemsPerPage.toString(),
                        setting_type: 'int',
                        locale: '',
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Lists settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving lists:', error);
                    setFeedback({ type: 'error', message: 'Failed to save lists settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Lists
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Items Per Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={lists.itemsPerPage}
                      onChange={(e) => setLists({ itemsPerPage: parseInt(e.target.value) || 25 })}
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Privacy Sub-tab */}
              {activeSetupSubTab === 'privacy' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'privacyStatement',
                        setting_value: privacy.privacyStatement,
                        setting_type: 'string',
                        locale: primaryLocale,
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Privacy statement saved successfully.' });
                  } catch (error) {
                    console.error('Error saving privacy:', error);
                    setFeedback({ type: 'error', message: 'Failed to save privacy statement.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Privacy Statement
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Privacy Statement
                    </label>
                    <textarea
                      value={privacy.privacyStatement}
                      onChange={(e) => setPrivacy({ privacyStatement: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Date/Time Sub-tab */}
              {activeSetupSubTab === 'dateTime' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'timeZone', setting_value: dateTime.timeZone, locale: '' },
                      { setting_name: 'dateFormat', setting_value: dateTime.dateFormat, locale: '' },
                    ];
                    for (const setting of settings) {
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: setting.setting_name,
                          setting_value: setting.setting_value,
                          setting_type: 'string',
                          locale: setting.locale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                    }
                    setFeedback({ type: 'success', message: 'Date/Time settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving date/time:', error);
                    setFeedback({ type: 'error', message: 'Failed to save date/time settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Date/Time
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Time Zone
                    </label>
                    <select
                      value={dateTime.timeZone}
                      onChange={(e) => setDateTime({ ...dateTime, timeZone: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Date Format
                    </label>
                    <select
                      value={dateTime.dateFormat}
                      onChange={(e) => setDateTime({ ...dateTime, dateFormat: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Y-m-d">YYYY-MM-DD</option>
                      <option value="d/m/Y">DD/MM/YYYY</option>
                      <option value="m/d/Y">MM/DD/YYYY</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Plugins Tab */}
          {activeTab === 'plugins' && (
            <div>
              {/* Plugins Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActivePluginsSubTab('installedPlugins')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activePluginsSubTab === 'installedPlugins' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activePluginsSubTab === 'installedPlugins' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Installed Plugins
                </button>
                <button
                  onClick={() => setActivePluginsSubTab('pluginGallery')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activePluginsSubTab === 'pluginGallery' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activePluginsSubTab === 'pluginGallery' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Plugin Gallery
                </button>
              </div>

              {/* Installed Plugins Sub-tab */}
              {activePluginsSubTab === 'installedPlugins' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Installed Plugins
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Plugin management will be implemented here.
                  </p>
                </div>
              )}

              {/* Plugin Gallery Sub-tab */}
              {activePluginsSubTab === 'pluginGallery' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Plugin Gallery
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Plugin gallery will be implemented here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ManagerSettingsWebsitePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"appearance" | "setup" | "plugins">("appearance");
  const [activeAppearanceSubTab, setActiveAppearanceSubTab] = useState<"theme" | "setup" | "advanced">("theme");
  const [activeSetupSubTab, setActiveSetupSubTab] = useState<"information" | "languages" | "navigationMenus" | "announcements" | "lists" | "privacy" | "dateTime">("information");
  const [activePluginsSubTab, setActivePluginsSubTab] = useState<"installedPlugins" | "pluginGallery">("installedPlugins");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Get primary locale
  const [primaryLocale, setPrimaryLocale] = useState('en_US');

  // Appearance - Theme state
  const [theme, setTheme] = useState({ activeTheme: 'default' });

  // Appearance - Setup state
  const [appearanceSetup, setAppearanceSetup] = useState({ pageFooter: '' });

  // Appearance - Advanced state
  const [appearanceAdvanced, setAppearanceAdvanced] = useState({ customCss: '' });

  // Setup - Information state
  const [information, setInformation] = useState({ 
    journalTitle: '', 
    journalDescription: '', 
    aboutJournal: '' 
  });

  // Setup - Languages state
  const [languages, setLanguages] = useState<{
    primaryLocale: string;
    languages: Record<string, { ui: boolean; forms: boolean; submissions: boolean }>;
  }>({
    primaryLocale: 'en_US',
    languages: {}
  });

  // Setup - Announcements state
  const [announcements, setAnnouncements] = useState({ enableAnnouncements: false });

  // Setup - Lists state
  const [lists, setLists] = useState({ itemsPerPage: 25 });

  // Setup - Privacy state
  const [privacy, setPrivacy] = useState({ privacyStatement: '' });

  // Setup - Date/Time state
  const [dateTime, setDateTime] = useState({ timeZone: 'UTC', dateFormat: 'Y-m-d' });

  // Load settings from database
  useEffect(() => {
    if (!journalId) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Load journal to get primary_locale
        const { data: journal } = await supabase
          .from('journals')
          .select('primary_locale')
          .eq('id', journalId)
          .single();

        const locale = journal?.primary_locale || 'en_US';
        setPrimaryLocale(locale);

        // Load website settings from journal_settings
        // Some settings use primary locale, some use empty locale
        const { data: websiteSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value, locale')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'activeTheme', 'pageFooter', 'customCss',
            'enableAnnouncements', 'itemsPerPage', 'privacyStatement',
            'timeZone', 'dateFormat'
          ])
          .in('locale', [locale, '']);

        if (websiteSettings) {
          const settings: Record<string, string> = {};
          // Prioritize locale-specific settings, fallback to empty locale
          websiteSettings.forEach((s: any) => {
            if (!settings[s.setting_name] || s.locale === locale) {
              settings[s.setting_name] = s.setting_value || '';
            }
          });

          if (settings.activeTheme) setTheme({ activeTheme: settings.activeTheme });
          if (settings.pageFooter) setAppearanceSetup({ pageFooter: settings.pageFooter });
          if (settings.customCss) setAppearanceAdvanced({ customCss: settings.customCss });
          if (settings.enableAnnouncements) setAnnouncements({ enableAnnouncements: settings.enableAnnouncements === 'true' || settings.enableAnnouncements === '1' });
          if (settings.itemsPerPage) setLists({ itemsPerPage: parseInt(settings.itemsPerPage) || 25 });
          if (settings.privacyStatement) setPrivacy({ privacyStatement: settings.privacyStatement });
          if (settings.timeZone) setDateTime(prev => ({ ...prev, timeZone: settings.timeZone }));
          if (settings.dateFormat) setDateTime(prev => ({ ...prev, dateFormat: settings.dateFormat }));
        }

        // Load information from journal_settings (name, description, about)
        const { data: infoSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .in('setting_name', ['name', 'description', 'about'])
          .eq('locale', locale);

        if (infoSettings) {
          const info: Record<string, string> = {};
          infoSettings.forEach((s: any) => {
            info[s.setting_name] = s.setting_value || '';
          });
          setInformation({
            journalTitle: info.name || '',
            journalDescription: info.description || '',
            aboutJournal: info.about || '',
          });
        }

        // Load languages settings
        const { data: langSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .eq('setting_name', 'supportedLocales')
          .maybeSingle();

        if (langSettings?.setting_value) {
          try {
            const parsed = JSON.parse(langSettings.setting_value);
            if (parsed.languages) {
              setLanguages(parsed);
            }
          } catch {
            // Ignore parse error
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setFeedback({ type: 'error', message: 'Failed to load settings.' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [journalId]);

  // Auto-dismiss feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      minHeight: '100%',
      backgroundColor: '#eaedee',
      padding: 0,
      margin: 0,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Page Header - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #e5e5e5',
        padding: '1.5rem 0',
      }}>
        <div style={{ padding: '0 1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <Link
              href="/manager"
              style={{
                color: '#006798',
                textDecoration: 'underline',
              }}
            >
              Dashboard
            </Link>
            <span style={{ color: '#6B7280', margin: '0 0.5rem' }}>»</span>
            <Link
              href="/manager/settings"
              style={{
                color: '#006798',
                textDecoration: 'underline',
              }}
            >
              Journal Settings
            </Link>
            <span style={{ color: '#6B7280', margin: '0 0.5rem' }}>»</span>
            <span style={{ color: '#111827' }}>Website</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Website Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure your journal's website appearance, navigation, languages, and plugins.
          </p>
        </div>
      </div>

      {/* Content - OJS PKP 3.3 Style */}
      <div style={{ padding: '0 1.5rem', marginTop: '1.5rem' }}>
        {/* Feedback Message */}
        {feedback && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
            color: feedback.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '0.875rem',
          }}>
            {feedback.message}
          </div>
        )}

        {/* Main Tabs Navigation - OJS PKP 3.3 Style */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e5e5',
          display: 'flex',
          gap: 0,
        }}>
          <button
            onClick={() => setActiveTab('appearance')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'appearance' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'appearance' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'appearance' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'setup' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'setup' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'setup' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('plugins')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'plugins' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'plugins' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'plugins' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Plugins
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderTop: 'none',
          padding: '1.5rem',
          minHeight: '400px',
        }}>
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              {/* Appearance Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActiveAppearanceSubTab('theme')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'theme' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'theme' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Theme
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab('setup')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'setup' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'setup' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab('advanced')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'advanced' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'advanced' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Advanced
                </button>
              </div>

              {/* Theme Sub-tab */}
              {activeAppearanceSubTab === 'theme' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Theme
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Select the theme for your journal website.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Active Theme
                    </label>
                    <select
                      value={theme.activeTheme}
                      onChange={(e) => setTheme({ activeTheme: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="default">Default Theme</option>
                      <option value="custom">Custom Theme</option>
                    </select>
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'activeTheme',
                            setting_value: theme.activeTheme,
                            setting_type: 'string',
                            locale: primaryLocale,
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Theme settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving theme:', error);
                        setFeedback({ type: 'error', message: 'Failed to save theme settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Setup Sub-tab */}
              {activeAppearanceSubTab === 'setup' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Appearance Setup
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Page Footer
                    </label>
                    <textarea
                      value={appearanceSetup.pageFooter}
                      onChange={(e) => setAppearanceSetup({ pageFooter: e.target.value })}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'pageFooter',
                            setting_value: appearanceSetup.pageFooter,
                            setting_type: 'string',
                            locale: primaryLocale,
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Appearance setup saved successfully.' });
                      } catch (error) {
                        console.error('Error saving appearance setup:', error);
                        setFeedback({ type: 'error', message: 'Failed to save appearance setup.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Advanced Sub-tab */}
              {activeAppearanceSubTab === 'advanced' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Advanced Appearance
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Custom CSS
                    </label>
                    <textarea
                      value={appearanceAdvanced.customCss}
                      onChange={(e) => setAppearanceAdvanced({ customCss: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'customCss',
                            setting_value: appearanceAdvanced.customCss,
                            setting_type: 'string',
                            locale: '',
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Advanced appearance settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving advanced appearance:', error);
                        setFeedback({ type: 'error', message: 'Failed to save advanced appearance settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Setup Tab */}
          {activeTab === 'setup' && (
            <div>
              {/* Setup Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setActiveSetupSubTab('information')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'information' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'information' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('languages')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'languages' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'languages' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Languages
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('navigationMenus')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'navigationMenus' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'navigationMenus' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Navigation Menus
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('announcements')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'announcements' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'announcements' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Announcements
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('lists')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'lists' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'lists' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Lists
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('privacy')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'privacy' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'privacy' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Privacy
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('dateTime')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'dateTime' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'dateTime' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Date/Time
                </button>
              </div>

              {/* Information Sub-tab */}
              {activeSetupSubTab === 'information' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'name', setting_value: information.journalTitle, locale: primaryLocale },
                      { setting_name: 'description', setting_value: information.journalDescription, locale: primaryLocale },
                      { setting_name: 'about', setting_value: information.aboutJournal, locale: primaryLocale },
                    ];
                    for (const setting of settings) {
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: setting.setting_name,
                          setting_value: setting.setting_value,
                          setting_type: 'string',
                          locale: setting.locale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                    }
                    setFeedback({ type: 'success', message: 'Information settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving information:', error);
                    setFeedback({ type: 'error', message: 'Failed to save information settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Information
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Journal Title
                    </label>
                    <input
                      type="text"
                      value={information.journalTitle}
                      onChange={(e) => setInformation({ ...information, journalTitle: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Journal Description
                    </label>
                    <textarea
                      value={information.journalDescription}
                      onChange={(e) => setInformation({ ...information, journalDescription: e.target.value })}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      About the Journal
                    </label>
                    <textarea
                      value={information.aboutJournal}
                      onChange={(e) => setInformation({ ...information, aboutJournal: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Languages Sub-tab */}
              {activeSetupSubTab === 'languages' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Languages
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Configure which languages are available for your journal's user interface, forms, and submissions.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Primary Locale
                    </label>
                    <select
                      value={languages.primaryLocale}
                      onChange={(e) => setLanguages({ ...languages, primaryLocale: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="en_US">English (US)</option>
                      <option value="id_ID">Indonesian</option>
                      <option value="es_ES">Spanish</option>
                      <option value="fr_FR">French</option>
                    </select>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1rem',
                  }}>
                    Language management grid will be implemented here.
                  </p>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'supportedLocales',
                            setting_value: JSON.stringify(languages),
                            setting_type: 'string',
                            locale: '',
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Language settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving languages:', error);
                        setFeedback({ type: 'error', message: 'Failed to save language settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Navigation Menus Sub-tab */}
              {activeSetupSubTab === 'navigationMenus' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Navigation Menus
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Navigation menus management will be implemented here.
                  </p>
                </div>
              )}

              {/* Announcements Sub-tab */}
              {activeSetupSubTab === 'announcements' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'enableAnnouncements',
                        setting_value: announcements.enableAnnouncements ? '1' : '0',
                        setting_type: 'bool',
                        locale: '',
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Announcements settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving announcements:', error);
                    setFeedback({ type: 'error', message: 'Failed to save announcements settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Announcements
                  </h2>
                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="enableAnnouncements"
                      checked={announcements.enableAnnouncements}
                      onChange={(e) => setAnnouncements({ enableAnnouncements: e.target.checked })}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                    />
                    <label htmlFor="enableAnnouncements" style={{
                      fontSize: '0.875rem',
                      color: '#002C40',
                      cursor: 'pointer',
                    }}>
                      Enable Announcements
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Lists Sub-tab */}
              {activeSetupSubTab === 'lists' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'itemsPerPage',
                        setting_value: lists.itemsPerPage.toString(),
                        setting_type: 'int',
                        locale: '',
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Lists settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving lists:', error);
                    setFeedback({ type: 'error', message: 'Failed to save lists settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Lists
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Items Per Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={lists.itemsPerPage}
                      onChange={(e) => setLists({ itemsPerPage: parseInt(e.target.value) || 25 })}
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Privacy Sub-tab */}
              {activeSetupSubTab === 'privacy' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'privacyStatement',
                        setting_value: privacy.privacyStatement,
                        setting_type: 'string',
                        locale: primaryLocale,
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Privacy statement saved successfully.' });
                  } catch (error) {
                    console.error('Error saving privacy:', error);
                    setFeedback({ type: 'error', message: 'Failed to save privacy statement.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Privacy Statement
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Privacy Statement
                    </label>
                    <textarea
                      value={privacy.privacyStatement}
                      onChange={(e) => setPrivacy({ privacyStatement: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Date/Time Sub-tab */}
              {activeSetupSubTab === 'dateTime' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'timeZone', setting_value: dateTime.timeZone, locale: '' },
                      { setting_name: 'dateFormat', setting_value: dateTime.dateFormat, locale: '' },
                    ];
                    for (const setting of settings) {
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: setting.setting_name,
                          setting_value: setting.setting_value,
                          setting_type: 'string',
                          locale: setting.locale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                    }
                    setFeedback({ type: 'success', message: 'Date/Time settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving date/time:', error);
                    setFeedback({ type: 'error', message: 'Failed to save date/time settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Date/Time
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Time Zone
                    </label>
                    <select
                      value={dateTime.timeZone}
                      onChange={(e) => setDateTime({ ...dateTime, timeZone: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Date Format
                    </label>
                    <select
                      value={dateTime.dateFormat}
                      onChange={(e) => setDateTime({ ...dateTime, dateFormat: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Y-m-d">YYYY-MM-DD</option>
                      <option value="d/m/Y">DD/MM/YYYY</option>
                      <option value="m/d/Y">MM/DD/YYYY</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Plugins Tab */}
          {activeTab === 'plugins' && (
            <div>
              {/* Plugins Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActivePluginsSubTab('installedPlugins')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activePluginsSubTab === 'installedPlugins' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activePluginsSubTab === 'installedPlugins' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Installed Plugins
                </button>
                <button
                  onClick={() => setActivePluginsSubTab('pluginGallery')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activePluginsSubTab === 'pluginGallery' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activePluginsSubTab === 'pluginGallery' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Plugin Gallery
                </button>
              </div>

              {/* Installed Plugins Sub-tab */}
              {activePluginsSubTab === 'installedPlugins' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Installed Plugins
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Plugin management will be implemented here.
                  </p>
                </div>
              )}

              {/* Plugin Gallery Sub-tab */}
              {activePluginsSubTab === 'pluginGallery' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Plugin Gallery
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Plugin gallery will be implemented here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ManagerSettingsWebsitePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"appearance" | "setup" | "plugins">("appearance");
  const [activeAppearanceSubTab, setActiveAppearanceSubTab] = useState<"theme" | "setup" | "advanced">("theme");
  const [activeSetupSubTab, setActiveSetupSubTab] = useState<"information" | "languages" | "navigationMenus" | "announcements" | "lists" | "privacy" | "dateTime">("information");
  const [activePluginsSubTab, setActivePluginsSubTab] = useState<"installedPlugins" | "pluginGallery">("installedPlugins");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Get primary locale
  const [primaryLocale, setPrimaryLocale] = useState('en_US');

  // Appearance - Theme state
  const [theme, setTheme] = useState({ activeTheme: 'default' });

  // Appearance - Setup state
  const [appearanceSetup, setAppearanceSetup] = useState({ pageFooter: '' });

  // Appearance - Advanced state
  const [appearanceAdvanced, setAppearanceAdvanced] = useState({ customCss: '' });

  // Setup - Information state
  const [information, setInformation] = useState({ 
    journalTitle: '', 
    journalDescription: '', 
    aboutJournal: '' 
  });

  // Setup - Languages state
  const [languages, setLanguages] = useState<{
    primaryLocale: string;
    languages: Record<string, { ui: boolean; forms: boolean; submissions: boolean }>;
  }>({
    primaryLocale: 'en_US',
    languages: {}
  });

  // Setup - Announcements state
  const [announcements, setAnnouncements] = useState({ enableAnnouncements: false });

  // Setup - Lists state
  const [lists, setLists] = useState({ itemsPerPage: 25 });

  // Setup - Privacy state
  const [privacy, setPrivacy] = useState({ privacyStatement: '' });

  // Setup - Date/Time state
  const [dateTime, setDateTime] = useState({ timeZone: 'UTC', dateFormat: 'Y-m-d' });

  // Load settings from database
  useEffect(() => {
    if (!journalId) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Load journal to get primary_locale
        const { data: journal } = await supabase
          .from('journals')
          .select('primary_locale')
          .eq('id', journalId)
          .single();

        const locale = journal?.primary_locale || 'en_US';
        setPrimaryLocale(locale);

        // Load website settings from journal_settings
        // Some settings use primary locale, some use empty locale
        const { data: websiteSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value, locale')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'activeTheme', 'pageFooter', 'customCss',
            'enableAnnouncements', 'itemsPerPage', 'privacyStatement',
            'timeZone', 'dateFormat'
          ])
          .in('locale', [locale, '']);

        if (websiteSettings) {
          const settings: Record<string, string> = {};
          // Prioritize locale-specific settings, fallback to empty locale
          websiteSettings.forEach((s: any) => {
            if (!settings[s.setting_name] || s.locale === locale) {
              settings[s.setting_name] = s.setting_value || '';
            }
          });

          if (settings.activeTheme) setTheme({ activeTheme: settings.activeTheme });
          if (settings.pageFooter) setAppearanceSetup({ pageFooter: settings.pageFooter });
          if (settings.customCss) setAppearanceAdvanced({ customCss: settings.customCss });
          if (settings.enableAnnouncements) setAnnouncements({ enableAnnouncements: settings.enableAnnouncements === 'true' || settings.enableAnnouncements === '1' });
          if (settings.itemsPerPage) setLists({ itemsPerPage: parseInt(settings.itemsPerPage) || 25 });
          if (settings.privacyStatement) setPrivacy({ privacyStatement: settings.privacyStatement });
          if (settings.timeZone) setDateTime(prev => ({ ...prev, timeZone: settings.timeZone }));
          if (settings.dateFormat) setDateTime(prev => ({ ...prev, dateFormat: settings.dateFormat }));
        }

        // Load information from journal_settings (name, description, about)
        const { data: infoSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .in('setting_name', ['name', 'description', 'about'])
          .eq('locale', locale);

        if (infoSettings) {
          const info: Record<string, string> = {};
          infoSettings.forEach((s: any) => {
            info[s.setting_name] = s.setting_value || '';
          });
          setInformation({
            journalTitle: info.name || '',
            journalDescription: info.description || '',
            aboutJournal: info.about || '',
          });
        }

        // Load languages settings
        const { data: langSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .eq('setting_name', 'supportedLocales')
          .maybeSingle();

        if (langSettings?.setting_value) {
          try {
            const parsed = JSON.parse(langSettings.setting_value);
            if (parsed.languages) {
              setLanguages(parsed);
            }
          } catch {
            // Ignore parse error
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setFeedback({ type: 'error', message: 'Failed to load settings.' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [journalId]);

  // Auto-dismiss feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      minHeight: '100%',
      backgroundColor: '#eaedee',
      padding: 0,
      margin: 0,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Page Header - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #e5e5e5',
        padding: '1.5rem 0',
      }}>
        <div style={{ padding: '0 1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <Link
              href="/manager"
              style={{
                color: '#006798',
                textDecoration: 'underline',
              }}
            >
              Dashboard
            </Link>
            <span style={{ color: '#6B7280', margin: '0 0.5rem' }}>»</span>
            <Link
              href="/manager/settings"
              style={{
                color: '#006798',
                textDecoration: 'underline',
              }}
            >
              Journal Settings
            </Link>
            <span style={{ color: '#6B7280', margin: '0 0.5rem' }}>»</span>
            <span style={{ color: '#111827' }}>Website</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Website Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure your journal's website appearance, navigation, languages, and plugins.
          </p>
        </div>
      </div>

      {/* Content - OJS PKP 3.3 Style */}
      <div style={{ padding: '0 1.5rem', marginTop: '1.5rem' }}>
        {/* Feedback Message */}
        {feedback && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
            color: feedback.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '0.875rem',
          }}>
            {feedback.message}
          </div>
        )}

        {/* Main Tabs Navigation - OJS PKP 3.3 Style */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e5e5',
          display: 'flex',
          gap: 0,
        }}>
          <button
            onClick={() => setActiveTab('appearance')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'appearance' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'appearance' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'appearance' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'setup' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'setup' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'setup' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('plugins')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'plugins' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'plugins' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'plugins' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Plugins
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderTop: 'none',
          padding: '1.5rem',
          minHeight: '400px',
        }}>
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              {/* Appearance Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActiveAppearanceSubTab('theme')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'theme' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'theme' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Theme
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab('setup')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'setup' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'setup' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab('advanced')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'advanced' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'advanced' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Advanced
                </button>
              </div>

              {/* Theme Sub-tab */}
              {activeAppearanceSubTab === 'theme' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Theme
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Select the theme for your journal website.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Active Theme
                    </label>
                    <select
                      value={theme.activeTheme}
                      onChange={(e) => setTheme({ activeTheme: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="default">Default Theme</option>
                      <option value="custom">Custom Theme</option>
                    </select>
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'activeTheme',
                            setting_value: theme.activeTheme,
                            setting_type: 'string',
                            locale: primaryLocale,
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Theme settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving theme:', error);
                        setFeedback({ type: 'error', message: 'Failed to save theme settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Setup Sub-tab */}
              {activeAppearanceSubTab === 'setup' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Appearance Setup
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Page Footer
                    </label>
                    <textarea
                      value={appearanceSetup.pageFooter}
                      onChange={(e) => setAppearanceSetup({ pageFooter: e.target.value })}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'pageFooter',
                            setting_value: appearanceSetup.pageFooter,
                            setting_type: 'string',
                            locale: primaryLocale,
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Appearance setup saved successfully.' });
                      } catch (error) {
                        console.error('Error saving appearance setup:', error);
                        setFeedback({ type: 'error', message: 'Failed to save appearance setup.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Advanced Sub-tab */}
              {activeAppearanceSubTab === 'advanced' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Advanced Appearance
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Custom CSS
                    </label>
                    <textarea
                      value={appearanceAdvanced.customCss}
                      onChange={(e) => setAppearanceAdvanced({ customCss: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'customCss',
                            setting_value: appearanceAdvanced.customCss,
                            setting_type: 'string',
                            locale: '',
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Advanced appearance settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving advanced appearance:', error);
                        setFeedback({ type: 'error', message: 'Failed to save advanced appearance settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Setup Tab */}
          {activeTab === 'setup' && (
            <div>
              {/* Setup Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setActiveSetupSubTab('information')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'information' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'information' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('languages')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'languages' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'languages' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Languages
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('navigationMenus')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'navigationMenus' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'navigationMenus' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Navigation Menus
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('announcements')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'announcements' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'announcements' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Announcements
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('lists')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'lists' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'lists' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Lists
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('privacy')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'privacy' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'privacy' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Privacy
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('dateTime')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'dateTime' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'dateTime' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Date/Time
                </button>
              </div>

              {/* Information Sub-tab */}
              {activeSetupSubTab === 'information' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'name', setting_value: information.journalTitle, locale: primaryLocale },
                      { setting_name: 'description', setting_value: information.journalDescription, locale: primaryLocale },
                      { setting_name: 'about', setting_value: information.aboutJournal, locale: primaryLocale },
                    ];
                    for (const setting of settings) {
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: setting.setting_name,
                          setting_value: setting.setting_value,
                          setting_type: 'string',
                          locale: setting.locale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                    }
                    setFeedback({ type: 'success', message: 'Information settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving information:', error);
                    setFeedback({ type: 'error', message: 'Failed to save information settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Information
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Journal Title
                    </label>
                    <input
                      type="text"
                      value={information.journalTitle}
                      onChange={(e) => setInformation({ ...information, journalTitle: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Journal Description
                    </label>
                    <textarea
                      value={information.journalDescription}
                      onChange={(e) => setInformation({ ...information, journalDescription: e.target.value })}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      About the Journal
                    </label>
                    <textarea
                      value={information.aboutJournal}
                      onChange={(e) => setInformation({ ...information, aboutJournal: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Languages Sub-tab */}
              {activeSetupSubTab === 'languages' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Languages
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Configure which languages are available for your journal's user interface, forms, and submissions.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Primary Locale
                    </label>
                    <select
                      value={languages.primaryLocale}
                      onChange={(e) => setLanguages({ ...languages, primaryLocale: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="en_US">English (US)</option>
                      <option value="id_ID">Indonesian</option>
                      <option value="es_ES">Spanish</option>
                      <option value="fr_FR">French</option>
                    </select>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1rem',
                  }}>
                    Language management grid will be implemented here.
                  </p>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'supportedLocales',
                            setting_value: JSON.stringify(languages),
                            setting_type: 'string',
                            locale: '',
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Language settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving languages:', error);
                        setFeedback({ type: 'error', message: 'Failed to save language settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Navigation Menus Sub-tab */}
              {activeSetupSubTab === 'navigationMenus' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Navigation Menus
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Navigation menus management will be implemented here.
                  </p>
                </div>
              )}

              {/* Announcements Sub-tab */}
              {activeSetupSubTab === 'announcements' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'enableAnnouncements',
                        setting_value: announcements.enableAnnouncements ? '1' : '0',
                        setting_type: 'bool',
                        locale: '',
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Announcements settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving announcements:', error);
                    setFeedback({ type: 'error', message: 'Failed to save announcements settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Announcements
                  </h2>
                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="enableAnnouncements"
                      checked={announcements.enableAnnouncements}
                      onChange={(e) => setAnnouncements({ enableAnnouncements: e.target.checked })}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                    />
                    <label htmlFor="enableAnnouncements" style={{
                      fontSize: '0.875rem',
                      color: '#002C40',
                      cursor: 'pointer',
                    }}>
                      Enable Announcements
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Lists Sub-tab */}
              {activeSetupSubTab === 'lists' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'itemsPerPage',
                        setting_value: lists.itemsPerPage.toString(),
                        setting_type: 'int',
                        locale: '',
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Lists settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving lists:', error);
                    setFeedback({ type: 'error', message: 'Failed to save lists settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Lists
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Items Per Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={lists.itemsPerPage}
                      onChange={(e) => setLists({ itemsPerPage: parseInt(e.target.value) || 25 })}
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Privacy Sub-tab */}
              {activeSetupSubTab === 'privacy' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'privacyStatement',
                        setting_value: privacy.privacyStatement,
                        setting_type: 'string',
                        locale: primaryLocale,
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Privacy statement saved successfully.' });
                  } catch (error) {
                    console.error('Error saving privacy:', error);
                    setFeedback({ type: 'error', message: 'Failed to save privacy statement.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Privacy Statement
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Privacy Statement
                    </label>
                    <textarea
                      value={privacy.privacyStatement}
                      onChange={(e) => setPrivacy({ privacyStatement: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Date/Time Sub-tab */}
              {activeSetupSubTab === 'dateTime' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'timeZone', setting_value: dateTime.timeZone, locale: '' },
                      { setting_name: 'dateFormat', setting_value: dateTime.dateFormat, locale: '' },
                    ];
                    for (const setting of settings) {
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: setting.setting_name,
                          setting_value: setting.setting_value,
                          setting_type: 'string',
                          locale: setting.locale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                    }
                    setFeedback({ type: 'success', message: 'Date/Time settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving date/time:', error);
                    setFeedback({ type: 'error', message: 'Failed to save date/time settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Date/Time
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Time Zone
                    </label>
                    <select
                      value={dateTime.timeZone}
                      onChange={(e) => setDateTime({ ...dateTime, timeZone: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Date Format
                    </label>
                    <select
                      value={dateTime.dateFormat}
                      onChange={(e) => setDateTime({ ...dateTime, dateFormat: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Y-m-d">YYYY-MM-DD</option>
                      <option value="d/m/Y">DD/MM/YYYY</option>
                      <option value="m/d/Y">MM/DD/YYYY</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Plugins Tab */}
          {activeTab === 'plugins' && (
            <div>
              {/* Plugins Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActivePluginsSubTab('installedPlugins')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activePluginsSubTab === 'installedPlugins' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activePluginsSubTab === 'installedPlugins' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Installed Plugins
                </button>
                <button
                  onClick={() => setActivePluginsSubTab('pluginGallery')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activePluginsSubTab === 'pluginGallery' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activePluginsSubTab === 'pluginGallery' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Plugin Gallery
                </button>
              </div>

              {/* Installed Plugins Sub-tab */}
              {activePluginsSubTab === 'installedPlugins' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Installed Plugins
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Plugin management will be implemented here.
                  </p>
                </div>
              )}

              {/* Plugin Gallery Sub-tab */}
              {activePluginsSubTab === 'pluginGallery' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Plugin Gallery
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Plugin gallery will be implemented here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ManagerSettingsWebsitePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"appearance" | "setup" | "plugins">("appearance");
  const [activeAppearanceSubTab, setActiveAppearanceSubTab] = useState<"theme" | "setup" | "advanced">("theme");
  const [activeSetupSubTab, setActiveSetupSubTab] = useState<"information" | "languages" | "navigationMenus" | "announcements" | "lists" | "privacy" | "dateTime">("information");
  const [activePluginsSubTab, setActivePluginsSubTab] = useState<"installedPlugins" | "pluginGallery">("installedPlugins");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Get primary locale
  const [primaryLocale, setPrimaryLocale] = useState('en_US');

  // Appearance - Theme state
  const [theme, setTheme] = useState({ activeTheme: 'default' });

  // Appearance - Setup state
  const [appearanceSetup, setAppearanceSetup] = useState({ pageFooter: '' });

  // Appearance - Advanced state
  const [appearanceAdvanced, setAppearanceAdvanced] = useState({ customCss: '' });

  // Setup - Information state
  const [information, setInformation] = useState({ 
    journalTitle: '', 
    journalDescription: '', 
    aboutJournal: '' 
  });

  // Setup - Languages state
  const [languages, setLanguages] = useState<{
    primaryLocale: string;
    languages: Record<string, { ui: boolean; forms: boolean; submissions: boolean }>;
  }>({
    primaryLocale: 'en_US',
    languages: {}
  });

  // Setup - Announcements state
  const [announcements, setAnnouncements] = useState({ enableAnnouncements: false });

  // Setup - Lists state
  const [lists, setLists] = useState({ itemsPerPage: 25 });

  // Setup - Privacy state
  const [privacy, setPrivacy] = useState({ privacyStatement: '' });

  // Setup - Date/Time state
  const [dateTime, setDateTime] = useState({ timeZone: 'UTC', dateFormat: 'Y-m-d' });

  // Load settings from database
  useEffect(() => {
    if (!journalId) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Load journal to get primary_locale
        const { data: journal } = await supabase
          .from('journals')
          .select('primary_locale')
          .eq('id', journalId)
          .single();

        const locale = journal?.primary_locale || 'en_US';
        setPrimaryLocale(locale);

        // Load website settings from journal_settings
        // Some settings use primary locale, some use empty locale
        const { data: websiteSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value, locale')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'activeTheme', 'pageFooter', 'customCss',
            'enableAnnouncements', 'itemsPerPage', 'privacyStatement',
            'timeZone', 'dateFormat'
          ])
          .in('locale', [locale, '']);

        if (websiteSettings) {
          const settings: Record<string, string> = {};
          // Prioritize locale-specific settings, fallback to empty locale
          websiteSettings.forEach((s: any) => {
            if (!settings[s.setting_name] || s.locale === locale) {
              settings[s.setting_name] = s.setting_value || '';
            }
          });

          if (settings.activeTheme) setTheme({ activeTheme: settings.activeTheme });
          if (settings.pageFooter) setAppearanceSetup({ pageFooter: settings.pageFooter });
          if (settings.customCss) setAppearanceAdvanced({ customCss: settings.customCss });
          if (settings.enableAnnouncements) setAnnouncements({ enableAnnouncements: settings.enableAnnouncements === 'true' || settings.enableAnnouncements === '1' });
          if (settings.itemsPerPage) setLists({ itemsPerPage: parseInt(settings.itemsPerPage) || 25 });
          if (settings.privacyStatement) setPrivacy({ privacyStatement: settings.privacyStatement });
          if (settings.timeZone) setDateTime(prev => ({ ...prev, timeZone: settings.timeZone }));
          if (settings.dateFormat) setDateTime(prev => ({ ...prev, dateFormat: settings.dateFormat }));
        }

        // Load information from journal_settings (name, description, about)
        const { data: infoSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .in('setting_name', ['name', 'description', 'about'])
          .eq('locale', locale);

        if (infoSettings) {
          const info: Record<string, string> = {};
          infoSettings.forEach((s: any) => {
            info[s.setting_name] = s.setting_value || '';
          });
          setInformation({
            journalTitle: info.name || '',
            journalDescription: info.description || '',
            aboutJournal: info.about || '',
          });
        }

        // Load languages settings
        const { data: langSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .eq('setting_name', 'supportedLocales')
          .maybeSingle();

        if (langSettings?.setting_value) {
          try {
            const parsed = JSON.parse(langSettings.setting_value);
            if (parsed.languages) {
              setLanguages(parsed);
            }
          } catch {
            // Ignore parse error
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setFeedback({ type: 'error', message: 'Failed to load settings.' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [journalId]);

  // Auto-dismiss feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '100%',
      minHeight: '100%',
      backgroundColor: '#eaedee',
      padding: 0,
      margin: 0,
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Page Header - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #e5e5e5',
        padding: '1.5rem 0',
      }}>
        <div style={{ padding: '0 1.5rem' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <Link
              href="/manager"
              style={{
                color: '#006798',
                textDecoration: 'underline',
              }}
            >
              Dashboard
            </Link>
            <span style={{ color: '#6B7280', margin: '0 0.5rem' }}>»</span>
            <Link
              href="/manager/settings"
              style={{
                color: '#006798',
                textDecoration: 'underline',
              }}
            >
              Journal Settings
            </Link>
            <span style={{ color: '#6B7280', margin: '0 0.5rem' }}>»</span>
            <span style={{ color: '#111827' }}>Website</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Website Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure your journal's website appearance, navigation, languages, and plugins.
          </p>
        </div>
      </div>

      {/* Content - OJS PKP 3.3 Style */}
      <div style={{ padding: '0 1.5rem', marginTop: '1.5rem' }}>
        {/* Feedback Message */}
        {feedback && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '4px',
            backgroundColor: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
            color: feedback.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${feedback.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: '0.875rem',
          }}>
            {feedback.message}
          </div>
        )}

        {/* Main Tabs Navigation - OJS PKP 3.3 Style */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e5e5',
          display: 'flex',
          gap: 0,
        }}>
          <button
            onClick={() => setActiveTab('appearance')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'appearance' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'appearance' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'appearance' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'setup' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'setup' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'setup' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Setup
          </button>
          <button
            onClick={() => setActiveTab('plugins')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'plugins' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'plugins' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'plugins' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Plugins
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e5e5',
          borderTop: 'none',
          padding: '1.5rem',
          minHeight: '400px',
        }}>
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div>
              {/* Appearance Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActiveAppearanceSubTab('theme')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'theme' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'theme' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Theme
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab('setup')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'setup' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'setup' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Setup
                </button>
                <button
                  onClick={() => setActiveAppearanceSubTab('advanced')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeAppearanceSubTab === 'advanced' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeAppearanceSubTab === 'advanced' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Advanced
                </button>
              </div>

              {/* Theme Sub-tab */}
              {activeAppearanceSubTab === 'theme' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Theme
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Select the theme for your journal website.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Active Theme
                    </label>
                    <select
                      value={theme.activeTheme}
                      onChange={(e) => setTheme({ activeTheme: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="default">Default Theme</option>
                      <option value="custom">Custom Theme</option>
                    </select>
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'activeTheme',
                            setting_value: theme.activeTheme,
                            setting_type: 'string',
                            locale: primaryLocale,
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Theme settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving theme:', error);
                        setFeedback({ type: 'error', message: 'Failed to save theme settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Setup Sub-tab */}
              {activeAppearanceSubTab === 'setup' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Appearance Setup
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Page Footer
                    </label>
                    <textarea
                      value={appearanceSetup.pageFooter}
                      onChange={(e) => setAppearanceSetup({ pageFooter: e.target.value })}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'pageFooter',
                            setting_value: appearanceSetup.pageFooter,
                            setting_type: 'string',
                            locale: primaryLocale,
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Appearance setup saved successfully.' });
                      } catch (error) {
                        console.error('Error saving appearance setup:', error);
                        setFeedback({ type: 'error', message: 'Failed to save appearance setup.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Advanced Sub-tab */}
              {activeAppearanceSubTab === 'advanced' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Advanced Appearance
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Custom CSS
                    </label>
                    <textarea
                      value={appearanceAdvanced.customCss}
                      onChange={(e) => setAppearanceAdvanced({ customCss: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'customCss',
                            setting_value: appearanceAdvanced.customCss,
                            setting_type: 'string',
                            locale: '',
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Advanced appearance settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving advanced appearance:', error);
                        setFeedback({ type: 'error', message: 'Failed to save advanced appearance settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Setup Tab */}
          {activeTab === 'setup' && (
            <div>
              {/* Setup Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => setActiveSetupSubTab('information')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'information' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'information' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('languages')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'languages' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'languages' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Languages
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('navigationMenus')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'navigationMenus' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'navigationMenus' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Navigation Menus
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('announcements')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'announcements' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'announcements' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Announcements
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('lists')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'lists' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'lists' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Lists
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('privacy')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'privacy' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'privacy' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Privacy
                </button>
                <button
                  onClick={() => setActiveSetupSubTab('dateTime')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeSetupSubTab === 'dateTime' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeSetupSubTab === 'dateTime' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Date/Time
                </button>
              </div>

              {/* Information Sub-tab */}
              {activeSetupSubTab === 'information' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'name', setting_value: information.journalTitle, locale: primaryLocale },
                      { setting_name: 'description', setting_value: information.journalDescription, locale: primaryLocale },
                      { setting_name: 'about', setting_value: information.aboutJournal, locale: primaryLocale },
                    ];
                    for (const setting of settings) {
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: setting.setting_name,
                          setting_value: setting.setting_value,
                          setting_type: 'string',
                          locale: setting.locale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                    }
                    setFeedback({ type: 'success', message: 'Information settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving information:', error);
                    setFeedback({ type: 'error', message: 'Failed to save information settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Information
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Journal Title
                    </label>
                    <input
                      type="text"
                      value={information.journalTitle}
                      onChange={(e) => setInformation({ ...information, journalTitle: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Journal Description
                    </label>
                    <textarea
                      value={information.journalDescription}
                      onChange={(e) => setInformation({ ...information, journalDescription: e.target.value })}
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      About the Journal
                    </label>
                    <textarea
                      value={information.aboutJournal}
                      onChange={(e) => setInformation({ ...information, aboutJournal: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Languages Sub-tab */}
              {activeSetupSubTab === 'languages' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Languages
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Configure which languages are available for your journal's user interface, forms, and submissions.
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Primary Locale
                    </label>
                    <select
                      value={languages.primaryLocale}
                      onChange={(e) => setLanguages({ ...languages, primaryLocale: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="en_US">English (US)</option>
                      <option value="id_ID">Indonesian</option>
                      <option value="es_ES">Spanish</option>
                      <option value="fr_FR">French</option>
                    </select>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1rem',
                  }}>
                    Language management grid will be implemented here.
                  </p>
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const supabase = getSupabaseClient();
                        const { error } = await supabase
                          .from('journal_settings')
                          .upsert({
                            journal_id: journalId,
                            setting_name: 'supportedLocales',
                            setting_value: JSON.stringify(languages),
                            setting_type: 'string',
                            locale: '',
                          }, {
                            onConflict: 'journal_id,setting_name,locale'
                          });
                        if (error) throw error;
                        setFeedback({ type: 'success', message: 'Language settings saved successfully.' });
                      } catch (error) {
                        console.error('Error saving languages:', error);
                        setFeedback({ type: 'error', message: 'Failed to save language settings.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Navigation Menus Sub-tab */}
              {activeSetupSubTab === 'navigationMenus' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Navigation Menus
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Navigation menus management will be implemented here.
                  </p>
                </div>
              )}

              {/* Announcements Sub-tab */}
              {activeSetupSubTab === 'announcements' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'enableAnnouncements',
                        setting_value: announcements.enableAnnouncements ? '1' : '0',
                        setting_type: 'bool',
                        locale: '',
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Announcements settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving announcements:', error);
                    setFeedback({ type: 'error', message: 'Failed to save announcements settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Announcements
                  </h2>
                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="enableAnnouncements"
                      checked={announcements.enableAnnouncements}
                      onChange={(e) => setAnnouncements({ enableAnnouncements: e.target.checked })}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                    />
                    <label htmlFor="enableAnnouncements" style={{
                      fontSize: '0.875rem',
                      color: '#002C40',
                      cursor: 'pointer',
                    }}>
                      Enable Announcements
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Lists Sub-tab */}
              {activeSetupSubTab === 'lists' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'itemsPerPage',
                        setting_value: lists.itemsPerPage.toString(),
                        setting_type: 'int',
                        locale: '',
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Lists settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving lists:', error);
                    setFeedback({ type: 'error', message: 'Failed to save lists settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Lists
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Items Per Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={lists.itemsPerPage}
                      onChange={(e) => setLists({ itemsPerPage: parseInt(e.target.value) || 25 })}
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Privacy Sub-tab */}
              {activeSetupSubTab === 'privacy' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const { error } = await supabase
                      .from('journal_settings')
                      .upsert({
                        journal_id: journalId,
                        setting_name: 'privacyStatement',
                        setting_value: privacy.privacyStatement,
                        setting_type: 'string',
                        locale: primaryLocale,
                      }, {
                        onConflict: 'journal_id,setting_name,locale'
                      });
                    if (error) throw error;
                    setFeedback({ type: 'success', message: 'Privacy statement saved successfully.' });
                  } catch (error) {
                    console.error('Error saving privacy:', error);
                    setFeedback({ type: 'error', message: 'Failed to save privacy statement.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Privacy Statement
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Privacy Statement
                    </label>
                    <textarea
                      value={privacy.privacyStatement}
                      onChange={(e) => setPrivacy({ privacyStatement: e.target.value })}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        fontFamily: 'Arial, sans-serif',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}

              {/* Date/Time Sub-tab */}
              {activeSetupSubTab === 'dateTime' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'timeZone', setting_value: dateTime.timeZone, locale: '' },
                      { setting_name: 'dateFormat', setting_value: dateTime.dateFormat, locale: '' },
                    ];
                    for (const setting of settings) {
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: setting.setting_name,
                          setting_value: setting.setting_value,
                          setting_type: 'string',
                          locale: setting.locale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                    }
                    setFeedback({ type: 'success', message: 'Date/Time settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving date/time:', error);
                    setFeedback({ type: 'error', message: 'Failed to save date/time settings.' });
                  } finally {
                    setSaving(false);
                  }
                }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Date/Time
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Time Zone
                    </label>
                    <select
                      value={dateTime.timeZone}
                      onChange={(e) => setDateTime({ ...dateTime, timeZone: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="UTC">UTC</option>
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Date Format
                    </label>
                    <select
                      value={dateTime.dateFormat}
                      onChange={(e) => setDateTime({ ...dateTime, dateFormat: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '300px',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="Y-m-d">YYYY-MM-DD</option>
                      <option value="d/m/Y">DD/MM/YYYY</option>
                      <option value="m/d/Y">MM/DD/YYYY</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      backgroundColor: saving ? '#6c757d' : '#006798',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Plugins Tab */}
          {activeTab === 'plugins' && (
            <div>
              {/* Plugins Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActivePluginsSubTab('installedPlugins')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activePluginsSubTab === 'installedPlugins' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activePluginsSubTab === 'installedPlugins' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Installed Plugins
                </button>
                <button
                  onClick={() => setActivePluginsSubTab('pluginGallery')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activePluginsSubTab === 'pluginGallery' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activePluginsSubTab === 'pluginGallery' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Plugin Gallery
                </button>
              </div>

              {/* Installed Plugins Sub-tab */}
              {activePluginsSubTab === 'installedPlugins' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Installed Plugins
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Plugin management will be implemented here.
                  </p>
                </div>
              )}

              {/* Plugin Gallery Sub-tab */}
              {activePluginsSubTab === 'pluginGallery' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Plugin Gallery
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Plugin gallery will be implemented here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

