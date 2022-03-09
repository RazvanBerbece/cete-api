/**
 * Record<string, number> STATUS_CODES
 * Contains commonly used status codes for cete-api server responses
 */

const STATUS_CODES = {
    SUCCESS: 200,
    CLIENT_INVALID_REQUEST_NO_BODY: 401,
    CLIENT_INVALID_REQUEST_NO_DATA: 402,
    CLIENT_INVALID_REQUEST_NO_UID_OR_PARAM: 403,
    SERVER_DB_ERROR: 513,
    SERVER_GET_AUDIO_METADATA_FROM_UID_BLOB: 514,
};

export default STATUS_CODES;