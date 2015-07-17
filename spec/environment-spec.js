"use babel";

import {Environment} from "../lib/environment";

describe("Environment", () => {
  let environmentMain, service = null;
  beforeEach(() => {
    environmentMain = null;
    waitsForPromise(() => {
      return atom.packages.activatePackage("environment").then(pack => {
        environmentMain = pack.mainModule;
      });
    });
  });

  describe("when the environment package is activated", () => {
    it("activates successfully", () => {
      expect(environmentMain).toBeDefined();
    });

    it("provides the environment service", () => {
      expect(environmentMain).toBeDefined();
      let called = false;
      expect(service).toBeFalsy();
      atom.packages.serviceHub.consume("environment", "0.1.0", (e) => {
        service = e;
        called = true;
      });

      waitsFor(() => {
        return called;
      });

      runs(() => {
        expect(service).toBeTruthy();
      });
    });
  });

  describe("when atom was launched from a launchd launched process", () => {
    let environment;

    beforeEach(() => {
      let anaemicenv = process.env;
      anaemicenv.PATH = "/usr/bin:/bin:/usr/sbin:/sbin";
      environment = new Environment();
      spyOn(environment, "processenv").andReturn(anaemicenv);
      spyOn(environment, "platform").andReturn("darwin");
    });

    it("detects that the environment needs patching", () => {
      expect(environment.shouldPatchEnvironment()).toBe(true);
    });

    it("detects the user's shell", () => {
      expect(environment.shell()).toBeDefined();
      expect(environment.shell()).toBeTruthy();
      expect(environment.shell()).not.toBe("");
    });

    it("launches the user's shell to patch the environment", () => {
      spyOn(environment, "shell").andReturn("/bin/bash");
      expect(environment.current().PATH).not.toBe("/usr/bin:/bin:/usr/sbin:/sbin");
    });

    it("launches the user's shell to patch the environment", () => {
      spyOn(environment, "shell").andReturn("/bin/sh");
      expect(environment.current().PATH).not.toBe("/usr/bin:/bin:/usr/sbin:/sbin");
    });
  });

  describe("when atom was launched from a terminal", () => {
    let environment;

    beforeEach(() => {
      let customenv = process.env;
      customenv.PATH = "/usr/bin:/bin:/usr/sbin:/sbin:/someother/userdefined/path";
      environment = new Environment();
      spyOn(environment, "processenv").andReturn(customenv);
      spyOn(environment, "platform").andReturn("darwin");
    });

    it("detects that the environment does not need patching", () => {
      expect(environment.shouldPatchEnvironment()).toBe(false);
    });
  });
});
