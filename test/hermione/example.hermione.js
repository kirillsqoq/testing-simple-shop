const { assert } = require("chai");

describe("my site", async function () {
	it("Тест, который пройдет", async function () {
		await this.browser.url("http://localhost:3000/hw/store");
		await this.browser.assertView("plain", "body");
		// const title = await this.browser.$("#uhfLogo").getText();
		// assert.equal(title, "Microsoft");
	});
});
