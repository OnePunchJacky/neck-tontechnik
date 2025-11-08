'use client';

import { useState, useEffect } from 'react';
import FormField from '@/app/components/admin/FormField';
import { Key, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface ApplicationPassword {
  uuid: string;
  name: string;
  created: string;
  last_used?: string;
  last_ip?: string;
}

export default function SettingsPage() {
  const [appPasswords, setAppPasswords] = useState<ApplicationPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPasswordName, setNewPasswordName] = useState('');
  const [newPasswordValue, setNewPasswordValue] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchApplicationPasswords();
  }, []);

  const fetchApplicationPasswords = async () => {
    try {
      const response = await fetch('/api/user/application-passwords');
      if (response.ok) {
        const data = await response.json();
        setAppPasswords(data || []);
      }
    } catch (error) {
      console.error('Error fetching application passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPasswordName.trim()) {
      setError('Bitte gib einen Namen für das Application Password ein');
      return;
    }

    try {
      const response = await fetch('/api/user/application-passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPasswordName }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewPasswordValue(data.password);
        setShowNewPassword(true);
        setNewPasswordName('');
        setSuccess('Application Password erfolgreich erstellt! Speichere es sicher, es wird nur einmal angezeigt.');
        await fetchApplicationPasswords();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Fehler beim Erstellen des Application Passwords');
      }
    } catch (error) {
      setError('Fehler beim Erstellen des Application Passwords');
    }
  };

  const handleRevokeAppPassword = async (uuid: string) => {
    if (!confirm('Möchtest du dieses Application Password wirklich widerrufen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/application-passwords/${uuid}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Application Password erfolgreich widerrufen');
        await fetchApplicationPasswords();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Fehler beim Widerrufen des Application Passwords');
      }
    } catch (error) {
      setError('Fehler beim Widerrufen des Application Passwords');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newPassword: passwordForm.newPassword,
          currentPassword: passwordForm.currentPassword || undefined,
        }),
      });

      if (response.ok) {
        setSuccess('Passwort erfolgreich geändert. Du musst dich mit dem neuen Passwort neu anmelden.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordFields(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Fehler beim Ändern des Passworts');
      }
    } catch (error) {
      setError('Fehler beim Ändern des Passworts');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        Einstellungen
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500">
          {success}
        </div>
      )}

      {/* Change Main Password */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
          Hauptpasswort ändern
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Ändere dein WordPress-Hauptpasswort. Nach der Änderung musst du dich mit dem neuen Passwort neu anmelden.
        </p>
        {!showPasswordFields ? (
          <button
            onClick={() => setShowPasswordFields(true)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
          >
            Passwort ändern
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <FormField
              label="Aktuelles Passwort (optional)"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })}
              helperText="Einige WordPress-Installationen erfordern das aktuelle Passwort zur Bestätigung"
            />
            <FormField
              label="Neues Passwort"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
              required
            />
            <FormField
              label="Passwort bestätigen"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
              required
            />
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
              >
                Passwort ändern
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordFields(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setError(null);
                }}
                className="px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] hover:opacity-80"
              >
                Abbrechen
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Application Passwords */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
          Application Passwords
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Application Passwords werden für die API-Authentifizierung verwendet. Du kannst mehrere erstellen und verwalten.
        </p>

        {/* New Application Password */}
        {showNewPassword && newPasswordValue && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                Wichtig: Speichere dieses Passwort jetzt! Es wird nur einmal angezeigt.
              </p>
              <button
                onClick={() => {
                  setShowNewPassword(false);
                  setNewPasswordValue(null);
                }}
                className="text-yellow-600 dark:text-yellow-400 hover:opacity-80"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded text-sm font-mono">
                {newPasswordValue}
              </code>
              <button
                onClick={() => copyToClipboard(newPasswordValue)}
                className="p-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded hover:opacity-80"
                title="Kopieren"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleCreateAppPassword} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newPasswordName}
              onChange={(e) => setNewPasswordName(e.target.value)}
              placeholder="Name für das Application Password"
              className="flex-1 px-4 py-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Erstellen
            </button>
          </div>
        </form>

        {/* List of Application Passwords */}
        {loading ? (
          <div className="text-[var(--color-text-secondary)]">Laden...</div>
        ) : appPasswords.length === 0 ? (
          <p className="text-[var(--color-text-secondary)]">Keine Application Passwords vorhanden</p>
        ) : (
          <div className="space-y-3">
            {appPasswords.map((appPassword) => (
              <div
                key={appPassword.uuid}
                className="flex items-center justify-between p-4 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-[var(--color-text-primary)] mb-1">
                    {appPassword.name}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    Erstellt: {formatDate(appPassword.created)}
                  </div>
                  {appPassword.last_used && (
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      Zuletzt verwendet: {formatDate(appPassword.last_used)}
                      {appPassword.last_ip && ` (${appPassword.last_ip})`}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRevokeAppPassword(appPassword.uuid)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Widerrufen"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

