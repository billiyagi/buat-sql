import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function addRelationAction(formData: FormData, diagramId: string) {
    const fromTableId = formData.get("fromTableId") as string;
    const fromColumnId = formData.get("fromColumnId") as string;
    const toTableId = formData.get("toTableId") as string;
    const toColumnId = formData.get("toColumnId") as string;

    if (fromTableId && fromColumnId && toTableId && toColumnId) {
        await diagramService.addRelation({
            diagramId,
            fromTableId,
            fromColumnId,
            toTableId,
            toColumnId
        });
        return data({ success: true });
    }
    return data({ error: "Missing fields" }, { status: 400 });
}
