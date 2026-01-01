import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Plus, Link2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "~/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type { AddColumnDialogProps } from "./types";

export function AddColumnDialog({
    table,
    eligibleTables,
    allColumns,
    isFk,
    setIsFk,
    selectedFkTableId,
    setSelectedFkTableId,
    enums,
    allEnumValues,
    fetcher: propFetcher
}: AddColumnDialogProps) {
    const fetcher = useFetcher();
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("VARCHAR(255)");
    const [selectedEnumId, setSelectedEnumId] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [customDefaultValue, setCustomDefaultValue] = useState("__NONE__");
    const availableFkColumns = allColumns.filter((c) => c.tableId === selectedFkTableId);

    // Auto-suggest default values based on type
    useEffect(() => {
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
    }, [selectedType]);

    const activeEnumValues = allEnumValues.filter(v => v.enumId === selectedEnumId);

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data && (fetcher.data as any).success) {
            setOpen(false);
        }
    }, [fetcher.state, fetcher.data]);

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setIsFk(false);
                setSelectedFkTableId("");
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs text-muted-foreground dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-dashed border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    <Plus className="mr-1 h-3 w-3" /> Add Column
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <fetcher.Form method="post">
                    <input type="hidden" name="tableId" value={table.id} />
                    <DialogHeader>
                        <DialogTitle>Add Column</DialogTitle>
                        <DialogDescription>Add a new column to {table.name}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Name & Type */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="add-name">Name</Label>
                                <Input id="add-name" name="name" placeholder="column_name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-type">Type</Label>
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
                                <Label htmlFor="add-enum">Select ENUM</Label>
                                <Select name="enumId" value={selectedEnumId} onValueChange={setSelectedEnumId} required={selectedType === "ENUM"}>
                                    <SelectTrigger id="add-enum">
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
                            <Label htmlFor="add-default">Default Value</Label>
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
                                        id="add-default"
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
                                <Switch name="isPk" />
                            </label>
                            <label className="flex items-center justify-between p-2 rounded-md border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium">Nullable</span>
                                <Switch name="isNullable" />
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
                                        <Select name="fkTableId" onValueChange={setSelectedFkTableId}>
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
                                        <Select name="fkColumnId" disabled={!selectedFkTableId}>
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
                                        <Select name="onDelete" defaultValue="NO ACTION">
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
                                        <Select name="onUpdate" defaultValue="NO ACTION">
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
                    <DialogFooter>
                        <Button type="submit" name="intent" value="addColumn">Add Column</Button>
                    </DialogFooter>
                </fetcher.Form>
            </DialogContent>
        </Dialog>
    );
}
