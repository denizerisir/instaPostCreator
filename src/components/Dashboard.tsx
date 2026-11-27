import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './Navbar';
import { CreatePost } from './CreatePost';
import { DraftsList } from './DraftsList';
import { SettingsView } from './SettingsView';
import { DraftEditorModal } from './DraftEditorModal';
import { ToastContainer } from './Toast';
import { DraftItem, ToastMessage } from '../types';
import { storage, apiRequest } from '../services/api';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [drafts, setDrafts] = useState<DraftItem[]>(() => storage.getLocalDrafts());
  const [activeDraftModal, setActiveDraftModal] = useState<DraftItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync drafts with serverless store if available, and keep local storage synced
  useEffect(() => {
    const fetchRemoteDrafts = async () => {
      try {
        const res = await apiRequest('/drafts');
        if (res.drafts && Array.isArray(res.drafts) && res.drafts.length > 0) {
          setDrafts(res.drafts);
          storage.setLocalDrafts(res.drafts);
        }
      } catch (err) {
        // Fall back to local drafts quietly
      }
    };
    fetchRemoteDrafts();
  }, []);

  // Save to local storage whenever drafts change
  const updateDrafts = (newDrafts: DraftItem[]) => {
    setDrafts(newDrafts);
    storage.setLocalDrafts(newDrafts);
  };

  const handleDraftCreated = (newDraft: DraftItem) => {
    const updated = [newDraft, ...drafts];
    updateDrafts(updated);
    setActiveDraftModal(newDraft); // Immediately open draft review modal
  };

  const handleSaveDraft = async (updatedDraft: DraftItem) => {
    const updated = drafts.map((d) => (d.id === updatedDraft.id ? updatedDraft : d));
    updateDrafts(updated);
    setActiveDraftModal(updatedDraft);

    // Save to serverless store
    try {
      await apiRequest(`/drafts?id=${updatedDraft.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedDraft),
      });
    } catch {}
  };

  const handleDeleteDraft = async (id: string) => {
    const updated = drafts.filter((d) => d.id !== id);
    updateDrafts(updated);
    if (activeDraftModal?.id === id) {
      setActiveDraftModal(null);
    }
    showToast('Taslak Silindi', 'İçerik taslağı başarıyla kaldırıldı.', 'info');

    try {
      await apiRequest(`/drafts?id=${id}`, {
        method: 'DELETE',
      });
    } catch {}
  };

  const draftCount = drafts.filter((d) => d.status === 'draft').length;
  const editedCount = drafts.filter((d) => d.status === 'edited' || d.status === 'shared').length;

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        draftCount={draftCount}
        editedCount={editedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' && (
          <CreatePost
            onDraftCreated={handleDraftCreated}
            showToast={showToast}
          />
        )}

        {activeTab === 'drafts' && (
          <DraftsList
            drafts={drafts}
            defaultStatusFilter="all"
            onEditDraft={(draft) => setActiveDraftModal(draft)}
            onDeleteDraft={handleDeleteDraft}
            onNavigateCreate={() => setActiveTab('create')}
            showToast={showToast}
          />
        )}

        {activeTab === 'edited' && (
          <DraftsList
            drafts={drafts}
            defaultStatusFilter="edited"
            onEditDraft={(draft) => setActiveDraftModal(draft)}
            onDeleteDraft={handleDeleteDraft}
            onNavigateCreate={() => setActiveTab('create')}
            showToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            drafts={drafts}
            onImportDrafts={(imported) => {
              const merged = [...imported, ...drafts];
              updateDrafts(merged);
            }}
            showToast={showToast}
          />
        )}
      </main>

      {/* Draft Review / Editing Lightbox Modal */}
      {activeDraftModal && (
        <DraftEditorModal
          draft={activeDraftModal}
          onClose={() => setActiveDraftModal(null)}
          onSave={handleSaveDraft}
          onDelete={handleDeleteDraft}
          showToast={showToast}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
