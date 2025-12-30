import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function deleteTableAction(formData: FormData) {
    const id = formData.get("id") as string;
    await diagramService.deleteTable(id);
    return data({ success: true });
}
