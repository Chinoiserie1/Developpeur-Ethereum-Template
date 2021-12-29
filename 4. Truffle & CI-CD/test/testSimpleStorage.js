const SimpleStorage = artifacts.require("./SimpleStorage");

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract("SimpleStorage", ([accounts]) => {
    // beforeEach(async () => {
    //     const simpleStorageInstance = await SimpleStorage.new();
    //     await simpleStorageInstance.set(89, { from: accounts });
    // })
    it("...should store the value 89.", async () => {
        const simpleStorageInstance = await SimpleStorage.new();
        await simpleStorageInstance.set(89, { from: accounts });
        // Get stored value
        const storedData = await simpleStorageInstance.get.call();
        assert.equal(storedData, 89, "The value 89 was not stored.");
    });
    it("...should store the value 89.", async () => {
        const simpleStorageInstance = await SimpleStorage.new();
        await simpleStorageInstance.set(89, { from: accounts });
        // Get stored value
        const storedData = await simpleStorageInstance.get.call();
        storedData.toString().should.equal('89');
    });
})