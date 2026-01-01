import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "~/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { ColumnData, TableData, EnumData, EnumValueData, RelationData } from "./types";

interface EditRowDialogProps {
    diagramId: string;
    tableName: string;
    columns: ColumnData[];
    row: Record<string, any>;
    pkColumn: string;
    allTables: TableData[];
    allColumns: ColumnData[];
    enums: EnumData[];
    enumValues: EnumValueData[];
    relations: RelationData[];
    onClose: () => void;
    onSuccess: () => void;
}

export function EditRowDialog({
    diagramId,
    tableName,
    columns,
    row,
    pkColumn,
    allTables,
    allColumns,
    enums,
    enumValues,
    relations,
    onClose,
    onSuccess
}: EditRowDialogProps) {
    const [formData, setFormData] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        columns.forEach(col => {
            initial[col.name] = row[col.name] === null ? "" : String(row[col.name]);
        });
        return initial;
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Store FK reference data for dropdown options
    const [fkOptions, setFkOptions] = useState<Record<string, any[]>>({});

    // Find the current table's data
    const currentTable = allTables.find(t => t.name === tableName);

    // Fetch FK reference data on mount
    useEffect(() => {
        if (!currentTable) return;

        const tableRelations = relations.filter(r => r.fromTableId === currentTable.id);

        async function fetchFkData() {
            const options: Record<string, any[]> = {};

            for (const rel of tableRelations) {
                const fromCol = allColumns.find(c => c.id === rel.fromColumnId);
                const toTable = allTables.find(t => t.id === rel.toTableId);
                const toCol = allColumns.find(c => c.id === rel.toColumnId);

                if (fromCol && toTable && toCol) {
                    try {
                        const res = await fetch(`/api/sandbox/${diagramId}/${toTable.name}`);
                        const data = await res.json();
                        if (data.rows) {
                            options[fromCol.name] = data.rows.map((r: any) => ({
                                value: r[toCol.name],
                                label: `${r[toCol.name]}${Object.keys(r).length > 1 ? ` (${Object.values(r).slice(0, 2).join(', ')})` : ''}`
                            }));
                        }
                    } catch (e) {
                        console.error(`Failed to fetch FK data for ${fromCol.name}`);
                    }
                }
            }

            setFkOptions(options);
        }

        fetchFkData();
    }, [currentTable, relations, allColumns, allTables, diagramId]);

    function getEnumValues(col: ColumnData): EnumValueData[] {
        if (!col.enumId) return [];
        return enumValues.filter(ev => ev.enumId === col.enumId);
    }

    function isFkColumn(col: ColumnData): boolean {
        if (!currentTable) return false;
        return relations.some(r => r.fromTableId === currentTable.id && r.fromColumnId === col.id);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const form = new FormData();
            form.append("intent", "update");
            form.append("pkColumn", pkColumn);
            form.append("pkValue", String(row[pkColumn]));

            for (const [key, value] of Object.entries(formData)) {
                if (key !== pkColumn) {
                    form.append(key, value);
                }
            }

            const res = await fetch(`/api/sandbox/${diagramId}/${tableName}`, {
                method: "POST",
                body: form,
            });

            const result = await res.json();

            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || "Failed to update row");
            }
        } catch (e: any) {
            setError(e.message || "Failed to update row");
        }

        setIsSubmitting(false);
    }

    function renderInput(col: ColumnData) {
        const colEnumValues = getEnumValues(col);
        const isFk = isFkColumn(col);
        const fkOpts = fkOptions[col.name];

        // Primary key - readonly
        if (col.isPk) {
            return (
                <Input
                    id={col.name}
                    value={formData[col.name]}
                    disabled
                    className="bg-muted"
                />
            );
        }

        // Enum column - show select with enum values
        if (colEnumValues.length > 0) {
            return (
                <Select
                    value={formData[col.name] || undefined}
                    onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        [col.name]: value === "__NULL__" ? "" : value
                    }))}
                >
                    <SelectTrigger className="w-full overflow-hidden">
                        <SelectValue className="truncate" placeholder={col.isNullable ? "Select or leave empty" : "Select value"} />
                    </SelectTrigger>
                    <SelectContent>
                        {col.isNullable && (
                            <SelectItem value="__NULL__">
                                <span className="italic text-muted-foreground">null</span>
                            </SelectItem>
                        )}
                        {colEnumValues.map(ev => (
                            <SelectItem key={ev.id} value={ev.value}>
                                {ev.value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        // FK column with available options - show select
        if (isFk && fkOpts && fkOpts.length > 0) {
            return (
                <Select
                    value={formData[col.name] || undefined}
                    onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        [col.name]: value === "__NULL__" ? "" : value
                    }))}
                >
                    <SelectTrigger className="w-full overflow-hidden">
                        <SelectValue className="truncate" placeholder={col.isNullable ? "Select or leave empty" : "Select reference"} />
                    </SelectTrigger>
                    <SelectContent>
                        {col.isNullable && (
                            <SelectItem value="__NULL__">
                                <span className="italic text-muted-foreground">null</span>
                            </SelectItem>
                        )}
                        {fkOpts.map((opt, idx) => (
                            <SelectItem key={idx} value={String(opt.value)}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        // Default text input
        return (
            <Input
                id={col.name}
                value={formData[col.name]}
                onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [col.name]: e.target.value
                }))}
                placeholder={col.isNullable ? "null" : "required"}
            />
        );
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Row in {tableName}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        {columns.map(col => {
                            const isFk = isFkColumn(col);

                            return (
                                <div key={col.id} className="space-y-2">
                                    <Label htmlFor={col.name}>
                                        {col.name}
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({col.enumId ? 'ENUM' : col.type})
                                        </span>
                                        {col.defaultValue && (
                                            <Badge variant="secondary" className="ml-2 text-[10px] py-0 h-4 font-normal">
                                                DEFAULT
                                            </Badge>
                                        )}
                                        {col.isPk && (
                                            <span className="ml-1 text-xs text-primary font-bold">PK</span>
                                        )}
                                        {isFk && (
                                            <span className="ml-1 text-xs text-blue-500 font-bold">FK</span>
                                        )}
                                    </Label>
                                    {renderInput(col)}
                                </div>
                            );
                        })}
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 text-destructive text-sm rounded-md">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Update
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
