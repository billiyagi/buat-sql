import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function addEnumAction(formData: FormData, diagramId: string) {
    const name = formData.get("name") as string;
    await diagramService.addEnum(diagramId, name);
    return data({ success: true });
}
