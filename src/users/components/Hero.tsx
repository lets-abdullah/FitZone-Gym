import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Dumbbell, 
  Award, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Tv, 
  Image as ImageIcon,
  Sparkles,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';

interface HeroProps {
  onNavigate: (path: string) => void;
}

const CINEMATIC_VIDEOS = [
  {
    id: 'biceps',
    title: 'Intensity Training',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-man-performing-dumbbell-curls-in-the-gym-41710-large.mp4',
    poster: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'barbell',
    title: 'Power Lifting',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-athletic-man-lifting-barbell-in-the-gym-41708-large.mp4',
    poster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200'
  }
];

export default function Hero({ onNavigate }: HeroProps) {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [frameCount, setFrameCount] = useState(102);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Simple frame counter simulation to make the media look alive and scientific
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setFrameCount(f => (f >= 999 ? 100 : f + 1));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.log('Video play interrupted:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTrackChange = (index: number) => {
    setCurrentVideoIdx(index);
    setMediaType('video');
    setIsPlaying(true);
    // Let state update and then load & play
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().catch(err => console.log('Video play interrupted:', err));
      }
    }, 50);
  };

  return (
    <div id="hero-main-container" className="relative bg-zinc-50 overflow-hidden py-12 md:py-20 lg:py-28 border-b border-zinc-200">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-gold-400/15 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: High-Impact Typography & Action Triggers */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
            
            {/* Live Science Hub Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-zinc-200 shadow-sm rounded-full text-gold-700 font-mono text-[11px] font-bold tracking-wider uppercase"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-600"></span>
              </span>
              <Award size={13} className="text-gold-600" />
              <span>Performance Hub & Science Walkthrough</span>
            </motion.div>

            {/* Main Headings */}
            <div className="space-y-4 md:space-y-5">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-zinc-900 uppercase leading-[0.95]"
              >
                Forge Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-600 via-amber-600 to-amber-800 font-black relative">
                  Elite Physique
                  <span className="absolute left-0 bottom-1 w-full h-[3px] bg-gradient-to-r from-gold-500 to-amber-600 rounded-full" />
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl font-sans text-zinc-650 text-sm sm:text-base leading-relaxed font-normal"
              >
                Experience the state-of-the-art knowledge and compound coaching environment of <span className="text-gold-700 font-bold">FitZone Gym</span>. Watch our cinematic walk-through video, design customized nutrition blueprints, and track target body mass formulas instantly.
              </motion.p>
            </div>

            {/* CTA Button Array */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <button
                id="hero-plans-cta-btn"
                onClick={() => onNavigate('memberships')}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-display text-xs uppercase tracking-wider font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-zinc-950"
              >
                View Membership Plans <ArrowRight size={15} className="text-gold-400" />
              </button>
              
              <button
                id="hero-explore-cta-btn"
                onClick={() => onNavigate('about')}
                className="bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 hover:border-zinc-350 font-display text-xs uppercase tracking-wider font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2 group"
              >
                Explore Gym Hub <Dumbbell size={15} className="text-gold-600 group-hover:rotate-45 transition-transform" />
              </button>
            </motion.div>

            {/* Micro Stats Widget */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 max-w-xl bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm divide-x divide-zinc-150"
            >
              <div className="text-center pr-3">
                <span className="block font-display text-xl md:text-2xl font-black text-zinc-900 tracking-tight">100%</span>
                <span className="block text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-widest font-mono mt-1 font-bold">Local Data JSON</span>
              </div>
              <div className="text-center px-3">
                <span className="block font-display text-xl md:text-2xl font-black text-gold-600 tracking-tight">4</span>
                <span className="block text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-widest font-mono mt-1 font-bold">Science Calculators</span>
              </div>
              <div className="text-center pl-3">
                <span className="block font-display text-xl md:text-2xl font-black text-zinc-900 tracking-tight">Elite</span>
                <span className="block text-[8px] md:text-[9px] text-zinc-500 uppercase tracking-widest font-mono mt-1 font-bold">Expert Coaching</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Premium Interactive Live Media Terminal */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-[11/10] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white group/terminal"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Backglow Ambient Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10 pointer-events-none" />

              {/* MEDIA RENDER CONTROLLER */}
              {mediaType === 'video' ? (
                <video
                  ref={videoRef}
                  src={CINEMATIC_VIDEOS[currentVideoIdx].url}
                  poster={CINEMATIC_VIDEOS[currentVideoIdx].poster}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 group-hover/terminal:grayscale-0 group-hover/terminal:scale-102 transition-all duration-700"
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop"
                  alt="High Intensity Gym Shoot"
                  className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover/terminal:scale-102 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Scientific HUD Frame Overlays */}
              <div className="absolute inset-x-0 top-0 p-4 z-20 flex justify-between items-center text-[10px] font-mono text-zinc-300 pointer-events-none">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-700/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold uppercase tracking-wider text-white">LIVE_FEED:0{currentVideoIdx + 1}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-700/50 font-bold">
                  <Activity size={10} className="text-gold-500 animate-pulse" />
                  <span>ISO_STABILIZED</span>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-20 flex flex-col gap-3">
                {/* Live video track titles/details */}
                <div className="text-left">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gold-400 bg-gold-400/10 px-2 py-0.5 rounded">
                    {mediaType === 'video' ? 'Interactive Video walkthrough' : 'Still High-Res Compound'}
                  </span>
                  <h3 className="text-white font-display font-black text-lg sm:text-xl uppercase tracking-tight mt-1">
                    {mediaType === 'video' ? CINEMATIC_VIDEOS[currentVideoIdx].title : 'Sector 9 Elite Compound'}
                  </h3>
                </div>

                {/* Tactical controls dock */}
                <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-1.5">
                    
                    {/* Video / Photo Switcher */}
                    <button
                      type="button"
                      onClick={() => setMediaType('video')}
                      className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold uppercase ${
                        mediaType === 'video' 
                          ? 'bg-amber-500 text-zinc-950' 
                          : 'bg-black/50 text-zinc-300 hover:bg-black/70 hover:text-white border border-zinc-700/30'
                      }`}
                      title="Play Cinematic Video Walkthrough"
                    >
                      <Tv size={11} />
                      <span className="hidden sm:inline">Walkthrough</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaType('image')}
                      className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold uppercase ${
                        mediaType === 'image' 
                          ? 'bg-amber-500 text-zinc-950' 
                          : 'bg-black/50 text-zinc-300 hover:bg-black/70 hover:text-white border border-zinc-700/30'
                      }`}
                      title="Show Still Action Shot"
                    >
                      <ImageIcon size={11} />
                      <span className="hidden sm:inline">Still Frame</span>
                    </button>
                  </div>

                  {/* Playback action triggers */}
                  {mediaType === 'video' && (
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-xl border border-zinc-700/30">
                      
                      {/* Playback clip cycle */}
                      <button
                        type="button"
                        onClick={() => handleTrackChange(currentVideoIdx === 0 ? 1 : 0)}
                        className="text-[9px] font-mono font-bold text-zinc-300 hover:text-amber-400 uppercase tracking-wider px-2 py-1 cursor-pointer transition-all border border-zinc-700/40 hover:border-amber-400/40 rounded-md bg-zinc-900/80"
                        title="Switch Cinematic Focus Clip"
                      >
                        Change Focus
                      </button>

                      {/* Play Pause */}
                      <button
                        type="button"
                        onClick={handlePlayPause}
                        className="p-1.5 text-white hover:text-amber-400 hover:scale-105 transition-all cursor-pointer"
                        title={isPlaying ? 'Pause Loop' : 'Play Loop'}
                      >
                        {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                      </button>

                      {/* Volume Audio state */}
                      <button
                        type="button"
                        onClick={handleMuteToggle}
                        className="p-1.5 text-white hover:text-amber-400 hover:scale-105 transition-all cursor-pointer"
                        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                      >
                        {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Decorative Corner Borders for futuristic look */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-500 pointer-events-none z-20 opacity-80" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-500 pointer-events-none z-20 opacity-80" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-500 pointer-events-none z-20 opacity-80" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-500 pointer-events-none z-20 opacity-80" />

              {/* Live Framerate / Telemetry line at right side */}
              <div className="absolute top-1/2 -translate-y-1/2 right-3 font-mono text-[8px] text-zinc-500/80 tracking-widest writing-mode-vertical uppercase pointer-events-none select-none z-20 hidden md:block">
                <span>FPS_CONTROLLER :: 60.0 • FRAME_STABLE: {frameCount}</span>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
