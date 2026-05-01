import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useGraphStore } from '../../store/graphStore';
import SongNode from './SongNode';
import TransitionEdge from './TransitionEdge';

const nodeTypes = { song: SongNode };
const edgeTypes = { transition: TransitionEdge };

const defaultEdgeOptions = {
  type: 'transition',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#C8BFA1',
    width: 18,
    height: 18,
  },
};

export default function GraphCanvas() {
  const songs = useGraphStore((s) => s.songs);
  const transitions = useGraphStore((s) => s.transitions);
  const setSongPosition = useGraphStore((s) => s.setSongPosition);
  const beginDrag = useGraphStore((s) => s.beginDrag);
  const removeSong = useGraphStore((s) => s.removeSong);
  const removeTransition = useGraphStore((s) => s.removeTransition);
  const addTransition = useGraphStore((s) => s.addTransition);
  const selectSong = useGraphStore((s) => s.selectSong);
  const selectTransition = useGraphStore((s) => s.selectTransition);
  const closePanel = useGraphStore((s) => s.closePanel);

  // Local React Flow node state. Drag updates are applied here every frame via
  // `applyNodeChanges` — they DO NOT round-trip through the global store, so
  // selectors/subscribers don't fire on every mouse move. Final position is
  // committed to the store on drag end (see onNodesChange below).
  const [rfNodes, setRfNodes] = useState([]);

  // Rebuild nodes when the songs array changes (add / remove / metadata edit /
  // drag-commit / undo / load). Position is taken from the store as the source
  // of truth — during a drag, songs doesn't change so this effect doesn't run.
  useEffect(() => {
    setRfNodes(
      songs.map((s) => ({
        id: s.id,
        type: 'song',
        position: { x: s.x, y: s.y },
        data: { song: s },
      }))
    );
  }, [songs]);

  const edges = useMemo(
    () =>
      transitions.map((t) => ({
        id: t.id,
        type: 'transition',
        source: t.sourceId,
        target: t.targetId,
        data: { transition: t },
      })),
    [transitions]
  );

  const onNodesChange = useCallback(
    (changes) => {
      // Apply all changes locally first (smooth dragging, selection, etc.)
      setRfNodes((curr) => applyNodeChanges(changes, curr));
      // Commit only meaningful changes back to the store
      changes.forEach((c) => {
        if (c.type === 'position' && c.position && c.dragging === false) {
          setSongPosition(c.id, c.position.x, c.position.y);
        }
        if (c.type === 'remove') removeSong(c.id);
      });
    },
    [setSongPosition, removeSong]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      changes.forEach((c) => {
        if (c.type === 'remove') removeTransition(c.id);
      });
    },
    [removeTransition]
  );

  const onConnect = useCallback(
    (c) => {
      if (!c.source || !c.target || c.source === c.target) return;
      const dup = transitions.some(
        (t) => t.sourceId === c.source && t.targetId === c.target
      );
      if (dup) {
        if (!confirm('A transition already exists between these songs. Add another?'))
          return;
      }
      addTransition({ sourceId: c.source, targetId: c.target });
    },
    [addTransition, transitions]
  );

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStart={() => beginDrag()}
      onNodeClick={(_, n) => selectSong(n.id)}
      onEdgeClick={(_, e) => selectTransition(e.id)}
      onPaneClick={() => closePanel()}
      fitView
      fitViewOptions={{ padding: 0.4, maxZoom: 1.1 }}
      minZoom={0.2}
      maxZoom={2.5}
      proOptions={{ hideAttribution: false }}
      deleteKeyCode={['Backspace', 'Delete']}
      selectionOnDrag
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      panOnDrag={[1, 2]}
      connectionRadius={40}
    >
      <Background variant={BackgroundVariant.Dots} gap={32} size={1.5} />
      <Controls position="bottom-right" showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor="#FF4D17"
        nodeStrokeColor="#0A0907"
        nodeStrokeWidth={1}
        maskColor="rgba(10,9,7,0.92)"
      />
    </ReactFlow>
  );
}
