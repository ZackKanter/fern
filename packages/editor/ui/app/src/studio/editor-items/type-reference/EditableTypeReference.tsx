import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { useBooleanState } from "@fern-api/react-commons";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import { useCallback } from "react";
import { TypeReferenceEditor } from "./draft-type-reference/TypeReferenceEditor";
import styles from "./EditableTypeReference.module.scss";
import { MonospaceText } from "./MonospaceText";
import { TypeReferencePreview } from "./type-reference-preview/TypeReferencePreview";

export declare namespace EditableTypeReference {
    export interface Props {
        typeReference: FernApiEditor.TypeReference;
        onChange: (typeReference: FernApiEditor.TypeReference) => void;
    }
}

export const EditableTypeReference: React.FC<EditableTypeReference.Props> = ({ typeReference, onChange }) => {
    const { value: isEditing, setTrue: onClickEdit, setFalse: onDoneEditing } = useBooleanState(false);

    const onSave = useCallback(
        (typeReference: FernApiEditor.TypeReference) => {
            onChange(typeReference);
            onDoneEditing();
        },
        [onChange, onDoneEditing]
    );

    return (
        <MonospaceText>
            {isEditing ? (
                <TypeReferenceEditor typeReference={typeReference} onSave={onSave} onCancel={onDoneEditing} />
            ) : (
                <div className={styles.preview}>
                    <TypeReferencePreview typeReference={typeReference} />
                    <Button minimal icon={IconNames.EDIT} onClick={onClickEdit} />
                </div>
            )}
        </MonospaceText>
    );
};
