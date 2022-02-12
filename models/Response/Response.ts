/**
 * CLASS Response
 * 
 * Models a response that clients will get from the cete-api
 */

 class Response {

    public timestamp: string;
    public route: string;
    private data: Record<string, unknown>;

    constructor(timestamp: string, route: string, data: Record<string, unknown>) {
        this.timestamp = timestamp;
        this.route = route;
        this.data = data;
    }

    /**
     * Public access methods
     */
    public getData(): Record<string, unknown> {
        return this.data;
    }
    public getDictionary(): Record<string, unknown> { // dictionary return type
        return {
            timestamp: this.timestamp,
            route: this.route,
            data: this.getData()
        }
    }

    /**
     * Public setter methods
     */
    public setData(newData: Record<string, unknown>) {
        this.data = newData;
    }

}

export default Response;