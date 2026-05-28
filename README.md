# YTPlayer

**YTPlayer** is an advanced, lightweight wrapper around [Plyr](https://plyr.io/) that provides highly customizable YouTube embeds. It allows you to add custom branding overlays, scrolling marquees, dynamic text animations, and custom quality controls to your YouTube videos without writing complex API logic.

## Features
* 🎨 **Custom Branding:** Add static overlay images, custom frames, and user logos.
* 📜 **Scrolling Marquee:** Built-in animated marquee text for announcements or watermarks.
* ✨ **Dynamic Text:** Display rotating text that automatically animates across different corners and the center of the video.
* ⚙️ **Quality Controls:** Native-feeling 1080p, 720p, 480p, and 360p custom quality toggle.
* 📱 **Responsive & Fullscreen Ready:** Persists overlays perfectly in fullscreen and handles landscape orientation locking on mobile devices.

## Installation

You don't need to install anything via npm. You can include YTPlayer directly in your HTML file using the jsDelivr CDN. 

*(Make sure you are using the latest `1.0.4` tag and the files from the `dist` folder)*

```html
<!-- Include YTPlayer CSS -->
<link rel="stylesheet" href="[https://cdn.jsdelivr.net/gh/1Tech-X/ytplayer@1.0.4/dist/ytplayer.css](https://cdn.jsdelivr.net/gh/1Tech-X/ytplayer@1.0.4/dist/ytplayer.css)">

<!-- Include YTPlayer JS -->
<script src="[https://cdn.jsdelivr.net/gh/1Tech-X/ytplayer@1.0.4/dist/ytplayer.min.js](https://cdn.jsdelivr.net/gh/1Tech-X/ytplayer@1.0.4/dist/ytplayer.min.js)"></script>


## Usage

### 1. Add the HTML Container
Create an empty `<div>` in your HTML with a unique ID where the video player should render.

```html
<div style="max-width: 800px; margin: 0 auto;">
    <div id="video-container"></div>
</div>

## Initialize with JavaScript

### 2. Initialize YTPlayer
Use the YTPlayer class to configure and mount the player to your container.

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const myPlayer = new YTPlayer({
        container: '#video-container', // Target your div
        videoId: 'bTqVqk7FSmY',        // Add YouTube Video ID
        
        // Branding
        showLogo: true,
        userLogo: '[https://via.placeholder.com/80](https://via.placeholder.com/80)', // URL to your logo
        brandingImage: '[https://via.placeholder.com/800x450?text=Transparent+Overlay](https://via.placeholder.com/800x450?text=Transparent+Overlay)',
        
        // Marquee Settings
        showMarquee: true,
        marqueeText: 'Welcome to our premium course! Subscribe for more.',
        
        // Dynamic Animated Text
        dynamicText: {
            enabled: true,
            messages: [
                'Subscribe Now!', 
                'Check the link in description', 
                'New videos every week!'
            ],
            interval: 3000 // Cycles every 3 seconds
        },
        
        // General Settings
        autoPlay: false,
        showQualityControl: true
    });
});

## Configuration Options

### When initializing new YTPlayer(options), you can pass the following properties in the options object:

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Type</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>container</code></td>
      <td><code>String | Element</code></td>
      <td><code>null</code></td>
      <td><strong>(Required)</strong> CSS selector or DOM element where the player will render.</td>
    </tr>
    <tr>
      <td><code>videoId</code></td>
      <td><code>String</code></td>
      <td><code>''</code></td>
      <td><strong>(Required)</strong> The 11-character YouTube video ID.</td>
    </tr>
    <tr>
      <td><code>autoPlay</code></td>
      <td><code>Boolean</code></td>
      <td><code>false</code></td>
      <td>Whether the video should attempt to auto-play on load.</td>
    </tr>
    <tr>
      <td><code>showQualityControl</code></td>
      <td><code>Boolean</code></td>
      <td><code>true</code></td>
      <td>Show the custom 1080p/720p/480p/360p toggle in the controls.</td>
    </tr>
    <tr>
      <td><code>brandingImage</code></td>
      <td><code>String</code></td>
      <td><code>''</code></td>
      <td>URL for a full-size static overlay image.</td>
    </tr>
    <tr>
      <td><code>frameImage</code></td>
      <td><code>String</code></td>
      <td><code>''</code></td>
      <td>URL for a frame overlay (sits below branding layer).</td>
    </tr>
    <tr>
      <td><code>showLogo</code></td>
      <td><code>Boolean</code></td>
      <td><code>true</code></td>
      <td>Whether to display the user logo on the top right.</td>
    </tr>
    <tr>
      <td><code>userLogo</code></td>
      <td><code>String</code></td>
      <td><code>''</code></td>
      <td>URL for the circular user logo.</td>
    </tr>
    <tr>
      <td><code>showMarquee</code></td>
      <td><code>Boolean</code></td>
      <td><code>true</code></td>
      <td>Whether to show the bottom scrolling marquee.</td>
    </tr>
    <tr>
      <td><code>marqueeText</code></td>
      <td><code>String</code></td>
      <td><code>''</code></td>
      <td>The text to display in the scrolling marquee.</td>
    </tr>
    <tr>
      <td><code>dynamicText</code></td>
      <td><code>Object</code></td>
      <td><code>{enabled: false, messages: [], interval: 3000}</code></td>
      <td>Configure rotating text that animates in different positions.</td>
    </tr>
    <tr>
      <td><code>controls</code></td>
      <td><code>Array</code></td>
      <td><code>[...]</code></td>
      <td>Customize the Plyr controls array.</td>
    </tr>
  </tbody>
</table>