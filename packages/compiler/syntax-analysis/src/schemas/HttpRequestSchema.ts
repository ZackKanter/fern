import { z } from "zod";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpRequestSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        encoding: z.optional(z.string()),
        type: z.optional(TypeDefinitionSchema),
    }),
]);

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
