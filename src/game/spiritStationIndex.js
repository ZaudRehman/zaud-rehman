import { createSpiritStation } from './SpiritStation';
import SpiritUI from './SpiritUI';

export function initSpiritStation() {
  console.log('🚂 Spirit Station System Ready');
  
  window.launchSpiritStation = function() {
    console.log('🌸 Opening Spirit Station...');
    
    // 1. Create fullscreen container
    const container = document.createElement('div');
    container.id = 'spirit-station-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      background: #000; /* Prevent white flash */
    `;
    document.body.appendChild(container);

    // 2. Create UI Layer (Absolute on top of Canvas)
    const uiLayer = document.createElement('div');
    uiLayer.id = 'spirit-ui-layer';
    uiLayer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none; /* Let clicks pass through to game */
      z-index: 10000;
    `;
    // Inject the HTML string from SpiritUI
    uiLayer.innerHTML = SpiritUI(); 
    container.appendChild(uiLayer);
    
    // 3. Close button (High Z-Index)
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 24px;
      right: 24px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(0,0,0,0.2);
      backdrop-filter: blur(8px);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      font-size: 20px;
      cursor: pointer;
      z-index: 10001; /* Above UI */
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;
    
    closeBtn.onmouseenter = () => {
      closeBtn.style.transform = 'scale(1.1) rotate(90deg)';
      closeBtn.style.background = 'rgba(255,50,50,0.8)';
    };
    closeBtn.onmouseleave = () => {
      closeBtn.style.transform = 'scale(1) rotate(0deg)';
      closeBtn.style.background = 'rgba(0,0,0,0.2)';
    };
    
    closeBtn.onclick = () => {
      // Cleanup game instance if possible
      const gameCanvas = container.querySelector('canvas');
      if (gameCanvas) {
        // Find Phaser game instance attached to window or DOM if needed
        // For now, removing the DOM element is enough to kill the context in most browsers
      }
      container.remove();
    };
    
    container.appendChild(closeBtn);
    
    // 4. Launch Phaser Game inside container
    // The game will append its canvas automatically to this div
    const game = createSpiritStation('spirit-station-container');
    
    // Clean up game when container is removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.removedNodes) {
          mutation.removedNodes.forEach((node) => {
            if (node.id === 'spirit-station-container') {
              game.destroy(true); // Destroy game and remove canvas
              console.log('🛑 Spirit Station destroyed');
            }
          });
        }
      });
    });
    
    observer.observe(document.body, { childList: true });

    console.log('✅ Spirit Station launched!');
  };
}
