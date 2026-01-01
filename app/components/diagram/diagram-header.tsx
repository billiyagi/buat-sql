import { Link } from "react-router";
import { ArrowLeft, Download, Database, Code, FileCode, FlaskConical } from "lucide-react";
import { Button } from "~/components/ui/button";
import { AddTableDialog } from "./add-table-dialog";
import { AddEnumDialog } from "./add-enum-dialog";
import { ThemeToggle } from "./theme-toggle";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "~/components/ui/popover";
import type { useFetcher } from "react-router";

type FetcherWithComponents<T> = ReturnType<typeof useFetcher<T>>;

interface DiagramHeaderProps {
    diagram: { id: string; name: string };
    tables: any[];
    fetcher: FetcherWithComponents<any>;
    onOpenSandbox: () => void;
}

export function DiagramHeader({
    diagram,
    tables,
    fetcher,
    onOpenSandbox,
}: DiagramHeaderProps) {
    return (
        <header className="flex-none h-16 border-b px-6 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 sticky top-0 transition-colors">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Link to="/"><ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" /></Link>
                </Button>
                <div className="flex flex-col">
                    <h1 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{diagram.name}</h1>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-500/10 dark:ring-slate-400/20">
                            {tables.length} tables
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 font-medium border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
                    onClick={onOpenSandbox}
                >
                    <FlaskConical className="h-4 w-4" />
                    Test Data
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-2 font-medium border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all">
                            <Download className="h-4 w-4" /> Export
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-1 dark:bg-slate-900 dark:border-slate-800" align="end">
                        <div className="p-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Choose Format</div>
                        <div className="space-y-1">
                            <a
                                href={`/api/export/${diagram.id}?format=sql`}
                                download
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors group"
                            >
                                <Database className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                                <div className="flex flex-col">
                                    <span className="font-medium">SQL Script</span>
                                    <span className="text-[10px] text-slate-400">Standard SQL statements</span>
                                </div>
                            </a>
                            <a
                                href={`/api/export/${diagram.id}?format=prisma`}
                                download
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors group"
                            >
                                <FileCode className="h-4 w-4 text-slate-400 group-hover:text-emerald-500" />
                                <div className="flex flex-col">
                                    <span className="font-medium">Prisma Schema</span>
                                    <span className="text-[10px] text-slate-400">schema.prisma file</span>
                                </div>
                            </a>
                            <a
                                href={`/api/export/${diagram.id}?format=drizzle`}
                                download
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors group"
                            >
                                <Code className="h-4 w-4 text-slate-400 group-hover:text-orange-500" />
                                <div className="flex flex-col">
                                    <span className="font-medium">Drizzle ORM</span>
                                    <span className="text-[10px] text-slate-400">TypeScript schema</span>
                                </div>
                            </a>
                        </div>
                    </PopoverContent>
                </Popover>

                <AddTableDialog fetcher={fetcher} />
                <AddEnumDialog fetcher={fetcher} />
            </div>
        </header>
    );
}
