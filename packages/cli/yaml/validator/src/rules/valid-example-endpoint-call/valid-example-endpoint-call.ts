import {
    constructFernFileContext,
    ErrorResolverImpl,
    ExampleResolverImpl,
    TypeResolverImpl,
} from "@fern-api/ir-generator";
import { Rule } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { validateExampleEndpointCallParameters } from "./validateExampleEndpointCallParameters";
import { validateRequest } from "./validateRequest";
import { validateResponse } from "./validateResponse";

export const ValidExampleEndpointCallRule: Rule = {
    name: "valid-example-endpoint-call",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);
        const errorResolver = new ErrorResolverImpl(workspace);
        const exampleResolver = new ExampleResolverImpl(typeResolver);

        return {
            definitionFile: {
                exampleHeaders: ({ service, endpoint, examples }, { relativeFilepath, contents: definitionFile }) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations: {
                            ...workspace.definition.rootApiFile.contents.headers,
                            ...service.headers,
                            ...(typeof endpoint.request !== "string" ? endpoint.request?.headers : undefined),
                        },
                        examples,
                        parameterDisplayName: "header",
                        typeResolver,
                        exampleResolver,
                        workspace,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                    });
                },
                examplePathParameters: (
                    { service, endpoint, examples },
                    { relativeFilepath, contents: definitionFile }
                ) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations: {
                            ...service["path-parameters"],
                            ...endpoint["path-parameters"],
                        },
                        examples,
                        parameterDisplayName: "path parameter",
                        typeResolver,
                        exampleResolver,
                        workspace,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                    });
                },
                exampleQueryParameters: ({ endpoint, examples }, { relativeFilepath, contents: definitionFile }) => {
                    return validateExampleEndpointCallParameters({
                        allDeclarations:
                            typeof endpoint.request !== "string" ? endpoint.request?.["query-parameters"] : undefined,
                        examples,
                        parameterDisplayName: "query parameter",
                        typeResolver,
                        exampleResolver,
                        workspace,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                    });
                },
                exampleRequest: ({ endpoint, example }, { relativeFilepath, contents: definitionFile }) => {
                    return validateRequest({
                        example,
                        endpoint,
                        typeResolver,
                        exampleResolver,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                        workspace,
                    });
                },
                exampleResponse: ({ endpoint, example }, { relativeFilepath, contents: definitionFile }) => {
                    return validateResponse({
                        example,
                        endpoint,
                        typeResolver,
                        exampleResolver,
                        file: constructFernFileContext({
                            relativeFilepath,
                            definitionFile,
                            casingsGenerator: CASINGS_GENERATOR,
                        }),
                        workspace,
                        errorResolver,
                    });
                },
            },
        };
    },
};
