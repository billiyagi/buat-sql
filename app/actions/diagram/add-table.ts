import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function addTableAction(formData: FormData, diagramId: string) {
    const name = formData.get("name") as string;
    const color = formData.get("color") as string || "slate";
    await diagramService.addTable(diagramId, name, color);
    return data({ success: true });
}
