# YTPlayer

YTPlayer is an advanced, lightweight wrapper around Plyr that provides highly customizable YouTube embeds. It allows you to add custom branding overlays, scrolling marquees, dynamic text animations, and custom quality controls to your YouTube videos without writing complex API logic.

## Features

- 🎨 **Custom Branding:** Add static overlay images, custom frames, and user logos.
- 📜 **Scrolling Marquee:** Built-in animated marquee text for announcements or watermarks.
- ✨ **Dynamic Text:** Display rotating text that automatically animates across different corners and the center of the video.
- ⚙️ **Quality Controls:** Native-feeling 1080p, 720p, 480p, and 360p custom quality toggle.
- 📱 **Responsive & Fullscreen Ready:** Persists overlays perfectly in fullscreen and handles landscape orientation locking on mobile devices.

## Installation

You don't need to install anything via npm. You can include YTPlayer directly in your HTML file using the jsDelivr CDN.

> **Note:** Make sure you are using the latest `1.0.4` tag and the files from the `dist` folder.

```html
<!-- Include YTPlayer CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/1Tech-X/ytplayer@1.0.4/dist/ytplayer.css">

<!-- Include YTPlayer JS -->
<script src="https://cdn.jsdelivr.net/gh/1Tech-X/ytplayer@1.0.4/dist/ytplayer.min.js"></script>

## Usage

### 1. Add the HTML Container

Create an empty `<div>` in your HTML with a unique ID where the video player should render.

```html
<div style="max-width: 800px; margin: 0 auto;">
    <div id="video-container"></div>
</div>

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `String` or `Element` | `null` | **(Required)** CSS selector or DOM element where the player will render. |
| `videoId` | `String` | `''` | **(Required)** The 11-character YouTube video ID. |
| `autoPlay` | `Boolean` | `false` | Whether the video should attempt to auto-play on load. |
| `showQualityControl` | `Boolean` | `true` | Show the custom 1080p/720p/480p/360p toggle in the controls. |
| `brandingImage` | `String` | `''` | URL for a full-size static overlay image. |
| `frameImage` | `String` | `''` | URL for a frame overlay (sits below branding layer). |
| `showLogo` | `Boolean` | `true` | Whether to display the user logo on the top right. |
| `userLogo` | `String` | `''` | URL for the circular user logo. |
| `showMarquee` | `Boolean` | `true` | Whether to show the bottom scrolling marquee. |
| `marqueeText` | `String` | `''` | The text to display in the scrolling marquee. |
| `dynamicText` | `Object` | `{enabled: false, messages: [], interval: 3000}` | Configure rotating text that animates in different positions. |
| `controls` | `Array` | `[...]` | Customize the Plyr controls array. |