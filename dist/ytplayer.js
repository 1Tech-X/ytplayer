/**
 * YTPlayer - Advanced YouTube Player with Branding & Controls
 * Version: 1.0.0
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
        /**
         * Initialize YTPlayer
         * @param {Object} options Configuration options
         */
        constructor(options = {}) {
            // Default configuration
            this.config = {
                container: null,           // Container element or selector
                videoId: '',               // YouTube video ID
                brandingImage: '',         // User branding overlay image
                youtubeBranding: '',       // YouTube branding overlay image
                frameImage: '',            // Frame overlay image
                userLogo: 'assets/img/user.png', // User logo
                marqueeText: '',           // Text for marquee
                autoPlay: false,           // Auto play video
                showQualityControl: true,  // Show quality control
                showWatermark: true,       // Show bottom watermark
                showLogo: true,            // Show user logo
                showMarquee: true,         // Show marquee text
                controls: [                // Plyr controls
                    'play-large',
                    'play',
                    'progress',
                    'current-time',
                    'mute',
                    'volume',
                    'fullscreen'
                ],
                plyrOptions: {},           // Additional Plyr options
                onReady: null,             // Callback when player is ready
                onPlay: null,              // Callback on play
                onPause: null,             // Callback on pause
                onEnd: null,               // Callback on end
                dynamicText: {             // Animated text configuration
                    enabled: false,
                    messages: [],
                    position: 'top-left',
                    interval: 3000
                }
            };

            // Merge user options
            Object.assign(this.config, options);

            // Internal state
            this.player = null;
            this.currentQuality = '720';
            this.dynamicTextIndex = 0;
            this.dynamicTextInterval = null;

            // Validate and initialize
            this._init();
        }

        /**
         * Initialize the player
         */
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

        /**
         * Load required dependencies (Plyr)
         */
        _loadDependencies() {
            return new Promise((resolve, reject) => {
                // Check if Plyr is already loaded
                if (typeof Plyr !== 'undefined') {
                    resolve();
                    return;
                }

                // Load Plyr CSS
                if (!document.querySelector('link[href*="plyr.css"]')) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
                    document.head.appendChild(link);
                }

                // Load Plyr JS
                const script = document.createElement('script');
                script.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        /**
         * Build the HTML structure
         */
        _buildHTML() {
            const container = typeof this.config.container === 'string' 
                ? document.querySelector(this.config.container) 
                : this.config.container;

            if (!container) {
                throw new Error('YTPlayer: Container not found');
            }

            // Determine overlay image
            let overlayImageSrc = '';
            if (this.config.brandingImage && this.config.brandingImage.trim() !== '') {
                overlayImageSrc = this.config.brandingImage;
            } else if (this.config.youtubeBranding && this.config.youtubeBranding.trim() !== '') {
                overlayImageSrc = this.config.youtubeBranding;
            }

            const html = `
                <div class="ytplayer-wrapper">
                    ${this.config.showMarquee && this.config.marqueeText ? `
                    <div class="ytplayer-watermark">
                        <div class="ytplayer-marquee">
                            <div class="ytplayer-marquee-content">
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
                    
                    ${this.config.dynamicText.enabled ? `
                    <div class="ytplayer-dynamic-text" id="ytplayer-dynamic-text"></div>
                    ` : ''}
                    
                    ${this.config.showLogo ? `
                    <div class="ytplayer-logo">
                        <img src="${this.config.userLogo}" alt="Logo" onerror="this.src='assets/img/user.png'">
                    </div>
                    ` : ''}
                    
                    <div class="ytplayer-interaction-blocker"></div>
                    
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
        }

        /**
         * Setup Plyr player
         */
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

        /**
         * Bind player events
         */
        _bindEvents() {
            // Player ready
            this.player.on('ready', () => {
                if (this.config.showQualityControl) {
                    this._addQualityButton();
                }
                this._setupInteractionBlocker();
                
                if (this.config.dynamicText.enabled) {
                    this._startDynamicText();
                }

                // Execute ready callback
                if (typeof this.config.onReady === 'function') {
                    this.config.onReady(this);
                }
            });

            // Play event
            this.player.on('play', () => {
                if (typeof this.config.onPlay === 'function') {
                    this.config.onPlay(this);
                }
            });

            // Pause event
            this.player.on('pause', () => {
                if (typeof this.config.onPause === 'function') {
                    this.config.onPause(this);
                }
            });

            // End event
            this.player.on('ended', () => {
                if (typeof this.config.onEnd === 'function') {
                    this.config.onEnd(this);
                }
            });

            // Controls shown - ensure quality button
            this.player.on('controlsshown', () => {
                if (this.config.showQualityControl) {
                    this._addQualityButton();
                }
            });

            // Fullscreen events
            this.player.on('enterfullscreen', () => {
                setTimeout(() => {
                    if (this.config.showQualityControl) {
                        this._addQualityButton();
                    }
                }, 200);
                
                // Lock orientation if available
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock('landscape').catch(() => {});
                }
            });

            this.player.on('exitfullscreen', () => {
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
            });

            // Quality selection
            this.container.addEventListener('click', (e) => {
                if (e.target.classList.contains('ytplayer-quality-option')) {
                    const quality = e.target.dataset.quality;
                    this.setQuality(quality);
                }
            });

            // Close quality popup on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.ytplayer-quality-popup') && 
                    !e.target.closest('.ytplayer-custom-quality-btn')) {
                    this._hideQualityPopup();
                }
            });
        }

        /**
         * Setup interaction blocker (click to play/pause)
         */
        _setupInteractionBlocker() {
            const blocker = this.container.querySelector('.ytplayer-interaction-blocker');
            if (blocker) {
                blocker.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.player.togglePlay();
                });
            }
        }

        /**
         * Add quality control button
         */
        _addQualityButton() {
            if (this.container.querySelector('.ytplayer-custom-quality-btn')) return;

            const controls = this.container.querySelector('.plyr__controls');
            if (!controls) return;

            const btn = document.createElement('button');
            btn.className = 'ytplayer-custom-quality-btn plyr__control';
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-pressed', 'false');
            btn.innerHTML = `<i class="fas fa-cog"></i> <span>${this.currentQuality}p</span>`;

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

        /**
         * Toggle quality popup
         */
        _toggleQualityPopup() {
            const popup = this.container.querySelector('.ytplayer-quality-popup');
            if (popup) {
                popup.classList.toggle('show');
            }
        }

        /**
         * Hide quality popup
         */
        _hideQualityPopup() {
            const popup = this.container.querySelector('.ytplayer-quality-popup');
            if (popup) {
                popup.classList.remove('show');
            }
        }

        /**
         * Start dynamic text animation
         */
        _startDynamicText() {
            const textEl = this.container.querySelector('#ytplayer-dynamic-text');
            if (!textEl || !this.config.dynamicText.messages.length) return;

            const updateText = () => {
                textEl.style.opacity = '0';
                setTimeout(() => {
                    textEl.innerHTML = this.config.dynamicText.messages[this.dynamicTextIndex];
                    textEl.style.opacity = '1';
                    this.dynamicTextIndex = (this.dynamicTextIndex + 1) % 
                        this.config.dynamicText.messages.length;
                }, 800);
            };

            updateText();
            this.dynamicTextInterval = setInterval(updateText, this.config.dynamicText.interval);
        }

        /**
         * Set video quality
         * @param {string} quality - Quality level (360, 480, 720, 1080)
         */
        setQuality(quality) {
            this.currentQuality = quality;
            
            // Update active state
            this.container.querySelectorAll('.ytplayer-quality-option').forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.quality === quality) {
                    opt.classList.add('active');
                }
            });

            // Update button text
            const btnText = this.container.querySelector('.ytplayer-custom-quality-btn span');
            if (btnText) {
                btnText.textContent = quality + 'p';
            }

            this._hideQualityPopup();

            // Set YouTube quality
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

        /**
         * Update branding overlay
         * @param {string} imageUrl - New branding image URL
         */
        updateBranding(imageUrl) {
            const branding = this.container.querySelector('.ytplayer-branding-layer');
            if (!branding) {
                const newBranding = document.createElement('img');
                newBranding.src = imageUrl;
                newBranding.alt = 'Overlay';
                newBranding.className = 'ytplayer-overlay ytplayer-branding-layer';
                const wrapper = this.container.querySelector('.ytplayer-wrapper');
                if (wrapper) {
                    wrapper.insertBefore(newBranding, wrapper.querySelector('.ytplayer-video-container'));
                }
            } else {
                branding.src = imageUrl;
            }
        }

        /**
         * Update user logo
         * @param {string} imageUrl - New logo URL
         */
        updateLogo(imageUrl) {
            const logo = this.container.querySelector('.ytplayer-logo img');
            if (logo) {
                logo.src = imageUrl;
            }
        }

        /**
         * Update marquee text
         * @param {string} text - New marquee text
         */
        updateMarquee(text) {
            const marqueeTexts = this.container.querySelectorAll('.ytplayer-marquee-text');
            marqueeTexts.forEach(el => {
                el.textContent = text;
            });
        }

        /**
         * Play video
         */
        play() {
            if (this.player) {
                this.player.play();
            }
        }

        /**
         * Pause video
         */
        pause() {
            if (this.player) {
                this.player.pause();
            }
        }

        /**
         * Toggle play/pause
         */
        togglePlay() {
            if (this.player) {
                this.player.togglePlay();
            }
        }

        /**
         * Enter fullscreen
         */
        enterFullscreen() {
            if (this.player) {
                this.player.fullscreen.enter();
            }
        }

        /**
         * Exit fullscreen
         */
        exitFullscreen() {
            if (this.player) {
                this.player.fullscreen.exit();
            }
        }

        /**
         * Destroy the player
         */
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