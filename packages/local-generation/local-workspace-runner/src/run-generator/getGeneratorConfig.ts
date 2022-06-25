import { GeneratorConfig, GeneratorHelpers } from "@fern-api/api";
import path from "path";
import { DOCKER_CODEGEN_OUTPUT_DIRECTORY, DOCKER_GENERATORS_DIRECTORY, DOCKER_PATH_TO_IR } from "./constants";

export declare namespace getGeneratorConfig {
    export interface Args {
        helpers: GeneratorHelpers;
        absolutePathToOutput: string | undefined;
        workspaceName: string;
        customConfig: unknown;
    }

    export interface Return {
        config: GeneratorConfig;
        binds: string[];
    }
}

export function getGeneratorConfig({
    helpers,
    absolutePathToOutput,
    customConfig,
    workspaceName,
}: getGeneratorConfig.Args): getGeneratorConfig.Return {
    const binds: string[] = [];

    // convert paths in helpers from host to docker
    const convertedHelpers: GeneratorConfig["helpers"] = {
        encodings: {},
    };
    for (const [encoding, helperForEncoding] of Object.entries(helpers.encodings)) {
        const absolutePathOnDocker = path.join(
            DOCKER_GENERATORS_DIRECTORY,
            helperForEncoding.name,
            helperForEncoding.version
        );
        convertedHelpers.encodings[encoding] = {
            name: helperForEncoding.name,
            version: helperForEncoding.version,
            absolutePath: absolutePathOnDocker,
        };
        binds.push(`${helperForEncoding.absolutePath}:${absolutePathOnDocker}`);
    }

    return {
        binds,
        config: {
            irFilepath: DOCKER_PATH_TO_IR,
            output: absolutePathToOutput != null ? { path: DOCKER_CODEGEN_OUTPUT_DIRECTORY } : null,
            publish: null,
            customConfig,
            helpers: convertedHelpers,
            workspaceName,
            organization: "fern-api",
        },
    };
}
