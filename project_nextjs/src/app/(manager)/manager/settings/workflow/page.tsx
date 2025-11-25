"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ManagerSettingsWorkflowPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"submission" | "review" | "library" | "emails">("submission");
  const [activeSubmissionSubTab, setActiveSubmissionSubTab] = useState<"disableSubmissions" | "metadata" | "components" | "submissionChecklist" | "authorGuidelines">("disableSubmissions");
  const [activeReviewSubTab, setActiveReviewSubTab] = useState<"reviewSetup" | "reviewerGuidance" | "reviewForms">("reviewSetup");
  const [activeEmailSubTab, setActiveEmailSubTab] = useState<"emailsSetup" | "emailTemplates">("emailsSetup");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Get primary locale
  const [primaryLocale, setPrimaryLocale] = useState('en_US');

  // Submission - Disable Submissions state
  const [disableSubmissions, setDisableSubmissions] = useState(false);

  // Submission - Author Guidelines state
  const [authorGuidelines, setAuthorGuidelines] = useState('');

  // Review - Review Setup state
  const [reviewSetup, setReviewSetup] = useState({
    defaultReviewMode: 'double',
    restrictReviewerFileAccess: false,
    reviewerAccessKeysEnabled: false,
    numWeeksPerResponse: '4',
    numWeeksPerReview: '4',
    numDaysBeforeInviteReminder: '3',
    numDaysBeforeSubmitReminder: '3',
  });

  // Review - Reviewer Guidance state
  const [reviewerGuidance, setReviewerGuidance] = useState({
    reviewGuidelines: '',
    competingInterests: '',
    showEnsuringLink: false,
  });

  // Emails - Email Setup state
  const [emailSetup, setEmailSetup] = useState({
    emailSignature: '',
    envelopeSender: '',
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

        const locale = journal?.primary_locale || 'en_US';
        setPrimaryLocale(locale);

        // Load workflow settings from journal_settings
        // Some settings use primary locale, some use empty locale
        const { data: workflowSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value, locale')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'disableSubmissions',
            'authorGuidelines',
            'review_defaultReviewMode', 'review_restrictReviewerFileAccess', 'review_reviewerAccessKeysEnabled',
            'review_numWeeksPerResponse', 'review_numWeeksPerReview',
            'review_numDaysBeforeInviteReminder', 'review_numDaysBeforeSubmitReminder',
            'reviewerGuidance_reviewGuidelines', 'reviewerGuidance_competingInterests', 'reviewerGuidance_showEnsuringLink',
            'emailSetup_emailSignature', 'emailSetup_envelopeSender'
          ])
          .in('locale', [locale, '']);

        if (workflowSettings) {
          const settings: Record<string, string> = {};
          // Prioritize locale-specific settings, fallback to empty locale
          workflowSettings.forEach((s: any) => {
            if (!settings[s.setting_name] || s.locale === locale) {
              settings[s.setting_name] = s.setting_value || '';
            }
          });

          if (settings.disableSubmissions) setDisableSubmissions(settings.disableSubmissions === '1' || settings.disableSubmissions === 'true');
          if (settings.authorGuidelines) setAuthorGuidelines(settings.authorGuidelines);
          if (settings.review_defaultReviewMode) setReviewSetup(prev => ({ ...prev, defaultReviewMode: settings.review_defaultReviewMode }));
          if (settings.review_restrictReviewerFileAccess) setReviewSetup(prev => ({ ...prev, restrictReviewerFileAccess: settings.review_restrictReviewerFileAccess === '1' || settings.review_restrictReviewerFileAccess === 'true' }));
          if (settings.review_reviewerAccessKeysEnabled) setReviewSetup(prev => ({ ...prev, reviewerAccessKeysEnabled: settings.review_reviewerAccessKeysEnabled === '1' || settings.review_reviewerAccessKeysEnabled === 'true' }));
          if (settings.review_numWeeksPerResponse) setReviewSetup(prev => ({ ...prev, numWeeksPerResponse: settings.review_numWeeksPerResponse }));
          if (settings.review_numWeeksPerReview) setReviewSetup(prev => ({ ...prev, numWeeksPerReview: settings.review_numWeeksPerReview }));
          if (settings.review_numDaysBeforeInviteReminder) setReviewSetup(prev => ({ ...prev, numDaysBeforeInviteReminder: settings.review_numDaysBeforeInviteReminder }));
          if (settings.review_numDaysBeforeSubmitReminder) setReviewSetup(prev => ({ ...prev, numDaysBeforeSubmitReminder: settings.review_numDaysBeforeSubmitReminder }));
          if (settings.reviewerGuidance_reviewGuidelines) setReviewerGuidance(prev => ({ ...prev, reviewGuidelines: settings.reviewerGuidance_reviewGuidelines }));
          if (settings.reviewerGuidance_competingInterests) setReviewerGuidance(prev => ({ ...prev, competingInterests: settings.reviewerGuidance_competingInterests }));
          if (settings.reviewerGuidance_showEnsuringLink) setReviewerGuidance(prev => ({ ...prev, showEnsuringLink: settings.reviewerGuidance_showEnsuringLink === '1' || settings.reviewerGuidance_showEnsuringLink === 'true' }));
          if (settings.emailSetup_emailSignature) setEmailSetup(prev => ({ ...prev, emailSignature: settings.emailSetup_emailSignature }));
          if (settings.emailSetup_envelopeSender) setEmailSetup(prev => ({ ...prev, envelopeSender: settings.emailSetup_envelopeSender }));
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
            <span style={{ color: '#111827' }}>Workflow</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Workflow Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure the submission, review, and publication workflow for your journal.
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
            onClick={() => setActiveTab('submission')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'submission' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'submission' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'submission' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Submission
          </button>
          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'review' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'review' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'review' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Review
          </button>
          <button
            onClick={() => setActiveTab('library')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'library' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'library' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'library' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'emails' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'emails' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'emails' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Emails
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
          {/* Submission Tab */}
          {activeTab === 'submission' && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Sidebar Sub-tabs */}
              <div style={{
                width: '200px',
                borderRight: '1px solid #e5e5e5',
                paddingRight: '1rem',
              }}>
                <button
                  onClick={() => setActiveSubmissionSubTab('disableSubmissions')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'disableSubmissions' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'disableSubmissions' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'disableSubmissions' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Disable Submissions
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('metadata')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'metadata' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'metadata' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'metadata' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Metadata
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('components')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'components' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'components' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'components' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Components
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('submissionChecklist')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'submissionChecklist' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'submissionChecklist' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'submissionChecklist' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Submission Checklist
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('authorGuidelines')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'authorGuidelines' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'authorGuidelines' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'authorGuidelines' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Author Guidelines
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                {/* Disable Submissions Sub-tab */}
                {activeSubmissionSubTab === 'disableSubmissions' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: 'disableSubmissions',
                          setting_value: disableSubmissions ? '1' : '0',
                          setting_type: 'bool',
                          locale: '',
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                      setFeedback({ type: 'success', message: 'Disable submissions settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving disable submissions:', error);
                      setFeedback({ type: 'error', message: 'Failed to save disable submissions settings.' });
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
                      Disable Submissions
                    </h2>
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <input
                          type="checkbox"
                          id="disableSubmissions"
                          checked={disableSubmissions}
                          onChange={(e) => setDisableSubmissions(e.target.checked)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                          }}
                        />
                        <label htmlFor="disableSubmissions" style={{
                          fontSize: '0.875rem',
                          color: '#002C40',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}>
                          Disable submissions to this journal
                        </label>
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(0, 0, 0, 0.54)',
                        margin: 0,
                      }}>
                        When enabled, authors will not be able to submit new manuscripts to this journal. Existing submissions will continue through the editorial workflow.
                      </p>
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

                {/* Metadata Sub-tab */}
                {activeSubmissionSubTab === 'metadata' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Metadata
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Configure which metadata fields are available and whether authors can add them during submission.
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      fontStyle: 'italic',
                    }}>
                      Metadata management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Components Sub-tab */}
                {activeSubmissionSubTab === 'components' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Components (File Types)
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Components (genres) management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Submission Checklist Sub-tab */}
                {activeSubmissionSubTab === 'submissionChecklist' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Submission Checklist
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Submission checklist management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Author Guidelines Sub-tab */}
                {activeSubmissionSubTab === 'authorGuidelines' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: 'authorGuidelines',
                          setting_value: authorGuidelines,
                          setting_type: 'string',
                          locale: primaryLocale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                      setFeedback({ type: 'success', message: 'Author guidelines saved successfully.' });
                    } catch (error) {
                      console.error('Error saving author guidelines:', error);
                      setFeedback({ type: 'error', message: 'Failed to save author guidelines.' });
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
                      Author Guidelines
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Author Guidelines
                      </label>
                      <textarea
                        value={authorGuidelines}
                        onChange={(e) => setAuthorGuidelines(e.target.value)}
                        rows={15}
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
              </div>
            </div>
          )}

          {/* Review Tab */}
          {activeTab === 'review' && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Sidebar Sub-tabs */}
              <div style={{
                width: '200px',
                borderRight: '1px solid #e5e5e5',
                paddingRight: '1rem',
              }}>
                <button
                  onClick={() => setActiveReviewSubTab('reviewSetup')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewSetup' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewSetup' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewSetup' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Review Setup
                </button>
                <button
                  onClick={() => setActiveReviewSubTab('reviewerGuidance')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewerGuidance' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewerGuidance' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewerGuidance' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Reviewer Guidance
                </button>
                <button
                  onClick={() => setActiveReviewSubTab('reviewForms')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewForms' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewForms' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewForms' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Review Forms
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                {/* Review Setup Sub-tab */}
                {activeReviewSubTab === 'reviewSetup' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const settings = [
                        { setting_name: 'review_defaultReviewMode', setting_value: reviewSetup.defaultReviewMode, locale: '' },
                        { setting_name: 'review_restrictReviewerFileAccess', setting_value: reviewSetup.restrictReviewerFileAccess ? '1' : '0', locale: '' },
                        { setting_name: 'review_reviewerAccessKeysEnabled', setting_value: reviewSetup.reviewerAccessKeysEnabled ? '1' : '0', locale: '' },
                        { setting_name: 'review_numWeeksPerResponse', setting_value: reviewSetup.numWeeksPerResponse, locale: '' },
                        { setting_name: 'review_numWeeksPerReview', setting_value: reviewSetup.numWeeksPerReview, locale: '' },
                        { setting_name: 'review_numDaysBeforeInviteReminder', setting_value: reviewSetup.numDaysBeforeInviteReminder, locale: '' },
                        { setting_name: 'review_numDaysBeforeSubmitReminder', setting_value: reviewSetup.numDaysBeforeSubmitReminder, locale: '' },
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
                      setFeedback({ type: 'success', message: 'Review setup settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving review setup:', error);
                      setFeedback({ type: 'error', message: 'Failed to save review setup settings.' });
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
                      Review Setup
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Default Review Mode
                      </label>
                      <select
                        value={reviewSetup.defaultReviewMode}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: e.target.value })}
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
                        <option value="double">Double Blind</option>
                        <option value="single">Single Blind</option>
                        <option value="open">Open</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="restrictReviewerFileAccess"
                        checked={reviewSetup.restrictReviewerFileAccess}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, restrictReviewerFileAccess: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="restrictReviewerFileAccess" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Restrict Reviewer File Access
                      </label>
                    </div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="reviewerAccessKeysEnabled"
                        checked={reviewSetup.reviewerAccessKeysEnabled}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, reviewerAccessKeysEnabled: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="reviewerAccessKeysEnabled" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Enable Reviewer Access Keys
                      </label>
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
                          Weeks Per Response
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewSetup.numWeeksPerResponse}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerResponse: e.target.value })}
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
                          Weeks Per Review
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewSetup.numWeeksPerReview}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerReview: e.target.value })}
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
                          Days Before Invite Reminder
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={reviewSetup.numDaysBeforeInviteReminder}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeInviteReminder: e.target.value })}
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
                          Days Before Submit Reminder
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={reviewSetup.numDaysBeforeSubmitReminder}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeSubmitReminder: e.target.value })}
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
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </form>
                )}

                {/* Reviewer Guidance Sub-tab */}
                {activeReviewSubTab === 'reviewerGuidance' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const settings = [
                        { setting_name: 'reviewerGuidance_reviewGuidelines', setting_value: reviewerGuidance.reviewGuidelines, locale: primaryLocale },
                        { setting_name: 'reviewerGuidance_competingInterests', setting_value: reviewerGuidance.competingInterests, locale: primaryLocale },
                        { setting_name: 'reviewerGuidance_showEnsuringLink', setting_value: reviewerGuidance.showEnsuringLink ? '1' : '0', locale: '' },
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
                      setFeedback({ type: 'success', message: 'Reviewer guidance settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving reviewer guidance:', error);
                      setFeedback({ type: 'error', message: 'Failed to save reviewer guidance settings.' });
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
                      Reviewer Guidance
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Review Guidelines
                      </label>
                      <textarea
                        value={reviewerGuidance.reviewGuidelines}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, reviewGuidelines: e.target.value })}
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
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Competing Interests
                      </label>
                      <textarea
                        value={reviewerGuidance.competingInterests}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, competingInterests: e.target.value })}
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
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="showEnsuringLink"
                        checked={reviewerGuidance.showEnsuringLink}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, showEnsuringLink: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="showEnsuringLink" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Show Ensuring Link
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

                {/* Review Forms Sub-tab */}
                {activeReviewSubTab === 'reviewForms' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Review Forms
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Review forms management grid will be implemented here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <div>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#002C40',
              }}>
                Library Files
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(0, 0, 0, 0.54)',
                marginBottom: '1.5rem',
              }}>
                Library files management grid will be implemented here.
              </p>
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div>
              {/* Emails Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActiveEmailSubTab('emailsSetup')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeEmailSubTab === 'emailsSetup' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeEmailSubTab === 'emailsSetup' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Email Setup
                </button>
                <button
                  onClick={() => setActiveEmailSubTab('emailTemplates')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeEmailSubTab === 'emailTemplates' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeEmailSubTab === 'emailTemplates' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Email Templates
                </button>
              </div>

              {/* Email Setup Sub-tab */}
              {activeEmailSubTab === 'emailsSetup' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'emailSetup_emailSignature', setting_value: emailSetup.emailSignature, locale: primaryLocale },
                      { setting_name: 'emailSetup_envelopeSender', setting_value: emailSetup.envelopeSender, locale: '' },
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
                    setFeedback({ type: 'success', message: 'Email setup settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving email setup:', error);
                    setFeedback({ type: 'error', message: 'Failed to save email setup settings.' });
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
                    Email Setup
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Email Signature
                    </label>
                    <textarea
                      value={emailSetup.emailSignature}
                      onChange={(e) => setEmailSetup({ ...emailSetup, emailSignature: e.target.value })}
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
                      Envelope Sender
                    </label>
                    <input
                      type="email"
                      value={emailSetup.envelopeSender}
                      onChange={(e) => setEmailSetup({ ...emailSetup, envelopeSender: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
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

              {/* Email Templates Sub-tab */}
              {activeEmailSubTab === 'emailTemplates' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Email Templates
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Email templates management will be implemented here.
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

export default function ManagerSettingsWorkflowPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"submission" | "review" | "library" | "emails">("submission");
  const [activeSubmissionSubTab, setActiveSubmissionSubTab] = useState<"disableSubmissions" | "metadata" | "components" | "submissionChecklist" | "authorGuidelines">("disableSubmissions");
  const [activeReviewSubTab, setActiveReviewSubTab] = useState<"reviewSetup" | "reviewerGuidance" | "reviewForms">("reviewSetup");
  const [activeEmailSubTab, setActiveEmailSubTab] = useState<"emailsSetup" | "emailTemplates">("emailsSetup");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Get primary locale
  const [primaryLocale, setPrimaryLocale] = useState('en_US');

  // Submission - Disable Submissions state
  const [disableSubmissions, setDisableSubmissions] = useState(false);

  // Submission - Author Guidelines state
  const [authorGuidelines, setAuthorGuidelines] = useState('');

  // Review - Review Setup state
  const [reviewSetup, setReviewSetup] = useState({
    defaultReviewMode: 'double',
    restrictReviewerFileAccess: false,
    reviewerAccessKeysEnabled: false,
    numWeeksPerResponse: '4',
    numWeeksPerReview: '4',
    numDaysBeforeInviteReminder: '3',
    numDaysBeforeSubmitReminder: '3',
  });

  // Review - Reviewer Guidance state
  const [reviewerGuidance, setReviewerGuidance] = useState({
    reviewGuidelines: '',
    competingInterests: '',
    showEnsuringLink: false,
  });

  // Emails - Email Setup state
  const [emailSetup, setEmailSetup] = useState({
    emailSignature: '',
    envelopeSender: '',
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

        const locale = journal?.primary_locale || 'en_US';
        setPrimaryLocale(locale);

        // Load workflow settings from journal_settings
        // Some settings use primary locale, some use empty locale
        const { data: workflowSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value, locale')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'disableSubmissions',
            'authorGuidelines',
            'review_defaultReviewMode', 'review_restrictReviewerFileAccess', 'review_reviewerAccessKeysEnabled',
            'review_numWeeksPerResponse', 'review_numWeeksPerReview',
            'review_numDaysBeforeInviteReminder', 'review_numDaysBeforeSubmitReminder',
            'reviewerGuidance_reviewGuidelines', 'reviewerGuidance_competingInterests', 'reviewerGuidance_showEnsuringLink',
            'emailSetup_emailSignature', 'emailSetup_envelopeSender'
          ])
          .in('locale', [locale, '']);

        if (workflowSettings) {
          const settings: Record<string, string> = {};
          // Prioritize locale-specific settings, fallback to empty locale
          workflowSettings.forEach((s: any) => {
            if (!settings[s.setting_name] || s.locale === locale) {
              settings[s.setting_name] = s.setting_value || '';
            }
          });

          if (settings.disableSubmissions) setDisableSubmissions(settings.disableSubmissions === '1' || settings.disableSubmissions === 'true');
          if (settings.authorGuidelines) setAuthorGuidelines(settings.authorGuidelines);
          if (settings.review_defaultReviewMode) setReviewSetup(prev => ({ ...prev, defaultReviewMode: settings.review_defaultReviewMode }));
          if (settings.review_restrictReviewerFileAccess) setReviewSetup(prev => ({ ...prev, restrictReviewerFileAccess: settings.review_restrictReviewerFileAccess === '1' || settings.review_restrictReviewerFileAccess === 'true' }));
          if (settings.review_reviewerAccessKeysEnabled) setReviewSetup(prev => ({ ...prev, reviewerAccessKeysEnabled: settings.review_reviewerAccessKeysEnabled === '1' || settings.review_reviewerAccessKeysEnabled === 'true' }));
          if (settings.review_numWeeksPerResponse) setReviewSetup(prev => ({ ...prev, numWeeksPerResponse: settings.review_numWeeksPerResponse }));
          if (settings.review_numWeeksPerReview) setReviewSetup(prev => ({ ...prev, numWeeksPerReview: settings.review_numWeeksPerReview }));
          if (settings.review_numDaysBeforeInviteReminder) setReviewSetup(prev => ({ ...prev, numDaysBeforeInviteReminder: settings.review_numDaysBeforeInviteReminder }));
          if (settings.review_numDaysBeforeSubmitReminder) setReviewSetup(prev => ({ ...prev, numDaysBeforeSubmitReminder: settings.review_numDaysBeforeSubmitReminder }));
          if (settings.reviewerGuidance_reviewGuidelines) setReviewerGuidance(prev => ({ ...prev, reviewGuidelines: settings.reviewerGuidance_reviewGuidelines }));
          if (settings.reviewerGuidance_competingInterests) setReviewerGuidance(prev => ({ ...prev, competingInterests: settings.reviewerGuidance_competingInterests }));
          if (settings.reviewerGuidance_showEnsuringLink) setReviewerGuidance(prev => ({ ...prev, showEnsuringLink: settings.reviewerGuidance_showEnsuringLink === '1' || settings.reviewerGuidance_showEnsuringLink === 'true' }));
          if (settings.emailSetup_emailSignature) setEmailSetup(prev => ({ ...prev, emailSignature: settings.emailSetup_emailSignature }));
          if (settings.emailSetup_envelopeSender) setEmailSetup(prev => ({ ...prev, envelopeSender: settings.emailSetup_envelopeSender }));
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
            <span style={{ color: '#111827' }}>Workflow</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Workflow Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure the submission, review, and publication workflow for your journal.
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
            onClick={() => setActiveTab('submission')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'submission' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'submission' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'submission' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Submission
          </button>
          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'review' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'review' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'review' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Review
          </button>
          <button
            onClick={() => setActiveTab('library')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'library' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'library' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'library' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'emails' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'emails' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'emails' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Emails
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
          {/* Submission Tab */}
          {activeTab === 'submission' && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Sidebar Sub-tabs */}
              <div style={{
                width: '200px',
                borderRight: '1px solid #e5e5e5',
                paddingRight: '1rem',
              }}>
                <button
                  onClick={() => setActiveSubmissionSubTab('disableSubmissions')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'disableSubmissions' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'disableSubmissions' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'disableSubmissions' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Disable Submissions
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('metadata')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'metadata' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'metadata' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'metadata' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Metadata
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('components')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'components' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'components' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'components' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Components
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('submissionChecklist')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'submissionChecklist' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'submissionChecklist' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'submissionChecklist' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Submission Checklist
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('authorGuidelines')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'authorGuidelines' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'authorGuidelines' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'authorGuidelines' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Author Guidelines
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                {/* Disable Submissions Sub-tab */}
                {activeSubmissionSubTab === 'disableSubmissions' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: 'disableSubmissions',
                          setting_value: disableSubmissions ? '1' : '0',
                          setting_type: 'bool',
                          locale: '',
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                      setFeedback({ type: 'success', message: 'Disable submissions settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving disable submissions:', error);
                      setFeedback({ type: 'error', message: 'Failed to save disable submissions settings.' });
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
                      Disable Submissions
                    </h2>
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <input
                          type="checkbox"
                          id="disableSubmissions"
                          checked={disableSubmissions}
                          onChange={(e) => setDisableSubmissions(e.target.checked)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                          }}
                        />
                        <label htmlFor="disableSubmissions" style={{
                          fontSize: '0.875rem',
                          color: '#002C40',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}>
                          Disable submissions to this journal
                        </label>
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(0, 0, 0, 0.54)',
                        margin: 0,
                      }}>
                        When enabled, authors will not be able to submit new manuscripts to this journal. Existing submissions will continue through the editorial workflow.
                      </p>
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

                {/* Metadata Sub-tab */}
                {activeSubmissionSubTab === 'metadata' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Metadata
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Configure which metadata fields are available and whether authors can add them during submission.
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      fontStyle: 'italic',
                    }}>
                      Metadata management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Components Sub-tab */}
                {activeSubmissionSubTab === 'components' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Components (File Types)
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Components (genres) management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Submission Checklist Sub-tab */}
                {activeSubmissionSubTab === 'submissionChecklist' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Submission Checklist
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Submission checklist management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Author Guidelines Sub-tab */}
                {activeSubmissionSubTab === 'authorGuidelines' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: 'authorGuidelines',
                          setting_value: authorGuidelines,
                          setting_type: 'string',
                          locale: primaryLocale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                      setFeedback({ type: 'success', message: 'Author guidelines saved successfully.' });
                    } catch (error) {
                      console.error('Error saving author guidelines:', error);
                      setFeedback({ type: 'error', message: 'Failed to save author guidelines.' });
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
                      Author Guidelines
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Author Guidelines
                      </label>
                      <textarea
                        value={authorGuidelines}
                        onChange={(e) => setAuthorGuidelines(e.target.value)}
                        rows={15}
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
              </div>
            </div>
          )}

          {/* Review Tab */}
          {activeTab === 'review' && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Sidebar Sub-tabs */}
              <div style={{
                width: '200px',
                borderRight: '1px solid #e5e5e5',
                paddingRight: '1rem',
              }}>
                <button
                  onClick={() => setActiveReviewSubTab('reviewSetup')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewSetup' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewSetup' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewSetup' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Review Setup
                </button>
                <button
                  onClick={() => setActiveReviewSubTab('reviewerGuidance')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewerGuidance' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewerGuidance' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewerGuidance' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Reviewer Guidance
                </button>
                <button
                  onClick={() => setActiveReviewSubTab('reviewForms')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewForms' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewForms' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewForms' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Review Forms
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                {/* Review Setup Sub-tab */}
                {activeReviewSubTab === 'reviewSetup' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const settings = [
                        { setting_name: 'review_defaultReviewMode', setting_value: reviewSetup.defaultReviewMode, locale: '' },
                        { setting_name: 'review_restrictReviewerFileAccess', setting_value: reviewSetup.restrictReviewerFileAccess ? '1' : '0', locale: '' },
                        { setting_name: 'review_reviewerAccessKeysEnabled', setting_value: reviewSetup.reviewerAccessKeysEnabled ? '1' : '0', locale: '' },
                        { setting_name: 'review_numWeeksPerResponse', setting_value: reviewSetup.numWeeksPerResponse, locale: '' },
                        { setting_name: 'review_numWeeksPerReview', setting_value: reviewSetup.numWeeksPerReview, locale: '' },
                        { setting_name: 'review_numDaysBeforeInviteReminder', setting_value: reviewSetup.numDaysBeforeInviteReminder, locale: '' },
                        { setting_name: 'review_numDaysBeforeSubmitReminder', setting_value: reviewSetup.numDaysBeforeSubmitReminder, locale: '' },
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
                      setFeedback({ type: 'success', message: 'Review setup settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving review setup:', error);
                      setFeedback({ type: 'error', message: 'Failed to save review setup settings.' });
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
                      Review Setup
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Default Review Mode
                      </label>
                      <select
                        value={reviewSetup.defaultReviewMode}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: e.target.value })}
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
                        <option value="double">Double Blind</option>
                        <option value="single">Single Blind</option>
                        <option value="open">Open</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="restrictReviewerFileAccess"
                        checked={reviewSetup.restrictReviewerFileAccess}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, restrictReviewerFileAccess: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="restrictReviewerFileAccess" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Restrict Reviewer File Access
                      </label>
                    </div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="reviewerAccessKeysEnabled"
                        checked={reviewSetup.reviewerAccessKeysEnabled}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, reviewerAccessKeysEnabled: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="reviewerAccessKeysEnabled" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Enable Reviewer Access Keys
                      </label>
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
                          Weeks Per Response
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewSetup.numWeeksPerResponse}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerResponse: e.target.value })}
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
                          Weeks Per Review
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewSetup.numWeeksPerReview}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerReview: e.target.value })}
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
                          Days Before Invite Reminder
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={reviewSetup.numDaysBeforeInviteReminder}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeInviteReminder: e.target.value })}
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
                          Days Before Submit Reminder
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={reviewSetup.numDaysBeforeSubmitReminder}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeSubmitReminder: e.target.value })}
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
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </form>
                )}

                {/* Reviewer Guidance Sub-tab */}
                {activeReviewSubTab === 'reviewerGuidance' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const settings = [
                        { setting_name: 'reviewerGuidance_reviewGuidelines', setting_value: reviewerGuidance.reviewGuidelines, locale: primaryLocale },
                        { setting_name: 'reviewerGuidance_competingInterests', setting_value: reviewerGuidance.competingInterests, locale: primaryLocale },
                        { setting_name: 'reviewerGuidance_showEnsuringLink', setting_value: reviewerGuidance.showEnsuringLink ? '1' : '0', locale: '' },
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
                      setFeedback({ type: 'success', message: 'Reviewer guidance settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving reviewer guidance:', error);
                      setFeedback({ type: 'error', message: 'Failed to save reviewer guidance settings.' });
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
                      Reviewer Guidance
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Review Guidelines
                      </label>
                      <textarea
                        value={reviewerGuidance.reviewGuidelines}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, reviewGuidelines: e.target.value })}
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
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Competing Interests
                      </label>
                      <textarea
                        value={reviewerGuidance.competingInterests}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, competingInterests: e.target.value })}
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
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="showEnsuringLink"
                        checked={reviewerGuidance.showEnsuringLink}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, showEnsuringLink: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="showEnsuringLink" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Show Ensuring Link
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

                {/* Review Forms Sub-tab */}
                {activeReviewSubTab === 'reviewForms' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Review Forms
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Review forms management grid will be implemented here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <div>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#002C40',
              }}>
                Library Files
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(0, 0, 0, 0.54)',
                marginBottom: '1.5rem',
              }}>
                Library files management grid will be implemented here.
              </p>
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div>
              {/* Emails Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActiveEmailSubTab('emailsSetup')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeEmailSubTab === 'emailsSetup' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeEmailSubTab === 'emailsSetup' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Email Setup
                </button>
                <button
                  onClick={() => setActiveEmailSubTab('emailTemplates')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeEmailSubTab === 'emailTemplates' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeEmailSubTab === 'emailTemplates' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Email Templates
                </button>
              </div>

              {/* Email Setup Sub-tab */}
              {activeEmailSubTab === 'emailsSetup' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'emailSetup_emailSignature', setting_value: emailSetup.emailSignature, locale: primaryLocale },
                      { setting_name: 'emailSetup_envelopeSender', setting_value: emailSetup.envelopeSender, locale: '' },
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
                    setFeedback({ type: 'success', message: 'Email setup settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving email setup:', error);
                    setFeedback({ type: 'error', message: 'Failed to save email setup settings.' });
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
                    Email Setup
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Email Signature
                    </label>
                    <textarea
                      value={emailSetup.emailSignature}
                      onChange={(e) => setEmailSetup({ ...emailSetup, emailSignature: e.target.value })}
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
                      Envelope Sender
                    </label>
                    <input
                      type="email"
                      value={emailSetup.envelopeSender}
                      onChange={(e) => setEmailSetup({ ...emailSetup, envelopeSender: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
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

              {/* Email Templates Sub-tab */}
              {activeEmailSubTab === 'emailTemplates' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Email Templates
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Email templates management will be implemented here.
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

export default function ManagerSettingsWorkflowPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"submission" | "review" | "library" | "emails">("submission");
  const [activeSubmissionSubTab, setActiveSubmissionSubTab] = useState<"disableSubmissions" | "metadata" | "components" | "submissionChecklist" | "authorGuidelines">("disableSubmissions");
  const [activeReviewSubTab, setActiveReviewSubTab] = useState<"reviewSetup" | "reviewerGuidance" | "reviewForms">("reviewSetup");
  const [activeEmailSubTab, setActiveEmailSubTab] = useState<"emailsSetup" | "emailTemplates">("emailsSetup");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Get primary locale
  const [primaryLocale, setPrimaryLocale] = useState('en_US');

  // Submission - Disable Submissions state
  const [disableSubmissions, setDisableSubmissions] = useState(false);

  // Submission - Author Guidelines state
  const [authorGuidelines, setAuthorGuidelines] = useState('');

  // Review - Review Setup state
  const [reviewSetup, setReviewSetup] = useState({
    defaultReviewMode: 'double',
    restrictReviewerFileAccess: false,
    reviewerAccessKeysEnabled: false,
    numWeeksPerResponse: '4',
    numWeeksPerReview: '4',
    numDaysBeforeInviteReminder: '3',
    numDaysBeforeSubmitReminder: '3',
  });

  // Review - Reviewer Guidance state
  const [reviewerGuidance, setReviewerGuidance] = useState({
    reviewGuidelines: '',
    competingInterests: '',
    showEnsuringLink: false,
  });

  // Emails - Email Setup state
  const [emailSetup, setEmailSetup] = useState({
    emailSignature: '',
    envelopeSender: '',
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

        const locale = journal?.primary_locale || 'en_US';
        setPrimaryLocale(locale);

        // Load workflow settings from journal_settings
        // Some settings use primary locale, some use empty locale
        const { data: workflowSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value, locale')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'disableSubmissions',
            'authorGuidelines',
            'review_defaultReviewMode', 'review_restrictReviewerFileAccess', 'review_reviewerAccessKeysEnabled',
            'review_numWeeksPerResponse', 'review_numWeeksPerReview',
            'review_numDaysBeforeInviteReminder', 'review_numDaysBeforeSubmitReminder',
            'reviewerGuidance_reviewGuidelines', 'reviewerGuidance_competingInterests', 'reviewerGuidance_showEnsuringLink',
            'emailSetup_emailSignature', 'emailSetup_envelopeSender'
          ])
          .in('locale', [locale, '']);

        if (workflowSettings) {
          const settings: Record<string, string> = {};
          // Prioritize locale-specific settings, fallback to empty locale
          workflowSettings.forEach((s: any) => {
            if (!settings[s.setting_name] || s.locale === locale) {
              settings[s.setting_name] = s.setting_value || '';
            }
          });

          if (settings.disableSubmissions) setDisableSubmissions(settings.disableSubmissions === '1' || settings.disableSubmissions === 'true');
          if (settings.authorGuidelines) setAuthorGuidelines(settings.authorGuidelines);
          if (settings.review_defaultReviewMode) setReviewSetup(prev => ({ ...prev, defaultReviewMode: settings.review_defaultReviewMode }));
          if (settings.review_restrictReviewerFileAccess) setReviewSetup(prev => ({ ...prev, restrictReviewerFileAccess: settings.review_restrictReviewerFileAccess === '1' || settings.review_restrictReviewerFileAccess === 'true' }));
          if (settings.review_reviewerAccessKeysEnabled) setReviewSetup(prev => ({ ...prev, reviewerAccessKeysEnabled: settings.review_reviewerAccessKeysEnabled === '1' || settings.review_reviewerAccessKeysEnabled === 'true' }));
          if (settings.review_numWeeksPerResponse) setReviewSetup(prev => ({ ...prev, numWeeksPerResponse: settings.review_numWeeksPerResponse }));
          if (settings.review_numWeeksPerReview) setReviewSetup(prev => ({ ...prev, numWeeksPerReview: settings.review_numWeeksPerReview }));
          if (settings.review_numDaysBeforeInviteReminder) setReviewSetup(prev => ({ ...prev, numDaysBeforeInviteReminder: settings.review_numDaysBeforeInviteReminder }));
          if (settings.review_numDaysBeforeSubmitReminder) setReviewSetup(prev => ({ ...prev, numDaysBeforeSubmitReminder: settings.review_numDaysBeforeSubmitReminder }));
          if (settings.reviewerGuidance_reviewGuidelines) setReviewerGuidance(prev => ({ ...prev, reviewGuidelines: settings.reviewerGuidance_reviewGuidelines }));
          if (settings.reviewerGuidance_competingInterests) setReviewerGuidance(prev => ({ ...prev, competingInterests: settings.reviewerGuidance_competingInterests }));
          if (settings.reviewerGuidance_showEnsuringLink) setReviewerGuidance(prev => ({ ...prev, showEnsuringLink: settings.reviewerGuidance_showEnsuringLink === '1' || settings.reviewerGuidance_showEnsuringLink === 'true' }));
          if (settings.emailSetup_emailSignature) setEmailSetup(prev => ({ ...prev, emailSignature: settings.emailSetup_emailSignature }));
          if (settings.emailSetup_envelopeSender) setEmailSetup(prev => ({ ...prev, envelopeSender: settings.emailSetup_envelopeSender }));
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
            <span style={{ color: '#111827' }}>Workflow</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Workflow Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure the submission, review, and publication workflow for your journal.
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
            onClick={() => setActiveTab('submission')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'submission' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'submission' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'submission' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Submission
          </button>
          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'review' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'review' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'review' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Review
          </button>
          <button
            onClick={() => setActiveTab('library')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'library' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'library' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'library' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'emails' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'emails' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'emails' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Emails
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
          {/* Submission Tab */}
          {activeTab === 'submission' && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Sidebar Sub-tabs */}
              <div style={{
                width: '200px',
                borderRight: '1px solid #e5e5e5',
                paddingRight: '1rem',
              }}>
                <button
                  onClick={() => setActiveSubmissionSubTab('disableSubmissions')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'disableSubmissions' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'disableSubmissions' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'disableSubmissions' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Disable Submissions
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('metadata')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'metadata' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'metadata' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'metadata' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Metadata
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('components')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'components' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'components' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'components' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Components
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('submissionChecklist')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'submissionChecklist' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'submissionChecklist' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'submissionChecklist' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Submission Checklist
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('authorGuidelines')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'authorGuidelines' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'authorGuidelines' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'authorGuidelines' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Author Guidelines
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                {/* Disable Submissions Sub-tab */}
                {activeSubmissionSubTab === 'disableSubmissions' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: 'disableSubmissions',
                          setting_value: disableSubmissions ? '1' : '0',
                          setting_type: 'bool',
                          locale: '',
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                      setFeedback({ type: 'success', message: 'Disable submissions settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving disable submissions:', error);
                      setFeedback({ type: 'error', message: 'Failed to save disable submissions settings.' });
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
                      Disable Submissions
                    </h2>
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <input
                          type="checkbox"
                          id="disableSubmissions"
                          checked={disableSubmissions}
                          onChange={(e) => setDisableSubmissions(e.target.checked)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                          }}
                        />
                        <label htmlFor="disableSubmissions" style={{
                          fontSize: '0.875rem',
                          color: '#002C40',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}>
                          Disable submissions to this journal
                        </label>
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(0, 0, 0, 0.54)',
                        margin: 0,
                      }}>
                        When enabled, authors will not be able to submit new manuscripts to this journal. Existing submissions will continue through the editorial workflow.
                      </p>
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

                {/* Metadata Sub-tab */}
                {activeSubmissionSubTab === 'metadata' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Metadata
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Configure which metadata fields are available and whether authors can add them during submission.
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      fontStyle: 'italic',
                    }}>
                      Metadata management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Components Sub-tab */}
                {activeSubmissionSubTab === 'components' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Components (File Types)
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Components (genres) management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Submission Checklist Sub-tab */}
                {activeSubmissionSubTab === 'submissionChecklist' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Submission Checklist
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Submission checklist management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Author Guidelines Sub-tab */}
                {activeSubmissionSubTab === 'authorGuidelines' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: 'authorGuidelines',
                          setting_value: authorGuidelines,
                          setting_type: 'string',
                          locale: primaryLocale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                      setFeedback({ type: 'success', message: 'Author guidelines saved successfully.' });
                    } catch (error) {
                      console.error('Error saving author guidelines:', error);
                      setFeedback({ type: 'error', message: 'Failed to save author guidelines.' });
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
                      Author Guidelines
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Author Guidelines
                      </label>
                      <textarea
                        value={authorGuidelines}
                        onChange={(e) => setAuthorGuidelines(e.target.value)}
                        rows={15}
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
              </div>
            </div>
          )}

          {/* Review Tab */}
          {activeTab === 'review' && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Sidebar Sub-tabs */}
              <div style={{
                width: '200px',
                borderRight: '1px solid #e5e5e5',
                paddingRight: '1rem',
              }}>
                <button
                  onClick={() => setActiveReviewSubTab('reviewSetup')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewSetup' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewSetup' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewSetup' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Review Setup
                </button>
                <button
                  onClick={() => setActiveReviewSubTab('reviewerGuidance')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewerGuidance' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewerGuidance' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewerGuidance' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Reviewer Guidance
                </button>
                <button
                  onClick={() => setActiveReviewSubTab('reviewForms')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewForms' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewForms' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewForms' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Review Forms
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                {/* Review Setup Sub-tab */}
                {activeReviewSubTab === 'reviewSetup' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const settings = [
                        { setting_name: 'review_defaultReviewMode', setting_value: reviewSetup.defaultReviewMode, locale: '' },
                        { setting_name: 'review_restrictReviewerFileAccess', setting_value: reviewSetup.restrictReviewerFileAccess ? '1' : '0', locale: '' },
                        { setting_name: 'review_reviewerAccessKeysEnabled', setting_value: reviewSetup.reviewerAccessKeysEnabled ? '1' : '0', locale: '' },
                        { setting_name: 'review_numWeeksPerResponse', setting_value: reviewSetup.numWeeksPerResponse, locale: '' },
                        { setting_name: 'review_numWeeksPerReview', setting_value: reviewSetup.numWeeksPerReview, locale: '' },
                        { setting_name: 'review_numDaysBeforeInviteReminder', setting_value: reviewSetup.numDaysBeforeInviteReminder, locale: '' },
                        { setting_name: 'review_numDaysBeforeSubmitReminder', setting_value: reviewSetup.numDaysBeforeSubmitReminder, locale: '' },
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
                      setFeedback({ type: 'success', message: 'Review setup settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving review setup:', error);
                      setFeedback({ type: 'error', message: 'Failed to save review setup settings.' });
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
                      Review Setup
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Default Review Mode
                      </label>
                      <select
                        value={reviewSetup.defaultReviewMode}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: e.target.value })}
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
                        <option value="double">Double Blind</option>
                        <option value="single">Single Blind</option>
                        <option value="open">Open</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="restrictReviewerFileAccess"
                        checked={reviewSetup.restrictReviewerFileAccess}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, restrictReviewerFileAccess: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="restrictReviewerFileAccess" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Restrict Reviewer File Access
                      </label>
                    </div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="reviewerAccessKeysEnabled"
                        checked={reviewSetup.reviewerAccessKeysEnabled}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, reviewerAccessKeysEnabled: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="reviewerAccessKeysEnabled" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Enable Reviewer Access Keys
                      </label>
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
                          Weeks Per Response
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewSetup.numWeeksPerResponse}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerResponse: e.target.value })}
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
                          Weeks Per Review
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewSetup.numWeeksPerReview}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerReview: e.target.value })}
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
                          Days Before Invite Reminder
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={reviewSetup.numDaysBeforeInviteReminder}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeInviteReminder: e.target.value })}
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
                          Days Before Submit Reminder
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={reviewSetup.numDaysBeforeSubmitReminder}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeSubmitReminder: e.target.value })}
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
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </form>
                )}

                {/* Reviewer Guidance Sub-tab */}
                {activeReviewSubTab === 'reviewerGuidance' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const settings = [
                        { setting_name: 'reviewerGuidance_reviewGuidelines', setting_value: reviewerGuidance.reviewGuidelines, locale: primaryLocale },
                        { setting_name: 'reviewerGuidance_competingInterests', setting_value: reviewerGuidance.competingInterests, locale: primaryLocale },
                        { setting_name: 'reviewerGuidance_showEnsuringLink', setting_value: reviewerGuidance.showEnsuringLink ? '1' : '0', locale: '' },
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
                      setFeedback({ type: 'success', message: 'Reviewer guidance settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving reviewer guidance:', error);
                      setFeedback({ type: 'error', message: 'Failed to save reviewer guidance settings.' });
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
                      Reviewer Guidance
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Review Guidelines
                      </label>
                      <textarea
                        value={reviewerGuidance.reviewGuidelines}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, reviewGuidelines: e.target.value })}
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
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Competing Interests
                      </label>
                      <textarea
                        value={reviewerGuidance.competingInterests}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, competingInterests: e.target.value })}
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
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="showEnsuringLink"
                        checked={reviewerGuidance.showEnsuringLink}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, showEnsuringLink: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="showEnsuringLink" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Show Ensuring Link
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

                {/* Review Forms Sub-tab */}
                {activeReviewSubTab === 'reviewForms' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Review Forms
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Review forms management grid will be implemented here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <div>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#002C40',
              }}>
                Library Files
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(0, 0, 0, 0.54)',
                marginBottom: '1.5rem',
              }}>
                Library files management grid will be implemented here.
              </p>
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div>
              {/* Emails Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActiveEmailSubTab('emailsSetup')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeEmailSubTab === 'emailsSetup' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeEmailSubTab === 'emailsSetup' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Email Setup
                </button>
                <button
                  onClick={() => setActiveEmailSubTab('emailTemplates')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeEmailSubTab === 'emailTemplates' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeEmailSubTab === 'emailTemplates' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Email Templates
                </button>
              </div>

              {/* Email Setup Sub-tab */}
              {activeEmailSubTab === 'emailsSetup' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'emailSetup_emailSignature', setting_value: emailSetup.emailSignature, locale: primaryLocale },
                      { setting_name: 'emailSetup_envelopeSender', setting_value: emailSetup.envelopeSender, locale: '' },
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
                    setFeedback({ type: 'success', message: 'Email setup settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving email setup:', error);
                    setFeedback({ type: 'error', message: 'Failed to save email setup settings.' });
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
                    Email Setup
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Email Signature
                    </label>
                    <textarea
                      value={emailSetup.emailSignature}
                      onChange={(e) => setEmailSetup({ ...emailSetup, emailSignature: e.target.value })}
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
                      Envelope Sender
                    </label>
                    <input
                      type="email"
                      value={emailSetup.envelopeSender}
                      onChange={(e) => setEmailSetup({ ...emailSetup, envelopeSender: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
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

              {/* Email Templates Sub-tab */}
              {activeEmailSubTab === 'emailTemplates' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Email Templates
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Email templates management will be implemented here.
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

export default function ManagerSettingsWorkflowPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"submission" | "review" | "library" | "emails">("submission");
  const [activeSubmissionSubTab, setActiveSubmissionSubTab] = useState<"disableSubmissions" | "metadata" | "components" | "submissionChecklist" | "authorGuidelines">("disableSubmissions");
  const [activeReviewSubTab, setActiveReviewSubTab] = useState<"reviewSetup" | "reviewerGuidance" | "reviewForms">("reviewSetup");
  const [activeEmailSubTab, setActiveEmailSubTab] = useState<"emailsSetup" | "emailTemplates">("emailsSetup");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Get journal ID from user roles
  const journalId = user?.roles?.find(r => r.context_id)?.context_id;

  // Get primary locale
  const [primaryLocale, setPrimaryLocale] = useState('en_US');

  // Submission - Disable Submissions state
  const [disableSubmissions, setDisableSubmissions] = useState(false);

  // Submission - Author Guidelines state
  const [authorGuidelines, setAuthorGuidelines] = useState('');

  // Review - Review Setup state
  const [reviewSetup, setReviewSetup] = useState({
    defaultReviewMode: 'double',
    restrictReviewerFileAccess: false,
    reviewerAccessKeysEnabled: false,
    numWeeksPerResponse: '4',
    numWeeksPerReview: '4',
    numDaysBeforeInviteReminder: '3',
    numDaysBeforeSubmitReminder: '3',
  });

  // Review - Reviewer Guidance state
  const [reviewerGuidance, setReviewerGuidance] = useState({
    reviewGuidelines: '',
    competingInterests: '',
    showEnsuringLink: false,
  });

  // Emails - Email Setup state
  const [emailSetup, setEmailSetup] = useState({
    emailSignature: '',
    envelopeSender: '',
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

        const locale = journal?.primary_locale || 'en_US';
        setPrimaryLocale(locale);

        // Load workflow settings from journal_settings
        // Some settings use primary locale, some use empty locale
        const { data: workflowSettings } = await supabase
          .from('journal_settings')
          .select('setting_name, setting_value, locale')
          .eq('journal_id', journalId)
          .in('setting_name', [
            'disableSubmissions',
            'authorGuidelines',
            'review_defaultReviewMode', 'review_restrictReviewerFileAccess', 'review_reviewerAccessKeysEnabled',
            'review_numWeeksPerResponse', 'review_numWeeksPerReview',
            'review_numDaysBeforeInviteReminder', 'review_numDaysBeforeSubmitReminder',
            'reviewerGuidance_reviewGuidelines', 'reviewerGuidance_competingInterests', 'reviewerGuidance_showEnsuringLink',
            'emailSetup_emailSignature', 'emailSetup_envelopeSender'
          ])
          .in('locale', [locale, '']);

        if (workflowSettings) {
          const settings: Record<string, string> = {};
          // Prioritize locale-specific settings, fallback to empty locale
          workflowSettings.forEach((s: any) => {
            if (!settings[s.setting_name] || s.locale === locale) {
              settings[s.setting_name] = s.setting_value || '';
            }
          });

          if (settings.disableSubmissions) setDisableSubmissions(settings.disableSubmissions === '1' || settings.disableSubmissions === 'true');
          if (settings.authorGuidelines) setAuthorGuidelines(settings.authorGuidelines);
          if (settings.review_defaultReviewMode) setReviewSetup(prev => ({ ...prev, defaultReviewMode: settings.review_defaultReviewMode }));
          if (settings.review_restrictReviewerFileAccess) setReviewSetup(prev => ({ ...prev, restrictReviewerFileAccess: settings.review_restrictReviewerFileAccess === '1' || settings.review_restrictReviewerFileAccess === 'true' }));
          if (settings.review_reviewerAccessKeysEnabled) setReviewSetup(prev => ({ ...prev, reviewerAccessKeysEnabled: settings.review_reviewerAccessKeysEnabled === '1' || settings.review_reviewerAccessKeysEnabled === 'true' }));
          if (settings.review_numWeeksPerResponse) setReviewSetup(prev => ({ ...prev, numWeeksPerResponse: settings.review_numWeeksPerResponse }));
          if (settings.review_numWeeksPerReview) setReviewSetup(prev => ({ ...prev, numWeeksPerReview: settings.review_numWeeksPerReview }));
          if (settings.review_numDaysBeforeInviteReminder) setReviewSetup(prev => ({ ...prev, numDaysBeforeInviteReminder: settings.review_numDaysBeforeInviteReminder }));
          if (settings.review_numDaysBeforeSubmitReminder) setReviewSetup(prev => ({ ...prev, numDaysBeforeSubmitReminder: settings.review_numDaysBeforeSubmitReminder }));
          if (settings.reviewerGuidance_reviewGuidelines) setReviewerGuidance(prev => ({ ...prev, reviewGuidelines: settings.reviewerGuidance_reviewGuidelines }));
          if (settings.reviewerGuidance_competingInterests) setReviewerGuidance(prev => ({ ...prev, competingInterests: settings.reviewerGuidance_competingInterests }));
          if (settings.reviewerGuidance_showEnsuringLink) setReviewerGuidance(prev => ({ ...prev, showEnsuringLink: settings.reviewerGuidance_showEnsuringLink === '1' || settings.reviewerGuidance_showEnsuringLink === 'true' }));
          if (settings.emailSetup_emailSignature) setEmailSetup(prev => ({ ...prev, emailSignature: settings.emailSetup_emailSignature }));
          if (settings.emailSetup_envelopeSender) setEmailSetup(prev => ({ ...prev, envelopeSender: settings.emailSetup_envelopeSender }));
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
            <span style={{ color: '#111827' }}>Workflow</span>
          </div>
          
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: 0,
            padding: '0.5rem 0',
            color: '#002C40',
          }}>
            Workflow Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'rgba(0, 0, 0, 0.54)',
            marginTop: '0.5rem',
            marginBottom: 0,
          }}>
            Configure the submission, review, and publication workflow for your journal.
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
            onClick={() => setActiveTab('submission')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'submission' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'submission' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'submission' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Submission
          </button>
          <button
            onClick={() => setActiveTab('review')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'review' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'review' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'review' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Review
          </button>
          <button
            onClick={() => setActiveTab('library')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'library' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'library' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'library' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: activeTab === 'emails' ? '#002C40' : '#666',
              backgroundColor: activeTab === 'emails' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'emails' ? '3px solid #006798' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Emails
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
          {/* Submission Tab */}
          {activeTab === 'submission' && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Sidebar Sub-tabs */}
              <div style={{
                width: '200px',
                borderRight: '1px solid #e5e5e5',
                paddingRight: '1rem',
              }}>
                <button
                  onClick={() => setActiveSubmissionSubTab('disableSubmissions')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'disableSubmissions' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'disableSubmissions' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'disableSubmissions' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Disable Submissions
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('metadata')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'metadata' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'metadata' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'metadata' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Metadata
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('components')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'components' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'components' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'components' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Components
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('submissionChecklist')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'submissionChecklist' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'submissionChecklist' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'submissionChecklist' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Submission Checklist
                </button>
                <button
                  onClick={() => setActiveSubmissionSubTab('authorGuidelines')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeSubmissionSubTab === 'authorGuidelines' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeSubmissionSubTab === 'authorGuidelines' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeSubmissionSubTab === 'authorGuidelines' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Author Guidelines
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                {/* Disable Submissions Sub-tab */}
                {activeSubmissionSubTab === 'disableSubmissions' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: 'disableSubmissions',
                          setting_value: disableSubmissions ? '1' : '0',
                          setting_type: 'bool',
                          locale: '',
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                      setFeedback({ type: 'success', message: 'Disable submissions settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving disable submissions:', error);
                      setFeedback({ type: 'error', message: 'Failed to save disable submissions settings.' });
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
                      Disable Submissions
                    </h2>
                    <div style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <input
                          type="checkbox"
                          id="disableSubmissions"
                          checked={disableSubmissions}
                          onChange={(e) => setDisableSubmissions(e.target.checked)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                          }}
                        />
                        <label htmlFor="disableSubmissions" style={{
                          fontSize: '0.875rem',
                          color: '#002C40',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}>
                          Disable submissions to this journal
                        </label>
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(0, 0, 0, 0.54)',
                        margin: 0,
                      }}>
                        When enabled, authors will not be able to submit new manuscripts to this journal. Existing submissions will continue through the editorial workflow.
                      </p>
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

                {/* Metadata Sub-tab */}
                {activeSubmissionSubTab === 'metadata' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Metadata
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Configure which metadata fields are available and whether authors can add them during submission.
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      fontStyle: 'italic',
                    }}>
                      Metadata management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Components Sub-tab */}
                {activeSubmissionSubTab === 'components' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Components (File Types)
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Components (genres) management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Submission Checklist Sub-tab */}
                {activeSubmissionSubTab === 'submissionChecklist' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Submission Checklist
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Submission checklist management grid will be implemented here.
                    </p>
                  </div>
                )}

                {/* Author Guidelines Sub-tab */}
                {activeSubmissionSubTab === 'authorGuidelines' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const { error } = await supabase
                        .from('journal_settings')
                        .upsert({
                          journal_id: journalId,
                          setting_name: 'authorGuidelines',
                          setting_value: authorGuidelines,
                          setting_type: 'string',
                          locale: primaryLocale,
                        }, {
                          onConflict: 'journal_id,setting_name,locale'
                        });
                      if (error) throw error;
                      setFeedback({ type: 'success', message: 'Author guidelines saved successfully.' });
                    } catch (error) {
                      console.error('Error saving author guidelines:', error);
                      setFeedback({ type: 'error', message: 'Failed to save author guidelines.' });
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
                      Author Guidelines
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Author Guidelines
                      </label>
                      <textarea
                        value={authorGuidelines}
                        onChange={(e) => setAuthorGuidelines(e.target.value)}
                        rows={15}
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
              </div>
            </div>
          )}

          {/* Review Tab */}
          {activeTab === 'review' && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Sidebar Sub-tabs */}
              <div style={{
                width: '200px',
                borderRight: '1px solid #e5e5e5',
                paddingRight: '1rem',
              }}>
                <button
                  onClick={() => setActiveReviewSubTab('reviewSetup')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewSetup' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewSetup' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewSetup' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Review Setup
                </button>
                <button
                  onClick={() => setActiveReviewSubTab('reviewerGuidance')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewerGuidance' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewerGuidance' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewerGuidance' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Reviewer Guidance
                </button>
                <button
                  onClick={() => setActiveReviewSubTab('reviewForms')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    backgroundColor: activeReviewSubTab === 'reviewForms' ? 'rgba(0, 103, 152, 0.1)' : 'transparent',
                    color: activeReviewSubTab === 'reviewForms' ? '#006798' : 'rgba(0, 0, 0, 0.84)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: activeReviewSubTab === 'reviewForms' ? 600 : 400,
                    marginBottom: '0.25rem',
                  }}
                >
                  Review Forms
                </button>
              </div>

              {/* Content Area */}
              <div style={{ flex: 1 }}>
                {/* Review Setup Sub-tab */}
                {activeReviewSubTab === 'reviewSetup' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const settings = [
                        { setting_name: 'review_defaultReviewMode', setting_value: reviewSetup.defaultReviewMode, locale: '' },
                        { setting_name: 'review_restrictReviewerFileAccess', setting_value: reviewSetup.restrictReviewerFileAccess ? '1' : '0', locale: '' },
                        { setting_name: 'review_reviewerAccessKeysEnabled', setting_value: reviewSetup.reviewerAccessKeysEnabled ? '1' : '0', locale: '' },
                        { setting_name: 'review_numWeeksPerResponse', setting_value: reviewSetup.numWeeksPerResponse, locale: '' },
                        { setting_name: 'review_numWeeksPerReview', setting_value: reviewSetup.numWeeksPerReview, locale: '' },
                        { setting_name: 'review_numDaysBeforeInviteReminder', setting_value: reviewSetup.numDaysBeforeInviteReminder, locale: '' },
                        { setting_name: 'review_numDaysBeforeSubmitReminder', setting_value: reviewSetup.numDaysBeforeSubmitReminder, locale: '' },
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
                      setFeedback({ type: 'success', message: 'Review setup settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving review setup:', error);
                      setFeedback({ type: 'error', message: 'Failed to save review setup settings.' });
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
                      Review Setup
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Default Review Mode
                      </label>
                      <select
                        value={reviewSetup.defaultReviewMode}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, defaultReviewMode: e.target.value })}
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
                        <option value="double">Double Blind</option>
                        <option value="single">Single Blind</option>
                        <option value="open">Open</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="restrictReviewerFileAccess"
                        checked={reviewSetup.restrictReviewerFileAccess}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, restrictReviewerFileAccess: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="restrictReviewerFileAccess" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Restrict Reviewer File Access
                      </label>
                    </div>
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="reviewerAccessKeysEnabled"
                        checked={reviewSetup.reviewerAccessKeysEnabled}
                        onChange={(e) => setReviewSetup({ ...reviewSetup, reviewerAccessKeysEnabled: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="reviewerAccessKeysEnabled" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Enable Reviewer Access Keys
                      </label>
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
                          Weeks Per Response
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewSetup.numWeeksPerResponse}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerResponse: e.target.value })}
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
                          Weeks Per Review
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={reviewSetup.numWeeksPerReview}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numWeeksPerReview: e.target.value })}
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
                          Days Before Invite Reminder
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={reviewSetup.numDaysBeforeInviteReminder}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeInviteReminder: e.target.value })}
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
                          Days Before Submit Reminder
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={reviewSetup.numDaysBeforeSubmitReminder}
                          onChange={(e) => setReviewSetup({ ...reviewSetup, numDaysBeforeSubmitReminder: e.target.value })}
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
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </form>
                )}

                {/* Reviewer Guidance Sub-tab */}
                {activeReviewSubTab === 'reviewerGuidance' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      const supabase = getSupabaseClient();
                      const settings = [
                        { setting_name: 'reviewerGuidance_reviewGuidelines', setting_value: reviewerGuidance.reviewGuidelines, locale: primaryLocale },
                        { setting_name: 'reviewerGuidance_competingInterests', setting_value: reviewerGuidance.competingInterests, locale: primaryLocale },
                        { setting_name: 'reviewerGuidance_showEnsuringLink', setting_value: reviewerGuidance.showEnsuringLink ? '1' : '0', locale: '' },
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
                      setFeedback({ type: 'success', message: 'Reviewer guidance settings saved successfully.' });
                    } catch (error) {
                      console.error('Error saving reviewer guidance:', error);
                      setFeedback({ type: 'error', message: 'Failed to save reviewer guidance settings.' });
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
                      Reviewer Guidance
                    </h2>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Review Guidelines
                      </label>
                      <textarea
                        value={reviewerGuidance.reviewGuidelines}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, reviewGuidelines: e.target.value })}
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
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#002C40',
                      }}>
                        Competing Interests
                      </label>
                      <textarea
                        value={reviewerGuidance.competingInterests}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, competingInterests: e.target.value })}
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
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="showEnsuringLink"
                        checked={reviewerGuidance.showEnsuringLink}
                        onChange={(e) => setReviewerGuidance({ ...reviewerGuidance, showEnsuringLink: e.target.checked })}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                        }}
                      />
                      <label htmlFor="showEnsuringLink" style={{
                        fontSize: '0.875rem',
                        color: '#002C40',
                        cursor: 'pointer',
                      }}>
                        Show Ensuring Link
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

                {/* Review Forms Sub-tab */}
                {activeReviewSubTab === 'reviewForms' && (
                  <div>
                    <h2 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                      color: '#002C40',
                    }}>
                      Review Forms
                    </h2>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.54)',
                      marginBottom: '1.5rem',
                    }}>
                      Review forms management grid will be implemented here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Library Tab */}
          {activeTab === 'library' && (
            <div>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#002C40',
              }}>
                Library Files
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(0, 0, 0, 0.54)',
                marginBottom: '1.5rem',
              }}>
                Library files management grid will be implemented here.
              </p>
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div>
              {/* Emails Sub-tabs */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #e5e5e5',
                paddingBottom: '0.5rem',
              }}>
                <button
                  onClick={() => setActiveEmailSubTab('emailsSetup')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeEmailSubTab === 'emailsSetup' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeEmailSubTab === 'emailsSetup' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Email Setup
                </button>
                <button
                  onClick={() => setActiveEmailSubTab('emailTemplates')}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: activeEmailSubTab === 'emailTemplates' ? '#006798' : '#666',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeEmailSubTab === 'emailTemplates' ? '2px solid #006798' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  Email Templates
                </button>
              </div>

              {/* Email Setup Sub-tab */}
              {activeEmailSubTab === 'emailsSetup' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const supabase = getSupabaseClient();
                    const settings = [
                      { setting_name: 'emailSetup_emailSignature', setting_value: emailSetup.emailSignature, locale: primaryLocale },
                      { setting_name: 'emailSetup_envelopeSender', setting_value: emailSetup.envelopeSender, locale: '' },
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
                    setFeedback({ type: 'success', message: 'Email setup settings saved successfully.' });
                  } catch (error) {
                    console.error('Error saving email setup:', error);
                    setFeedback({ type: 'error', message: 'Failed to save email setup settings.' });
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
                    Email Setup
                  </h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      color: '#002C40',
                    }}>
                      Email Signature
                    </label>
                    <textarea
                      value={emailSetup.emailSignature}
                      onChange={(e) => setEmailSetup({ ...emailSetup, emailSignature: e.target.value })}
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
                      Envelope Sender
                    </label>
                    <input
                      type="email"
                      value={emailSetup.envelopeSender}
                      onChange={(e) => setEmailSetup({ ...emailSetup, envelopeSender: e.target.value })}
                      style={{
                        width: '100%',
                        maxWidth: '400px',
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

              {/* Email Templates Sub-tab */}
              {activeEmailSubTab === 'emailTemplates' && (
                <div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#002C40',
                  }}>
                    Email Templates
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.54)',
                    marginBottom: '1.5rem',
                  }}>
                    Email templates management will be implemented here.
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


