"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

type SectionItem = {
  id: string;
  title: string;
  abbreviation: string;
  enabled: boolean;
  policy?: string;
};

type CategoryItem = {
  id: string;
  title: string;
  path: string;
  description?: string;
};

type MastheadData = {
  name: string;
  acronym: string;
  abbreviation: string;
  description: string;
  editorialTeam: string;
  about: string;
  publisherInstitution: string;
  publisherUrl: string;
  onlineIssn: string;
  printIssn: string;
};

type ContactData = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAffiliation: string;
  mailingAddress: string;
  supportName: string;
  supportEmail: string;
  supportPhone: string;
};

export default function ManagerSettingsContextPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"masthead" | "contact" | "sections" | "categories">("masthead");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Masthead form state
  const [masthead, setMasthead] = useState<MastheadData>({
    name: '',
    acronym: '',
    abbreviation: '',
    description: '',
    editorialTeam: '',
    about: '',
    publisherInstitution: '',
    publisherUrl: '',
    onlineIssn: '',
    printIssn: '',
  });

  // Contact form state
  const [contact, setContact] = useState<ContactData>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactAffiliation: '',
    mailingAddress: '',
    supportName: '',
    supportEmail: '',
    supportPhone: '',
  });

  // Sections state
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [newSection, setNewSection] = useState<Omit<SectionItem, 'id'>>({
    title: '',
    abbreviation: '',
    enabled: true,
    policy: '',
  });

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCategory, setNewCategory] = useState<Omit<CategoryItem, 'id'>>({
    title: '',
    path: '',
    description: '',
  });

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

        const primaryLocale = journal?.primary_locale || 'en_US';

        // Load masthead data from journal_settings (OJS PKP 3.3 structure)
        const { data: mastheadSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'name', 'acronym', 'abbreviation', 'description', 'editorialTeam', 'about',
            'publisherInstitution', 'publisherUrl', 'onlineIssn', 'printIssn'
          ])
          .eq('locale', primaryLocale);

        if (mastheadSettings) {
          const mastheadData: Record<string, string> = {};
          mastheadSettings.forEach((s: any) => {
            mastheadData[s.setting_name] = s.setting_value || '';
          });
          setMasthead({
            name: mastheadData.name || '',
            acronym: mastheadData.acronym || '',
            abbreviation: mastheadData.abbreviation || '',
            description: mastheadData.description || '',
            editorialTeam: mastheadData.editorialTeam || '',
            about: mastheadData.about || '',
            publisherInstitution: mastheadData.publisherInstitution || '',
            publisherUrl: mastheadData.publisherUrl || '',
            onlineIssn: mastheadData.onlineIssn || '',
            printIssn: mastheadData.printIssn || '',
          });
        }

        // Load contact data from journal_settings (OJS PKP 3.3 - contact settings don't use locale)
        const { data: contactSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .eq('locale', '') // Contact settings in OJS 3.3 don't use locale
          .in('setting_name', [
            'contactName', 'contactEmail', 'contactPhone', 'contactAffiliation', 'mailingAddress',
            'supportName', 'supportEmail', 'supportPhone'
          ]);

        if (contactSettings) {
          const contactData: Partial<ContactData> = {};
          contactSettings.forEach((s: any) => {
            const key = s.setting_name as keyof ContactData;
            contactData[key] = s.setting_value as string;
          });
          setContact(prev => ({ ...prev, ...contactData }));
        }

        // Load sections with settings
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('*')
          .eq('journal_id', journalId)
          .order('seq', { ascending: true });

        if (sectionsData && sectionsData.length > 0) {
          const sectionIds = sectionsData.map((s: any) => s.id);
          
          // Load section settings using primary locale (fallback to empty string)
          const { data: sectionSettings } = await supabase
            .from('section_settings')
            .select('*')
            .in('section_id', sectionIds)
            .in('locale', [primaryLocale, '']); // Primary locale and fallback to empty

          const settingsMap = new Map();
          (sectionSettings || []).forEach((s: any) => {
            if (!settingsMap.has(s.section_id)) {
              settingsMap.set(s.section_id, {});
            }
            // Prioritize primary locale over empty locale
            const existing = settingsMap.get(s.section_id)[s.setting_name];
            if (!existing || s.locale === primaryLocale) {
              settingsMap.get(s.section_id)[s.setting_name] = s.setting_value;
            }
          });

          setSections(sectionsData.map((s: any) => {
            const settings = settingsMap.get(s.id) || {};
            return {
              id: s.id,
              title: settings.title || '',
              abbreviation: settings.abbrev || '',
              enabled: !s.is_inactive,
              policy: settings.policy || '',
            };
          }));
        }

        // Load categories - Using journal_settings for now if categories table doesn't exist
        // In OJS 3.3, categories have their own table, but we'll use journal_settings as fallback
        const { data: categoriesData } = await supabase
          .from('journal_settings')
          .select('setting_value')
          .eq('journal_id', journalId)
          .eq('setting_name', 'categories')
          .maybeSingle();

        if (categoriesData && categoriesData.setting_value) {
          try {
            const parsed = JSON.parse(categoriesData.setting_value);
            if (Array.isArray(parsed)) {
              setCategories(parsed);
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

  const generateId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);

  // Save handlers
  const handleSaveMasthead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalId) return;

    setSaving(true);
    setFeedback(null);

    try {
      const supabase = getSupabaseClient();

      // Get primary locale from journal
      const { data: journal } = await supabase
        .from('journals')
        .select('primary_locale')
        .eq('id', journalId)
        .single();

      const primaryLocale = journal?.primary_locale || 'en_US';

      // Save masthead data to journal_settings (OJS PKP 3.3 structure)
      const settings = [
        { setting_name: 'name', setting_value: masthead.name, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'acronym', setting_value: masthead.acronym, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'abbreviation', setting_value: masthead.abbreviation, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'description', setting_value: masthead.description, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'editorialTeam', setting_value: masthead.editorialTeam, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'about', setting_value: masthead.about, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'publisherInstitution', setting_value: masthead.publisherInstitution, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'publisherUrl', setting_value: masthead.publisherUrl, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'onlineIssn', setting_value: masthead.onlineIssn, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'printIssn', setting_value: masthead.printIssn, setting_type: 'string', locale: primaryLocale },
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('journal_settings')
          .upsert({
            journal_id: journalId,
            setting_name: setting.setting_name,
            setting_value: setting.setting_value,
            setting_type: setting.setting_type,
            locale: setting.locale,
          }, {
            onConflict: 'journal_id,setting_name,locale'
          });

        if (error) throw error;
      }

      setFeedback({ type: 'success', message: 'Masthead settings saved successfully.' });
    } catch (error) {
      console.error('Error saving masthead:', error);
      setFeedback({ type: 'error', message: 'Failed to save masthead settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalId) return;

    setSaving(true);
    setFeedback(null);

    try {
      const supabase = getSupabaseClient();

      // Contact settings in OJS PKP 3.3 don't use locale (locale = '')
      const settings = [
        { setting_name: 'contactName', setting_value: contact.contactName, locale: '' },
        { setting_name: 'contactEmail', setting_value: contact.contactEmail, locale: '' },
        { setting_name: 'contactPhone', setting_value: contact.contactPhone, locale: '' },
        { setting_name: 'contactAffiliation', setting_value: contact.contactAffiliation, locale: '' },
        { setting_name: 'mailingAddress', setting_value: contact.mailingAddress, locale: '' },
        { setting_name: 'supportName', setting_value: contact.supportName, locale: '' },
        { setting_name: 'supportEmail', setting_value: contact.supportEmail, locale: '' },
        { setting_name: 'supportPhone', setting_value: contact.supportPhone, locale: '' },
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

      setFeedback({ type: 'success', message: 'Contact settings saved successfully.' });
    } catch (error) {
      console.error('Error saving contact:', error);
      setFeedback({ type: 'error', message: 'Failed to save contact settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!journalId || !newSection.title.trim()) {
      setFeedback({ type: 'error', message: 'Section title is required.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      const { data: maxSeq } = await supabase
        .from('sections')
        .select('seq')
        .eq('journal_id', journalId)
        .order('seq', { ascending: false })
        .limit(1)
        .single();

      // Insert section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          journal_id: journalId,
          is_inactive: !newSection.enabled,
          seq: (maxSeq?.seq || 0) + 1,
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      // Get primary locale from journal
      const { data: journal } = await supabase
        .from('journals')
        .select('primary_locale')
        .eq('id', journalId)
        .single();

      const primaryLocale = journal?.primary_locale || 'en_US';

      // Insert section settings with primary locale (OJS PKP 3.3 structure)
      const sectionId = sectionData.id;
      const abbrev = newSection.abbreviation.trim() || newSection.title.trim().slice(0, 3).toUpperCase();
      
      const settings = [
        { section_id: sectionId, setting_name: 'title', setting_value: newSection.title.trim(), setting_type: 'string', locale: primaryLocale },
        { section_id: sectionId, setting_name: 'abbrev', setting_value: abbrev, setting_type: 'string', locale: primaryLocale },
      ];

      if (newSection.policy?.trim()) {
        settings.push({
          section_id: sectionId,
          setting_name: 'policy',
          setting_value: newSection.policy.trim(),
          setting_type: 'string',
          locale: primaryLocale
        });
      }

      const { error: settingsError } = await supabase
        .from('section_settings')
        .insert(settings);

      if (settingsError) throw settingsError;

      setSections([...sections, {
        id: sectionId,
        title: newSection.title.trim(),
        abbreviation: abbrev,
        enabled: newSection.enabled,
        policy: newSection.policy?.trim() || '',
      }]);

      setNewSection({ title: '', abbreviation: '', enabled: true, policy: '' });
      setFeedback({ type: 'success', message: 'Section added successfully.' });
    } catch (error) {
      console.error('Error adding section:', error);
      setFeedback({ type: 'error', message: 'Failed to add section.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!journalId) return;

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      // Delete section_settings first (foreign key constraint)
      const { error: settingsError } = await supabase
        .from('section_settings')
        .delete()
        .eq('section_id', id);

      if (settingsError) throw settingsError;

      // Delete section
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id)
        .eq('journal_id', journalId);

      if (error) throw error;

      setSections(sections.filter(s => s.id !== id));
      setFeedback({ type: 'success', message: 'Section deleted successfully.' });
    } catch (error) {
      console.error('Error deleting section:', error);
      setFeedback({ type: 'error', message: 'Failed to delete section.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!journalId || !newCategory.title.trim() || !newCategory.path.trim()) {
      setFeedback({ type: 'error', message: 'Category title and path are required.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      const { data: maxSeq } = await supabase
        .from('categories')
        .select('seq')
        .eq('journal_id', journalId)
        .order('seq', { ascending: false })
        .limit(1)
        .single();

      // Categories stored in journal_settings as JSON array
      const newCategoryItem = {
        id: generateId(),
        title: newCategory.title.trim(),
        path: newCategory.path.trim(),
        description: newCategory.description?.trim() || '',
      };

      const updatedCategories = [...categories, newCategoryItem];

      const { error } = await supabase
        .from('journal_settings')
        .upsert({
          journal_id: journalId,
          setting_name: 'categories',
          setting_value: JSON.stringify(updatedCategories),
          setting_type: 'string',
        }, {
          onConflict: 'journal_id,setting_name'
        });

      if (error) throw error;

      setCategories(updatedCategories);

      setNewCategory({ title: '', path: '', description: '' });
      setFeedback({ type: 'success', message: 'Category added successfully.' });
    } catch (error) {
      console.error('Error adding category:', error);
      setFeedback({ type: 'error', message: 'Failed to add category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!journalId) return;

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      // Update categories in journal_settings
      const updatedCategories = categories.filter(c => c.id !== id);

      const { error } = await supabase
        .from('journal_settings')
        .upsert({
          journal_id: journalId,
          setting_name: 'categories',
          setting_value: JSON.stringify(updatedCategories),
          setting_type: 'string',
        }, {
          onConflict: 'journal_id,setting_name'
        });

      if (error) throw error;

      setCategories(updatedCategories);
      setFeedback({ type: 'success', message: 'Category deleted successfully.' });
    } catch (error) {
      console.error('Error deleting category:', error);
      setFeedback({ type: 'error', message: 'Failed to delete category.' });
    } finally {
      setSaving(false);
    }
  };

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
            <span style={{ color: '#111827' }}>Journal Information</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Journal Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure basic details about the journal, including title, description, masthead, contact information, sections, and categories.
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

        {/* Tabs Navigation - OJS PKP 3.3 Style */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e5e5',
          display: 'flex',
          gap: 0,
        }}>
          <button
            onClick={() => setActiveTab('masthead')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'masthead' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'masthead' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'masthead' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Masthead
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'contact' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'contact' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'contact' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Contact
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'sections' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'sections' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'sections' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sections
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'categories' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'categories' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'categories' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Categories
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
          {/* Masthead Tab */}
          {activeTab === 'masthead' && (
            <form onSubmit={handleSaveMasthead}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Identity
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Title <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={masthead.name}
                    onChange={(e) => setMasthead({ ...masthead, name: e.target.value })}
                    required
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
                    Journal Initials <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={masthead.acronym}
                    onChange={(e) => setMasthead({ ...masthead, acronym: e.target.value })}
                    required
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

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Abbreviation
                  </label>
                  <input
                    type="text"
                    value={masthead.abbreviation}
                    onChange={(e) => setMasthead({ ...masthead, abbreviation: e.target.value })}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Key Information
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Summary
                  </label>
                  <textarea
                    value={masthead.description}
                    onChange={(e) => setMasthead({ ...masthead, description: e.target.value })}
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
                    Editorial Team
                  </label>
                  <textarea
                    value={masthead.editorialTeam}
                    onChange={(e) => setMasthead({ ...masthead, editorialTeam: e.target.value })}
                    rows={8}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Publishing
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={masthead.publisherInstitution}
                    onChange={(e) => setMasthead({ ...masthead, publisherInstitution: e.target.value })}
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
                    Publisher URL
                  </label>
                  <input
                    type="url"
                    value={masthead.publisherUrl}
                    onChange={(e) => setMasthead({ ...masthead, publisherUrl: e.target.value })}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Online ISSN
                    </label>
                    <input
                      type="text"
                      value={masthead.onlineIssn}
                      onChange={(e) => setMasthead({ ...masthead, onlineIssn: e.target.value })}
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
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Print ISSN
                    </label>
                    <input
                      type="text"
                      value={masthead.printIssn}
                      onChange={(e) => setMasthead({ ...masthead, printIssn: e.target.value })}
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
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  About the Journal
                </h2>
                
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
                    value={masthead.about}
                    onChange={(e) => setMasthead({ ...masthead, about: e.target.value })}
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
                  transition: 'background-color 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContact}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Principal Contact
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  The principal contact is the automatic sender and receiver for some automated emails.
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Name <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.contactName}
                    onChange={(e) => setContact({ ...contact, contactName: e.target.value })}
                    required
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
                    Email <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.contactEmail}
                    onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })}
                    required
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contact.contactPhone}
                    onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })}
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
                    Affiliation
                  </label>
                  <input
                    type="text"
                    value={contact.contactAffiliation}
                    onChange={(e) => setContact({ ...contact, contactAffiliation: e.target.value })}
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
                    Mailing Address
                  </label>
                  <textarea
                    value={contact.mailingAddress}
                    onChange={(e) => setContact({ ...contact, mailingAddress: e.target.value })}
                    rows={4}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Technical Support Contact
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Contact information for technical support inquiries.
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Name <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.supportName}
                    onChange={(e) => setContact({ ...contact, supportName: e.target.value })}
                    required
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
                    Email <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.supportEmail}
                    onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })}
                    required
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contact.supportPhone}
                    onChange={(e) => setContact({ ...contact, supportPhone: e.target.value })}
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
                  transition: 'background-color 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Sections
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Sections allow you to publish submissions in different sections of the journal, such as Articles, Reviews, etc.
                </p>

                {/* Add Section Form */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Add New Section
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Section Title <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newSection.title}
                        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                        placeholder="e.g., Articles"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Abbreviation
                      </label>
                      <input
                        type="text"
                        value={newSection.abbreviation}
                        onChange={(e) => setNewSection({ ...newSection, abbreviation: e.target.value })}
                        placeholder="e.g., ART"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Policy / Description
                      </label>
                      <textarea
                        value={newSection.policy || ''}
                        onChange={(e) => setNewSection({ ...newSection, policy: e.target.value })}
                        rows={3}
                        placeholder="Section policy or description..."
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="section-enabled"
                        checked={newSection.enabled}
                        onChange={(e) => setNewSection({ ...newSection, enabled: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="section-enabled" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Enabled
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      disabled={saving || !newSection.title.trim()}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: saving || !newSection.title.trim() ? '#6c757d' : '#006798',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving || !newSection.title.trim() ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Add Section
                    </button>
                  </div>
                </div>

                {/* Sections Table */}
                <div style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #dee2e6',
                      }}>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Section
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Abbreviation
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Enabled
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.length > 0 ? (
                        sections.map((section) => (
                          <tr key={section.id} style={{
                            borderBottom: '1px solid #dee2e6',
                          }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{section.title}</div>
                              {section.policy && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(0, 0, 0, 0.54)',
                                  marginTop: '0.25rem',
                                }}>
                                  {section.policy}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              {section.abbreviation}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: section.enabled ? '#d4edda' : '#f8d7da',
                                color: section.enabled ? '#155724' : '#721c24',
                              }}>
                                {section.enabled ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(section.id)}
                                disabled={saving}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  backgroundColor: saving ? '#6c757d' : '#dc3545',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.54)',
                            fontSize: '0.875rem',
                          }}>
                            No sections found. Use the form above to add a new section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Categories
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Categories can be used to organize and filter content across the journal.
                </p>

                {/* Add Category Form */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Add New Category
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Category Title <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newCategory.title}
                        onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                        placeholder="e.g., Computer Science"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Path <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newCategory.path}
                        onChange={(e) => setNewCategory({ ...newCategory, path: e.target.value })}
                        placeholder="e.g., computer-science"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Description
                      </label>
                      <textarea
                        value={newCategory.description || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        rows={3}
                        placeholder="Category description..."
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
                      type="button"
                      onClick={handleAddCategory}
                      disabled={saving || !newCategory.title.trim() || !newCategory.path.trim()}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: saving || !newCategory.title.trim() || !newCategory.path.trim() ? '#6c757d' : '#006798',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving || !newCategory.title.trim() || !newCategory.path.trim() ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Add Category
                    </button>
                  </div>
                </div>

                {/* Categories Table */}
                <div style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #dee2e6',
                      }}>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Category
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Path
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <tr key={category.id} style={{
                            borderBottom: '1px solid #dee2e6',
                          }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{category.title}</div>
                              {category.description && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(0, 0, 0, 0.54)',
                                  marginTop: '0.25rem',
                                }}>
                                  {category.description}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              {category.path}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={saving}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  backgroundColor: saving ? '#6c757d' : '#dc3545',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.54)',
                            fontSize: '0.875rem',
                          }}>
                            No categories found. Use the form above to add a category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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

type SectionItem = {
  id: string;
  title: string;
  abbreviation: string;
  enabled: boolean;
  policy?: string;
};

type CategoryItem = {
  id: string;
  title: string;
  path: string;
  description?: string;
};

type MastheadData = {
  name: string;
  acronym: string;
  abbreviation: string;
  description: string;
  editorialTeam: string;
  about: string;
  publisherInstitution: string;
  publisherUrl: string;
  onlineIssn: string;
  printIssn: string;
};

type ContactData = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAffiliation: string;
  mailingAddress: string;
  supportName: string;
  supportEmail: string;
  supportPhone: string;
};

export default function ManagerSettingsContextPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"masthead" | "contact" | "sections" | "categories">("masthead");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Masthead form state
  const [masthead, setMasthead] = useState<MastheadData>({
    name: '',
    acronym: '',
    abbreviation: '',
    description: '',
    editorialTeam: '',
    about: '',
    publisherInstitution: '',
    publisherUrl: '',
    onlineIssn: '',
    printIssn: '',
  });

  // Contact form state
  const [contact, setContact] = useState<ContactData>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactAffiliation: '',
    mailingAddress: '',
    supportName: '',
    supportEmail: '',
    supportPhone: '',
  });

  // Sections state
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [newSection, setNewSection] = useState<Omit<SectionItem, 'id'>>({
    title: '',
    abbreviation: '',
    enabled: true,
    policy: '',
  });

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCategory, setNewCategory] = useState<Omit<CategoryItem, 'id'>>({
    title: '',
    path: '',
    description: '',
  });

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

        const primaryLocale = journal?.primary_locale || 'en_US';

        // Load masthead data from journal_settings (OJS PKP 3.3 structure)
        const { data: mastheadSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'name', 'acronym', 'abbreviation', 'description', 'editorialTeam', 'about',
            'publisherInstitution', 'publisherUrl', 'onlineIssn', 'printIssn'
          ])
          .eq('locale', primaryLocale);

        if (mastheadSettings) {
          const mastheadData: Record<string, string> = {};
          mastheadSettings.forEach((s: any) => {
            mastheadData[s.setting_name] = s.setting_value || '';
          });
          setMasthead({
            name: mastheadData.name || '',
            acronym: mastheadData.acronym || '',
            abbreviation: mastheadData.abbreviation || '',
            description: mastheadData.description || '',
            editorialTeam: mastheadData.editorialTeam || '',
            about: mastheadData.about || '',
            publisherInstitution: mastheadData.publisherInstitution || '',
            publisherUrl: mastheadData.publisherUrl || '',
            onlineIssn: mastheadData.onlineIssn || '',
            printIssn: mastheadData.printIssn || '',
          });
        }

        // Load contact data from journal_settings (OJS PKP 3.3 - contact settings don't use locale)
        const { data: contactSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .eq('locale', '') // Contact settings in OJS 3.3 don't use locale
          .in('setting_name', [
            'contactName', 'contactEmail', 'contactPhone', 'contactAffiliation', 'mailingAddress',
            'supportName', 'supportEmail', 'supportPhone'
          ]);

        if (contactSettings) {
          const contactData: Partial<ContactData> = {};
          contactSettings.forEach((s: any) => {
            const key = s.setting_name as keyof ContactData;
            contactData[key] = s.setting_value as string;
          });
          setContact(prev => ({ ...prev, ...contactData }));
        }

        // Load sections with settings
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('*')
          .eq('journal_id', journalId)
          .order('seq', { ascending: true });

        if (sectionsData && sectionsData.length > 0) {
          const sectionIds = sectionsData.map((s: any) => s.id);
          
          // Load section settings using primary locale (fallback to empty string)
          const { data: sectionSettings } = await supabase
            .from('section_settings')
            .select('*')
            .in('section_id', sectionIds)
            .in('locale', [primaryLocale, '']); // Primary locale and fallback to empty

          const settingsMap = new Map();
          (sectionSettings || []).forEach((s: any) => {
            if (!settingsMap.has(s.section_id)) {
              settingsMap.set(s.section_id, {});
            }
            // Prioritize primary locale over empty locale
            const existing = settingsMap.get(s.section_id)[s.setting_name];
            if (!existing || s.locale === primaryLocale) {
              settingsMap.get(s.section_id)[s.setting_name] = s.setting_value;
            }
          });

          setSections(sectionsData.map((s: any) => {
            const settings = settingsMap.get(s.id) || {};
            return {
              id: s.id,
              title: settings.title || '',
              abbreviation: settings.abbrev || '',
              enabled: !s.is_inactive,
              policy: settings.policy || '',
            };
          }));
        }

        // Load categories - Using journal_settings for now if categories table doesn't exist
        // In OJS 3.3, categories have their own table, but we'll use journal_settings as fallback
        const { data: categoriesData } = await supabase
          .from('journal_settings')
          .select('setting_value')
          .eq('journal_id', journalId)
          .eq('setting_name', 'categories')
          .maybeSingle();

        if (categoriesData && categoriesData.setting_value) {
          try {
            const parsed = JSON.parse(categoriesData.setting_value);
            if (Array.isArray(parsed)) {
              setCategories(parsed);
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

  const generateId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);

  // Save handlers
  const handleSaveMasthead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalId) return;

    setSaving(true);
    setFeedback(null);

    try {
      const supabase = getSupabaseClient();

      // Get primary locale from journal
      const { data: journal } = await supabase
        .from('journals')
        .select('primary_locale')
        .eq('id', journalId)
        .single();

      const primaryLocale = journal?.primary_locale || 'en_US';

      // Save masthead data to journal_settings (OJS PKP 3.3 structure)
      const settings = [
        { setting_name: 'name', setting_value: masthead.name, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'acronym', setting_value: masthead.acronym, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'abbreviation', setting_value: masthead.abbreviation, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'description', setting_value: masthead.description, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'editorialTeam', setting_value: masthead.editorialTeam, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'about', setting_value: masthead.about, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'publisherInstitution', setting_value: masthead.publisherInstitution, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'publisherUrl', setting_value: masthead.publisherUrl, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'onlineIssn', setting_value: masthead.onlineIssn, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'printIssn', setting_value: masthead.printIssn, setting_type: 'string', locale: primaryLocale },
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('journal_settings')
          .upsert({
            journal_id: journalId,
            setting_name: setting.setting_name,
            setting_value: setting.setting_value,
            setting_type: setting.setting_type,
            locale: setting.locale,
          }, {
            onConflict: 'journal_id,setting_name,locale'
          });

        if (error) throw error;
      }

      setFeedback({ type: 'success', message: 'Masthead settings saved successfully.' });
    } catch (error) {
      console.error('Error saving masthead:', error);
      setFeedback({ type: 'error', message: 'Failed to save masthead settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalId) return;

    setSaving(true);
    setFeedback(null);

    try {
      const supabase = getSupabaseClient();

      // Contact settings in OJS PKP 3.3 don't use locale (locale = '')
      const settings = [
        { setting_name: 'contactName', setting_value: contact.contactName, locale: '' },
        { setting_name: 'contactEmail', setting_value: contact.contactEmail, locale: '' },
        { setting_name: 'contactPhone', setting_value: contact.contactPhone, locale: '' },
        { setting_name: 'contactAffiliation', setting_value: contact.contactAffiliation, locale: '' },
        { setting_name: 'mailingAddress', setting_value: contact.mailingAddress, locale: '' },
        { setting_name: 'supportName', setting_value: contact.supportName, locale: '' },
        { setting_name: 'supportEmail', setting_value: contact.supportEmail, locale: '' },
        { setting_name: 'supportPhone', setting_value: contact.supportPhone, locale: '' },
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

      setFeedback({ type: 'success', message: 'Contact settings saved successfully.' });
    } catch (error) {
      console.error('Error saving contact:', error);
      setFeedback({ type: 'error', message: 'Failed to save contact settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!journalId || !newSection.title.trim()) {
      setFeedback({ type: 'error', message: 'Section title is required.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      const { data: maxSeq } = await supabase
        .from('sections')
        .select('seq')
        .eq('journal_id', journalId)
        .order('seq', { ascending: false })
        .limit(1)
        .single();

      // Insert section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          journal_id: journalId,
          is_inactive: !newSection.enabled,
          seq: (maxSeq?.seq || 0) + 1,
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      // Get primary locale from journal
      const { data: journal } = await supabase
        .from('journals')
        .select('primary_locale')
        .eq('id', journalId)
        .single();

      const primaryLocale = journal?.primary_locale || 'en_US';

      // Insert section settings with primary locale (OJS PKP 3.3 structure)
      const sectionId = sectionData.id;
      const abbrev = newSection.abbreviation.trim() || newSection.title.trim().slice(0, 3).toUpperCase();
      
      const settings = [
        { section_id: sectionId, setting_name: 'title', setting_value: newSection.title.trim(), setting_type: 'string', locale: primaryLocale },
        { section_id: sectionId, setting_name: 'abbrev', setting_value: abbrev, setting_type: 'string', locale: primaryLocale },
      ];

      if (newSection.policy?.trim()) {
        settings.push({
          section_id: sectionId,
          setting_name: 'policy',
          setting_value: newSection.policy.trim(),
          setting_type: 'string',
          locale: primaryLocale
        });
      }

      const { error: settingsError } = await supabase
        .from('section_settings')
        .insert(settings);

      if (settingsError) throw settingsError;

      setSections([...sections, {
        id: sectionId,
        title: newSection.title.trim(),
        abbreviation: abbrev,
        enabled: newSection.enabled,
        policy: newSection.policy?.trim() || '',
      }]);

      setNewSection({ title: '', abbreviation: '', enabled: true, policy: '' });
      setFeedback({ type: 'success', message: 'Section added successfully.' });
    } catch (error) {
      console.error('Error adding section:', error);
      setFeedback({ type: 'error', message: 'Failed to add section.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!journalId) return;

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      // Delete section_settings first (foreign key constraint)
      const { error: settingsError } = await supabase
        .from('section_settings')
        .delete()
        .eq('section_id', id);

      if (settingsError) throw settingsError;

      // Delete section
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id)
        .eq('journal_id', journalId);

      if (error) throw error;

      setSections(sections.filter(s => s.id !== id));
      setFeedback({ type: 'success', message: 'Section deleted successfully.' });
    } catch (error) {
      console.error('Error deleting section:', error);
      setFeedback({ type: 'error', message: 'Failed to delete section.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!journalId || !newCategory.title.trim() || !newCategory.path.trim()) {
      setFeedback({ type: 'error', message: 'Category title and path are required.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      const { data: maxSeq } = await supabase
        .from('categories')
        .select('seq')
        .eq('journal_id', journalId)
        .order('seq', { ascending: false })
        .limit(1)
        .single();

      // Categories stored in journal_settings as JSON array
      const newCategoryItem = {
        id: generateId(),
        title: newCategory.title.trim(),
        path: newCategory.path.trim(),
        description: newCategory.description?.trim() || '',
      };

      const updatedCategories = [...categories, newCategoryItem];

      const { error } = await supabase
        .from('journal_settings')
        .upsert({
          journal_id: journalId,
          setting_name: 'categories',
          setting_value: JSON.stringify(updatedCategories),
          setting_type: 'string',
        }, {
          onConflict: 'journal_id,setting_name'
        });

      if (error) throw error;

      setCategories(updatedCategories);

      setNewCategory({ title: '', path: '', description: '' });
      setFeedback({ type: 'success', message: 'Category added successfully.' });
    } catch (error) {
      console.error('Error adding category:', error);
      setFeedback({ type: 'error', message: 'Failed to add category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!journalId) return;

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      // Update categories in journal_settings
      const updatedCategories = categories.filter(c => c.id !== id);

      const { error } = await supabase
        .from('journal_settings')
        .upsert({
          journal_id: journalId,
          setting_name: 'categories',
          setting_value: JSON.stringify(updatedCategories),
          setting_type: 'string',
        }, {
          onConflict: 'journal_id,setting_name'
        });

      if (error) throw error;

      setCategories(updatedCategories);
      setFeedback({ type: 'success', message: 'Category deleted successfully.' });
    } catch (error) {
      console.error('Error deleting category:', error);
      setFeedback({ type: 'error', message: 'Failed to delete category.' });
    } finally {
      setSaving(false);
    }
  };

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
            <span style={{ color: '#111827' }}>Journal Information</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Journal Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure basic details about the journal, including title, description, masthead, contact information, sections, and categories.
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

        {/* Tabs Navigation - OJS PKP 3.3 Style */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e5e5',
          display: 'flex',
          gap: 0,
        }}>
          <button
            onClick={() => setActiveTab('masthead')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'masthead' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'masthead' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'masthead' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Masthead
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'contact' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'contact' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'contact' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Contact
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'sections' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'sections' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'sections' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sections
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'categories' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'categories' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'categories' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Categories
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
          {/* Masthead Tab */}
          {activeTab === 'masthead' && (
            <form onSubmit={handleSaveMasthead}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Identity
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Title <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={masthead.name}
                    onChange={(e) => setMasthead({ ...masthead, name: e.target.value })}
                    required
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
                    Journal Initials <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={masthead.acronym}
                    onChange={(e) => setMasthead({ ...masthead, acronym: e.target.value })}
                    required
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

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Abbreviation
                  </label>
                  <input
                    type="text"
                    value={masthead.abbreviation}
                    onChange={(e) => setMasthead({ ...masthead, abbreviation: e.target.value })}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Key Information
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Summary
                  </label>
                  <textarea
                    value={masthead.description}
                    onChange={(e) => setMasthead({ ...masthead, description: e.target.value })}
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
                    Editorial Team
                  </label>
                  <textarea
                    value={masthead.editorialTeam}
                    onChange={(e) => setMasthead({ ...masthead, editorialTeam: e.target.value })}
                    rows={8}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Publishing
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={masthead.publisherInstitution}
                    onChange={(e) => setMasthead({ ...masthead, publisherInstitution: e.target.value })}
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
                    Publisher URL
                  </label>
                  <input
                    type="url"
                    value={masthead.publisherUrl}
                    onChange={(e) => setMasthead({ ...masthead, publisherUrl: e.target.value })}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Online ISSN
                    </label>
                    <input
                      type="text"
                      value={masthead.onlineIssn}
                      onChange={(e) => setMasthead({ ...masthead, onlineIssn: e.target.value })}
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
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Print ISSN
                    </label>
                    <input
                      type="text"
                      value={masthead.printIssn}
                      onChange={(e) => setMasthead({ ...masthead, printIssn: e.target.value })}
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
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  About the Journal
                </h2>
                
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
                    value={masthead.about}
                    onChange={(e) => setMasthead({ ...masthead, about: e.target.value })}
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
                  transition: 'background-color 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContact}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Principal Contact
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  The principal contact is the automatic sender and receiver for some automated emails.
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Name <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.contactName}
                    onChange={(e) => setContact({ ...contact, contactName: e.target.value })}
                    required
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
                    Email <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.contactEmail}
                    onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })}
                    required
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contact.contactPhone}
                    onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })}
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
                    Affiliation
                  </label>
                  <input
                    type="text"
                    value={contact.contactAffiliation}
                    onChange={(e) => setContact({ ...contact, contactAffiliation: e.target.value })}
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
                    Mailing Address
                  </label>
                  <textarea
                    value={contact.mailingAddress}
                    onChange={(e) => setContact({ ...contact, mailingAddress: e.target.value })}
                    rows={4}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Technical Support Contact
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Contact information for technical support inquiries.
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Name <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.supportName}
                    onChange={(e) => setContact({ ...contact, supportName: e.target.value })}
                    required
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
                    Email <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.supportEmail}
                    onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })}
                    required
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contact.supportPhone}
                    onChange={(e) => setContact({ ...contact, supportPhone: e.target.value })}
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
                  transition: 'background-color 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Sections
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Sections allow you to publish submissions in different sections of the journal, such as Articles, Reviews, etc.
                </p>

                {/* Add Section Form */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Add New Section
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Section Title <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newSection.title}
                        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                        placeholder="e.g., Articles"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Abbreviation
                      </label>
                      <input
                        type="text"
                        value={newSection.abbreviation}
                        onChange={(e) => setNewSection({ ...newSection, abbreviation: e.target.value })}
                        placeholder="e.g., ART"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Policy / Description
                      </label>
                      <textarea
                        value={newSection.policy || ''}
                        onChange={(e) => setNewSection({ ...newSection, policy: e.target.value })}
                        rows={3}
                        placeholder="Section policy or description..."
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="section-enabled"
                        checked={newSection.enabled}
                        onChange={(e) => setNewSection({ ...newSection, enabled: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="section-enabled" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Enabled
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      disabled={saving || !newSection.title.trim()}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: saving || !newSection.title.trim() ? '#6c757d' : '#006798',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving || !newSection.title.trim() ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Add Section
                    </button>
                  </div>
                </div>

                {/* Sections Table */}
                <div style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #dee2e6',
                      }}>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Section
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Abbreviation
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Enabled
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.length > 0 ? (
                        sections.map((section) => (
                          <tr key={section.id} style={{
                            borderBottom: '1px solid #dee2e6',
                          }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{section.title}</div>
                              {section.policy && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(0, 0, 0, 0.54)',
                                  marginTop: '0.25rem',
                                }}>
                                  {section.policy}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              {section.abbreviation}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: section.enabled ? '#d4edda' : '#f8d7da',
                                color: section.enabled ? '#155724' : '#721c24',
                              }}>
                                {section.enabled ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(section.id)}
                                disabled={saving}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  backgroundColor: saving ? '#6c757d' : '#dc3545',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.54)',
                            fontSize: '0.875rem',
                          }}>
                            No sections found. Use the form above to add a new section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Categories
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Categories can be used to organize and filter content across the journal.
                </p>

                {/* Add Category Form */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Add New Category
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Category Title <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newCategory.title}
                        onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                        placeholder="e.g., Computer Science"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Path <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newCategory.path}
                        onChange={(e) => setNewCategory({ ...newCategory, path: e.target.value })}
                        placeholder="e.g., computer-science"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Description
                      </label>
                      <textarea
                        value={newCategory.description || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        rows={3}
                        placeholder="Category description..."
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
                      type="button"
                      onClick={handleAddCategory}
                      disabled={saving || !newCategory.title.trim() || !newCategory.path.trim()}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: saving || !newCategory.title.trim() || !newCategory.path.trim() ? '#6c757d' : '#006798',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving || !newCategory.title.trim() || !newCategory.path.trim() ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Add Category
                    </button>
                  </div>
                </div>

                {/* Categories Table */}
                <div style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #dee2e6',
                      }}>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Category
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Path
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <tr key={category.id} style={{
                            borderBottom: '1px solid #dee2e6',
                          }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{category.title}</div>
                              {category.description && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(0, 0, 0, 0.54)',
                                  marginTop: '0.25rem',
                                }}>
                                  {category.description}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              {category.path}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={saving}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  backgroundColor: saving ? '#6c757d' : '#dc3545',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.54)',
                            fontSize: '0.875rem',
                          }}>
                            No categories found. Use the form above to add a category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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

type SectionItem = {
  id: string;
  title: string;
  abbreviation: string;
  enabled: boolean;
  policy?: string;
};

type CategoryItem = {
  id: string;
  title: string;
  path: string;
  description?: string;
};

type MastheadData = {
  name: string;
  acronym: string;
  abbreviation: string;
  description: string;
  editorialTeam: string;
  about: string;
  publisherInstitution: string;
  publisherUrl: string;
  onlineIssn: string;
  printIssn: string;
};

type ContactData = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAffiliation: string;
  mailingAddress: string;
  supportName: string;
  supportEmail: string;
  supportPhone: string;
};

export default function ManagerSettingsContextPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"masthead" | "contact" | "sections" | "categories">("masthead");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Masthead form state
  const [masthead, setMasthead] = useState<MastheadData>({
    name: '',
    acronym: '',
    abbreviation: '',
    description: '',
    editorialTeam: '',
    about: '',
    publisherInstitution: '',
    publisherUrl: '',
    onlineIssn: '',
    printIssn: '',
  });

  // Contact form state
  const [contact, setContact] = useState<ContactData>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactAffiliation: '',
    mailingAddress: '',
    supportName: '',
    supportEmail: '',
    supportPhone: '',
  });

  // Sections state
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [newSection, setNewSection] = useState<Omit<SectionItem, 'id'>>({
    title: '',
    abbreviation: '',
    enabled: true,
    policy: '',
  });

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCategory, setNewCategory] = useState<Omit<CategoryItem, 'id'>>({
    title: '',
    path: '',
    description: '',
  });

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

        const primaryLocale = journal?.primary_locale || 'en_US';

        // Load masthead data from journal_settings (OJS PKP 3.3 structure)
        const { data: mastheadSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'name', 'acronym', 'abbreviation', 'description', 'editorialTeam', 'about',
            'publisherInstitution', 'publisherUrl', 'onlineIssn', 'printIssn'
          ])
          .eq('locale', primaryLocale);

        if (mastheadSettings) {
          const mastheadData: Record<string, string> = {};
          mastheadSettings.forEach((s: any) => {
            mastheadData[s.setting_name] = s.setting_value || '';
          });
          setMasthead({
            name: mastheadData.name || '',
            acronym: mastheadData.acronym || '',
            abbreviation: mastheadData.abbreviation || '',
            description: mastheadData.description || '',
            editorialTeam: mastheadData.editorialTeam || '',
            about: mastheadData.about || '',
            publisherInstitution: mastheadData.publisherInstitution || '',
            publisherUrl: mastheadData.publisherUrl || '',
            onlineIssn: mastheadData.onlineIssn || '',
            printIssn: mastheadData.printIssn || '',
          });
        }

        // Load contact data from journal_settings (OJS PKP 3.3 - contact settings don't use locale)
        const { data: contactSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .eq('locale', '') // Contact settings in OJS 3.3 don't use locale
          .in('setting_name', [
            'contactName', 'contactEmail', 'contactPhone', 'contactAffiliation', 'mailingAddress',
            'supportName', 'supportEmail', 'supportPhone'
          ]);

        if (contactSettings) {
          const contactData: Partial<ContactData> = {};
          contactSettings.forEach((s: any) => {
            const key = s.setting_name as keyof ContactData;
            contactData[key] = s.setting_value as string;
          });
          setContact(prev => ({ ...prev, ...contactData }));
        }

        // Load sections with settings
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('*')
          .eq('journal_id', journalId)
          .order('seq', { ascending: true });

        if (sectionsData && sectionsData.length > 0) {
          const sectionIds = sectionsData.map((s: any) => s.id);
          
          // Load section settings using primary locale (fallback to empty string)
          const { data: sectionSettings } = await supabase
            .from('section_settings')
            .select('*')
            .in('section_id', sectionIds)
            .in('locale', [primaryLocale, '']); // Primary locale and fallback to empty

          const settingsMap = new Map();
          (sectionSettings || []).forEach((s: any) => {
            if (!settingsMap.has(s.section_id)) {
              settingsMap.set(s.section_id, {});
            }
            // Prioritize primary locale over empty locale
            const existing = settingsMap.get(s.section_id)[s.setting_name];
            if (!existing || s.locale === primaryLocale) {
              settingsMap.get(s.section_id)[s.setting_name] = s.setting_value;
            }
          });

          setSections(sectionsData.map((s: any) => {
            const settings = settingsMap.get(s.id) || {};
            return {
              id: s.id,
              title: settings.title || '',
              abbreviation: settings.abbrev || '',
              enabled: !s.is_inactive,
              policy: settings.policy || '',
            };
          }));
        }

        // Load categories - Using journal_settings for now if categories table doesn't exist
        // In OJS 3.3, categories have their own table, but we'll use journal_settings as fallback
        const { data: categoriesData } = await supabase
          .from('journal_settings')
          .select('setting_value')
          .eq('journal_id', journalId)
          .eq('setting_name', 'categories')
          .maybeSingle();

        if (categoriesData && categoriesData.setting_value) {
          try {
            const parsed = JSON.parse(categoriesData.setting_value);
            if (Array.isArray(parsed)) {
              setCategories(parsed);
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

  const generateId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);

  // Save handlers
  const handleSaveMasthead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalId) return;

    setSaving(true);
    setFeedback(null);

    try {
      const supabase = getSupabaseClient();

      // Get primary locale from journal
      const { data: journal } = await supabase
        .from('journals')
        .select('primary_locale')
        .eq('id', journalId)
        .single();

      const primaryLocale = journal?.primary_locale || 'en_US';

      // Save masthead data to journal_settings (OJS PKP 3.3 structure)
      const settings = [
        { setting_name: 'name', setting_value: masthead.name, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'acronym', setting_value: masthead.acronym, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'abbreviation', setting_value: masthead.abbreviation, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'description', setting_value: masthead.description, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'editorialTeam', setting_value: masthead.editorialTeam, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'about', setting_value: masthead.about, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'publisherInstitution', setting_value: masthead.publisherInstitution, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'publisherUrl', setting_value: masthead.publisherUrl, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'onlineIssn', setting_value: masthead.onlineIssn, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'printIssn', setting_value: masthead.printIssn, setting_type: 'string', locale: primaryLocale },
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('journal_settings')
          .upsert({
            journal_id: journalId,
            setting_name: setting.setting_name,
            setting_value: setting.setting_value,
            setting_type: setting.setting_type,
            locale: setting.locale,
          }, {
            onConflict: 'journal_id,setting_name,locale'
          });

        if (error) throw error;
      }

      setFeedback({ type: 'success', message: 'Masthead settings saved successfully.' });
    } catch (error) {
      console.error('Error saving masthead:', error);
      setFeedback({ type: 'error', message: 'Failed to save masthead settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalId) return;

    setSaving(true);
    setFeedback(null);

    try {
      const supabase = getSupabaseClient();

      // Contact settings in OJS PKP 3.3 don't use locale (locale = '')
      const settings = [
        { setting_name: 'contactName', setting_value: contact.contactName, locale: '' },
        { setting_name: 'contactEmail', setting_value: contact.contactEmail, locale: '' },
        { setting_name: 'contactPhone', setting_value: contact.contactPhone, locale: '' },
        { setting_name: 'contactAffiliation', setting_value: contact.contactAffiliation, locale: '' },
        { setting_name: 'mailingAddress', setting_value: contact.mailingAddress, locale: '' },
        { setting_name: 'supportName', setting_value: contact.supportName, locale: '' },
        { setting_name: 'supportEmail', setting_value: contact.supportEmail, locale: '' },
        { setting_name: 'supportPhone', setting_value: contact.supportPhone, locale: '' },
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

      setFeedback({ type: 'success', message: 'Contact settings saved successfully.' });
    } catch (error) {
      console.error('Error saving contact:', error);
      setFeedback({ type: 'error', message: 'Failed to save contact settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!journalId || !newSection.title.trim()) {
      setFeedback({ type: 'error', message: 'Section title is required.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      const { data: maxSeq } = await supabase
        .from('sections')
        .select('seq')
        .eq('journal_id', journalId)
        .order('seq', { ascending: false })
        .limit(1)
        .single();

      // Insert section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          journal_id: journalId,
          is_inactive: !newSection.enabled,
          seq: (maxSeq?.seq || 0) + 1,
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      // Get primary locale from journal
      const { data: journal } = await supabase
        .from('journals')
        .select('primary_locale')
        .eq('id', journalId)
        .single();

      const primaryLocale = journal?.primary_locale || 'en_US';

      // Insert section settings with primary locale (OJS PKP 3.3 structure)
      const sectionId = sectionData.id;
      const abbrev = newSection.abbreviation.trim() || newSection.title.trim().slice(0, 3).toUpperCase();
      
      const settings = [
        { section_id: sectionId, setting_name: 'title', setting_value: newSection.title.trim(), setting_type: 'string', locale: primaryLocale },
        { section_id: sectionId, setting_name: 'abbrev', setting_value: abbrev, setting_type: 'string', locale: primaryLocale },
      ];

      if (newSection.policy?.trim()) {
        settings.push({
          section_id: sectionId,
          setting_name: 'policy',
          setting_value: newSection.policy.trim(),
          setting_type: 'string',
          locale: primaryLocale
        });
      }

      const { error: settingsError } = await supabase
        .from('section_settings')
        .insert(settings);

      if (settingsError) throw settingsError;

      setSections([...sections, {
        id: sectionId,
        title: newSection.title.trim(),
        abbreviation: abbrev,
        enabled: newSection.enabled,
        policy: newSection.policy?.trim() || '',
      }]);

      setNewSection({ title: '', abbreviation: '', enabled: true, policy: '' });
      setFeedback({ type: 'success', message: 'Section added successfully.' });
    } catch (error) {
      console.error('Error adding section:', error);
      setFeedback({ type: 'error', message: 'Failed to add section.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!journalId) return;

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      // Delete section_settings first (foreign key constraint)
      const { error: settingsError } = await supabase
        .from('section_settings')
        .delete()
        .eq('section_id', id);

      if (settingsError) throw settingsError;

      // Delete section
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id)
        .eq('journal_id', journalId);

      if (error) throw error;

      setSections(sections.filter(s => s.id !== id));
      setFeedback({ type: 'success', message: 'Section deleted successfully.' });
    } catch (error) {
      console.error('Error deleting section:', error);
      setFeedback({ type: 'error', message: 'Failed to delete section.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!journalId || !newCategory.title.trim() || !newCategory.path.trim()) {
      setFeedback({ type: 'error', message: 'Category title and path are required.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      const { data: maxSeq } = await supabase
        .from('categories')
        .select('seq')
        .eq('journal_id', journalId)
        .order('seq', { ascending: false })
        .limit(1)
        .single();

      // Categories stored in journal_settings as JSON array
      const newCategoryItem = {
        id: generateId(),
        title: newCategory.title.trim(),
        path: newCategory.path.trim(),
        description: newCategory.description?.trim() || '',
      };

      const updatedCategories = [...categories, newCategoryItem];

      const { error } = await supabase
        .from('journal_settings')
        .upsert({
          journal_id: journalId,
          setting_name: 'categories',
          setting_value: JSON.stringify(updatedCategories),
          setting_type: 'string',
        }, {
          onConflict: 'journal_id,setting_name'
        });

      if (error) throw error;

      setCategories(updatedCategories);

      setNewCategory({ title: '', path: '', description: '' });
      setFeedback({ type: 'success', message: 'Category added successfully.' });
    } catch (error) {
      console.error('Error adding category:', error);
      setFeedback({ type: 'error', message: 'Failed to add category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!journalId) return;

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      // Update categories in journal_settings
      const updatedCategories = categories.filter(c => c.id !== id);

      const { error } = await supabase
        .from('journal_settings')
        .upsert({
          journal_id: journalId,
          setting_name: 'categories',
          setting_value: JSON.stringify(updatedCategories),
          setting_type: 'string',
        }, {
          onConflict: 'journal_id,setting_name'
        });

      if (error) throw error;

      setCategories(updatedCategories);
      setFeedback({ type: 'success', message: 'Category deleted successfully.' });
    } catch (error) {
      console.error('Error deleting category:', error);
      setFeedback({ type: 'error', message: 'Failed to delete category.' });
    } finally {
      setSaving(false);
    }
  };

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
            <span style={{ color: '#111827' }}>Journal Information</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Journal Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure basic details about the journal, including title, description, masthead, contact information, sections, and categories.
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

        {/* Tabs Navigation - OJS PKP 3.3 Style */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e5e5',
          display: 'flex',
          gap: 0,
        }}>
          <button
            onClick={() => setActiveTab('masthead')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'masthead' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'masthead' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'masthead' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Masthead
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'contact' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'contact' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'contact' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Contact
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'sections' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'sections' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'sections' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sections
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'categories' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'categories' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'categories' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Categories
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
          {/* Masthead Tab */}
          {activeTab === 'masthead' && (
            <form onSubmit={handleSaveMasthead}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Identity
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Title <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={masthead.name}
                    onChange={(e) => setMasthead({ ...masthead, name: e.target.value })}
                    required
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
                    Journal Initials <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={masthead.acronym}
                    onChange={(e) => setMasthead({ ...masthead, acronym: e.target.value })}
                    required
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

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Abbreviation
                  </label>
                  <input
                    type="text"
                    value={masthead.abbreviation}
                    onChange={(e) => setMasthead({ ...masthead, abbreviation: e.target.value })}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Key Information
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Summary
                  </label>
                  <textarea
                    value={masthead.description}
                    onChange={(e) => setMasthead({ ...masthead, description: e.target.value })}
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
                    Editorial Team
                  </label>
                  <textarea
                    value={masthead.editorialTeam}
                    onChange={(e) => setMasthead({ ...masthead, editorialTeam: e.target.value })}
                    rows={8}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Publishing
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={masthead.publisherInstitution}
                    onChange={(e) => setMasthead({ ...masthead, publisherInstitution: e.target.value })}
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
                    Publisher URL
                  </label>
                  <input
                    type="url"
                    value={masthead.publisherUrl}
                    onChange={(e) => setMasthead({ ...masthead, publisherUrl: e.target.value })}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Online ISSN
                    </label>
                    <input
                      type="text"
                      value={masthead.onlineIssn}
                      onChange={(e) => setMasthead({ ...masthead, onlineIssn: e.target.value })}
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
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Print ISSN
                    </label>
                    <input
                      type="text"
                      value={masthead.printIssn}
                      onChange={(e) => setMasthead({ ...masthead, printIssn: e.target.value })}
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
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  About the Journal
                </h2>
                
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
                    value={masthead.about}
                    onChange={(e) => setMasthead({ ...masthead, about: e.target.value })}
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
                  transition: 'background-color 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContact}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Principal Contact
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  The principal contact is the automatic sender and receiver for some automated emails.
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Name <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.contactName}
                    onChange={(e) => setContact({ ...contact, contactName: e.target.value })}
                    required
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
                    Email <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.contactEmail}
                    onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })}
                    required
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contact.contactPhone}
                    onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })}
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
                    Affiliation
                  </label>
                  <input
                    type="text"
                    value={contact.contactAffiliation}
                    onChange={(e) => setContact({ ...contact, contactAffiliation: e.target.value })}
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
                    Mailing Address
                  </label>
                  <textarea
                    value={contact.mailingAddress}
                    onChange={(e) => setContact({ ...contact, mailingAddress: e.target.value })}
                    rows={4}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Technical Support Contact
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Contact information for technical support inquiries.
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Name <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.supportName}
                    onChange={(e) => setContact({ ...contact, supportName: e.target.value })}
                    required
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
                    Email <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.supportEmail}
                    onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })}
                    required
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contact.supportPhone}
                    onChange={(e) => setContact({ ...contact, supportPhone: e.target.value })}
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
                  transition: 'background-color 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Sections
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Sections allow you to publish submissions in different sections of the journal, such as Articles, Reviews, etc.
                </p>

                {/* Add Section Form */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Add New Section
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Section Title <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newSection.title}
                        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                        placeholder="e.g., Articles"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Abbreviation
                      </label>
                      <input
                        type="text"
                        value={newSection.abbreviation}
                        onChange={(e) => setNewSection({ ...newSection, abbreviation: e.target.value })}
                        placeholder="e.g., ART"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Policy / Description
                      </label>
                      <textarea
                        value={newSection.policy || ''}
                        onChange={(e) => setNewSection({ ...newSection, policy: e.target.value })}
                        rows={3}
                        placeholder="Section policy or description..."
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="section-enabled"
                        checked={newSection.enabled}
                        onChange={(e) => setNewSection({ ...newSection, enabled: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="section-enabled" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Enabled
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      disabled={saving || !newSection.title.trim()}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: saving || !newSection.title.trim() ? '#6c757d' : '#006798',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving || !newSection.title.trim() ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Add Section
                    </button>
                  </div>
                </div>

                {/* Sections Table */}
                <div style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #dee2e6',
                      }}>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Section
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Abbreviation
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Enabled
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.length > 0 ? (
                        sections.map((section) => (
                          <tr key={section.id} style={{
                            borderBottom: '1px solid #dee2e6',
                          }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{section.title}</div>
                              {section.policy && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(0, 0, 0, 0.54)',
                                  marginTop: '0.25rem',
                                }}>
                                  {section.policy}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              {section.abbreviation}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: section.enabled ? '#d4edda' : '#f8d7da',
                                color: section.enabled ? '#155724' : '#721c24',
                              }}>
                                {section.enabled ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(section.id)}
                                disabled={saving}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  backgroundColor: saving ? '#6c757d' : '#dc3545',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.54)',
                            fontSize: '0.875rem',
                          }}>
                            No sections found. Use the form above to add a new section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Categories
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Categories can be used to organize and filter content across the journal.
                </p>

                {/* Add Category Form */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Add New Category
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Category Title <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newCategory.title}
                        onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                        placeholder="e.g., Computer Science"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Path <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newCategory.path}
                        onChange={(e) => setNewCategory({ ...newCategory, path: e.target.value })}
                        placeholder="e.g., computer-science"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Description
                      </label>
                      <textarea
                        value={newCategory.description || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        rows={3}
                        placeholder="Category description..."
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
                      type="button"
                      onClick={handleAddCategory}
                      disabled={saving || !newCategory.title.trim() || !newCategory.path.trim()}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: saving || !newCategory.title.trim() || !newCategory.path.trim() ? '#6c757d' : '#006798',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving || !newCategory.title.trim() || !newCategory.path.trim() ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Add Category
                    </button>
                  </div>
                </div>

                {/* Categories Table */}
                <div style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #dee2e6',
                      }}>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Category
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Path
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <tr key={category.id} style={{
                            borderBottom: '1px solid #dee2e6',
                          }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{category.title}</div>
                              {category.description && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(0, 0, 0, 0.54)',
                                  marginTop: '0.25rem',
                                }}>
                                  {category.description}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              {category.path}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={saving}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  backgroundColor: saving ? '#6c757d' : '#dc3545',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.54)',
                            fontSize: '0.875rem',
                          }}>
                            No categories found. Use the form above to add a category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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

type SectionItem = {
  id: string;
  title: string;
  abbreviation: string;
  enabled: boolean;
  policy?: string;
};

type CategoryItem = {
  id: string;
  title: string;
  path: string;
  description?: string;
};

type MastheadData = {
  name: string;
  acronym: string;
  abbreviation: string;
  description: string;
  editorialTeam: string;
  about: string;
  publisherInstitution: string;
  publisherUrl: string;
  onlineIssn: string;
  printIssn: string;
};

type ContactData = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAffiliation: string;
  mailingAddress: string;
  supportName: string;
  supportEmail: string;
  supportPhone: string;
};

export default function ManagerSettingsContextPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"masthead" | "contact" | "sections" | "categories">("masthead");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Masthead form state
  const [masthead, setMasthead] = useState<MastheadData>({
    name: '',
    acronym: '',
    abbreviation: '',
    description: '',
    editorialTeam: '',
    about: '',
    publisherInstitution: '',
    publisherUrl: '',
    onlineIssn: '',
    printIssn: '',
  });

  // Contact form state
  const [contact, setContact] = useState<ContactData>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactAffiliation: '',
    mailingAddress: '',
    supportName: '',
    supportEmail: '',
    supportPhone: '',
  });

  // Sections state
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [newSection, setNewSection] = useState<Omit<SectionItem, 'id'>>({
    title: '',
    abbreviation: '',
    enabled: true,
    policy: '',
  });

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCategory, setNewCategory] = useState<Omit<CategoryItem, 'id'>>({
    title: '',
    path: '',
    description: '',
  });

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

        const primaryLocale = journal?.primary_locale || 'en_US';

        // Load masthead data from journal_settings (OJS PKP 3.3 structure)
        const { data: mastheadSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'name', 'acronym', 'abbreviation', 'description', 'editorialTeam', 'about',
            'publisherInstitution', 'publisherUrl', 'onlineIssn', 'printIssn'
          ])
          .eq('locale', primaryLocale);

        if (mastheadSettings) {
          const mastheadData: Record<string, string> = {};
          mastheadSettings.forEach((s: any) => {
            mastheadData[s.setting_name] = s.setting_value || '';
          });
          setMasthead({
            name: mastheadData.name || '',
            acronym: mastheadData.acronym || '',
            abbreviation: mastheadData.abbreviation || '',
            description: mastheadData.description || '',
            editorialTeam: mastheadData.editorialTeam || '',
            about: mastheadData.about || '',
            publisherInstitution: mastheadData.publisherInstitution || '',
            publisherUrl: mastheadData.publisherUrl || '',
            onlineIssn: mastheadData.onlineIssn || '',
            printIssn: mastheadData.printIssn || '',
          });
        }

        // Load contact data from journal_settings (OJS PKP 3.3 - contact settings don't use locale)
        const { data: contactSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value')
          .eq('journal_id', journalId)
          .eq('locale', '') // Contact settings in OJS 3.3 don't use locale
          .in('setting_name', [
            'contactName', 'contactEmail', 'contactPhone', 'contactAffiliation', 'mailingAddress',
            'supportName', 'supportEmail', 'supportPhone'
          ]);

        if (contactSettings) {
          const contactData: Partial<ContactData> = {};
          contactSettings.forEach((s: any) => {
            const key = s.setting_name as keyof ContactData;
            contactData[key] = s.setting_value as string;
          });
          setContact(prev => ({ ...prev, ...contactData }));
        }

        // Load sections with settings
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('*')
          .eq('journal_id', journalId)
          .order('seq', { ascending: true });

        if (sectionsData && sectionsData.length > 0) {
          const sectionIds = sectionsData.map((s: any) => s.id);
          
          // Load section settings using primary locale (fallback to empty string)
          const { data: sectionSettings } = await supabase
            .from('section_settings')
            .select('*')
            .in('section_id', sectionIds)
            .in('locale', [primaryLocale, '']); // Primary locale and fallback to empty

          const settingsMap = new Map();
          (sectionSettings || []).forEach((s: any) => {
            if (!settingsMap.has(s.section_id)) {
              settingsMap.set(s.section_id, {});
            }
            // Prioritize primary locale over empty locale
            const existing = settingsMap.get(s.section_id)[s.setting_name];
            if (!existing || s.locale === primaryLocale) {
              settingsMap.get(s.section_id)[s.setting_name] = s.setting_value;
            }
          });

          setSections(sectionsData.map((s: any) => {
            const settings = settingsMap.get(s.id) || {};
            return {
              id: s.id,
              title: settings.title || '',
              abbreviation: settings.abbrev || '',
              enabled: !s.is_inactive,
              policy: settings.policy || '',
            };
          }));
        }

        // Load categories - Using journal_settings for now if categories table doesn't exist
        // In OJS 3.3, categories have their own table, but we'll use journal_settings as fallback
        const { data: categoriesData } = await supabase
          .from('journal_settings')
          .select('setting_value')
          .eq('journal_id', journalId)
          .eq('setting_name', 'categories')
          .maybeSingle();

        if (categoriesData && categoriesData.setting_value) {
          try {
            const parsed = JSON.parse(categoriesData.setting_value);
            if (Array.isArray(parsed)) {
              setCategories(parsed);
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

  const generateId = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2, 10);

  // Save handlers
  const handleSaveMasthead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalId) return;

    setSaving(true);
    setFeedback(null);

    try {
      const supabase = getSupabaseClient();

      // Get primary locale from journal
      const { data: journal } = await supabase
        .from('journals')
        .select('primary_locale')
        .eq('id', journalId)
        .single();

      const primaryLocale = journal?.primary_locale || 'en_US';

      // Save masthead data to journal_settings (OJS PKP 3.3 structure)
      const settings = [
        { setting_name: 'name', setting_value: masthead.name, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'acronym', setting_value: masthead.acronym, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'abbreviation', setting_value: masthead.abbreviation, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'description', setting_value: masthead.description, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'editorialTeam', setting_value: masthead.editorialTeam, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'about', setting_value: masthead.about, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'publisherInstitution', setting_value: masthead.publisherInstitution, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'publisherUrl', setting_value: masthead.publisherUrl, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'onlineIssn', setting_value: masthead.onlineIssn, setting_type: 'string', locale: primaryLocale },
        { setting_name: 'printIssn', setting_value: masthead.printIssn, setting_type: 'string', locale: primaryLocale },
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('journal_settings')
          .upsert({
            journal_id: journalId,
            setting_name: setting.setting_name,
            setting_value: setting.setting_value,
            setting_type: setting.setting_type,
            locale: setting.locale,
          }, {
            onConflict: 'journal_id,setting_name,locale'
          });

        if (error) throw error;
      }

      setFeedback({ type: 'success', message: 'Masthead settings saved successfully.' });
    } catch (error) {
      console.error('Error saving masthead:', error);
      setFeedback({ type: 'error', message: 'Failed to save masthead settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalId) return;

    setSaving(true);
    setFeedback(null);

    try {
      const supabase = getSupabaseClient();

      // Contact settings in OJS PKP 3.3 don't use locale (locale = '')
      const settings = [
        { setting_name: 'contactName', setting_value: contact.contactName, locale: '' },
        { setting_name: 'contactEmail', setting_value: contact.contactEmail, locale: '' },
        { setting_name: 'contactPhone', setting_value: contact.contactPhone, locale: '' },
        { setting_name: 'contactAffiliation', setting_value: contact.contactAffiliation, locale: '' },
        { setting_name: 'mailingAddress', setting_value: contact.mailingAddress, locale: '' },
        { setting_name: 'supportName', setting_value: contact.supportName, locale: '' },
        { setting_name: 'supportEmail', setting_value: contact.supportEmail, locale: '' },
        { setting_name: 'supportPhone', setting_value: contact.supportPhone, locale: '' },
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

      setFeedback({ type: 'success', message: 'Contact settings saved successfully.' });
    } catch (error) {
      console.error('Error saving contact:', error);
      setFeedback({ type: 'error', message: 'Failed to save contact settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!journalId || !newSection.title.trim()) {
      setFeedback({ type: 'error', message: 'Section title is required.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      const { data: maxSeq } = await supabase
        .from('sections')
        .select('seq')
        .eq('journal_id', journalId)
        .order('seq', { ascending: false })
        .limit(1)
        .single();

      // Insert section
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          journal_id: journalId,
          is_inactive: !newSection.enabled,
          seq: (maxSeq?.seq || 0) + 1,
        })
        .select()
        .single();

      if (sectionError) throw sectionError;

      // Get primary locale from journal
      const { data: journal } = await supabase
        .from('journals')
        .select('primary_locale')
        .eq('id', journalId)
        .single();

      const primaryLocale = journal?.primary_locale || 'en_US';

      // Insert section settings with primary locale (OJS PKP 3.3 structure)
      const sectionId = sectionData.id;
      const abbrev = newSection.abbreviation.trim() || newSection.title.trim().slice(0, 3).toUpperCase();
      
      const settings = [
        { section_id: sectionId, setting_name: 'title', setting_value: newSection.title.trim(), setting_type: 'string', locale: primaryLocale },
        { section_id: sectionId, setting_name: 'abbrev', setting_value: abbrev, setting_type: 'string', locale: primaryLocale },
      ];

      if (newSection.policy?.trim()) {
        settings.push({
          section_id: sectionId,
          setting_name: 'policy',
          setting_value: newSection.policy.trim(),
          setting_type: 'string',
          locale: primaryLocale
        });
      }

      const { error: settingsError } = await supabase
        .from('section_settings')
        .insert(settings);

      if (settingsError) throw settingsError;

      setSections([...sections, {
        id: sectionId,
        title: newSection.title.trim(),
        abbreviation: abbrev,
        enabled: newSection.enabled,
        policy: newSection.policy?.trim() || '',
      }]);

      setNewSection({ title: '', abbreviation: '', enabled: true, policy: '' });
      setFeedback({ type: 'success', message: 'Section added successfully.' });
    } catch (error) {
      console.error('Error adding section:', error);
      setFeedback({ type: 'error', message: 'Failed to add section.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!journalId) return;

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      // Delete section_settings first (foreign key constraint)
      const { error: settingsError } = await supabase
        .from('section_settings')
        .delete()
        .eq('section_id', id);

      if (settingsError) throw settingsError;

      // Delete section
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id)
        .eq('journal_id', journalId);

      if (error) throw error;

      setSections(sections.filter(s => s.id !== id));
      setFeedback({ type: 'success', message: 'Section deleted successfully.' });
    } catch (error) {
      console.error('Error deleting section:', error);
      setFeedback({ type: 'error', message: 'Failed to delete section.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!journalId || !newCategory.title.trim() || !newCategory.path.trim()) {
      setFeedback({ type: 'error', message: 'Category title and path are required.' });
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      const { data: maxSeq } = await supabase
        .from('categories')
        .select('seq')
        .eq('journal_id', journalId)
        .order('seq', { ascending: false })
        .limit(1)
        .single();

      // Categories stored in journal_settings as JSON array
      const newCategoryItem = {
        id: generateId(),
        title: newCategory.title.trim(),
        path: newCategory.path.trim(),
        description: newCategory.description?.trim() || '',
      };

      const updatedCategories = [...categories, newCategoryItem];

      const { error } = await supabase
        .from('journal_settings')
        .upsert({
          journal_id: journalId,
          setting_name: 'categories',
          setting_value: JSON.stringify(updatedCategories),
          setting_type: 'string',
        }, {
          onConflict: 'journal_id,setting_name'
        });

      if (error) throw error;

      setCategories(updatedCategories);

      setNewCategory({ title: '', path: '', description: '' });
      setFeedback({ type: 'success', message: 'Category added successfully.' });
    } catch (error) {
      console.error('Error adding category:', error);
      setFeedback({ type: 'error', message: 'Failed to add category.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!journalId) return;

    setSaving(true);
    try {
      const supabase = getSupabaseClient();

      // Update categories in journal_settings
      const updatedCategories = categories.filter(c => c.id !== id);

      const { error } = await supabase
        .from('journal_settings')
        .upsert({
          journal_id: journalId,
          setting_name: 'categories',
          setting_value: JSON.stringify(updatedCategories),
          setting_type: 'string',
        }, {
          onConflict: 'journal_id,setting_name'
        });

      if (error) throw error;

      setCategories(updatedCategories);
      setFeedback({ type: 'success', message: 'Category deleted successfully.' });
    } catch (error) {
      console.error('Error deleting category:', error);
      setFeedback({ type: 'error', message: 'Failed to delete category.' });
    } finally {
      setSaving(false);
    }
  };

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
            <span style={{ color: '#111827' }}>Journal Information</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Journal Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure basic details about the journal, including title, description, masthead, contact information, sections, and categories.
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

        {/* Tabs Navigation - OJS PKP 3.3 Style */}
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '2px solid #e5e5e5',
          display: 'flex',
          gap: 0,
        }}>
          <button
            onClick={() => setActiveTab('masthead')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'masthead' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'masthead' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'masthead' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Masthead
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'contact' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'contact' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'contact' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Contact
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'sections' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'sections' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'sections' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sections
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'categories' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'categories' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'categories' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Categories
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
          {/* Masthead Tab */}
          {activeTab === 'masthead' && (
            <form onSubmit={handleSaveMasthead}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Identity
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Title <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={masthead.name}
                    onChange={(e) => setMasthead({ ...masthead, name: e.target.value })}
                    required
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
                    Journal Initials <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={masthead.acronym}
                    onChange={(e) => setMasthead({ ...masthead, acronym: e.target.value })}
                    required
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

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Abbreviation
                  </label>
                  <input
                    type="text"
                    value={masthead.abbreviation}
                    onChange={(e) => setMasthead({ ...masthead, abbreviation: e.target.value })}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Key Information
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Journal Summary
                  </label>
                  <textarea
                    value={masthead.description}
                    onChange={(e) => setMasthead({ ...masthead, description: e.target.value })}
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
                    Editorial Team
                  </label>
                  <textarea
                    value={masthead.editorialTeam}
                    onChange={(e) => setMasthead({ ...masthead, editorialTeam: e.target.value })}
                    rows={8}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  Publishing
                </h2>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={masthead.publisherInstitution}
                    onChange={(e) => setMasthead({ ...masthead, publisherInstitution: e.target.value })}
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
                    Publisher URL
                  </label>
                  <input
                    type="url"
                    value={masthead.publisherUrl}
                    onChange={(e) => setMasthead({ ...masthead, publisherUrl: e.target.value })}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Online ISSN
                    </label>
                    <input
                      type="text"
                      value={masthead.onlineIssn}
                      onChange={(e) => setMasthead({ ...masthead, onlineIssn: e.target.value })}
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
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Print ISSN
                    </label>
                    <input
                      type="text"
                      value={masthead.printIssn}
                      onChange={(e) => setMasthead({ ...masthead, printIssn: e.target.value })}
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
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#002C40',
                }}>
                  About the Journal
                </h2>
                
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
                    value={masthead.about}
                    onChange={(e) => setMasthead({ ...masthead, about: e.target.value })}
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
                  transition: 'background-color 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContact}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Principal Contact
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  The principal contact is the automatic sender and receiver for some automated emails.
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Name <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.contactName}
                    onChange={(e) => setContact({ ...contact, contactName: e.target.value })}
                    required
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
                    Email <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.contactEmail}
                    onChange={(e) => setContact({ ...contact, contactEmail: e.target.value })}
                    required
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contact.contactPhone}
                    onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })}
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
                    Affiliation
                  </label>
                  <input
                    type="text"
                    value={contact.contactAffiliation}
                    onChange={(e) => setContact({ ...contact, contactAffiliation: e.target.value })}
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
                    Mailing Address
                  </label>
                  <textarea
                    value={contact.mailingAddress}
                    onChange={(e) => setContact({ ...contact, mailingAddress: e.target.value })}
                    rows={4}
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
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Technical Support Contact
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Contact information for technical support inquiries.
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#002C40',
                  }}>
                    Name <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={contact.supportName}
                    onChange={(e) => setContact({ ...contact, supportName: e.target.value })}
                    required
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
                    Email <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={contact.supportEmail}
                    onChange={(e) => setContact({ ...contact, supportEmail: e.target.value })}
                    required
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contact.supportPhone}
                    onChange={(e) => setContact({ ...contact, supportPhone: e.target.value })}
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
                  transition: 'background-color 0.2s',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Sections
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Sections allow you to publish submissions in different sections of the journal, such as Articles, Reviews, etc.
                </p>

                {/* Add Section Form */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Add New Section
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Section Title <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newSection.title}
                        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                        placeholder="e.g., Articles"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Abbreviation
                      </label>
                      <input
                        type="text"
                        value={newSection.abbreviation}
                        onChange={(e) => setNewSection({ ...newSection, abbreviation: e.target.value })}
                        placeholder="e.g., ART"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Policy / Description
                      </label>
                      <textarea
                        value={newSection.policy || ''}
                        onChange={(e) => setNewSection({ ...newSection, policy: e.target.value })}
                        rows={3}
                        placeholder="Section policy or description..."
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="section-enabled"
                        checked={newSection.enabled}
                        onChange={(e) => setNewSection({ ...newSection, enabled: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="section-enabled" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Enabled
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      disabled={saving || !newSection.title.trim()}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: saving || !newSection.title.trim() ? '#6c757d' : '#006798',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving || !newSection.title.trim() ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Add Section
                    </button>
                  </div>
                </div>

                {/* Sections Table */}
                <div style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #dee2e6',
                      }}>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Section
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Abbreviation
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Enabled
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.length > 0 ? (
                        sections.map((section) => (
                          <tr key={section.id} style={{
                            borderBottom: '1px solid #dee2e6',
                          }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{section.title}</div>
                              {section.policy && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(0, 0, 0, 0.54)',
                                  marginTop: '0.25rem',
                                }}>
                                  {section.policy}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              {section.abbreviation}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: section.enabled ? '#d4edda' : '#f8d7da',
                                color: section.enabled ? '#155724' : '#721c24',
                              }}>
                                {section.enabled ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(section.id)}
                                disabled={saving}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  backgroundColor: saving ? '#6c757d' : '#dc3545',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.54)',
                            fontSize: '0.875rem',
                          }}>
                            No sections found. Use the form above to add a new section.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#002C40',
                }}>
                  Categories
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.54)',
                  marginBottom: '1rem',
                }}>
                  Categories can be used to organize and filter content across the journal.
                </p>

                {/* Add Category Form */}
                <div style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Add New Category
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Category Title <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newCategory.title}
                        onChange={(e) => setNewCategory({ ...newCategory, title: e.target.value })}
                        placeholder="e.g., Computer Science"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Path <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={newCategory.path}
                        onChange={(e) => setNewCategory({ ...newCategory, path: e.target.value })}
                        placeholder="e.g., computer-science"
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
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Description
                      </label>
                      <textarea
                        value={newCategory.description || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        rows={3}
                        placeholder="Category description..."
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
                      type="button"
                      onClick={handleAddCategory}
                      disabled={saving || !newCategory.title.trim() || !newCategory.path.trim()}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        backgroundColor: saving || !newCategory.title.trim() || !newCategory.path.trim() ? '#6c757d' : '#006798',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving || !newCategory.title.trim() || !newCategory.path.trim() ? 'not-allowed' : 'pointer',
                        alignSelf: 'flex-start',
                      }}
                    >
                      Add Category
                    </button>
                  </div>
                </div>

                {/* Categories Table */}
                <div style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#f8f9fa',
                        borderBottom: '2px solid #dee2e6',
                      }}>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Category
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Path
                        </th>
                        <th style={{
                          padding: '0.75rem',
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#002C40',
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <tr key={category.id} style={{
                            borderBottom: '1px solid #dee2e6',
                          }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{category.title}</div>
                              {category.description && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'rgba(0, 0, 0, 0.54)',
                                  marginTop: '0.25rem',
                                }}>
                                  {category.description}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                              {category.path}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={saving}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  backgroundColor: saving ? '#6c757d' : '#dc3545',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: 'rgba(0, 0, 0, 0.54)',
                            fontSize: '0.875rem',
                          }}>
                            No categories found. Use the form above to add a category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

