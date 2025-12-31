import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Note } from '../types/Note';
import { getPrimaryTag } from '../types/Note';
import { TagBadge } from './TagBadge';
import './NoteCard.css';

interface NoteCardProps {
  note: Note;
  currentIndex: number;
  totalCount: number;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
}

export function NoteCard({
  note,
  currentIndex,
  totalCount,
  onSwipeUp,
  onSwipeDown
}: NoteCardProps) {
  const y = useMotionValue(0);
  const x = useMotionValue(0);

  // Rotation based on horizontal drag (matching Swift: 0.05 degree factor)
  const rotate = useTransform(x, [-200, 200], [-10, 10]);

  // Scale decreases as card is dragged (matching Swift: 0.0005 factor)
  const scale = useTransform(
    y,
    [-300, 0, 300],
    [0.85, 1, 0.85]
  );

  // Opacity for swipe indicators
  const swipeUpOpacity = useTransform(y, [-100, -50, 0], [1, 0.5, 0]);
  const swipeDownOpacity = useTransform(y, [0, 50, 100], [0, 0.5, 1]);

  const SWIPE_THRESHOLD = 100; // Matching Swift

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offsetY = info.offset.y;
    const velocityY = info.velocity.y;

    if (offsetY < -SWIPE_THRESHOLD || velocityY < -500) {
      // Swiped up - Skip
      onSwipeUp();
    } else if (offsetY > SWIPE_THRESHOLD || velocityY > 500) {
      // Swiped down
      onSwipeDown();
    }
  };

  const primaryTag = getPrimaryTag(note);

  return (
    <motion.div
      className="note-card"
      style={{ x, y, rotate, scale }}
      drag
      dragConstraints={{ left: 0, right: 0, top: -300, bottom: 300 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{
        y: -1000,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
    >
      {/* Swipe indicators */}
      <motion.div className="swipe-indicator swipe-up" style={{ opacity: swipeUpOpacity }}>
        Skip
      </motion.div>
      <motion.div className="swipe-indicator swipe-down" style={{ opacity: swipeDownOpacity }}>
        Keep
      </motion.div>

      {/* Card header */}
      <div className="card-header">
        {primaryTag && <TagBadge tag={primaryTag} />}
        <span className="card-counter">{currentIndex + 1} / {totalCount}</span>
      </div>

      {/* Title */}
      <h2 className="card-title">{note.title}</h2>

      {/* Content */}
      <div className="card-content">
        <p>{note.content}</p>
      </div>

      {/* Tags */}
      <div className="card-tags">
        {note.tags.slice(0, 5).map((tag, index) => (
          <TagBadge key={index} tag={tag} size="small" />
        ))}
        {note.tags.length > 5 && (
          <span className="more-tags">+{note.tags.length - 5}</span>
        )}
      </div>

      {/* Links count */}
      <div className="card-links">
        <span className="link-icon">🔗</span>
        <span>Connections: {note.links.length}</span>
      </div>
    </motion.div>
  );
}
