import { Link, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { ArticleCard } from '../../components/common/ArticleCard';
import { EmptyState } from '../../components/common/PageStatus';
import { SafeImage } from '../../components/common/SafeImage';
import { useDocumentTitle } from '../../app/hooks';
import { BLOG_ARTICLES, getArticleBySlug } from '../../data/blog';
import { formatDate } from '../../utils/format';
import '../../css/blog.css';

export function ArticlePage() {
  const { slug = '' } = useParams();
  const article = getArticleBySlug(slug);
  useDocumentTitle(article?.title ?? 'Article not found');

  if (!article) {
    return (
      <EmptyState
        icon={ArticleOutlinedIcon}
        title="Article not found"
        description="This article does not exist or has moved."
        action={
          <Button component={Link} to="/blog" variant="contained">
            Back to the Journal
          </Button>
        }
      />
    );
  }

  const more = BLOG_ARTICLES.filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <Stack spacing={6}>
      <article className="ms-article">
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            Home
          </Link>
          <Link to="/blog" style={{ textDecoration: 'none' }}>
            Journal
          </Link>
          <Typography color="text.primary" noWrap sx={{ maxWidth: 240 }}>
            {article.title}
          </Typography>
        </Breadcrumbs>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip label={article.category} size="small" sx={{ bgcolor: '#f3efe9' }} />
          <Typography variant="body2" color="text.secondary">
            {article.readingMinutes} min read · {formatDate(article.publishedAt)}
          </Typography>
        </Stack>
        <Typography variant="h1" sx={{ mt: 2, fontSize: { xs: '2.1rem', md: '3rem' } }}>
          {article.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, fontSize: '1.15rem' }}>
          {article.excerpt}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <SafeImage src={article.image} alt={article.imageAlt} className="ms-article-hero" loading="eager" />
        </Box>

        <div className="ms-article-content">
          {article.sections.map((section, index) => (
            <section key={index}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </section>
          ))}
          <Divider sx={{ my: 4 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button component={Link} to={article.shopLink.to} variant="contained" endIcon={<ArrowForwardIcon />}>
              {article.shopLink.label}
            </Button>
            <Button component={Link} to="/blog" variant="outlined" startIcon={<ArrowBackIcon />}>
              All articles
            </Button>
          </Stack>
        </div>
      </article>

      <Box component="section" aria-labelledby="more-heading">
        <Typography id="more-heading" variant="h4" component="h2" sx={{ mb: 3 }}>
          Keep reading
        </Typography>
        <div className="ms-blog-grid">
          {more.map((item) => (
            <ArticleCard key={item.slug} article={item} />
          ))}
        </div>
      </Box>
    </Stack>
  );
}
