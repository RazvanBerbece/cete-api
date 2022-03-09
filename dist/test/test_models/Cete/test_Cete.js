"use strict";
/**
 * Cete Test Harness
 * Tests the behaviour of the Cete type and corresponding functions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import Cete from "../../../models/Cete/Cete"
const assert_1 = __importDefault(require("assert"));
const Cete_1 = __importDefault(require("../../../models/Cete/Cete"));
describe('CLASS Cete', function () {
    describe('#processAndStoreCete()', function () {
        it('should return "NaN" when the id cannot be calculated', function () {
            // TODO
            assert_1.default.equal(0, 0);
        });
    });
});
describe('CLASS Cete', function () {
    describe('#setFilePath()', function () {
        it('should return the correct filepath format or an error status for a given id and archived propriety', function () {
            // Useful variables
            const example_userId = "testUsedId123";
            const example_ceteId = "123456789abcdef";
            // Cete with 'public' status
            const ceteObj_public = new Cete_1.default();
            ceteObj_public.setCeteId(example_ceteId);
            ceteObj_public.setUserId(example_userId);
            ceteObj_public.setFilePath();
            assert_1.default.strictEqual(ceteObj_public.getFilePath(), "Cetes/testUsedId123/public/123456789abcdef.mp3", "setFilePath() for public Cete failed to create the correct path");
            // Cete with 'archived' status
            const ceteObj_archived = new Cete_1.default();
            ceteObj_archived.setCeteId(example_ceteId);
            ceteObj_archived.setUserId(example_userId);
            ceteObj_archived.setIsArchived(true);
            ceteObj_archived.setFilePath();
            assert_1.default.strictEqual(ceteObj_archived.getFilePath(), "Cetes/testUsedId123/archived/123456789abcdef.mp3", "setFilePath() for archived Cete failed to create the correct path");
            // Cete with missing details (userId)
            const ceteObj_missing_userId = new Cete_1.default();
            ceteObj_missing_userId.setCeteId(example_ceteId);
            const status_missing_userId = ceteObj_missing_userId.setFilePath();
            assert_1.default.notStrictEqual(status_missing_userId, 1, "setFilePath() for Cete with missing details (userId) failed to return Error");
            // Cete with missing details (ceteId)
            const ceteObj_missing_ceteId = new Cete_1.default();
            ceteObj_missing_ceteId.setUserId(example_userId);
            const ceteObj_missing_ceteId_status = ceteObj_missing_ceteId.setFilePath();
            assert_1.default.notStrictEqual(ceteObj_missing_ceteId_status, 1, "setFilePath() for Cete with missing details (ceteId) failed to return Error");
        });
    });
});
//# sourceMappingURL=test_Cete.js.map