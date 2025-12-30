import type { useFetcher } from "react-router";

export interface TableData {
    id: string;
    name: string;
    x: number;
    y: number;
    color: string | null;
}

export interface ColumnData {
    id: string;
    tableId: string;
    name: string;
    type: string;
    isPk: boolean | null;
    isNullable: boolean | null;
    enumId?: string | null;
}

export interface EnumData {
    id: string;
    diagramId: string;
    name: string;
    x: number;
    y: number;
    color: string | null;
}

export interface EnumValueData {
    id: string;
    enumId: string;
    value: string;
}

export interface RelationData {
    id: string;
    fromTableId: string;
    toTableId: string;
    fromColumnId: string;
    toColumnId: string;
    onDelete?: string;
    onUpdate?: string;
}

export interface RelationArrowsProps {
    relations: RelationData[];
    scale: number;
    pan: { x: number; y: number };
    canvasRef: React.RefObject<HTMLDivElement>;
    updateTrigger: number;
    columns: ColumnData[];
}

export interface DraggableTableProps {
    table: TableData;
    columns: ColumnData[];
    allTables: TableData[];
    allColumns: ColumnData[];
    relations: RelationData[];
    onStop: (e: any, data: { x: number; y: number }, tableId: string) => void;
    updateArrows: () => void;
    fetcher: ReturnType<typeof useFetcher>;
    scale: number;
    enums: EnumData[];
    allEnumValues: EnumValueData[];
}

export interface EditColumnDialogProps {
    column: ColumnData;
    table: TableData;
    eligibleTables: TableData[];
    allColumns: ColumnData[];
    relations: RelationData[];
    fetcher: ReturnType<typeof useFetcher>;
    enums: EnumData[];
}

export interface AddColumnDialogProps {
    table: TableData;
    eligibleTables: TableData[];
    allColumns: ColumnData[];
    fetcher: ReturnType<typeof useFetcher>;
    isFk: boolean;
    setIsFk: (value: boolean) => void;
    selectedFkTableId: string;
    setSelectedFkTableId: (value: string) => void;
    enums: EnumData[];
}
export interface AddTableDialogProps {
    fetcher: ReturnType<typeof useFetcher>;
}

export interface AddRelationDialogProps {
    tables: TableData[];
    columns: ColumnData[];
    sourceTableId: string;
    setSourceTableId: (value: string) => void;
    targetTableId: string;
    setTargetTableId: (value: string) => void;
    sourceColumns: ColumnData[];
    targetColumns: ColumnData[];
    fetcher: ReturnType<typeof useFetcher>;
}

export interface EnumNodeProps {
    enumData: EnumData;
    enumValues: EnumValueData[];
    allEnums: EnumData[];
    allTables: TableData[];
    allColumns: ColumnData[];
    allEnumValues: EnumValueData[];
    onStop: (e: any, data: { x: number; y: number }, id: string) => void;
    updateArrows: () => void;
    fetcher: ReturnType<typeof useFetcher>;
    scale: number;
}

export interface AddEnumDialogProps {
    fetcher: ReturnType<typeof useFetcher>;
}
