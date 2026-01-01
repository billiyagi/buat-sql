import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function updateColumnAction(formData: FormData, diagramId: string) {
    const id = formData.get("columnId") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const tableId = formData.get("tableId") as string;
    const isFk = formData.get("isFk") === "on";
    const fkTableId = (formData.get("fkTableId") as string) || undefined;
    const fkColumnId = (formData.get("fkColumnId") as string) || undefined;
    const onDelete = formData.get("onDelete") as string || "NO ACTION";
    const onUpdate = formData.get("onUpdate") as string || "NO ACTION";

    const enumId = formData.get("enumId") as string || undefined;
    let defaultValue = formData.get("defaultValue") as string || undefined;
    if (defaultValue === "__NONE__") defaultValue = undefined;

    await diagramService.updateColumn({
        columnId: id,
        name,
        type,
        isPk: formData.get("isPk") === "on",
        isNullable: formData.get("isNullable") === "on",
        isFk,
        fkTableId,
        fkColumnId,
        tableId,
        onDelete,
        onUpdate,
        diagramId,
        enumId,
        defaultValue
    });

    return data({ success: true });
}
