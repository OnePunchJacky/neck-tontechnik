'use client';

import { useState, useEffect, useRef } from 'react';
import ContactFooter from '../../components/ContactFooter';

// Type definitions
interface AudioFile {
  id: number;
  title: { rendered: string };
  source_url: string;
  media_details: {
    length_formatted: string;
    filesize: number;
    bitrate: number;
    sample_rate: number;
  };
}

interface AudioSample {
  id: number;
  title: { rendered: string };
  beforeAudio?: AudioFile;
  afterAudio?: AudioFile;
}

// Audio Player Component
interface AudioPlayerProps {
  beforeUrl: string;
  afterUrl: string;
  title: string;
  duration: string;
}

function AudioPlayer({ beforeUrl, afterUrl, title, duration }: AudioPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState<'before' | 'after'>('before');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const beforeAudioRef = useRef<HTMLAudioElement>(null);
  const afterAudioRef = useRef<HTMLAudioElement>(null);

  const getCurrentAudio = () => {
    return currentTrack === 'before' ? beforeAudioRef.current : afterAudioRef.current;
  };

  const getOtherAudio = () => {
    return currentTrack === 'before' ? afterAudioRef.current : beforeAudioRef.current;
  };

  const togglePlayPause = () => {
    const currentAudio = getCurrentAudio();
    if (!currentAudio) return;
    
    if (isPlaying) {
      currentAudio.pause();
    } else {
      currentAudio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const switchTrack = (track: 'before' | 'after') => {
    if (currentTrack === track) return;
    
    const currentAudio = getCurrentAudio();
    const newAudio = track === 'before' ? beforeAudioRef.current : afterAudioRef.current;
    
    if (!currentAudio || !newAudio) return;
    
    const wasPlaying = isPlaying;
    const currentTimePos = currentAudio.currentTime;
    
    // Pause current audio
    if (wasPlaying) {
      currentAudio.pause();
    }
    
    // Sync time to new audio
    newAudio.currentTime = currentTimePos;
    
    // Switch track
    setCurrentTrack(track);
    
    // Play new audio if was playing
    if (wasPlaying) {
      newAudio.play();
    }
  };

  const handleTimeUpdate = () => {
    const currentAudio = getCurrentAudio();
    if (currentAudio) {
      setCurrentTime(currentAudio.currentTime);
      
      // Keep other audio in sync
      const otherAudio = getOtherAudio();
      if (otherAudio && Math.abs(otherAudio.currentTime - currentAudio.currentTime) > 0.1) {
        otherAudio.currentTime = currentAudio.currentTime;
      }
    }
  };

  const handleLoadedMetadata = (audioElement: HTMLAudioElement) => {
    if (audioElement) {
      setTotalDuration(audioElement.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    // Update both audio elements
    if (beforeAudioRef.current) {
      beforeAudioRef.current.currentTime = newTime;
    }
    if (afterAudioRef.current) {
      afterAudioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-4">{title}</h3>
      
      {/* Hidden audio elements - both preloaded */}
      <audio
        ref={beforeAudioRef}
        src={beforeUrl}
        onTimeUpdate={currentTrack === 'before' ? handleTimeUpdate : undefined}
        onLoadedMetadata={() => handleLoadedMetadata(beforeAudioRef.current!)}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
        style={{ display: 'none' }}
      />
      <audio
        ref={afterAudioRef}
        src={afterUrl}
        onTimeUpdate={currentTrack === 'after' ? handleTimeUpdate : undefined}
        onLoadedMetadata={() => handleLoadedMetadata(afterAudioRef.current!)}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* Track Selector */}
      <div className="flex mb-4 bg-zinc-700 rounded-lg p-1">
        <button
          onClick={() => switchTrack('before')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            currentTrack === 'before'
              ? 'bg-red-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Vorher (Unmastered)
        </button>
        <button
          onClick={() => switchTrack('after')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            currentTrack === 'after'
              ? 'bg-green-600 text-white'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Nachher (Mastered)
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={totalDuration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{duration}</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            currentTrack === 'before' 
              ? 'bg-red-900 text-red-200' 
              : 'bg-green-900 text-green-200'
          }`}>
            {currentTrack === 'before' ? 'Unmastered Version' : 'Mastered Version'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MasteringPage() {
  const [audioSamples, setAudioSamples] = useState<AudioSample[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAudioSamples() {
      try {
        // Fetch audio samples
        const samplesResponse = await fetch(
          'https://staging.neck-tontechnik.com/wp-json/wp/v2/audio_sample?per_page=100'
        );
        
        if (!samplesResponse.ok) {
          throw new Error('Failed to fetch audio samples');
        }
        
        const samples = await samplesResponse.json();
        
        // Fetch media attachments for each sample
        const samplesWithAudio = await Promise.all(
          samples.map(async (sample: any) => {
            try {
              const mediaResponse = await fetch(
                `https://staging.neck-tontechnik.com/wp-json/wp/v2/media?parent=${sample.id}`
              );
              
              if (mediaResponse.ok) {
                const mediaFiles = await mediaResponse.json();
                
                const beforeAudio = mediaFiles.find((file: any) => 
                  file.title.rendered.toLowerCase().includes('vorher') ||
                  file.slug.includes('vorher')
                );
                
                const afterAudio = mediaFiles.find((file: any) => 
                  file.title.rendered.toLowerCase().includes('nachher') ||
                  file.slug.includes('nachher')
                );
                
                return {
                  id: sample.id,
                  title: sample.title,
                  beforeAudio,
                  afterAudio
                };
              }
            } catch (error) {
              console.error(`Error fetching media for sample ${sample.id}:`, error);
            }
            
            return {
              id: sample.id,
              title: sample.title
            };
          })
        );
        
        // Filter out samples without both before and after audio
        const validSamples = samplesWithAudio.filter(sample => 
          sample.beforeAudio && sample.afterAudio
        );
        
        setAudioSamples(validSamples);
      } catch (error) {
        console.error('Error fetching audio samples:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAudioSamples();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-[url('/images/studio-bg.jpg')] bg-cover bg-center bg-fixed opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 md:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-2xl">
            Mastering Vergleiche
          </h1>
          <p className="text-xl md:text-2xl text-white leading-relaxed drop-shadow-2xl mb-8">
            Höre den Unterschied zwischen unmastered und mastered Versionen. 
            Professionelles Mastering bringt deine Musik zum Leben.
          </p>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-12 px-4 md:px-8 bg-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-6">So funktioniert's</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Auswählen</h3>
              <p className="text-gray-300 text-sm">
                Wähle zwischen "Vorher" (unmastered) und "Nachher" (mastered)
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Abspielen</h3>
              <p className="text-gray-300 text-sm">
                Klicke Play und höre dir beide Versionen an
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Vergleichen</h3>
              <p className="text-gray-300 text-sm">
                Wechsle zwischen den Versionen und höre den Unterschied
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Audio Samples */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Mastering Beispiele
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-gray-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Lade Audio-Beispiele...</span>
              </div>
            </div>
          ) : audioSamples.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Keine Audio-Beispiele gefunden.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {audioSamples.map((sample) => (
                <AudioPlayer
                  key={sample.id}
                  beforeUrl={sample.beforeAudio!.source_url}
                  afterUrl={sample.afterAudio!.source_url}
                  title={sample.title.rendered}
                  duration={sample.afterAudio!.media_details.length_formatted}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-zinc-800 py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Was bewirkt professionelles Mastering?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Optimale Lautstärke</h3>
              <p className="text-gray-300 text-sm">
                Deine Tracks erreichen kommerzielle Lautstärke ohne Verzerrungen
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Mehr Energie</h3>
              <p className="text-gray-300 text-sm">
                Kompression und EQ verleihen deiner Musik mehr Durchsetzungskraft
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Konsistenz</h3>
              <p className="text-gray-300 text-sm">
                Alle Tracks eines Albums klingen einheitlich und ausgewogen
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Klarheit</h3>
              <p className="text-gray-300 text-sm">
                Jedes Element im Mix wird deutlicher und präsenter
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Streaming-Ready</h3>
              <p className="text-gray-300 text-sm">
                Optimiert für Spotify, Apple Music und andere Streaming-Plattformen
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Emotionale Wirkung</h3>
              <p className="text-gray-300 text-sm">
                Das finale Mastering verleiht deiner Musik mehr Emotion und Impact
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Footer */}
      <ContactFooter />
    </div>
  );
}