// "Share a card as an image" (Phase 1 WhatsApp sharing). Draws a card to a canvas and hands it
// to the share sheet; falls back to a PNG download where file sharing is unavailable.
import { ageLabel } from './freshness';

function wrap(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lineH; } else line = test;
  }
  ctx.fillText(line, x, y);
  return y + lineH;
}

export async function renderCardImage(role) {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, `hsl(${role.hue} 70% 55%)`);
  g.addColorStop(1, `hsl(${(role.hue + 40) % 360} 65% 38%)`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.beginPath(); ctx.roundRect(70, 330, W - 140, 800, 48); ctx.fill();

  ctx.textAlign = 'center'; ctx.font = '260px serif'; ctx.fillStyle = '#000';
  ctx.fillText(role.emoji, W / 2, 330);

  ctx.textAlign = 'left'; ctx.fillStyle = '#1d2433';
  ctx.font = '700 72px system-ui, sans-serif';
  let y = wrap(ctx, role.name, 130, 450, W - 260, 84);
  ctx.font = '400 40px system-ui, sans-serif'; ctx.fillStyle = '#5d6678';
  y = wrap(ctx, role.tagline, 130, y + 10, W - 260, 52) + 20;

  for (const key of ['salary', 'exam', 'study']) {
    const fld = role.fields[key];
    ctx.font = '600 32px system-ui, sans-serif'; ctx.fillStyle = '#5d6678';
    ctx.fillText(`${fld.label} · updated ${ageLabel(fld.updated)}`, 130, y);
    ctx.font = '600 42px system-ui, sans-serif'; ctx.fillStyle = '#1d2433';
    y = wrap(ctx, fld.value, 130, y + 52, W - 260, 52) + 22;
  }

  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '700 50px system-ui, sans-serif';
  ctx.fillText('🧭 CareerQuest', W / 2, 1230);
  ctx.font = '400 32px system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('See what careers are really like.', W / 2, 1285);

  return new Promise((res) => c.toBlob(res, 'image/png'));
}

// Returns 'shared' | 'downloaded' | 'cancelled'.
export async function shareCard(role) {
  const blob = await renderCardImage(role);
  const file = new File([blob], `careerquest-${role.id}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${role.name} on CareerQuest` });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}
