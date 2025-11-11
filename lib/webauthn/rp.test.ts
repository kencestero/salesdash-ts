import { getRpIDFromHost } from "./rp";

test("rp id", () => {
  expect(getRpIDFromHost(" www.mjsalesdash.com ")).toBe("mjsalesdash.com");
  expect(getRpIDFromHost("mjsalesdash.com")).toBe("mjsalesdash.com");
});
