import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { GeneratorName } from "@fern-api/generators-configuration";
import { isVersionAhead } from "@fern-api/semver-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { getIntermediateRepresentationMigrator } from "../IntermediateRepresentationMigrator";
import { IrVersions } from "../ir-versions";
import { migrateIntermediateRepresentationForGenerator } from "../migrateIntermediateRepresentationForGenerator";
import { AlwaysRunMigration, GeneratorVersion } from "../types/IrMigration";
import { getIrForApi } from "./utils/getIrForApi";

describe("migrateIntermediateRepresentation", () => {
    describe("migrations are in order", () => {
        const migrations = getIntermediateRepresentationMigrator().migrations;
        for (const generatorName of Object.values(GeneratorName)) {
            // eslint-disable-next-line jest/valid-title
            it(generatorName, () => {
                const versions = migrations
                    .map((migration) => migration.minGeneratorVersionsToExclude[generatorName])
                    // filter out AlwaysRunMigration's, since these can appear wherever
                    .filter(
                        (version): version is Exclude<GeneratorVersion | undefined, AlwaysRunMigration> =>
                            version !== AlwaysRunMigration
                    );
                const expectedVersions = [...versions].sort((a, b) => {
                    // a null version signifies this migration should never be
                    // run for this generator, so it should be at the end (i.e.
                    // for the earliest IR versions)
                    if (a == null) {
                        return 1;
                    }
                    if (b == null) {
                        return -1;
                    }

                    // versions should be sorted from latest to earliest
                    return isVersionAhead(a, b) ? -1 : 1;
                });

                expect(versions).toEqual(expectedVersions);
            });
        }
    });

    it("does not run migration if generator version is equal to migration's 'minVersiontoExclude'", async () => {
        const migrated = migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.246",
            },
        });
        expect(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            (migrated as IrVersions.V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue
        ).toBeUndefined();
    });

    it("runs migration if generator (dev) version is less than migration's 'minVersiontoExclude'", async () => {
        const migrated = migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.245-1-ga1ce47f",
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect((migrated as IrVersions.V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue).toEqual({
            camelCase: "blogNotFoundError",
            originalValue: "BlogNotFoundError",
            pascalCase: "BlogNotFoundError",
            screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
            snakeCase: "blog_not_found_error",
            wireValue: "BlogNotFoundError",
        });
    });

    it("runs migration if generator (release) version is less than migration's 'minVersiontoExclude'", async () => {
        const migrated = migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.245",
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        expect((migrated as IrVersions.V1.ir.IntermediateRepresentation)?.errors?.[0]?.discriminantValue).toEqual({
            camelCase: "blogNotFoundError",
            originalValue: "BlogNotFoundError",
            pascalCase: "BlogNotFoundError",
            screamingSnakeCase: "BLOG_NOT_FOUND_ERROR",
            snakeCase: "blog_not_found_error",
            wireValue: "BlogNotFoundError",
        });
    });

    it("does not run migration if generator (dev) version is greater than migration's 'minVersiontoExclude'", async () => {
        const migrated = migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.246-1-ga1ce47f",
            },
        });

        expect((migrated as IrVersions.V1.ir.IntermediateRepresentation).errors[0]?.discriminantValue).toBeUndefined();
    });

    it("does not run migration if generator (release) version is greater than migration's 'minVersiontoExclude'", async () => {
        const migrated = migrateIntermediateRepresentationForGenerator({
            intermediateRepresentation: await getIrForSimpleApi(),
            context: createMockTaskContext(),
            targetGenerator: {
                name: "fernapi/fern-typescript-sdk",
                version: "0.0.247",
            },
        });

        expect((migrated as IrVersions.V1.ir.IntermediateRepresentation).errors[0]?.discriminantValue).toBeUndefined();
    });
});

function getIrForSimpleApi(): Promise<IntermediateRepresentation> {
    return getIrForApi(join(AbsoluteFilePath.of(__dirname), "./fixtures/simple"));
}
