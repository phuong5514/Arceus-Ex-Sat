




export const return_error = (response, error_code, error_message, writeConsole = false) => {
    if (writeConsole) {
        console.error(error_message);
    }

    response.status(error_code).json({ ok: false,  message: error_message});
}

export default return_error