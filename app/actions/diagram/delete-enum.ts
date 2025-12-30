import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function deleteEnumAction(formData: FormData) {
    const id = formData.get("id") as string;
    await diagramService.deleteEnum(id);
    return data({ success: true });
}
