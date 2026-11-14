import { Link } from 'react-router-dom';
import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { BlogArticle } from '../../data/blog';
import { formatDate } from '../../utils/format';
import { SafeImage } from './SafeImage';

interface ArticleCardProps {
  article: BlogArticle;
  /** Larger lead card layout used for the first article. */
  featured?: boolean;
}

export function ArticleCard({ article, featured }: ArticleCardProps) {
  return (
    <Card component="article" className={`ms-article-card${featured ? ' featured' : ''}`}>
      <CardActionArea component={Link} to={`/blog/${article.slug}`} className="ms-article-link" aria-label={`Read article: ${article.title}`}>
        <div className="ms-article-media">
          <SafeImage src={article.image} alt={article.imageAlt} />
        </div>
        <CardContent className="ms-article-body">
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label={article.category} size="small" sx={{ bgcolor: '#f3efe9', fontWeight: 600 }} />
            <Typography variant="caption" color="text.secondary">
              {article.readingMinutes} min read · {formatDate(article.publishedAt)}
            </Typography>
          </Stack>
          <Typography variant="h5" component="h3" sx={{ mt: 2, fontSize: featured ? { md: '1.6rem' } : undefined }}>
            {article.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {article.excerpt}
          </Typography>
          <Typography component="span" className="ms-article-cta">
            Read article <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
