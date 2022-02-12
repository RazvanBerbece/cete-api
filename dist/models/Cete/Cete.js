"use strict";
/**
 * CLASS Cete
 * Logical model for a "Cete", an audio file which gets uploaded / shared / archived / liked
 *
 * The ceteId field works as a backend identifier for each Cete. It helps in storing and maybe searching for Cetes
 *
 * It also contains a filepath field, which is initialised with 'NaN'
 * and can be updated with the actual filepath where the audio file will be stored on the storage blob
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Cete {
    constructor() {
        this.isArchived = false;
        this.filepath = 'NaN';
    }
    /**
     * Public access methods for Cete fields
     */
    getCeteId() {
        return this.ceteId;
    }
    getUserId() {
        return this.userId;
    }
    getTimestamp() {
        return this.timestamp;
    }
    getData() {
        return this.data;
    }
    getisArchived() {
        return this.isArchived;
    }
    getFilePath() {
        return this.filepath;
    }
    /**
     * Public setter methods for Cete fields
     */
    setCeteId(newCeteId) {
        this.ceteId = newCeteId;
    }
    setUserId(newUserId) {
        this.userId = newUserId;
    }
    setTimestamp(newTimestamp) {
        this.timestamp = newTimestamp;
    }
    setData(newData) {
        this.data = newData;
    }
    setIsArchived(newIsArchived) {
        this.isArchived = newIsArchived;
    }
    setFilePath() {
        return;
    }
}
exports.default = Cete;
//# sourceMappingURL=Cete.js.map