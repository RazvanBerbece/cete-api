/**
 * CLASS Response
 *
 * Models a response that clients will get from the cete-api
 */
class Response {
    constructor(statusCode, timestamp, route, data) {
        this.statusCode = statusCode;
        this.timestamp = timestamp;
        this.route = route;
        this.data = data;
    }
    /**
     * Public access methods
     */
    getData() {
        return this.data;
    }
    getDictionary() {
        return {
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            route: this.route,
            data: this.getData()
        };
    }
    /**
     * Public setter methods
     */
    setData(newData) {
        this.data = newData;
    }
}
export default Response;
//# sourceMappingURL=Response.js.map