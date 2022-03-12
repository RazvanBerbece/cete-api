"use strict";
/**
 * CLASS Response
 *
 * Models a response that clients will get from the cete-api
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Response {
    constructor(timestamp, route, resource) {
        this.timestamp = timestamp;
        this.route = route;
        this.resource = resource;
    }
    /**
     * Public access methods
     */
    getResource() {
        return this.resource;
    }
    getDictionary() {
        return {
            timestamp: this.timestamp,
            route: this.route,
            resource: this.getResource()
        };
    }
    /**
     * Public setter methods
     */
    setResource(newResource) {
        this.resource = newResource;
    }
}
exports.default = Response;
//# sourceMappingURL=Response.js.map