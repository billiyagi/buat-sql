import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
    X,
    RefreshCw,
    Plus,
    Pencil,
    Trash2,
    FlaskConical,
    AlertCircle,
    Loader2
} from "lucide-react";
import type { TableData, ColumnData, EnumData, EnumValueData, RelationData } from "./types";
import { AddRowDialog } from "./add-row-dialog";
import { EditRowDialog } from "./edit-row-dialog";

interface SandboxPanelProps {
    diagramId: string;
    tables: TableData[];
    columns: ColumnData[];
    enums: EnumData[];
    enumValues: EnumValueData[];
    relations: RelationData[];
    onClose: () => void;
}

interface SandboxStatus {
    exists: boolean;
    isStale: boolean;
    tableCount: number;
}

export function SandboxPanel({ diagramId, tables, columns, enums, enumValues, relations, onClose }: SandboxPanelProps) {
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [status, setStatus] = useState<SandboxStatus | null>(null);
    const [rows, setRows] = useState<Record<string, any>[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);

    const initFetcher = useFetcher();
    const crudFetcher = useFetcher();

    // Fetch sandbox status on mount
    useEffect(() => {
        fetchStatus();
    }, [diagramId]);

    // Auto-select first table
    useEffect(() => {
        if (!selectedTable && tables.length > 0) {
            setSelectedTable(tables[0].name);
        }
    }, [tables, selectedTable]);

    // Fetch rows when table changes
    useEffect(() => {
        if (selectedTable && status?.exists) {
            fetchRows();
        }
    }, [selectedTable, status?.exists]);

    // Handle CRUD fetcher response
    useEffect(() => {
        if (crudFetcher.data) {
            if (crudFetcher.data.success) {
                fetchRows();
                setError(null);
            } else if (crudFetcher.data.error) {
                setError(crudFetcher.data.error);
            }
        }
    }, [crudFetcher.data]);

    // Handle init fetcher response
    useEffect(() => {
        if (initFetcher.data) {
            if (initFetcher.data.success) {
                fetchStatus();
                setError(null);
            } else if (initFetcher.data.error) {
                setError(initFetcher.data.error);
            }
        }
    }, [initFetcher.data]);

    async function fetchStatus() {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/sandbox/${diagramId}`);
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            setError("Failed to fetch sandbox status");
        }
        setIsLoading(false);
    }

    async function fetchRows() {
        if (!selectedTable) return;
        try {
            const res = await fetch(`/api/sandbox/${diagramId}/${selectedTable}`);
            const data = await res.json();
            setRows(data.rows || []);
        } catch (e) {
            setRows([]);
        }
    }

    function initializeSandbox() {
        initFetcher.submit(null, {
            method: "POST",
            action: `/api/sandbox/${diagramId}`,
        });
    }

    function deleteRow(row: Record<string, any>) {
        if (!selectedTable) return;

        // Find primary key column
        const tableData = tables.find(t => t.name === selectedTable);
        if (!tableData) return;

        const tableCols = columns.filter(c => c.tableId === tableData.id);
        const pkCol = tableCols.find(c => c.isPk);
        if (!pkCol) {
            setError("Cannot delete: no primary key column found");
            return;
        }

        const formData = new FormData();
        formData.append("intent", "delete");
        formData.append("pkColumn", pkCol.name);
        formData.append("pkValue", String(row[pkCol.name]));

        crudFetcher.submit(formData, {
            method: "POST",
            action: `/api/sandbox/${diagramId}/${selectedTable}`,
        });
    }

    // Get columns for selected table
    const selectedTableData = tables.find(t => t.name === selectedTable);
    const tableColumns = selectedTableData
        ? columns.filter(c => c.tableId === selectedTableData.id)
        : [];
    const pkColumn = tableColumns.find(c => c.isPk);

    const isInitializing = initFetcher.state !== "idle";

    return (
        <div className="fixed top-0 right-0 h-full w-[800px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Data Sandbox</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Status Bar */}
            <div className="flex items-center gap-4 px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm">
                {isLoading ? (
                    <span className="text-slate-500 dark:text-slate-400">Loading...</span>
                ) : status?.exists ? (
                    <>
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className={`w-2 h-2 rounded-full ${status.isStale ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            {status.isStale ? "Out of sync" : "Active"}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                            {status.tableCount} tables
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto h-7"
                            onClick={initializeSandbox}
                            disabled={isInitializing}
                        >
                            {isInitializing ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                                <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            {status.isStale ? "Sync" : "Reset"}
                        </Button>
                    </>
                ) : (
                    <>
                        <span className="text-slate-500 dark:text-slate-400">Not initialized</span>
                        <Button
                            variant="default"
                            size="sm"
                            className="ml-auto h-7"
                            onClick={initializeSandbox}
                            disabled={isInitializing}
                        >
                            {isInitializing ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                                <Plus className="h-3 w-3 mr-1" />
                            )}
                            Initialize
                        </Button>
                    </>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 dark:text-red-400 text-sm border-b border-slate-200 dark:border-slate-800">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{error}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 px-2"
                        onClick={() => setError(null)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Table Tabs */}
            {status?.exists && (
                <div className="flex gap-1 p-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-white dark:bg-slate-900">
                    {tables.map(table => (
                        <Button
                            key={table.id}
                            variant={selectedTable === table.name ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 px-3"
                            onClick={() => setSelectedTable(table.name)}
                        >
                            {table.name}
                        </Button>
                    ))}
                </div>
            )}

            {/* Data Grid */}
            <div className="flex-1 overflow-auto p-4">
                {!status?.exists ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <FlaskConical className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-center">
                            Initialize the sandbox to start testing your schema with real data.
                        </p>
                    </div>
                ) : tableColumns.length === 0 ? (
                    <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                        No columns in selected table
                    </div>
                ) : (
                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        <table className="w-full text-sm table-fixed">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                    {tableColumns.map(col => (
                                        <th
                                            key={col.id}
                                            className="text-left px-3 py-2 font-medium border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 truncate"
                                        >
                                            {col.name}
                                            {col.isPk && (
                                                <span className="ml-1 text-xs text-blue-500">PK</span>
                                            )}
                                        </th>
                                    ))}
                                    <th className="w-20 px-3 py-2 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 flex-shrink-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={tableColumns.length + 1}
                                            className="text-center text-slate-500 dark:text-slate-400 py-8"
                                        >
                                            No data yet. Click "Add Row" to insert test data.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            {tableColumns.map(col => (
                                                <td key={col.id} className="px-3 py-2 text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={row[col.name] === null ? 'null' : String(row[col.name])}>
                                                    {row[col.name] === null ? (
                                                        <span className="text-slate-400 dark:text-slate-500 italic">null</span>
                                                    ) : (
                                                        String(row[col.name])
                                                    )}
                                                </td>
                                            ))}
                                            <td className="px-3 py-2">
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => setEditingRow(row)}
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => deleteRow(row)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer with Add Button */}
            {status?.exists && selectedTable && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <Button
                        className="w-full"
                        onClick={() => setShowAddDialog(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Row
                    </Button>
                </div>
            )}

            {/* Add Row Dialog */}
            {showAddDialog && selectedTable && (
                <AddRowDialog
                    diagramId={diagramId}
                    tableName={selectedTable}
                    columns={tableColumns}
                    allTables={tables}
                    allColumns={columns}
                    enums={enums}
                    enumValues={enumValues}
                    relations={relations}
                    onClose={() => setShowAddDialog(false)}
                    onSuccess={() => {
                        setShowAddDialog(false);
                        fetchRows();
                    }}
                />
            )}

            {/* Edit Row Dialog */}
            {editingRow && selectedTable && pkColumn && (
                <EditRowDialog
                    diagramId={diagramId}
                    tableName={selectedTable}
                    columns={tableColumns}
                    row={editingRow}
                    pkColumn={pkColumn.name}
                    allTables={tables}
                    allColumns={columns}
                    enums={enums}
                    enumValues={enumValues}
                    relations={relations}
                    onClose={() => setEditingRow(null)}
                    onSuccess={() => {
                        setEditingRow(null);
                        fetchRows();
                    }}
                />
            )}
        </div>
    );
}
