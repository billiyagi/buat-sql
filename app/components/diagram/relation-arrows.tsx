import React, { useState, useEffect } from "react";
import type { RelationArrowsProps } from "./types";
import { useTheme } from "~/components/theme-provider";

export const RelationArrows = React.memo(function RelationArrows({ relations, columns, scale, pan, canvasRef, updateTrigger }: RelationArrowsProps) {
    const [paths, setPaths] = useState<Array<{ id: string; d: string; markerType: 'right' | 'left' | 'down' | 'up' }>>([]);
    const { theme } = useTheme();

    // Theme-based colors
    const tableRelationColor = theme === 'dark' ? "#94a3b8" : "#64748b"; // Slate 400 vs 500
    const enumRelationColor = theme === 'dark' ? "#10b981" : "#059669"; // Emerald 500 vs 600

    useEffect(() => {
        const calculatePaths = () => {
            if (!canvasRef.current) return;

            const canvasRect = canvasRef.current.getBoundingClientRect();
            const newPaths: typeof paths = [];

            for (const rel of relations) {
                const sourceEl = document.getElementById(rel.fromColumnId);
                const targetEl = document.getElementById(rel.toColumnId);

                if (!sourceEl || !targetEl) continue;

                const sourceRect = sourceEl.getBoundingClientRect();
                const targetRect = targetEl.getBoundingClientRect();

                const sourceTableEl = sourceEl.closest('.absolute') as HTMLElement;
                const targetTableEl = targetEl.closest('.absolute') as HTMLElement;

                if (!sourceTableEl || !targetTableEl) continue;

                const sourceTableRect = sourceTableEl.getBoundingClientRect();
                const targetTableRect = targetTableEl.getBoundingClientRect();

                const sourceRowY = (sourceRect.top + sourceRect.bottom) / 2 - canvasRect.top;
                const targetRowY = (targetRect.top + targetRect.bottom) / 2 - canvasRect.top;

                const sourceLeft = sourceTableRect.left - canvasRect.left;
                const sourceRight = sourceTableRect.right - canvasRect.left;
                const targetLeft = targetTableRect.left - canvasRect.left;
                const targetRight = targetTableRect.right - canvasRect.left;

                const OFFSET = 20;
                let d: string;

                if (sourceRight + OFFSET <= targetLeft) {
                    const midX = (sourceRight + targetLeft) / 2;
                    d = `M ${sourceRight} ${sourceRowY} H ${midX} V ${targetRowY} H ${targetLeft}`;
                } else if (targetRight + OFFSET <= sourceLeft) {
                    const midX = (sourceLeft + targetRight) / 2;
                    d = `M ${sourceLeft} ${sourceRowY} H ${midX} V ${targetRowY} H ${targetRight}`;
                } else {
                    const leftMost = Math.min(sourceLeft, targetLeft);
                    const rightMost = Math.max(sourceRight, targetRight);

                    const sourceCenter = (sourceLeft + sourceRight) / 2;
                    const targetCenter = (targetLeft + targetRight) / 2;

                    if (targetCenter >= sourceCenter) {
                        const routeX = rightMost + OFFSET;
                        d = `M ${sourceRight} ${sourceRowY} H ${routeX} V ${targetRowY} H ${targetRight}`;
                    } else {
                        const routeX = leftMost - OFFSET;
                        d = `M ${sourceLeft} ${sourceRowY} H ${routeX} V ${targetRowY} H ${targetLeft}`;
                    }
                }

                newPaths.push({ id: rel.id, d, markerType: 'right' });
            }

            for (const col of columns) {
                if (!col.enumId) continue;
                const sourceEl = document.getElementById(col.id);
                const targetEl = document.getElementById(`enum-${col.enumId}`);

                if (!sourceEl || !targetEl) continue;

                const sourceRect = sourceEl.getBoundingClientRect();
                const targetRect = targetEl.getBoundingClientRect();

                const sourceTableEl = sourceEl.closest('.absolute') as HTMLElement;
                if (!sourceTableEl) continue;

                const sourceTableRect = sourceTableEl.getBoundingClientRect();

                const sourceRowY = (sourceRect.top + sourceRect.bottom) / 2 - canvasRect.top;
                const targetCenterY = (targetRect.top + targetRect.bottom) / 2 - canvasRect.top;

                const sourceLeft = sourceTableRect.left - canvasRect.left;
                const sourceRight = sourceTableRect.right - canvasRect.left;
                const targetLeft = targetRect.left - canvasRect.left;
                const targetRight = targetRect.right - canvasRect.left;

                const OFFSET = 20;
                let d: string;

                if (sourceRight + OFFSET <= targetLeft) {
                    const midX = (sourceRight + targetLeft) / 2;
                    d = `M ${sourceRight} ${sourceRowY} H ${midX} V ${targetCenterY} H ${targetLeft}`;
                } else if (targetRight + OFFSET <= sourceLeft) {
                    const midX = (sourceLeft + targetRight) / 2;
                    d = `M ${sourceLeft} ${sourceRowY} H ${midX} V ${targetCenterY} H ${targetRight}`;
                } else {
                    const leftMost = Math.min(sourceLeft, targetLeft);
                    const rightMost = Math.max(sourceRight, targetRight);
                    const sourceCenter = (sourceLeft + sourceRight) / 2;
                    const targetCenter = (targetLeft + targetRight) / 2;

                    if (targetCenter >= sourceCenter) {
                        const routeX = rightMost + OFFSET;
                        d = `M ${sourceRight} ${sourceRowY} H ${routeX} V ${targetCenterY} H ${targetRight}`;
                    } else {
                        const routeX = leftMost - OFFSET;
                        d = `M ${sourceLeft} ${sourceRowY} H ${routeX} V ${targetCenterY} H ${targetLeft}`;
                    }
                }

                newPaths.push({ id: `enum-rel-${col.id}`, d, markerType: 'right' });
            }

            setPaths(newPaths);
        };

        calculatePaths();

        const frameId = requestAnimationFrame(calculatePaths);
        return () => cancelAnimationFrame(frameId);
    }, [relations, columns, scale, pan, canvasRef, updateTrigger]);

    return (
        <svg
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'visible',
                zIndex: 5,
            }}
        >
            <defs>
                {/* Start marker - small circle (FK source) */}
                <marker
                    id="start-circle"
                    markerWidth="8"
                    markerHeight="8"
                    refX="4"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <circle cx="4" cy="4" r="3" fill={tableRelationColor} />
                </marker>
                {/* End marker - arrow (PK target) */}
                <marker
                    id="end-arrow"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill={tableRelationColor} />
                </marker>
                {/* Enum marker - emerald diamond */}
                <marker
                    id="enum-diamond"
                    markerWidth="10"
                    markerHeight="10"
                    refX="5"
                    refY="5"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <rect x="2" y="2" width="6" height="6" transform="rotate(45 5 5)" fill={enumRelationColor} />
                </marker>
                {/* Enum arrow - emerald arrow head */}
                <marker
                    id="enum-arrow"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill={enumRelationColor} />
                </marker>
            </defs>
            <style>
                {`
                    @keyframes dash-flow {
                        to {
                            stroke-dashoffset: -12;
                        }
                    }
                    .relation-path {
                        animation: dash-flow 0.5s linear infinite;
                    }
                `}
            </style>
            {paths.map(({ id, d }) => (
                <path
                    key={id}
                    d={d}
                    className="relation-path"
                    fill="none"
                    stroke={id.startsWith('enum-rel') ? enumRelationColor : tableRelationColor}
                    strokeWidth={1.5}
                    strokeDasharray={id.startsWith('enum-rel') ? "3 3" : "4 2"}
                    markerStart={id.startsWith('enum-rel') ? "none" : "url(#start-circle)"}
                    markerEnd={id.startsWith('enum-rel') ? "url(#enum-arrow)" : "url(#end-arrow)"}
                />
            ))}
        </svg>
    );
});
