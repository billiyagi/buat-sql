import { data } from "react-router";
import { diagramService } from "~/services/diagram.service";

export async function updateEnumAction(formData: FormData) {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string | null;
    const color = formData.get("color") as string | null;

    const updates: any = {};
    if (name !== null) updates.name = name;
    if (color !== null) updates.color = color;

    await diagramService.updateEnum(id, updates);

    const valuesJson = formData.get("values") as string;
    if (valuesJson) {
        const values = JSON.parse(valuesJson) as { id?: string; value: string }[];
        await diagramService.updateEnumValues(id, values);
    }

    return data({ success: true });
}
