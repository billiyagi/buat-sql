import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function addColumnAction(formData: FormData, diagramId: string) {
    const tableId = formData.get("tableId") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;

    const fkTableId = (formData.get("fkTableId") as string) || undefined;
    const fkColumnId = (formData.get("fkColumnId") as string) || undefined;
    const onDelete = formData.get("onDelete") as string || "NO ACTION";
    const onUpdate = formData.get("onUpdate") as string || "NO ACTION";

    const enumId = formData.get("enumId") as string || undefined;

    await diagramService.addColumn({
        tableId,
        name,
        type,
        isPk: formData.get("isPk") === "on",
        isNullable: formData.get("isNullable") === "on",
        fkTableId,
        fkColumnId,
        onDelete,
        onUpdate,
        diagramId,
        enumId
    });

    return data({ success: true });
}
