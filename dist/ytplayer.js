/**
 * YTPlayer - Advanced YouTube Player with Branding & Controls
 * Version: 1.0.3
 * Author: Prashant Srivastav
 * Description: Custom YouTube player with overlays, quality controls, countdown, and animations
 */
(function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        global.YTPlayer = factory();
    }
})(typeof window !== "undefined" ? window : this, function() {

    'use strict';

    class YTPlayer {
        constructor(options = {}) {
            this.config = {
                container: null,
                videoId: '',
                brandingImage: '',
                youtubeBranding: '',
                frameImage: '',
                userLogo: '',
                marqueeText: '',
                autoPlay: false,
                showQualityControl: true,
                showWatermark: true,
                showLogo: true,
                showMarquee: true,
                controls: [
                    'play-large',
                    'play',
                    'progress',
                    'current-time',
                    'mute',
                    'volume',
                    'fullscreen'
                ],
                plyrOptions: {},
                onReady: null,
                onPlay: null,
                onPause: null,
                onEnd: null,
                dynamicText: {
                    enabled: false,
                    messages: [],
                    interval: 3000
                }
            };

            Object.assign(this.config, options);

            this.player = null;
            this.currentQuality = '720';
            this.dynamicTextIndex = 0;
            this.dynamicTextInterval = null;
            this.currentPosition = 0;
            this.overlayElements = {};
            this.isFullscreen = false;

            this._init();
        }

        _init() {
            if (!this.config.container || !this.config.videoId) {
                console.error('YTPlayer: Container and videoId are required');
                return;
            }

            this._loadDependencies()
                .then(() => this._buildHTML())
                .then(() => this._setupPlayer())
                .catch(error => console.error('YTPlayer initialization error:', error));
        }

        _loadDependencies() {
            return new Promise((resolve, reject) => {
                if (typeof Plyr !== 'undefined') {
                    resolve();
                    return;
                }

                if (!document.querySelector('link[href*="plyr.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
                    document.head.appendChild(link);
                }

                const script = document.createElement('script');
                script.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        _buildHTML() {
            const container = typeof this.config.container === 'string' 
                ? document.querySelector(this.config.container) 
                : this.config.container;

            if (!container) {
                throw new Error('YTPlayer: Container not found');
            }

            let overlayImageSrc = '';
            if (this.config.brandingImage && this.config.brandingImage.trim() !== '') {
                overlayImageSrc = this.config.brandingImage;
            } else if (this.config.youtubeBranding && this.config.youtubeBranding.trim() !== '') {
                overlayImageSrc = this.config.youtubeBranding;
            }

            const hasMarquee = this.config.showMarquee && this.config.marqueeText && this.config.marqueeText.trim() !== '';
            const hasDynamicText = this.config.dynamicText && this.config.dynamicText.enabled && this.config.dynamicText.messages && this.config.dynamicText.messages.length > 0;
            const hasLogo = this.config.showLogo && this.config.userLogo && this.config.userLogo.trim() !== '';

            const html = `
                <div class="ytplayer-wrapper">
                    <!-- Overlay Container - Will be moved to Plyr on fullscreen -->
                    <div class="ytplayer-overlays-container" data-plyr-overlays>
                        ${hasMarquee ? `
                        <div class="ytplayer-watermark">
                            <div class="ytplayer-marquee">
                                <div class="ytplayer-marquee-content">
                                    <span class="ytplayer-marquee-text">${this.config.marqueeText}</span>
                                    <span class="ytplayer-marquee-text">${this.config.marqueeText}</span>
                                    <span class="ytplayer-marquee-text">${this.config.marqueeText}</span>
                                    <span class="ytplayer-marquee-text">${this.config.marqueeText}</span>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                        
                        ${this.config.frameImage ? `
                        <img src="${this.config.frameImage}" alt="Frame" class="ytplayer-overlay ytplayer-frame-layer">
                        ` : ''}
                        
                        ${overlayImageSrc ? `
                        <img src="${overlayImageSrc}" alt="Overlay" class="ytplayer-overlay ytplayer-branding-layer">
                        ` : ''}
                        
                        ${hasDynamicText ? `
                        <div class="ytplayer-dynamic-text ytplayer-dynamic-text-left" id="ytplayer-dynamic-text"></div>
                        ` : ''}
                        
                        ${hasLogo ? `
                        <div class="ytplayer-logo">
                            <img src="${this.config.userLogo}" alt="Logo">
                        </div>
                        ` : ''}
                        
                        <div class="ytplayer-interaction-blocker"></div>
                    </div>
                    
                    ${this.config.showQualityControl ? `
                    <div class="ytplayer-quality-popup">
                        <div class="ytplayer-quality-option" data-quality="1080">1080p</div>
                        <div class="ytplayer-quality-option active" data-quality="720">720p</div>
                        <div class="ytplayer-quality-option" data-quality="480">480p</div>
                        <div class="ytplayer-quality-option" data-quality="360">360p</div>
                    </div>
                    ` : ''}
                    
                    <div class="ytplayer-video-container" id="ytplayer-video">
                        <iframe 
                            src="https://www.youtube.com/embed/${this.config.videoId}?iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1"
                            allowfullscreen
                            allow="autoplay"
                        ></iframe>
                    </div>
                </div>
            `;

            container.innerHTML = html;
            this.container = container;
            
            // Store reference to overlays container
            this.overlaysContainer = container.querySelector('[data-plyr-overlays]');
        }

        _setupPlayer() {
            const plyrElement = this.container.querySelector('#ytplayer-video');
            
            this.player = new Plyr(plyrElement, {
                controls: this.config.controls,
                clickToPlay: false,
                youtube: { 
                    noCookie: true, 
                    rel: 0, 
                    showinfo: 0, 
                    modestbranding: 1 
                },
                ...this.config.plyrOptions
            });

            this._bindEvents();
            
            if (this.config.autoPlay) {
                this.player.play();
            }
        }

        _bindEvents() {
            this.player.on('ready', () => {
                if (this.config.showQualityControl) {
                    this._addQualityButton();
                }
                this._setupInteractionBlocker();
                
                if (this.config.dynamicText && this.config.dynamicText.enabled && this.config.dynamicText.messages && this.config.dynamicText.messages.length > 0) {
                    this._startDynamicText();
                }

                if (typeof this.config.onReady === 'function') {
                    this.config.onReady(this);
                }
            });

            this.player.on('play', () => {
                if (typeof this.config.onPlay === 'function') {
                    this.config.onPlay(this);
                }
            });

            this.player.on('pause', () => {
                if (typeof this.config.onPause === 'function') {
                    this.config.onPause(this);
                }
            });

            this.player.on('ended', () => {
                if (typeof this.config.onEnd === 'function') {
                    this.config.onEnd(this);
                }
            });

            this.player.on('controlsshown', () => {
                if (this.config.showQualityControl) {
                    this._addQualityButton();
                }
            });

            // FULLSCREEN FIX - Move overlays into Plyr container
            this.player.on('enterfullscreen', () => {
                this.isFullscreen = true;
                this._moveOverlaysToPlyr();
                
                setTimeout(() => {
                    if (this.config.showQualityControl) {
                        this._addQualityButton();
                    }
                }, 200);
                
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {});
                }
            });

            this.player.on('exitfullscreen', () => {
                this.isFullscreen = false;
                this._moveOverlaysBackToWrapper();
                
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
            });

            this.container.addEventListener('click', (e) => {
                if (e.target.classList.contains('ytplayer-quality-option')) {
                    const quality = e.target.dataset.quality;
                    this.setQuality(quality);
                }
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.ytplayer-quality-popup') && 
                    !e.target.closest('.ytplayer-custom-quality-btn')) {
                    this._hideQualityPopup();
                }
            });
        }

        _moveOverlaysToPlyr() {
            if (!this.overlaysContainer) return;
            
            // Find the Plyr container that goes fullscreen
            const plyrContainer = this.container.querySelector('.plyr');
            if (!plyrContainer) return;
            
            // Move overlays container into Plyr
            plyrContainer.appendChild(this.overlaysContainer);
            
            // Force visibility
            this.overlaysContainer.style.display = 'block';
            this.overlaysContainer.style.visibility = 'visible';
            this.overlaysContainer.style.opacity = '1';
            
            // Make all children visible
            const children = this.overlaysContainer.children;
            for (let i = 0; i < children.length; i++) {
                children[i].style.display = children[i].style.display || '';
                children[i].style.visibility = 'visible';
                children[i].style.opacity = '1';
            }
        }

        _moveOverlaysBackToWrapper() {
            if (!this.overlaysContainer) return;
            
            // Find the wrapper
            const wrapper = this.container.querySelector('.ytplayer-wrapper');
            if (!wrapper) return;
            
            // Move overlays back to wrapper (before video container)
            const videoContainer = wrapper.querySelector('.ytplayer-video-container');
            if (videoContainer) {
                wrapper.insertBefore(this.overlaysContainer, videoContainer);
            } else {
                wrapper.appendChild(this.overlaysContainer);
            }
        }

        _setupInteractionBlocker() {
            const blocker = this.container.querySelector('.ytplayer-interaction-blocker');
            if (blocker) {
                blocker.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.player.togglePlay();
                });
            }
        }

        _addQualityButton() {
            if (this.container.querySelector('.ytplayer-custom-quality-btn')) return;

            const controls = this.container.querySelector('.plyr__controls');
            if (!controls) return;

            const btn = document.createElement('button');
            btn.className = 'ytplayer-custom-quality-btn plyr__control';
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-pressed', 'false');
            btn.innerHTML = `<svg aria-hidden="true" focusable="false" style="width:18px;height:18px;fill:currentColor;"><use xlink:href="#plyr-settings"></use></svg> <span>${this.currentQuality}p</span>`;

            const fsBtn = controls.querySelector('[data-plyr="fullscreen"]');
            if (fsBtn) {
                controls.insertBefore(btn, fsBtn);
            } else {
                controls.appendChild(btn);
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._toggleQualityPopup();
            });
        }

        _toggleQualityPopup() {
            const popup = this.container.querySelector('.ytplayer-quality-popup');
            if (popup) {
                popup.classList.toggle('show');
            }
        }

        _hideQualityPopup() {
            const popup = this.container.querySelector('.ytplayer-quality-popup');
            if (popup) {
                popup.classList.remove('show');
            }
        }

        _startDynamicText() {
            const textEl = this.container.querySelector('#ytplayer-dynamic-text');
            if (!textEl || !this.config.dynamicText.messages.length) return;

            const positions = ['left', 'right', 'center'];
            
            const updateText = () => {
                textEl.classList.remove('ytplayer-dynamic-text-left', 'ytplayer-dynamic-text-right', 'ytplayer-dynamic-text-center');
                
                const position = positions[this.currentPosition];
                textEl.classList.add(`ytplayer-dynamic-text-${position}`);
                
                textEl.style.opacity = '0';
                textEl.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    textEl.innerHTML = this.config.dynamicText.messages[this.dynamicTextIndex];
                    
                    textEl.style.opacity = '1';
                    textEl.style.transform = 'translateY(0)';
                    
                    this.dynamicTextIndex = (this.dynamicTextIndex + 1) % this.config.dynamicText.messages.length;
                    this.currentPosition = (this.currentPosition + 1) % positions.length;
                }, 500);
            };

            updateText();
            this.dynamicTextInterval = setInterval(updateText, this.config.dynamicText.interval);
        }

        setQuality(quality) {
            this.currentQuality = quality;
            
            this.container.querySelectorAll('.ytplayer-quality-option').forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.quality === quality) {
                    opt.classList.add('active');
                }
            });

            const btnText = this.container.querySelector('.ytplayer-custom-quality-btn span');
            if (btnText) {
                btnText.textContent = quality + 'p';
            }

            this._hideQualityPopup();

            if (this.player && this.player.embed) {
                const qualityMap = {
                    '1080': 'hd1080',
                    '720': 'hd720',
                    '480': 'large',
                    '360': 'medium'
                };
                
                if (typeof this.player.embed.setPlaybackQuality === 'function') {
                    this.player.embed.setPlaybackQuality(qualityMap[quality] || 'hd720');
                }
            }
        }

        updateBranding(imageUrl) {
            const branding = this.container.querySelector('.ytplayer-branding-layer');
            if (!branding) {
                const newBranding = document.createElement('img');
                newBranding.src = imageUrl;
                newBranding.alt = 'Overlay';
                newBranding.className = 'ytplayer-overlay ytplayer-branding-layer';
                const overlaysContainer = this.container.querySelector('[data-plyr-overlays]');
                if (overlaysContainer) {
                    overlaysContainer.appendChild(newBranding);
                }
            } else {
                branding.src = imageUrl;
            }
        }

        updateLogo(imageUrl) {
            const logo = this.container.querySelector('.ytplayer-logo img');
            if (logo) {
                logo.src = imageUrl;
            }
        }

        updateMarquee(text) {
            const marqueeTexts = this.container.querySelectorAll('.ytplayer-marquee-text');
            marqueeTexts.forEach(el => {
                el.textContent = text;
            });
        }

        play() {
            if (this.player) {
                this.player.play();
            }
        }

        pause() {
            if (this.player) {
                this.player.pause();
            }
        }

        togglePlay() {
            if (this.player) {
                this.player.togglePlay();
            }
        }

        enterFullscreen() {
            if (this.player) {
                this.player.fullscreen.enter();
            }
        }

        exitFullscreen() {
            if (this.player) {
                this.player.fullscreen.exit();
            }
        }

        destroy() {
            if (this.dynamicTextInterval) {
                clearInterval(this.dynamicTextInterval);
            }
            
            if (this.player) {
                this.player.destroy();
                this.player = null;
            }
            
            if (this.container) {
                this.container.innerHTML = '';
            }
        }
    }

    return YTPlayer;
});