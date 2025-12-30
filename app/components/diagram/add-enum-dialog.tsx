import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ListPlus } from "lucide-react";
import { type AddEnumDialogProps } from "./types";

export function AddEnumDialog({ fetcher: propFetcher }: AddEnumDialogProps) {
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
                <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-700 hover:bg-white hover:shadow-sm">
                    <ListPlus className="mr-2 h-4 w-4" /> Add ENUM
                </Button>
            </DialogTrigger>
            <DialogContent>
                <fetcher.Form method="post">
                    <DialogHeader><DialogTitle>Add ENUM</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="enumName" className="text-right">Name</Label>
                            <Input id="enumName" name="name" className="col-span-3" required placeholder="e.g. user_role" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" name="intent" value="addEnum">Create ENUM</Button>
                    </DialogFooter>
                </fetcher.Form>
            </DialogContent>
        </Dialog>
    );
}
