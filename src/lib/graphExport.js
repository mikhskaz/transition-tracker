import { toPng } from 'html-to-image';

export async function exportGraphAsPng() {
  const el = document.querySelector('.react-flow');
  if (!el) return;
  try {
    const dataUrl = await toPng(el, {
      backgroundColor: '#0A0907',
      pixelRatio: 2,
      filter: (node) => {
        if (node.classList?.contains('react-flow__minimap')) return false;
        if (node.classList?.contains('react-flow__controls')) return false;
        if (node.classList?.contains('react-flow__attribution')) return false;
        return true;
      },
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `transition-tracker-${Date.now()}.png`;
    a.click();
  } catch (err) {
    alert(`PNG export failed: ${err.message}`);
  }
}
