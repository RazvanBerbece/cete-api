"use strict";
/**
 * Record<string, number> STATUS_CODES
 * Contains commonly used status codes for cete-api server responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
const STATUS_CODES = {
    SUCCESS: 200,
    CLIENT_INVALID_REQUEST_NO_BODY: 401,
    CLIENT_INVALID_REQUEST_NO_DATA: 402,
    CLIENT_INVALID_REQUEST_NO_UID_OR_PARAM: 403,
    CLIENT_INVALID_REQUEST_NO_CETEID_OR_PARAM: 404,
    SERVER_DB_ERROR: 513,
    SERVER_GET_CETES_FOR_PROFILE: 514,
    SERVER_GET_AUDIO_DATA_FROM_BLOB: 515,
    SERVER_LISTEN_AUDIO: 516,
    SERVER_DELETE_CETE: 517
};
exports.default = STATUS_CODES;
//# sourceMappingURL=statuses.js.map