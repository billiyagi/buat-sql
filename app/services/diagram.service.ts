import { db } from "~/db";
import { diagrams, tables, columns, relations, enums, enumValues } from "~/db/schema";
import { eq, and, or } from "drizzle-orm";

export class DiagramService {
    async getDiagramById(id: string) {
        const [diagram] = await db.select().from(diagrams).where(eq(diagrams.id, id));
        return diagram;
    }

    async getTablesByDiagramId(diagramId: string) {
        return await db.select().from(tables).where(eq(tables.diagramId, diagramId));
    }

    async getColumnsByDiagramId(diagramId: string) {
        return await db.select({
            id: columns.id,
            tableId: columns.tableId,
            name: columns.name,
            type: columns.type,
            isPk: columns.isPk,
            isNullable: columns.isNullable,
            enumId: columns.enumId,
            defaultValue: columns.defaultValue
        })
            .from(columns)
            .innerJoin(tables, eq(columns.tableId, tables.id))
            .where(eq(tables.diagramId, diagramId));
    }

    async getRelationsByDiagramId(diagramId: string) {
        return await db.select({
            id: relations.id,
            fromTableId: relations.fromTableId,
            toTableId: relations.toTableId,
            fromColumnId: relations.fromColumnId,
            toColumnId: relations.toColumnId,
            onDelete: relations.onDelete,
            onUpdate: relations.onUpdate
        })
            .from(relations)
            .where(eq(relations.diagramId, diagramId));
    }

    async getEnumsByDiagramId(diagramId: string) {
        return await db.select().from(enums).where(eq(enums.diagramId, diagramId));
    }

    async getEnumValuesByDiagramId(diagramId: string) {
        return await db.select({
            id: enumValues.id,
            enumId: enumValues.enumId,
            value: enumValues.value
        })
            .from(enumValues)
            .innerJoin(enums, eq(enumValues.enumId, enums.id))
            .where(eq(enums.diagramId, diagramId));
    }

    async addTable(diagramId: string, name: string, color: string = "slate") {
        // Get existing tables and enums to calculate smart position
        const existingTables = await this.getTablesByDiagramId(diagramId);
        const existingEnums = await this.getEnumsByDiagramId(diagramId);

        let newX = 100;
        let newY = 100;

        const allNodes = [...existingTables, ...existingEnums];
        if (allNodes.length > 0) {
            // Find the rightmost node and place new table to its right
            const rightmostNode = allNodes.reduce((max, node) =>
                node.x > max.x ? node : max, allNodes[0]);
            newX = rightmostNode.x + 300; // 300 = table width + padding
            newY = rightmostNode.y;
        }

        return await db.insert(tables).values({
            id: crypto.randomUUID(),
            diagramId,
            name,
            x: newX,
            y: newY,
            color
        });
    }

    async updateTable(id: string, updates: { name?: string; color?: string; x?: number; y?: number }) {
        return await db.update(tables).set(updates).where(eq(tables.id, id));
    }

    async deleteTable(id: string) {
        return await db.delete(tables).where(eq(tables.id, id));
    }

    async addColumn(data: {
        tableId: string;
        name: string;
        type: string;
        isPk: boolean;
        isNullable: boolean;
        fkTableId?: string;
        fkColumnId?: string;
        onDelete?: string;
        onUpdate?: string;
        diagramId: string;
        enumId?: string;
        defaultValue?: string;
    }) {
        const columnId = crypto.randomUUID();

        await db.insert(columns).values({
            id: columnId,
            tableId: data.tableId,
            name: data.name,
            type: data.type,
            isPk: data.isPk,
            isNullable: data.isNullable,
            enumId: data.enumId || null,
            defaultValue: data.defaultValue || null
        });

        if (data.fkTableId && data.fkColumnId) {
            await db.insert(relations).values({
                id: crypto.randomUUID(),
                diagramId: data.diagramId,
                fromTableId: data.tableId,
                fromColumnId: columnId,
                toTableId: data.fkTableId,
                toColumnId: data.fkColumnId,
                onDelete: data.onDelete || "NO ACTION",
                onUpdate: data.onUpdate || "NO ACTION"
            });
        }
    }

    async updateColumn(data: {
        columnId: string;
        name: string;
        type: string;
        isPk: boolean;
        isNullable: boolean;
        isFk: boolean;
        fkTableId?: string;
        fkColumnId?: string;
        tableId: string;
        onDelete?: string;
        onUpdate?: string;
        diagramId: string;
        enumId?: string;
        defaultValue?: string;
    }) {
        await db.update(columns).set({
            name: data.name,
            type: data.type,
            isPk: data.isPk,
            isNullable: data.isNullable,
            enumId: data.enumId || null,
            defaultValue: data.defaultValue || null
        }).where(eq(columns.id, data.columnId));

        // First delete existing relation from this column if any
        await db.delete(relations).where(eq(relations.fromColumnId, data.columnId));

        if (data.isFk && data.fkTableId && data.fkColumnId) {
            await db.insert(relations).values({
                id: crypto.randomUUID(),
                diagramId: data.diagramId,
                fromTableId: data.tableId,
                fromColumnId: data.columnId,
                toTableId: data.fkTableId,
                toColumnId: data.fkColumnId,
                onDelete: data.onDelete || "NO ACTION",
                onUpdate: data.onUpdate || "NO ACTION"
            });
        }
    }

    async addRelation(data: {
        diagramId: string;
        fromTableId: string;
        fromColumnId: string;
        toTableId: string;
        toColumnId: string;
    }) {
        return await db.insert(relations).values({
            id: crypto.randomUUID(),
            diagramId: data.diagramId,
            fromTableId: data.fromTableId,
            fromColumnId: data.fromColumnId,
            toTableId: data.toTableId,
            toColumnId: data.toColumnId
        });
    }

    async deleteColumn(columnId: string) {
        // First delete relations where this column is either source or target
        await db.delete(relations).where(
            or(
                eq(relations.fromColumnId, columnId),
                eq(relations.toColumnId, columnId)
            )
        );

        // Then delete the column
        return await db.delete(columns).where(eq(columns.id, columnId));
    }

    async addEnum(diagramId: string, name: string, color: string = "#10b981") {
        // Get existing tables and enums to calculate smart position
        const existingTables = await this.getTablesByDiagramId(diagramId);
        const existingEnums = await this.getEnumsByDiagramId(diagramId);

        let newX = 100;
        let newY = 100;

        const allNodes = [...existingTables, ...existingEnums];
        if (allNodes.length > 0) {
            // Find the rightmost node and place new enum to its right
            const rightmostNode = allNodes.reduce((max, node) =>
                node.x > max.x ? node : max, allNodes[0]);
            newX = rightmostNode.x + 300; // 300 = node width + padding
            newY = rightmostNode.y;
        }

        const id = crypto.randomUUID();
        await db.insert(enums).values({
            id,
            diagramId,
            name,
            x: newX,
            y: newY,
            color
        });
        return id;
    }

    async updateEnum(id: string, updates: { name?: string; color?: string; x?: number; y?: number }) {
        return await db.update(enums).set(updates).where(eq(enums.id, id));
    }

    async deleteEnum(id: string) {
        return await db.delete(enums).where(eq(enums.id, id));
    }

    async addEnumValue(enumId: string, value: string) {
        return await db.insert(enumValues).values({
            id: crypto.randomUUID(),
            enumId,
            value
        });
    }

    async deleteEnumValue(id: string) {
        return await db.delete(enumValues).where(eq(enumValues.id, id));
    }

    async updateEnumValues(enumId: string, values: { id?: string; value: string }[]) {
        // Simple approach: delete all and re-insert, or more complex reconcile.
        // Let's go with reconcile for better performance if values are stable.
        const existing = await db.select().from(enumValues).where(eq(enumValues.enumId, enumId));
        const existingIds = new Set(existing.map(e => e.id));
        const incomingIds = new Set(values.map(v => v.id).filter(id => !!id));

        // Delete removed
        for (const item of existing) {
            if (!incomingIds.has(item.id)) {
                await db.delete(enumValues).where(eq(enumValues.id, item.id));
            }
        }

        // Update or Insert
        for (const item of values) {
            if (item.id && existingIds.has(item.id)) {
                await db.update(enumValues).set({ value: item.value }).where(eq(enumValues.id, item.id));
            } else {
                await db.insert(enumValues).values({
                    id: crypto.randomUUID(),
                    enumId,
                    value: item.value
                });
            }
        }
    }
}

export const diagramService = new DiagramService();
