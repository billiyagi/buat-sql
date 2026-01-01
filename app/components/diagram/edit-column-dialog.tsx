import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Link2, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "~/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type { EditColumnDialogProps } from "./types";

export function EditColumnDialog({
    column,
    table,
    eligibleTables,
    allColumns,
    relations,
    enums,
    allEnumValues,
    fetcher: propFetcher
}: EditColumnDialogProps) {
    const fetcher = useFetcher();

    const existingRelation = relations?.find((r) => r.fromColumnId === column.id);

    const [isFk, setIsFk] = useState(!!existingRelation);
    const [selectedFkTableId, setSelectedFkTableId] = useState<string>(existingRelation?.toTableId || "");
    const [isPk, setIsPk] = useState(!!column.isPk);
    const [isNullable, setIsNullable] = useState(!!column.isNullable);
    const [selectedType, setSelectedType] = useState(column.type);
    const [selectedFkColumnId, setSelectedFkColumnId] = useState(existingRelation?.toColumnId || "");
    const [onDeleteValue, setOnDeleteValue] = useState(existingRelation?.onDelete || "NO ACTION");
    const [onUpdateValue, setOnUpdateValue] = useState(existingRelation?.onUpdate || "NO ACTION");
    const [selectedEnumId, setSelectedEnumId] = useState(column.enumId || "");
    const [open, setOpen] = useState(false);

    const [customDefaultValue, setCustomDefaultValue] = useState(column.defaultValue || "__NONE__");
    const [date, setDate] = useState<Date | undefined>(() => {
        if (column.defaultValue && !["now()", "uuid()", "NULL", "__NONE__"].includes(column.defaultValue)) {
            const d = parseISO(column.defaultValue);
            return isValid(d) ? d : undefined;
        }
        return undefined;
    });

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data && (fetcher.data as any).success) {
            setOpen(false);
        }
    }, [fetcher.state, fetcher.data]);

    // Cleanup default value when type changes
    useEffect(() => {
        // Only clear if type actually changed from the original column type
        if (selectedType !== column.type) {
            if (selectedType === "UUID") {
                setCustomDefaultValue("uuid()");
            } else if (["DATE", "DATETIME", "TIMESTAMP"].includes(selectedType)) {
                setCustomDefaultValue("now()");
            } else if (selectedType === "BOOLEAN") {
                setCustomDefaultValue("true");
            } else if (selectedType !== "ENUM") {
                setCustomDefaultValue("__NONE__");
            }
            setDate(undefined);
        }
    }, [selectedType, column.type]);

    const activeEnumValues = allEnumValues.filter(v => v.enumId === selectedEnumId);

    const availableFkColumns = allColumns.filter((c) => c.tableId === selectedFkTableId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div
                    id={column.id}
                    className="flex justify-between text-xs py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800/80 group cursor-pointer transition-colors"
                >
                    <div className="flex items-center gap-2">
                        {column.isPk && <div className="w-1 h-3 bg-yellow-400 dark:bg-yellow-500 rounded-full" title="Primary Key" />}
                        {existingRelation && <div className="w-1 h-3 bg-blue-400 dark:bg-blue-500 rounded-full" title="Foreign Key" />}
                        {!column.isPk && !existingRelation && <div className="w-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full" />}

                        <span className={`font-medium ${column.isPk ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-200"}`}>{column.name}</span>
                        {column.isPk && <span className="text-[9px] px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/80 text-yellow-700 dark:text-yellow-100 rounded font-bold uppercase tracking-wide">PK</span>}
                        {existingRelation && <span className="text-[9px] px-1 py-0.5 bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-100 rounded font-bold uppercase tracking-wide">FK</span>}
                        {column.defaultValue && <span className="text-[9px] px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700">DF</span>}
                    </div>
                    <span className="text-muted-foreground dark:text-slate-400 text-[10px] font-mono tracking-tight">{column.type}</span>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <fetcher.Form method="post">
                    <input type="hidden" name="tableId" value={table.id} />
                    <input type="hidden" name="columnId" value={column.id} />
                    <input type="hidden" name="isPk" value={isPk ? "on" : ""} />
                    <input type="hidden" name="isNullable" value={isNullable ? "on" : ""} />
                    <input type="hidden" name="isFk" value={isFk ? "on" : ""} />
                    <input type="hidden" name="enumId" value={selectedType === "ENUM" ? selectedEnumId : ""} />
                    <DialogHeader>
                        <DialogTitle>Edit Column</DialogTitle>
                        <DialogDescription>Modify {column.name} in {table.name}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Name & Type */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input id="edit-name" name="name" defaultValue={column.name} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-type">Type</Label>
                                <Select name="type" value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Numeric</SelectLabel>
                                            <SelectItem value="INT">INT</SelectItem>
                                            <SelectItem value="BIGINT">BIGINT</SelectItem>
                                            <SelectItem value="DECIMAL(10,2)">DECIMAL</SelectItem>
                                            <SelectItem value="FLOAT">FLOAT</SelectItem>
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>String</SelectLabel>
                                            <SelectItem value="VARCHAR(255)">VARCHAR(255)</SelectItem>
                                            <SelectItem value="TEXT">TEXT</SelectItem>
                                            <SelectItem value="CHAR(1)">CHAR</SelectItem>
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>Date/Time</SelectLabel>
                                            <SelectItem value="DATE">DATE</SelectItem>
                                            <SelectItem value="DATETIME">DATETIME</SelectItem>
                                            <SelectItem value="TIMESTAMP">TIMESTAMP</SelectItem>
                                        </SelectGroup>
                                        <SelectGroup>
                                            <SelectLabel>Other</SelectLabel>
                                            <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                                            <SelectItem value="JSON">JSON</SelectItem>
                                            <SelectItem value="UUID">UUID</SelectItem>
                                            <SelectItem value="ENUM">ENUM</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Enum Selection */}
                        {selectedType === "ENUM" && (
                            <div className="space-y-2">
                                <Label htmlFor="edit-enum">Select ENUM</Label>
                                <Select name="enumId" value={selectedEnumId} onValueChange={setSelectedEnumId} required={selectedType === "ENUM"}>
                                    <SelectTrigger id="edit-enum">
                                        <SelectValue placeholder="Select ENUM entity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {enums.map((en) => (
                                            <SelectItem key={en.id} value={en.id}>{en.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Default Value */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-default">Default Value</Label>
                            <div className="flex gap-2">
                                {selectedType === "ENUM" ? (
                                    <Select
                                        name="defaultValue"
                                        value={customDefaultValue}
                                        onValueChange={setCustomDefaultValue}
                                        disabled={!selectedEnumId}
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder={selectedEnumId ? "Select default value" : "Select an ENUM first"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__NONE__">No default</SelectItem>
                                            <SelectGroup>
                                                <SelectLabel>Values</SelectLabel>
                                                {activeEnumValues.map(v => (
                                                    <SelectItem key={v.id} value={v.value}>{v.value}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                            <SelectGroup>
                                                <SelectLabel>Functions</SelectLabel>
                                                <SelectItem value="NULL">NULL</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                ) : ["DATE", "DATETIME", "TIMESTAMP"].includes(selectedType) ? (
                                    <div className="flex-1 flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "flex-1 justify-start text-left font-normal",
                                                        !date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date ? format(date, "PPP") : (customDefaultValue === "now()" ? "now() (Current)" : "Pick a date")}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={(d) => {
                                                        setDate(d);
                                                        if (d) setCustomDefaultValue(format(d, "yyyy-MM-dd"));
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <input type="hidden" name="defaultValue" value={customDefaultValue} />
                                    </div>
                                ) : (
                                    <Input
                                        id="edit-default"
                                        name="defaultValue"
                                        type={["INT", "BIGINT", "DECIMAL(10,2)", "FLOAT"].includes(selectedType) ? "number" : "text"}
                                        value={customDefaultValue === "__NONE__" ? "" : customDefaultValue}
                                        onChange={(e) => setCustomDefaultValue(e.target.value)}
                                        placeholder="No default"
                                        className="flex-1"
                                    />
                                )}
                                {customDefaultValue !== "__NONE__" && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setCustomDefaultValue("__NONE__");
                                            setDate(undefined);
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-6 px-2 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                    onClick={() => setCustomDefaultValue("uuid()")}
                                >
                                    uuid()
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-6 px-2 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                    onClick={() => {
                                        setCustomDefaultValue("now()");
                                        setDate(undefined);
                                    }}
                                >
                                    now()
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-6 px-2 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                                    onClick={() => setCustomDefaultValue("NULL")}
                                >
                                    NULL
                                </Button>
                            </div>
                        </div>

                        {/* Switches Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t pt-4">
                            <label className="flex items-center justify-between p-2 rounded-md border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium">Primary Key</span>
                                <Switch checked={isPk} onCheckedChange={setIsPk} />
                            </label>
                            <label className="flex items-center justify-between p-2 rounded-md border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium">Nullable</span>
                                <Switch checked={isNullable} onCheckedChange={setIsNullable} />
                            </label>
                            <label className="flex items-center justify-between p-2 rounded-md border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors col-span-2 sm:col-span-1">
                                <span className="text-sm font-medium">Foreign Key</span>
                                <Switch checked={isFk} onCheckedChange={setIsFk} />
                            </label>
                        </div>

                        {/* FK Settings */}
                        {isFk && (
                            <div className="rounded-lg border p-4 space-y-3 bg-muted/50">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Link2 className="h-4 w-4" />
                                    Foreign Key Reference
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Reference Table</Label>
                                        <Select name="fkTableId" value={selectedFkTableId} onValueChange={setSelectedFkTableId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select table" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {eligibleTables.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Reference Column</Label>
                                        <Select name="fkColumnId" value={selectedFkColumnId} onValueChange={setSelectedFkColumnId} disabled={!selectedFkTableId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select column" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableFkColumns.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name} {c.isPk && "(PK)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">ON DELETE</Label>
                                        <Select name="onDelete" value={onDeleteValue} onValueChange={setOnDeleteValue}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NO ACTION">NO ACTION</SelectItem>
                                                <SelectItem value="CASCADE">CASCADE</SelectItem>
                                                <SelectItem value="SET NULL">SET NULL</SelectItem>
                                                <SelectItem value="RESTRICT">RESTRICT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">ON UPDATE</Label>
                                        <Select name="onUpdate" value={onUpdateValue} onValueChange={setOnUpdateValue}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NO ACTION">NO ACTION</SelectItem>
                                                <SelectItem value="CASCADE">CASCADE</SelectItem>
                                                <SelectItem value="SET NULL">SET NULL</SelectItem>
                                                <SelectItem value="RESTRICT">RESTRICT</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex justify-between items-center sm:justify-between">
                        <Button
                            type="submit"
                            name="intent"
                            value="deleteColumn"
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={(e) => {
                                if (!confirm("Are you sure you want to delete this column?")) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                        <Button type="submit" name="intent" value="updateColumn">Save Changes</Button>
                    </DialogFooter>
                </fetcher.Form>
            </DialogContent>
        </Dialog>
    );
}
