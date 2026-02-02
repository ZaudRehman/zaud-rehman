import Phaser from 'phaser';
import gsap from 'gsap';

// ============================================
// THE SPIRIT STATION ENGINE (GOD MODE)
// ============================================
class StationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StationScene' });
    this.state = {
      embers: 0,
      spirits: 0,
      trainArrived: false
    };
  }

  create() {
    const { width, height } = this.cameras.main;
    console.log('🌸 Spirit Station: Ghibli Mode Active');

    // 1. DYNAMIC WATERCOLOR SKY
    // We draw a gradient texture on the fly
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0xFFE5D9, 0xFFE5D9, 1);
    sky.fillRect(0, 0, width, height);
    this.add.existing(sky);

    // 2. PARALLAX CLOUDS (Procedural)
    this.createClouds();

    // 3. THE SEA RAILWAY (Procedural Art)
    this.createSeaRailway();

    // 4. SIGNAL LIGHT
    this.createSignalLight();

    // 5. START AMBIENCE
    this.startAmbience();

    // 6. DISPATCH EVENT FOR REACT/UI LAYER
    this.events.emit('ready');
    
    // Trigger Train after 2s
    this.time.delayedCall(2000, () => this.arriveTrain());
  }

  createClouds() {
    // Fluffy soft clouds moving slowly
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.circle(
        Phaser.Math.Between(0, this.scale.width),
        Phaser.Math.Between(50, 200),
        Phaser.Math.Between(40, 80),
        0xFFFFFF,
        0.8
      );
      
      // Blobby shape by adding more circles
      const c2 = this.add.circle(cloud.x + 40, cloud.y + 10, 50, 0xFFFFFF, 0.8);
      const c3 = this.add.circle(cloud.x - 40, cloud.y + 10, 50, 0xFFFFFF, 0.8);
      
      const container = this.add.container(0, 0, [cloud, c2, c3]);
      
      // Infinite drift
      this.tweens.add({
        targets: container,
        x: container.x + 100,
        duration: 20000 + Math.random() * 10000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createSeaRailway() {
    const { width, height } = this.scale;
    const railY = height * 0.8;

    // Ocean Surface
    const ocean = this.add.rectangle(
      width / 2,
      height,
      width,
      height * 0.25,
      0x4A90E2,
      0.6
    );
    ocean.setOrigin(0.5, 1);
    
    // Rail Tracks (submerged look)
    const track = this.add.graphics();
    track.lineStyle(4, 0x2C3E50, 0.8);
    track.beginPath();
    track.moveTo(0, railY);
    track.lineTo(width, railY);
    track.strokePath();

    // Sleepers (rail ties)
    for (let i = 0; i < width; i += 60) {
      track.lineStyle(8, 0x34495E, 0.9);
      track.beginPath();
      track.moveTo(i, railY - 10);
      track.lineTo(i + 10, railY + 10); // Perspective angle
      track.strokePath();
    }
  }

  createSignalLight() {
    const { width, height } = this.scale;
    // Classic Ghibli signal pole
    const pole = this.add.rectangle(
      width - 100,
      height * 0.7,
      10,
      200,
      0x2C3E50
    );
    
    // Light housing
    this.signalLight = this.add.circle(
      width - 100,
      height * 0.7 - 100,
      20,
      0xFF0000
    );
    
    // Bloom effect (fake)
    this.signalBloom = this.add.circle(
      width - 100,
      height * 0.7 - 100,
      40,
      0xFF0000,
      0.3
    );
    
    // Blinking animation
    this.tweens.add({
      targets: [this.signalLight, this.signalBloom],
      alpha: 0.2,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  arriveTrain() {
    // TURN SIGNAL GREEN
    this.signalLight.setFillStyle(0x00FF00);
    this.signalBloom.setFillStyle(0x00FF00, 0.3);

    const { width, height } = this.scale;
    
    // Train container
    const train = this.add.container(-600, height * 0.76); // Start off-screen
    
    // 1. Carriage body (rounded, Ghibli red)
    const body = this.add.rectangle(0, 0, 500, 140, 0xA93226); 
    body.setStrokeStyle(4, 0x7B241C);
    train.add(body);
    
    // 2. Windows (lit warm yellow)
    for (let i = 0; i < 4; i++) {
      const win = this.add.rectangle(
        -180 + (i * 120),
        -20,
        80,
        60,
        0xF9E79F,
        0.9
      );
      train.add(win);
    }
    
    // 3. Wheels
    const w1 = this.add.circle(-180, 70, 25, 0x17202A);
    const w2 = this.add.circle(180, 70, 25, 0x17202A);
    train.add([w1, w2]);
    
    // Animate arrival (GSAP ease for weight)
    this.tweens.add({
      targets: train,
      x: width / 2,
      duration: 4000,
      ease: 'Power2.easeOut', // Heavy train stopping
      onComplete: () => {
        this.cameras.main.shake(200, 0.005); // Impact shake
        this.disembarkSpirit(train.x, train.y);
      }
    });
  }

  disembarkSpirit(x, y) {
    // Create a soot sprite or ghost
    const spirit = this.add.circle(x, y, 20, 0xFFFFFF, 0.8);
    
    // Hop off train
    this.tweens.add({
      targets: spirit,
      x: x + 100,
      y: y + 50,
      duration: 1000,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        // Dispatch to UI
        window.dispatchEvent(
          new CustomEvent('spirit-arrived', { detail: { type: 'No Face' } })
        );
      }
    });
  }

  startAmbience() {
    // In a real app, load audio here:
    // this.sound.play('ocean_ambience', { loop: true, volume: 0.5 });
  }
}

// ✅ FIXED EXPORT NAME TO MATCH IMPORT IN INDEX.JS
export const createSpiritStation = (containerId) => {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: containerId,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#87CEEB',
    scene: StationScene,
    physics: { default: 'arcade' },
    scale: { mode: Phaser.Scale.RESIZE }
  });
};
