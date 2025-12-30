import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function moveEnumAction(formData: FormData) {
    const id = formData.get("id") as string;
    const x = parseFloat(formData.get("x") as string);
    const y = parseFloat(formData.get("y") as string);
    await diagramService.updateEnum(id, { x, y });
    return data({ success: true });
}
