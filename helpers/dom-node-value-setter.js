export const setValues = (parentNode, valuesObj) => {
    if (!parentNode || typeof parentNode.getElementById !== "function") {
        throw new Error("Invalid parentNode provided");
    }
    if (typeof valuesObj !== "object" || valuesObj === null || Array.isArray(valuesObj)) {
        throw new Error("valuesObj must be a non-null object");
    }

    Object.entries(valuesObj).forEach(([id, value]) => {
        if (typeof id !== "string") return;
        const childElement = parentNode.getElementById(id);
        if (childElement && "value" in childElement) {
            childElement.value = value;
        }
    });
};

export const clearValues = (parentNode, ids) => {
    if (!parentNode || typeof parentNode.getElementById !== "function") {
        throw new Error("Invalid parentNode provided");
    }
    if (!Array.isArray(ids)) {
        throw new Error("ids must be an array");
    }

    ids.forEach((id) => {
        if (typeof id !== "string") return;
        const childElement = parentNode.getElementById(id);
        if (childElement && "value" in childElement) {
            childElement.value = "";
        }
    });
};

export const toggleReadOnly = (parentNode, ids) => {
    if (!parentNode || typeof parentNode.getElementById !== "function") {
        throw new Error("Invalid parentNode provided");
    }
    if (!Array.isArray(ids)) {
        throw new Error("ids must be an array");
    }

    ids.forEach((id) => {
        const childElement = parentNode.getElementById(id);
        const readOnlyValue = !childElement.readOnly;
        childElement.readOnly = !readOnlyValue;
    })
}
