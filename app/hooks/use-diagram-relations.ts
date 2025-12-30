import { useState, useCallback, useMemo } from "react";

interface Column {
    id: string;
    tableId: string;
    name: string;
}

export function useDiagramRelations(columns: Column[]) {
    const [arrowUpdateTrigger, setArrowUpdateTrigger] = useState(0);
    const [sourceTableId, setSourceTableId] = useState<string>("");
    const [targetTableId, setTargetTableId] = useState<string>("");

    const updateArrows = useCallback(() => {
        setArrowUpdateTrigger(t => t + 1);
    }, []);

    const sourceColumns = useMemo(() => {
        return sourceTableId ? columns.filter(c => c.tableId === sourceTableId) : [];
    }, [columns, sourceTableId]);

    const targetColumns = useMemo(() => {
        return targetTableId ? columns.filter(c => c.tableId === targetTableId) : [];
    }, [columns, targetTableId]);

    return {
        arrowUpdateTrigger,
        updateArrows,
        sourceTableId,
        setSourceTableId,
        targetTableId,
        setTargetTableId,
        sourceColumns,
        targetColumns
    };
}
