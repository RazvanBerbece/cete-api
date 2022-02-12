/**
 * Record<string, number> STATUS_CODES
 * Contains commonly used status codes for cete-api server responses
 */

const STATUS_CODES = {
    SUCCESS: 200,
    CLIENT_INVALID_REQUEST_NO_BODY: 401,
    CLIENT_INVALID_REQUEST_NO_DATA: 402,
    SERVER_DB_ERROR: 513
}

export default STATUS_CODES;