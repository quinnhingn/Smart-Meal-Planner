import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const YoutubePlayer = forwardRef(({ videoId, play, onChangeState, onReady, initialPlayerParams, height }, ref) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getDuration: () => {
      return new Promise((resolve) => {
        if (playerRef.current && playerRef.current.getDuration) {
          resolve(playerRef.current.getDuration());
        } else {
          resolve(0);
        }
      });
    },
    getCurrentTime: () => {
      return new Promise((resolve) => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          resolve(playerRef.current.getCurrentTime());
        } else {
          resolve(0);
        }
      });
    },
    seekTo: (seconds, allowSeekAhead) => {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(seconds, allowSeekAhead);
      }
    }
  }));

  useEffect(() => {
    let interval;
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      interval = setInterval(() => {
         if (window.YT && window.YT.Player) {
            clearInterval(interval);
            initPlayer();
         }
      }, 100);
    }

    function initPlayer() {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: height || '220',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: play ? 1 : 0,
          start: initialPlayerParams?.start || 0,
          controls: 1,
          rel: 0,
          playsinline: 1
        },
        events: {
          'onReady': () => {
             if (onReady) onReady();
          },
          'onStateChange': (event) => {
             // 1 = playing, 2 = paused, 0 = ended
             if (event.data === 1) onChangeState && onChangeState('playing');
             if (event.data === 2) onChangeState && onChangeState('paused');
             if (event.data === 0) onChangeState && onChangeState('ended');
          }
        }
      });
    }

    return () => {
      if (interval) clearInterval(interval);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]); // Re-init when video changes

  // Sync play/pause prop
  useEffect(() => {
    if (playerRef.current && playerRef.current.playVideo && playerRef.current.pauseVideo) {
      try {
        if (play) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        console.log("Youtube play/pause error", e);
      }
    }
  }, [play]);

  return <div ref={containerRef} style={{ width: '100%', height: height || 220, backgroundColor: '#000' }} />;
});

export default YoutubePlayer;
