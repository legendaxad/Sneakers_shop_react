import { Stack, Typography } from '@mui/material';
import { ArticleCard } from '../../components/common/ArticleCard';
import { useDocumentTitle } from '../../app/hooks';
import { BLOG_ARTICLES } from '../../data/blog';
import '../../css/blog.css';

export function BlogPage() {
  useDocumentTitle('Journal');
  return (
    <Stack spacing={4}>
      <div>
        <span className="ms-eyebrow">The Journal</span>
        <Typography variant="h2" component="h1" sx={{ mt: 1.5 }}>
          Stories, guides & care
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>
          Advice from the MULTI-SHOP team on choosing, styling and caring for your sneakers.
        </Typography>
      </div>
      <div className="ms-blog-grid">
        {BLOG_ARTICLES.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </Stack>
  );
}
