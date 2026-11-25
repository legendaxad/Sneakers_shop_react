import { Link } from 'react-router-dom';
import { Button, Skeleton, Typography } from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { EmptyState, ErrorState } from '../../components/shared/PageStatus';
import { Reveal } from '../../components/shared/Reveal';
import { SafeImage } from '../../components/shared/SafeImage';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { useAppSelector } from '../../hooks';
import { useGlobals } from '../../hooks/useGlobal';
import { DEFAULT_AVATAR } from '../../../lib/config';
import type { SectionStatusProps } from './ProductSections';
import { retrieveTopUsers } from './selector';

const medal = ['gold', 'silver', 'bronze'];

/** Leaderboard from GET /member/top-users (public fields only: nickname, photo, points). */
export function TopCustomersSection({ loading, error, onRetry }: SectionStatusProps) {
  const { authMember: member } = useGlobals();
  const leaders = useAppSelector(retrieveTopUsers);

  return (
    <Reveal className="ms-leaderboard-section" aria-labelledby="leaderboard-heading">
      <div className="ms-leaderboard-intro">
        <SectionHeader
          id="leaderboard-heading"
          eyebrow="Community"
          title="Top customers"
          description="Members earn a point for every confirmed order. Here are this season’s most active sneakerheads."
          inverted
        />
        {!member && (
          <Button component={Link} to="/signup" className="ms-hero-primary" sx={{ alignSelf: 'flex-start' }}>
            Join and start earning
          </Button>
        )}
      </div>

      <div className="ms-leaderboard">
        {error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={76} sx={{ borderRadius: '20px', bgcolor: 'rgba(255,255,255,0.08)' }} />
          ))
        ) : leaders.length ? (
          <ol className="ms-leaderboard-list" aria-label="Top customers by points">
            {leaders.map((leader, index) => (
              <li key={leader._id} className={`ms-leader ${medal[index] ?? ''}`}>
                <span className="ms-leader-rank" aria-label={`Rank ${index + 1}`}>
                  {index + 1}
                </span>
                <SafeImage src={leader.memberImage} fallback={DEFAULT_AVATAR} alt="" className="ms-leader-avatar" />
                <Typography className="ms-leader-name" noWrap>
                  {leader.memberNick}
                </Typography>
                <span className="ms-leader-points">
                  {leader.memberPoint.toLocaleString('en-US')} <small>{leader.memberPoint === 1 ? 'pt' : 'pts'}</small>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={EmojiEventsOutlinedIcon} title="No leaders yet" description="Confirm your first order to claim the top spot." />
        )}
      </div>
    </Reveal>
  );
}
