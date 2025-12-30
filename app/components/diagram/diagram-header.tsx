import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { AddRelationDialog } from "./add-relation-dialog";
import { AddTableDialog } from "./add-table-dialog";
import { AddEnumDialog } from "./add-enum-dialog";
import type { useFetcher } from "react-router";

type FetcherWithComponents<T> = ReturnType<typeof useFetcher<T>>;

interface DiagramHeaderProps {
    diagram: { id: string; name: string };
    tables: any[];
    columns: any[];
    fetcher: FetcherWithComponents<any>;
    relationState: {
        sourceTableId: string;
        setSourceTableId: (id: string) => void;
        targetTableId: string;
        setTargetTableId: (id: string) => void;
        sourceColumns: any[];
        targetColumns: any[];
    };
}

export function DiagramHeader({
    diagram,
    tables,
    columns,
    fetcher,
    relationState
}: DiagramHeaderProps) {
    return (
        <header className="flex-none h-16 border-b px-6 flex items-center justify-between bg-white/80 backdrop-blur-md z-20 sticky top-0">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8 hover:bg-slate-100 transition-colors">
                    <Link to="/"><ArrowLeft className="h-4 w-4 text-slate-600" /></Link>
                </Button>
                <div className="flex flex-col">
                    <h1 className="font-bold text-slate-900 leading-tight">{diagram.name}</h1>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            {tables.length} tables
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px]" title={tables.map(t => t.name).join(", ")}>
                            {tables.map(t => t.name).join(", ")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-100/50 p-1 rounded-lg border border-slate-200/60 shadow-sm transition-all hover:bg-slate-100">
                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-medium text-slate-700 hover:bg-white hover:shadow-sm">
                        <a href={`/api/export/${diagram.id}`} download>Export SQL</a>
                    </Button>
                    <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                    <AddRelationDialog
                        tables={tables}
                        columns={columns}
                        sourceTableId={relationState.sourceTableId}
                        setSourceTableId={relationState.setSourceTableId}
                        targetTableId={relationState.targetTableId}
                        setTargetTableId={relationState.setTargetTableId}
                        sourceColumns={relationState.sourceColumns}
                        targetColumns={relationState.targetColumns}
                        fetcher={fetcher}
                    />
                </div>

                <AddTableDialog fetcher={fetcher} />
                <AddEnumDialog fetcher={fetcher} />
            </div>
        </header>
    );
}
