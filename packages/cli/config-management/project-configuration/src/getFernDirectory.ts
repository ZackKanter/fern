import { AbsoluteFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { findUp } from "find-up";
import { FERN_DIRECTORY, PROJECT_CONFIG_FILENAME } from "./constants";

export async function getFernDirectory(): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory" });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    const absolutePathToFernDirectory = AbsoluteFilePath.of(fernDirectoryStr);

    if (await doesPathExist(join(absolutePathToFernDirectory, PROJECT_CONFIG_FILENAME))) {
        return absolutePathToFernDirectory;
    } else {
        return undefined;
    }
}
