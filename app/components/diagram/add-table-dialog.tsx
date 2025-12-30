import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus } from "lucide-react";
import { type AddTableDialogProps } from "./types";

export function AddTableDialog({ fetcher: propFetcher }: AddTableDialogProps) {
    const fetcher = useFetcher();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data && (fetcher.data as any).success) {
            setOpen(false);
        }
    }, [fetcher.state, fetcher.data]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="shadow-sm transition-all hover:shadow-md active:scale-95"><Plus className="mr-2 h-4 w-4" /> Add Table</Button>
            </DialogTrigger>
            <DialogContent>
                <fetcher.Form method="post">
                    <DialogHeader><DialogTitle>Add Table</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tableName" className="text-right">Name</Label>
                            <Input id="tableName" name="name" className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" name="intent" value="addTable">Create</Button>
                    </DialogFooter>
                </fetcher.Form>
            </DialogContent>
        </Dialog>
    );
}
