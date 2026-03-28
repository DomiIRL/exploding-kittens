import { useAnimationState } from '../../context/AnimationContext';
import { AnimatedCard } from './AnimatedCard';
import './AnimationOverlay.css';
import '../board/player/card/Card.css';

export function AnimationOverlay() {
  const { animations } = useAnimationState();

  if (animations.length === 0) return null;

  return (
    <>
      <div className="animation-interaction-blocker" />
      {animations.map((anim: any) => <AnimatedCard key={anim.id} animation={anim} />)}
    </>
  );
}
