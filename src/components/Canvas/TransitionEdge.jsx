import { BaseEdge, getBezierPath } from 'reactflow';
import { useGraphStore } from '../../store/graphStore';

export default function TransitionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) {
  const t = data?.transition;
  const selected = useGraphStore((s) => s.selectedTransitionId === id);

  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.35,
  });

  const showLabel = t && (t.rating > 0 || t.bpmDelta != null || t.label);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? '#FF4D17' : '#C8BFA1',
          strokeWidth: selected ? 2 : 1.5,
          opacity: selected ? 1 : 0.85,
        }}
      />
      {showLabel && (
        <text
          dy="-4"
          paintOrder="stroke"
          stroke="#0A0907"
          strokeWidth="3.5"
          strokeLinejoin="round"
          fill={selected ? '#FF4D17' : '#F2EBD7'}
          style={{
            fontFamily: '"JetBrains Mono", ui-monospace, monospace',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.18em',
          }}
        >
          <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
            {t.rating > 0 && (
              <tspan fill="#FF4D17">{'★'.repeat(t.rating)}{' '}</tspan>
            )}
            {t.bpmDelta != null && t.bpmDelta !== 0 && (
              <tspan>
                {`${t.bpmDelta > 0 ? '+' : ''}${t.bpmDelta} BPM`}
                {t.label ? ' ' : ''}
              </tspan>
            )}
            {t.label && <tspan>{t.label.toUpperCase()}</tspan>}
          </textPath>
        </text>
      )}
    </>
  );
}
