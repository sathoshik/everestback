var system = require("../../app/config/system");

describe("When server is starting", () => {
  var SystemDirectory = {}

  describe('and all file paths are valid', () => {

    beforeEach(() => {
      SystemDirectory = {
        "public" : "/public",
        "uploads" : "/public/uploads"
      }
    });

    it("creates all directories and returns true", () => {
      var result = system.directoryCheck()
      expect(result).toEqual(true);
    });
  });
});
