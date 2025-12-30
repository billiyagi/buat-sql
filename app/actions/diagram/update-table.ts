import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function updateTableAction(formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const color = formData.get("color") as string;

    const updates: any = {};
    if (name) updates.name = name;
    if (color) updates.color = color;

    await diagramService.updateTable(id, updates);
    return data({ success: true });
}
