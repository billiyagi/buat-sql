import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function deleteColumnAction(formData: FormData) {
    const id = formData.get("columnId") as string;
    await diagramService.deleteColumn(id);
    return data({ success: true });
}
