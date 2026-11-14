import { ArticleCard } from '../../components/common/ArticleCard';
import { Reveal } from '../../components/common/Reveal';
import { SectionHeader } from '../../components/common/SectionHeader';
import { BLOG_ARTICLES } from '../../data/blog';

/** Editorial cards from the local Journal content (src/data/blog.ts). */
export function JournalSection() {
  const [lead, ...rest] = BLOG_ARTICLES;
  return (
    <Reveal aria-labelledby="journal-heading">
      <SectionHeader
        id="journal-heading"
        eyebrow="The Journal"
        title="Stories, guides & care"
        description="Advice from the MULTI-SHOP team on choosing, styling and caring for your sneakers."
        action={{ label: 'All articles', to: '/blog' }}
      />
      <div className="ms-journal-grid">
        <ArticleCard article={lead} featured />
        <div className="ms-journal-side">
          {rest.slice(0, 3).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
