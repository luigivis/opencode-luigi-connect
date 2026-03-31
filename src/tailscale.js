import { execSync } from 'child_process';

export async function getTailscaleInfo() {
  try {
    const output = execSync('tailscale status --json 2>/dev/null', { encoding: 'utf-8' });
    const status = JSON.parse(output);
    
    const self = status.Self;
    if (self && self.CurrAddr) {
      return {
        ip: self.CurrAddr.replace(/:.*$/, ''),
        hostname: self.HostName,
        isConnected: true,
      };
    }
  } catch {
    // Tailscale not running or not installed
  }
  
  return {
    ip: null,
    hostname: null,
    isConnected: false,
  };
}

export async function getTailscaleIP() {
  const info = await getTailscaleInfo();
  return info.ip;
}

export async function getLocalIP() {
  try {
    const output = execSync("ip route get 1 | awk '{print $6; exit}' 2>/dev/null || hostname -I | awk '{print $1}'", { encoding: 'utf-8' });
    return output.trim() || null;
  } catch {
    try {
      const output = execSync("ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $2}'", { encoding: 'utf-8' });
      return output.trim() || null;
    } catch {
      return null;
    }
  }
}

export async function getNetworkInfo() {
  const [tailscale, localIp] = await Promise.all([
    getTailscaleInfo(),
    getLocalIP(),
  ]);
  
  return { tailscale, localIp };
}

export function isTailscaleInstalled() {
  try {
    execSync('which tailscale', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function installTailscale() {
  try {
    execSync('curl -fsSL https://tailscale.com/install.sh | bash', { stdio: 'inherit' });
    return isTailscaleInstalled();
  } catch {
    return false;
  }
}
