/**
 * CLASS Response
 * 
 * Models a response that clients will get from the cete-api
 */

 class Response {

    public timestamp: string;
    public route: string;
    private resource: Record<string, unknown>;

    constructor(timestamp: string, route: string, resource: Record<string, unknown>) {
        this.timestamp = timestamp;
        this.route = route;
        this.resource = resource;
    }

    /**
     * Public access methods
     */
    public getResource(): Record<string, unknown> {
        return this.resource;
    }
    public getDictionary(): Record<string, unknown> { // dictionary return type
        return {
            timestamp: this.timestamp,
            route: this.route,
            resource: this.getResource()
        }
    }

    /**
     * Public setter methods
     */
    public setResource(newResource: Record<string, unknown>) {
        this.resource = newResource;
    }

}

export default Response;