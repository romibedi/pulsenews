import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Fetch and cache a font for satori
let fontData = null;
async function getFont() {
  if (fontData) return fontData;
  const res = await fetch('https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU79TR_V.ttf');
  fontData = await res.arrayBuffer();
  return fontData;
}

// Format a date string for display
function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

// Truncate text with ellipsis
function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 1) + '\u2026' : str;
}

// Card dimensions by format
const FORMATS = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  wide: { width: 1200, height: 630 },
};

export async function generateCard(article, format = 'story') {
  const { width, height } = FORMATS[format] || FORMATS.story;
  const font = await getFont();
  const isWide = format === 'wide';
  const isSquare = format === 'square';

  // Build the card layout as satori-compatible objects
  const card = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: isWide ? '40px 50px' : '60px',
        fontFamily: 'Plus Jakarta Sans',
        position: 'relative',
        overflow: 'hidden',
      },
      children: [
        // Decorative accent circles
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '-80px',
              right: '-80px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(224, 93, 68, 0.15)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '-60px',
              left: '-60px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(224, 93, 68, 0.1)',
            },
          },
        },
        // Category badge
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: isWide ? '16px' : '24px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    background: 'rgba(224, 93, 68, 0.2)',
                    color: '#e87461',
                    fontSize: isWide ? '14px' : '18px',
                    fontWeight: 700,
                    padding: isWide ? '4px 14px' : '6px 18px',
                    borderRadius: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  },
                  children: article.section || article.category || 'News',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: isWide ? '13px' : '16px',
                  },
                  children: formatDate(article.date),
                },
              },
            ],
          },
        },
        // Headline
        {
          type: 'div',
          props: {
            style: {
              color: '#ffffff',
              fontSize: isWide ? '36px' : isSquare ? '44px' : '52px',
              fontWeight: 700,
              lineHeight: 1.2,
              flex: 1,
              display: 'flex',
              alignItems: isWide ? 'center' : 'flex-start',
            },
            children: truncate(article.title, isWide ? 120 : 200),
          },
        },
        // Description (not for wide)
        ...(!isWide && article.description ? [{
          type: 'div',
          props: {
            style: {
              color: 'rgba(255,255,255,0.6)',
              fontSize: isSquare ? '18px' : '22px',
              lineHeight: 1.5,
              marginTop: '16px',
              marginBottom: '24px',
            },
            children: truncate(article.description, isSquare ? 120 : 200),
          },
        }] : []),
        // Source line
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: isWide ? '14px' : '16px',
              marginTop: isWide ? '0' : '8px',
            },
            children: [
              article.source || article.author || '',
              article.source && article.author ? ' \u00B7 ' : '',
              article.author && article.source ? article.author : '',
            ].filter(Boolean).join(''),
          },
        },
        // Branding bar
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: isWide ? '20px' : '32px',
              paddingTop: isWide ? '16px' : '24px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: isWide ? '28px' : '36px',
                          height: isWide ? '28px' : '36px',
                          borderRadius: '8px',
                          background: '#e05d44',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: isWide ? '14px' : '18px',
                          fontWeight: 800,
                        },
                        children: 'P',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          color: 'white',
                          fontSize: isWide ? '18px' : '24px',
                          fontWeight: 600,
                        },
                        children: [
                          {
                            type: 'span',
                            props: { children: 'PulseNews' },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { color: '#e87461' },
                              children: 'Today',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: isWide ? '12px' : '14px',
                  },
                  children: 'pulsenewstoday.com',
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(card, {
    width,
    height,
    fonts: [
      {
        name: 'Plus Jakarta Sans',
        data: font,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  });
  return resvg.render().asPng();
}
