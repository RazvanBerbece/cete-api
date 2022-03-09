/**
 * Cete Test Harness
 * Tests the behaviour of the Cete type and corresponding functions
 */

// import Cete from "../../../models/Cete/Cete"
import assert from 'assert';
import Cete from '../../../models/Cete/Cete';

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

describe('CLASS Cete', function() {
    describe('#processAndStoreCete()', function() {
      it('should return "NaN" when the id cannot be calculated', function() {
        // TODO
        assert.equal(0, 0);
      });
    });
});

describe('CLASS Cete', function() {
    describe('#setFilePath()', function() {
      it('should return the correct filepath format or an error status for a given id and archived propriety', function() {

        // Useful variables
        const example_userId = "testUsedId123";
        const example_ceteId = "123456789abcdef";

        // Cete with 'public' status
        const ceteObj_public = new Cete()
        ceteObj_public.setCeteId(example_ceteId);
        ceteObj_public.setUserId(example_userId);
        ceteObj_public.setFilePath();
        assert.strictEqual(
          ceteObj_public.getFilePath(), 
          "testUsedId123/public/123456789abcdef.wav", 
          "setFilePath() for public Cete failed to create the correct path"
        );

        // Cete with 'archived' status
        const ceteObj_archived = new Cete()
        ceteObj_archived.setCeteId(example_ceteId);
        ceteObj_archived.setUserId(example_userId);
        ceteObj_archived.setIsArchived(true);
        ceteObj_archived.setFilePath();
        assert.strictEqual(
          ceteObj_archived.getFilePath(), 
          "testUsedId123/archived/123456789abcdef.wav", 
          "setFilePath() for archived Cete failed to create the correct path"
        );

        // Cete with missing details (userId)
        const ceteObj_missing_userId = new Cete()
        ceteObj_missing_userId.setCeteId(example_ceteId);
        const status_missing_userId = ceteObj_missing_userId.setFilePath();
        assert.notStrictEqual(
          status_missing_userId,
          1,
          "setFilePath() for Cete with missing details (userId) failed to return Error"
        );

        // Cete with missing details (ceteId)
        const ceteObj_missing_ceteId = new Cete()
        ceteObj_missing_ceteId.setUserId(example_userId);
        const ceteObj_missing_ceteId_status = ceteObj_missing_ceteId.setFilePath();
        assert.notStrictEqual(
          ceteObj_missing_ceteId_status,
          1,
          "setFilePath() for Cete with missing details (ceteId) failed to return Error"
        );

      });
    });
});