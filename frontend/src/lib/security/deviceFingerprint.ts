export interface DeviceInfo {
  fingerprint: string;
  browser: string;
  os: string;
  device: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  colorDepth: number;
  touchSupport: boolean;
  webGLVendor?: string;
  webGLRenderer?: string;
}

class DeviceFingerprintGenerator {
  private cachedFingerprint: string | null = null;

  /**
   * Generate unique device fingerprint
   */
  async generate(): Promise<string> {
    if (this.cachedFingerprint) {
      return this.cachedFingerprint;
    }

    const components = await this.getComponents();
    const fingerprint = await this.hash(JSON.stringify(components));

    this.cachedFingerprint = fingerprint;
    return fingerprint;
  }

  /**
   * Get detailed device information
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    const fingerprint = await this.generate();
    const components = await this.getComponents();

    return {
      fingerprint,
      browser: this.getBrowser(),
      os: this.getOS(),
      device: this.getDevice(),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory,
      colorDepth: screen.colorDepth,
      touchSupport: this.getTouchSupport(),
      webGLVendor: components.webGL?.vendor,
      webGLRenderer: components.webGL?.renderer,
    };
  }

  /**
   * Check if device is trusted
   */
  async isTrusted(userId: string): Promise<boolean> {
    const fingerprint = await this.generate();
    const key = `trusted_device_${userId}_${fingerprint}`;

    return localStorage.getItem(key) === 'true';
  }

  /**
   * Mark device as trusted
   */
  async trustDevice(userId: string, expiryDays: number = 30): Promise<void> {
    const fingerprint = await this.generate();
    const key = `trusted_device_${userId}_${fingerprint}`;
    const expiry = Date.now() + expiryDays * 24 * 60 * 60 * 1000;

    localStorage.setItem(key, 'true');
    localStorage.setItem(`${key}_expiry`, expiry.toString());
  }

  /**
   * Remove device trust
   */
  async untrustDevice(userId: string): Promise<void> {
    const fingerprint = await this.generate();
    const key = `trusted_device_${userId}_${fingerprint}`;

    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_expiry`);
  }

  /**
   * Get all fingerprint components
   */
  private async getComponents(): Promise<Record<string, any>> {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      screenResolution: `${screen.width}x${screen.height}`,
      availableScreenResolution: `${screen.availWidth}x${screen.availHeight}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      sessionStorage: this.hasSessionStorage(),
      localStorage: this.hasLocalStorage(),
      indexedDB: this.hasIndexedDB(),
      openDatabase: this.hasOpenDatabase(),
      cpuClass: (navigator as any).cpuClass,
      doNotTrack: navigator.doNotTrack,
      plugins: this.getPlugins(),
      canvas: await this.getCanvasFingerprint(),
      webGL: this.getWebGLInfo(),
      fonts: await this.getFonts(),
      audio: await this.getAudioFingerprint(),
      touchSupport: this.getTouchSupport(),
    };
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getDevice(): string {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private hasSessionStorage(): boolean {
    try {
      return !!window.sessionStorage;
    } catch {
      return false;
    }
  }

  private hasLocalStorage(): boolean {
    try {
      return !!window.localStorage;
    } catch {
      return false;
    }
  }

  private hasIndexedDB(): boolean {
    return !!window.indexedDB;
  }

  private hasOpenDatabase(): boolean {
    return !!(window as any).openDatabase;
  }

  private getPlugins(): string[] {
    const plugins: string[] = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins;
  }

  private getTouchSupport(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      const text = 'SmartKode Device Fingerprint';
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText(text, 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText(text, 4, 17);

      return canvas.toDataURL();
    } catch {
      return '';
    }
  }

  private getWebGLInfo(): { vendor?: string; renderer?: string } | undefined {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return undefined;

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return undefined;

      return {
        vendor: (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      };
    } catch {
      return undefined;
    }
  }

  private async getFonts(): Promise<string[]> {
    // Common fonts to check
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const fontList = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact',
    ];

    const detectedFonts: string[] = [];

    for (const font of fontList) {
      if (await this.isFontAvailable(font, baseFonts)) {
        detectedFonts.push(font);
      }
    }

    return detectedFonts;
  }

  private async isFontAvailable(font: string, baseFonts: string[]): Promise<boolean> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const text = 'mmmmmmmmmmlli';
    const baselineSize: Record<string, number> = {};

    for (const baseFont of baseFonts) {
      ctx.font = `72px ${baseFont}`;
      baselineSize[baseFont] = ctx.measureText(text).width;
    }

    for (const baseFont of baseFonts) {
      ctx.font = `72px ${font}, ${baseFont}`;
      const newSize = ctx.measureText(text).width;
      if (newSize !== baselineSize[baseFont]) {
        return true;
      }
    }

    return false;
  }

  private async getAudioFingerprint(): Promise<number> {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const analyser = context.createAnalyser();
      const gainNode = context.createGain();
      const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0;
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(0);

      return new Promise((resolve) => {
        scriptProcessor.onaudioprocess = (event) => {
          const output = event.inputBuffer.getChannelData(0);
          let sum = 0;
          for (let i = 0; i < output.length; i++) {
            sum += Math.abs(output[i]);
          }
          resolve(sum);
          oscillator.stop();
          scriptProcessor.disconnect();
          analyser.disconnect();
          gainNode.disconnect();
        };
      });
    } catch {
      return 0;
    }
  }

  /**
   * Hash string using SubtleCrypto
   */
  private async hash(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton
export const deviceFingerprint = new DeviceFingerprintGenerator();

// Utility functions
export const getDeviceFingerprint = async (): Promise<string> => {
  return deviceFingerprint.generate();
};

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  return deviceFingerprint.getDeviceInfo();
};

export const isDeviceTrusted = async (userId: string): Promise<boolean> => {
  return deviceFingerprint.isTrusted(userId);
};

export const trustCurrentDevice = async (userId: string): Promise<void> => {
  return deviceFingerprint.trustDevice(userId);
};