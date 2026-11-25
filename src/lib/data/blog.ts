/**
 * Editorial content for the MULTI-SHOP Journal.
 *
 * This is local, hand-written content bundled with the storefront. It does not
 * come from a backend CMS; move it to an API when one exists.
 */
export interface BlogSection {
  heading?: string;
  paragraphs: string[];
}

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Guides' | 'Care' | 'Style' | 'Training';
  readingMinutes: number;
  publishedAt: string; // ISO date
  image: string;
  imageAlt: string;
  /** Shop link shown at the end of the article. */
  shopLink: { label: string; to: string };
  sections: BlogSection[];
}

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=75`;

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'choosing-your-running-shoe',
    title: 'How to choose the right running shoe',
    excerpt: 'Cushioning, drop and fit explained — a practical checklist before your next long run.',
    category: 'Guides',
    readingMinutes: 5,
    publishedAt: '2026-10-28',
    image: photo('photo-1491553895911-0055eca6402d'),
    imageAlt: 'A black performance running shoe floating against a light background',
    shopLink: { label: 'Shop running shoes', to: '/shop?collection=RUNNING' },
    sections: [
      {
        paragraphs: [
          'The best running shoe is the one that disappears on your foot. Before looking at colourways, think about where and how far you run, and how your current pair feels at the end of a session.',
        ],
      },
      {
        heading: 'Start with the fit',
        paragraphs: [
          'Leave roughly a thumb’s width between your longest toe and the end of the shoe — feet swell during longer runs. The heel should feel locked without pressure points, and the midfoot snug but not tight.',
          'Try shoes on later in the day and wear the socks you actually run in. If you are between sizes, the larger size usually works better for distance.',
        ],
      },
      {
        heading: 'Cushioning and drop',
        paragraphs: [
          'More cushioning protects your legs on long road runs; a firmer, lower shoe gives more ground feel for faster sessions. Heel-to-toe drop affects where you land: higher drops suit heel strikers, lower drops encourage a midfoot strike.',
        ],
      },
      {
        heading: 'When to replace',
        paragraphs: [
          'Most running shoes last 500–800 km. Flattened foam, uneven outsole wear or new aches are signs it is time for a fresh pair.',
        ],
      },
    ],
  },
  {
    slug: 'sneaker-care-guide',
    title: 'Sneaker care: keep your pairs fresh',
    excerpt: 'Simple routines for leather, mesh and suede that keep your rotation looking new for longer.',
    category: 'Care',
    readingMinutes: 4,
    publishedAt: '2026-10-14',
    image: photo('photo-1600269452121-4f2416e55c28'),
    imageAlt: 'Clean white leather sneakers photographed in black and white',
    shopLink: { label: 'Browse lifestyle sneakers', to: '/shop?collection=LIFESTYLE' },
    sections: [
      {
        paragraphs: [
          'A few minutes of care after wearing does more than an occasional deep clean. Brush off dirt while it is dry, let pairs air out, and store them away from direct sunlight.',
        ],
      },
      {
        heading: 'Leather and synthetics',
        paragraphs: [
          'Wipe with a soft cloth and a little mild soap in lukewarm water. Avoid soaking the shoe — work in small circles and dry with a clean towel.',
        ],
      },
      {
        heading: 'Mesh and knit',
        paragraphs: [
          'Use a soft brush and gentle cleaner, then stuff the shoes with paper to keep their shape while they dry at room temperature. Skip the dryer: heat weakens adhesives.',
        ],
      },
      {
        heading: 'Rotate your pairs',
        paragraphs: ['Giving each pair a day off lets the foam recover and moisture evaporate, which helps them last noticeably longer.'],
      },
    ],
  },
  {
    slug: 'building-a-sneaker-rotation',
    title: 'Street style: building a sneaker rotation',
    excerpt: 'Three pairs that cover almost every outfit — and how to choose colours that work together.',
    category: 'Style',
    readingMinutes: 6,
    publishedAt: '2026-09-30',
    image: photo('photo-1595341888016-a392ef81b7de'),
    imageAlt: 'A chunky multi-colour sneaker photographed in an urban setting',
    shopLink: { label: 'Explore casual styles', to: '/shop?collection=CASUAL' },
    sections: [
      {
        paragraphs: [
          'You do not need a wall of boxes to dress well. A small, intentional rotation covers work, weekends and evenings out.',
        ],
      },
      {
        heading: 'The clean everyday pair',
        paragraphs: ['A white or off-white low-top goes with denim, tailoring and shorts alike. Keep it clean and it instantly sharpens an outfit.'],
      },
      {
        heading: 'The statement pair',
        paragraphs: [
          'Pick one pair with colour or a bold silhouette and build the rest of the outfit around it in neutral tones so the shoes lead.',
        ],
      },
      {
        heading: 'The weather-ready pair',
        paragraphs: ['A darker shoe with a grippy outsole handles rain and city grime without worry — the pair you reach for when the forecast is uncertain.'],
      },
    ],
  },
  {
    slug: 'training-vs-running-shoes',
    title: 'Training shoes vs running shoes',
    excerpt: 'Why lifting in soft running foam holds you back, and what to look for in a gym shoe.',
    category: 'Training',
    readingMinutes: 4,
    publishedAt: '2026-09-12',
    image: photo('photo-1534438327276-14e5300c3a48'),
    imageAlt: 'A modern gym with dumbbell racks and an athlete training in the background',
    shopLink: { label: 'Shop training shoes', to: '/shop?collection=TRAINING' },
    sections: [
      {
        paragraphs: [
          'Running shoes are designed to move forward and absorb impact. Training shoes are designed to keep you stable while you move in every direction and push against the floor.',
        ],
      },
      {
        heading: 'Stability under load',
        paragraphs: [
          'Thick, soft midsoles compress under a barbell, which makes squats and deadlifts feel unstable. A flatter, firmer platform transfers force into the ground.',
        ],
      },
      {
        heading: 'Lateral support',
        paragraphs: ['Side-to-side drills, jumps and classes need a reinforced upper and a wider base so your foot stays over the sole.'],
      },
      {
        heading: 'One pair or two?',
        paragraphs: [
          'If you mostly lift and do classes, a dedicated trainer is worth it. If you run more than a few kilometres at a time, keep a running shoe for those sessions.',
        ],
      },
    ],
  },
];

export const getArticleBySlug = (slug: string): BlogArticle | undefined =>
  BLOG_ARTICLES.find((article) => article.slug === slug);
