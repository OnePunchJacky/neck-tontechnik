'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WPRecording, WPLiveReference, WPAudioSample, WPEquipment, WPArtist, WPMedia } from '@/app/lib/types';

interface AdminDataCacheContextType {
  // Data
  recordings: WPRecording[];
  liveReferences: WPLiveReference[];
  audioSamples: WPAudioSample[];
  equipment: WPEquipment[];
  artists: WPArtist[];
  media: WPMedia[];
  
  // Loading states
  loading: {
    recordings: boolean;
    liveReferences: boolean;
    audioSamples: boolean;
    equipment: boolean;
    artists: boolean;
    media: boolean;
  };
  
  // Refresh functions
  refreshRecordings: () => Promise<void>;
  refreshLiveReferences: () => Promise<void>;
  refreshAudioSamples: () => Promise<void>;
  refreshEquipment: () => Promise<void>;
  refreshArtists: () => Promise<void>;
  refreshMedia: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Check if any data is loading
  isLoading: boolean;
}

const AdminDataCacheContext = createContext<AdminDataCacheContextType | undefined>(undefined);

export function AdminDataCacheProvider({ children }: { children: ReactNode }) {
  const [recordings, setRecordings] = useState<WPRecording[]>([]);
  const [liveReferences, setLiveReferences] = useState<WPLiveReference[]>([]);
  const [audioSamples, setAudioSamples] = useState<WPAudioSample[]>([]);
  const [equipment, setEquipment] = useState<WPEquipment[]>([]);
  const [artists, setArtists] = useState<WPArtist[]>([]);
  const [media, setMedia] = useState<WPMedia[]>([]);
  
  const [loading, setLoading] = useState({
    recordings: false,
    liveReferences: false,
    audioSamples: false,
    equipment: false,
    artists: false,
    media: false,
  });

  const fetchRecordings = async () => {
    setLoading(prev => ({ ...prev, recordings: true }));
    try {
      const response = await fetch('/api/wp/recordings?per_page=100&status=any');
      if (response.ok) {
        const data = await response.json();
        setRecordings(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(prev => ({ ...prev, recordings: false }));
    }
  };

  const fetchLiveReferences = async () => {
    setLoading(prev => ({ ...prev, liveReferences: true }));
    try {
      const response = await fetch('/api/wp/live-references?per_page=100&status=any');
      if (response.ok) {
        const data = await response.json();
        setLiveReferences(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching live references:', error);
    } finally {
      setLoading(prev => ({ ...prev, liveReferences: false }));
    }
  };

  const fetchAudioSamples = async () => {
    setLoading(prev => ({ ...prev, audioSamples: true }));
    try {
      const response = await fetch('/api/wp/audio-samples?per_page=100&status=any');
      if (response.ok) {
        const data = await response.json();
        setAudioSamples(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching audio samples:', error);
    } finally {
      setLoading(prev => ({ ...prev, audioSamples: false }));
    }
  };

  const fetchEquipment = async () => {
    setLoading(prev => ({ ...prev, equipment: true }));
    try {
      const response = await fetch('/api/wp/equipment?per_page=100&status=any');
      if (response.ok) {
        const data = await response.json();
        setEquipment(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(prev => ({ ...prev, equipment: false }));
    }
  };

  const fetchArtists = async () => {
    setLoading(prev => ({ ...prev, artists: true }));
    try {
      const response = await fetch('/api/wp/artists?per_page=100&status=any');
      if (response.ok) {
        const data = await response.json();
        setArtists(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(prev => ({ ...prev, artists: false }));
    }
  };

  const fetchMedia = async () => {
    setLoading(prev => ({ ...prev, media: true }));
    try {
      const response = await fetch('/api/wp/media');
      if (response.ok) {
        const data = await response.json();
        setMedia(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(prev => ({ ...prev, media: false }));
    }
  };

  // Preload all data when the provider mounts
  useEffect(() => {
    // Load all data in parallel, but don't block the UI
    Promise.all([
      fetchRecordings(),
      fetchLiveReferences(),
      fetchAudioSamples(),
      fetchEquipment(),
      fetchArtists(),
      fetchMedia(),
    ]).catch(error => {
      console.error('Error preloading admin data:', error);
    });
  }, []);

  const isLoading = Object.values(loading).some(l => l === true);

  const value: AdminDataCacheContextType = {
    recordings,
    liveReferences,
    audioSamples,
    equipment,
    artists,
    media,
    loading,
    refreshRecordings: fetchRecordings,
    refreshLiveReferences: fetchLiveReferences,
    refreshAudioSamples: fetchAudioSamples,
    refreshEquipment: fetchEquipment,
    refreshArtists: fetchArtists,
    refreshMedia: fetchMedia,
    refreshAll: async () => {
      await Promise.all([
        fetchRecordings(),
        fetchLiveReferences(),
        fetchAudioSamples(),
        fetchEquipment(),
        fetchArtists(),
        fetchMedia(),
      ]);
    },
    isLoading,
  };

  return (
    <AdminDataCacheContext.Provider value={value}>
      {children}
    </AdminDataCacheContext.Provider>
  );
}

export function useAdminDataCache() {
  const context = useContext(AdminDataCacheContext);
  if (context === undefined) {
    throw new Error('useAdminDataCache must be used within an AdminDataCacheProvider');
  }
  return context;
}

