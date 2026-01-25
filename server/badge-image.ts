import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Badge image generator for social sharing
// Creates a 1200x630 image (optimal for social media)

interface BadgeImageOptions {
  badgeName: string;
  badgeIcon: string;
  badgeDescription: string;
  userName?: string;
}

// We'll fetch the font once and cache it
let fontData: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;

  // Fetch Inter font from Google Fonts
  const response = await fetch(
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff'
  );
  fontData = await response.arrayBuffer();
  return fontData;
}

export async function generateBadgeImage(options: BadgeImageOptions): Promise<Buffer> {
  const { badgeName, badgeIcon, badgeDescription, userName } = options;

  const font = await loadFont();

  // Create the SVG using satori
  // Using 'as any' because satori accepts this object format but TypeScript types expect JSX
  const svg = await satori(
    ({
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
          fontFamily: 'Inter',
        },
        children: [
          // Top branding
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 40,
                left: 50,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 24,
                      color: '#94a3b8',
                      fontWeight: 500,
                    },
                    children: '21 Day AI SaaS Challenge',
                  },
                },
              ],
            },
          },
          // Badge icon circle
          {
            type: 'div',
            props: {
              style: {
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 90,
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4)',
                marginBottom: 30,
              },
              children: badgeIcon,
            },
          },
          // "Badge Earned" text
          {
            type: 'div',
            props: {
              style: {
                fontSize: 18,
                color: '#22c55e',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 4,
                marginBottom: 12,
              },
              children: 'Badge Earned',
            },
          },
          // Badge name
          {
            type: 'div',
            props: {
              style: {
                fontSize: 56,
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: 16,
                textAlign: 'center',
              },
              children: badgeName,
            },
          },
          // Badge description
          {
            type: 'div',
            props: {
              style: {
                fontSize: 24,
                color: '#94a3b8',
                textAlign: 'center',
                maxWidth: 600,
              },
              children: badgeDescription,
            },
          },
          // User name (if provided)
          ...(userName ? [{
            type: 'div',
            props: {
              style: {
                marginTop: 40,
                fontSize: 20,
                color: '#64748b',
              },
              children: `Earned by ${userName}`,
            },
          }] : []),
          // Bottom branding
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: 40,
                right: 50,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 18,
                      color: '#64748b',
                    },
                    children: 'by Matt Webley',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 18,
                      color: '#475569',
                    },
                    children: '•',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 18,
                      color: '#64748b',
                    },
                    children: 'mattwebley.com',
                  },
                },
              ],
            },
          },
        ],
      },
    }) as any,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: font,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: font,
          weight: 500,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: font,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: font,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  // Convert SVG to PNG
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}

// Referral share image - creates curiosity and FOMO
export async function generateReferralImage(): Promise<Buffer> {
  const font = await loadFont();

  const svg = await satori(
    ({
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'Inter',
          position: 'relative',
        },
        children: [
          // Decorative elements - glowing orbs
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: -100,
                right: -100,
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: -150,
                left: -150,
                width: 500,
                height: 500,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
              },
            },
          },
          // Top label
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 24,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 16,
                      color: '#22c55e',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 3,
                      background: 'rgba(34, 197, 94, 0.1)',
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    },
                    children: "You're Invited",
                  },
                },
              ],
            },
          },
          // Main headline
          {
            type: 'div',
            props: {
              style: {
                fontSize: 64,
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.1,
                marginBottom: 16,
                maxWidth: 900,
              },
              children: 'Build Your Own AI SaaS',
            },
          },
          // Subheadline
          {
            type: 'div',
            props: {
              style: {
                fontSize: 36,
                fontWeight: 500,
                color: '#94a3b8',
                textAlign: 'center',
                marginBottom: 40,
              },
              children: 'In Just 21 Days',
            },
          },
          // Stats row
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                gap: 48,
                marginBottom: 40,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 42, fontWeight: 700, color: '#3b82f6' },
                          children: '21',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
                          children: 'Days',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 42, fontWeight: 700, color: '#8b5cf6' },
                          children: '$0',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
                          children: 'Coding Required',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 42, fontWeight: 700, color: '#22c55e' },
                          children: '100%',
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
                          children: 'AI-Powered',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          // CTA hint
          {
            type: 'div',
            props: {
              style: {
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                padding: '16px 40px',
                borderRadius: 12,
                fontSize: 20,
                fontWeight: 600,
                color: '#ffffff',
              },
              children: 'Join the Challenge →',
            },
          },
          // Bottom branding
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: 30,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 16,
                      color: '#64748b',
                    },
                    children: 'by Matt Webley',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 16,
                      color: '#475569',
                    },
                    children: '•',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 16,
                      color: '#64748b',
                    },
                    children: 'mattwebley.com',
                  },
                },
              ],
            },
          },
        ],
      },
    }) as any,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: font, weight: 400, style: 'normal' },
        { name: 'Inter', data: font, weight: 500, style: 'normal' },
        { name: 'Inter', data: font, weight: 600, style: 'normal' },
        { name: 'Inter', data: font, weight: 700, style: 'normal' },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });

  return resvg.render().asPng();
}
