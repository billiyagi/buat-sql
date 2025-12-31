import { type LoaderFunctionArgs } from "react-router";
import { db } from "~/db";
import { diagrams, tables, columns, relations, enums, enumValues } from "~/db/schema";
import { eq } from "drizzle-orm";

export async function loader({ params, request }: LoaderFunctionArgs) {
    const diagramId = params.id;
    if (!diagramId) throw new Response("Not Found", { status: 404 });

    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "sql";

    const [diagram] = await db.select().from(diagrams).where(eq(diagrams.id, diagramId));
    if (!diagram) throw new Response("Not Found", { status: 404 });

    const fetchedTables = await db.select().from(tables).where(eq(tables.diagramId, diagramId));
    const fetchedColumns = await db.select().from(columns);
    const fetchedRelations = await db.select().from(relations).where(eq(relations.diagramId, diagramId));
    const fetchedEnums = await db.select().from(enums).where(eq(enums.diagramId, diagramId));
    const fetchedEnumValues = await db.select().from(enumValues);

    if (format === "prisma") {
        return generatePrismaExport(diagram, fetchedTables, fetchedColumns, fetchedRelations, fetchedEnums, fetchedEnumValues);
    } else if (format === "drizzle") {
        return generateDrizzleExport(diagram, fetchedTables, fetchedColumns, fetchedRelations, fetchedEnums, fetchedEnumValues);
    } else {
        return generateSqlExport(diagram, fetchedTables, fetchedColumns, fetchedRelations);
    }
}

function generateSqlExport(diagram: any, tables: any[], columns: any[], relations: any[]) {
    const dbType = diagram.databaseType || "generic";
    const q = dbType === "mysql" || dbType === "mariadb" ? "`" : '"';
    let sql = `-- Exported from DrawSQL Clone\n-- Diagram: ${diagram.name}\n-- Database: ${dbType}\n-- Date: ${new Date().toISOString()}\n\n`;

    for (const table of tables) {
        const tableColumns = columns.filter(c => c.tableId === table.id);
        sql += `CREATE TABLE ${q}${table.name}${q} (\n`;
        const lines = tableColumns.map(col => {
            let line = `  ${q}${col.name}${q} ${col.type}`;
            if (col.isPk) line += " PRIMARY KEY";
            if (!col.isNullable) line += " NOT NULL";
            return line;
        });
        sql += lines.join(",\n");
        sql += "\n);\n\n";
    }

    if (relations.length > 0) {
        sql += "-- Foreign Keys\n";
        for (const rel of relations) {
            const fromTable = tables.find(t => t.id === rel.fromTableId);
            const fromCol = columns.find(c => c.id === rel.fromColumnId);
            const toTable = tables.find(t => t.id === rel.toTableId);
            const toCol = columns.find(c => c.id === rel.toColumnId);
            if (fromTable && fromCol && toTable && toCol) {
                sql += `ALTER TABLE ${q}${fromTable.name}${q} ADD CONSTRAINT ${q}fk_${fromTable.name}_${fromCol.name}${q} FOREIGN KEY (${q}${fromCol.name}${q}) REFERENCES ${q}${toTable.name}${q}(${q}${toCol.name}${q});\n`;
            }
        }
    }

    return new Response(sql, {
        headers: {
            "Content-Type": "application/sql",
            "Content-Disposition": `attachment; filename="${diagram.name.replace(/\s+/g, '_')}.sql"`,
        },
    });
}

function generatePrismaExport(diagram: any, tables: any[], columns: any[], relations: any[], enumsList: any[], enumValuesList: any[]) {
    let prisma = `// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;

    // Enums
    for (const en of enumsList) {
        const values = enumValuesList.filter(v => v.enumId === en.id);
        prisma += `enum ${en.name} {\n`;
        prisma += values.map(v => `  ${v.value}`).join("\n");
        prisma += "\n}\n\n";
    }

    // Models
    for (const table of tables) {
        const tableColumns = columns.filter(c => c.tableId === table.id);
        prisma += `model ${table.name} {\n`;

        for (const col of tableColumns) {
            let type = mapPrismaType(col.type);
            if (col.enumId) {
                const en = enumsList.find(e => e.id === col.enumId);
                if (en) type = en.name;
            }

            let line = `  ${col.name} ${type}${col.isNullable ? "?" : ""}`;
            if (col.isPk) line += " @id";

            // Note: relations in Prisma require explicit relation fields which we'll add after simple fields
            prisma += line + "\n";
        }

        // Add relation fields for foreign keys where this table is the source
        const sourceRelations = relations.filter(r => r.fromTableId === table.id);
        for (const rel of sourceRelations) {
            const fromCol = columns.find(c => c.id === rel.fromColumnId);
            const toTable = tables.find(t => t.id === rel.toTableId);
            const toCol = columns.find(c => c.id === rel.toColumnId);
            if (fromCol && toTable && toCol) {
                prisma += `  ${toTable.name.toLowerCase()} ${toTable.name} @relation(fields: [${fromCol.name}], references: [${toCol.name}])\n`;
            }
        }

        prisma += "}\n\n";
    }

    return new Response(prisma, {
        headers: {
            "Content-Type": "text/plain",
            "Content-Disposition": `attachment; filename="schema.prisma"`,
        },
    });
}

function generateDrizzleExport(diagram: any, tables: any[], columns: any[], relations: any[], enumsList: any[], enumValuesList: any[]) {
    let drizzle = `import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";\n\n`;

    // Drizzle SQLite Enums as Text with constraints or just exported list
    for (const en of enumsList) {
        const values = enumValuesList.filter(v => v.enumId === en.id);
        drizzle += `export const ${en.name}Values = [\n`;
        drizzle += values.map(v => `  "${v.value}"`).join(",\n");
        drizzle += "\n] as const;\n\n";
    }

    for (const table of tables) {
        const tableColumns = columns.filter(c => c.tableId === table.id);
        drizzle += `export const ${table.name.toLowerCase()}s = sqliteTable("${table.name}", {\n`;

        const lines = tableColumns.map(col => {
            let line = `  ${col.name}: ${mapDrizzleType(col.type)}("${col.name}")`;
            if (col.isPk) line += ".primaryKey()";
            if (!col.isNullable) line += ".notNull()";

            // References
            const rel = relations.find(r => r.fromColumnId === col.id);
            if (rel) {
                const toTable = tables.find(t => t.id === rel.toTableId);
                const toCol = columns.find(c => c.id === rel.toColumnId);
                if (toTable && toCol) {
                    line += `.references(() => ${toTable.name.toLowerCase()}s.${toCol.name})`;
                }
            }
            return line;
        });

        drizzle += lines.join(",\n");
        drizzle += "\n});\n\n";
    }

    return new Response(drizzle, {
        headers: {
            "Content-Type": "application/javascript",
            "Content-Disposition": `attachment; filename="schema.ts"`,
        },
    });
}

function mapPrismaType(sqlType: string): string {
    const t = sqlType.toUpperCase();
    if (t.includes("INT")) return "Int";
    if (t.includes("CHAR") || t.includes("TEXT") || t.includes("UUID")) return "String";
    if (t.includes("BOOL")) return "Boolean";
    if (t.includes("DATE") || t.includes("TIME")) return "DateTime";
    if (t.includes("FLOAT") || t.includes("REAL") || t.includes("DECIMAL") || t.includes("DOUBLE")) return "Float";
    return "String";
}

function mapDrizzleType(sqlType: string): string {
    const t = sqlType.toUpperCase();
    if (t.includes("INT")) return "integer";
    if (t.includes("CHAR") || t.includes("TEXT") || t.includes("UUID")) return "text";
    if (t.includes("BOOL")) return "integer"; // SQLite doesn't have native boolean
    if (t.includes("DATE") || t.includes("TIME")) return "text"; // Often stored as text or integer in SQLite
    if (t.includes("FLOAT") || t.includes("REAL") || t.includes("DECIMAL") || t.includes("DOUBLE")) return "real";
    return "text";
}

