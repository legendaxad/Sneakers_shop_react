import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton, Typography } from '@mui/material';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { Reveal } from '../../components/common/Reveal';
import { SafeImage } from '../../components/common/SafeImage';
import { SectionHeader } from '../../components/common/SectionHeader';
import { CATEGORY_META, type CategoryMeta } from '../../data/categories';
import { productApi } from '../../services/api';

type CategoryWithCount = CategoryMeta & { count: number | null };

/**
 * Column spans that fill every row: the first (lead) card is wider, and the
 * last card stretches over any empty cells. Desktop uses 4 columns, mobile 2.
 */
const gridSpans = (count: number, columns: number, leadSpan: number): number[] => {
  const spans = Array.from({ length: count }, (_, index) => (index === 0 ? Math.min(leadSpan, columns) : 1));
  const used = spans.reduce((sum, span) => sum + span, 0);
  const extra = (columns - (used % columns)) % columns;
  if (count) spans[count - 1] = Math.min(spans[count - 1] + extra, columns);
  return spans;
};

/** Product categories with live counts from GET /product/count; empty categories are hidden. */
export function CategorySection() {
  const [categories, setCategories] = useState<CategoryWithCount[] | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled(CATEGORY_META.map((meta) => productApi.getProductCount({ productCollection: meta.value }))).then((results) => {
      if (!active) return;
      const withCounts = CATEGORY_META.map((meta, index) => {
        const result = results[index];
        return { ...meta, count: result.status === 'fulfilled' ? result.value : null };
      });
      // If counts could not be loaded, still show the categories (without counts).
      const allFailed = withCounts.every((category) => category.count === null);
      setCategories(allFailed ? withCounts : withCounts.filter((category) => (category.count ?? 0) > 0));
    });
    return () => {
      active = false;
    };
  }, []);

  if (categories && categories.length === 0) return null;
  const desktopSpans = gridSpans(categories?.length ?? 0, 4, 2);
  const mobileSpans = gridSpans(categories?.length ?? 0, 2, 2);

  return (
    <Reveal aria-labelledby="categories-heading">
      <SectionHeader
        id="categories-heading"
        eyebrow="Shop by category"
        title="Find your next pair"
        description="Every collection is curated for how you move."
        action={{ label: 'View all products', to: '/shop' }}
      />
      <div className="ms-category-grid">
        {categories === null
          ? Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" className="ms-category-skeleton" sx={{ borderRadius: '28px' }} />
            ))
          : categories.map((category, index) => (
              <Link
                key={category.value}
                to={`/shop?collection=${category.value}`}
                className={`ms-category-card${index === 0 ? ' lead' : ''}`}
                style={{ '--span-md': desktopSpans[index], '--span-sm': mobileSpans[index] } as CSSProperties}
                aria-label={`${category.label}${category.count !== null ? `, ${category.count} styles` : ''}`}
              >
                <SafeImage src={category.image} alt="" />
                <div className="ms-category-overlay">
                  <span className="ms-category-tagline">{category.tagline}</span>
                  <Typography component="h3" className="ms-category-name">
                    {category.label}
                  </Typography>
                  {category.count !== null && (
                    <span className="ms-category-count">
                      {category.count} {category.count === 1 ? 'style' : 'styles'}
                    </span>
                  )}
                </div>
                <span className="ms-category-arrow" aria-hidden="true">
                  <ArrowOutwardIcon fontSize="small" />
                </span>
              </Link>
            ))}
      </div>
    </Reveal>
  );
}
